package com.wellsfargo.alertsiq.formbuilder.service;

import com.wellsfargo.alertsiq.formbuilder.entity.*;
import com.wellsfargo.alertsiq.formbuilder.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * MessageService — Three-collection dynamic persistence engine.
 *
 * Collections:
 *   MESSAGE_FIELDS    — flat field data keyed by mongoPropertyName
 *   MESSAGE_BOOKMARKS — fieldKey -> boolean
 *   MESSAGE_NOTES     — fieldKey -> List<Note>
 *
 * All field values come from the template schema at save time.
 * No field names are hardcoded here.
 */
@Service
public class MessageService {

    // Reserved keys in the incoming payload — not treated as form fields
    private static final Set<String> RESERVED_KEYS = Set.of(
            "_id", "templateId", "_status", "_bookmarks", "_notes"
    );

    @Autowired
    private TemplateRepository templateRepository;

    @Autowired
    private MessageFieldsRepository messageFieldsRepository;

    @Autowired
    private MessageBookmarksRepository messageBookmarksRepository;

    @Autowired
    private MessageNotesRepository messageNotesRepository;

    // ─────────────────────────────────────────────────────────────────────────
    // SAVE  (create or update)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Accepts a flat Map from the frontend.
     *
     * Expected keys in payload:
     *   templateId  – required, identifies the template schema to validate against
     *   _id         – optional, present on update
     *   _status     – optional, "Active" | "Draft" (default "Draft")
     *   _bookmarks  – optional Map<String,Boolean>
     *   _notes      – optional Map<String,List<Map<String,String>>>
     *   <fieldKey>  – one entry per form field filled by the user
     *
     * Returns a flat Map with the same structure (fieldKey keys) for binding back
     * into react-hook-form.
     */
    @Transactional
    public Map<String, Object> saveMessage(Map<String, Object> payload) {

        String templateId = extractString(payload, "templateId");
        if (templateId == null || templateId.isBlank()) {
            throw new IllegalArgumentException("templateId is required");
        }

        // 1. Fetch the latest template schema
        Template template = templateRepository.findByTemplateId(templateId)
                .orElseThrow(() -> new IllegalArgumentException("Template not found: " + templateId));

        // 2. Collect all field definitions from every tab and section
        List<Template.Field> allFields = collectAllFields(template);

        // 3. Validate user inputs against template field rules
        List<String> validationErrors = validate(payload, allFields);
        if (!validationErrors.isEmpty()) {
            throw new ValidationException(validationErrors);
        }

        // 4. Build flat field-value document keyed by mongoPropertyName
        Map<String, Object> mongoValues = new LinkedHashMap<>();
        for (Template.Field field : allFields) {
            Object userValue = payload.get(field.getFieldKey());
            if (userValue == null) continue;

            String mongoKey = resolveMongoKey(field);
            mongoValues.put(mongoKey, userValue);
        }

        // 5. Determine if this is a create or update
        String existingId = extractString(payload, "_id");
        String messageId;
        Optional<MessageFields> existingFields = Optional.empty();

        if (existingId != null && !existingId.isBlank()) {
            existingFields = messageFieldsRepository.findById(existingId);
            if (existingFields.isEmpty()) {
                existingFields = messageFieldsRepository.findByMessageId(existingId);
            }
        }

        if (existingFields.isPresent()) {
            // UPDATE — merge into existing document
            MessageFields mf = existingFields.get();
            messageId = mf.getMessageId();
            mf.getFieldValues().putAll(mongoValues);
            mf.setLastModified(today());
            mf.setStatus(extractString(payload, "_status") != null ? extractString(payload, "_status") : mf.getStatus());
            mf.setTemplateVersion(template.getVersion());
            messageFieldsRepository.save(mf);
        } else {
            // CREATE — generate a new messageId
            messageId = "MSG-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            MessageFields mf = MessageFields.builder()
                    .messageId(messageId)
                    .templateId(templateId)
                    .templateVersion(template.getVersion())
                    .status(extractString(payload, "_status") != null ? extractString(payload, "_status") : "Draft")
                    .lastModified(today())
                    .fieldValues(mongoValues)
                    .build();
            messageFieldsRepository.save(mf);
        }

        // 6. Save / upsert bookmarks
        saveBookmarks(messageId, payload);

        // 7. Save / upsert notes
        saveNotes(messageId, payload);

        // 8. Return reconstructed fieldKey-keyed response map
        return buildResponse(messageId, template, allFields, mongoValues, payload);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LOAD (single)
    // ─────────────────────────────────────────────────────────────────────────

    public Map<String, Object> getMessage(String id) {
        // Try by MongoDB _id first, then by messageId
        Optional<MessageFields> mfOpt = messageFieldsRepository.findById(id);
        if (mfOpt.isEmpty()) {
            mfOpt = messageFieldsRepository.findByMessageId(id);
        }
        MessageFields mf = mfOpt.orElseThrow(() -> new IllegalArgumentException("Message not found: " + id));

        Template template = templateRepository.findByTemplateId(mf.getTemplateId()).orElse(null);
        List<Template.Field> allFields = collectAllFields(template);

        // Reverse-map mongoPropertyName -> fieldKey
        Map<String, Object> fieldValues = reverseMap(mf.getFieldValues(), allFields);

        return buildFullResponse(mf, template, fieldValues);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LOAD ALL
    // ─────────────────────────────────────────────────────────────────────────

    public List<Map<String, Object>> getAllMessages() {
        List<MessageFields> all = messageFieldsRepository.findAllByOrderByLastModifiedDesc();
        List<Map<String, Object>> result = new ArrayList<>();

        for (MessageFields mf : all) {
            Template template = templateRepository.findByTemplateId(mf.getTemplateId()).orElse(null);
            List<Template.Field> allFields = collectAllFields(template);
            Map<String, Object> fieldValues = reverseMap(mf.getFieldValues(), allFields);
            result.add(buildFullResponse(mf, template, fieldValues));
        }

        return result;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DELETE
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional
    public void deleteMessage(String id) {
        Optional<MessageFields> mfOpt = messageFieldsRepository.findById(id);
        if (mfOpt.isEmpty()) {
            mfOpt = messageFieldsRepository.findByMessageId(id);
        }
        MessageFields mf = mfOpt.orElseThrow(() -> new IllegalArgumentException("Message not found: " + id));

        messageFieldsRepository.delete(mf);
        messageBookmarksRepository.deleteByMessageId(mf.getMessageId());
        messageNotesRepository.deleteByMessageId(mf.getMessageId());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // VALIDATION ENGINE
    // ─────────────────────────────────────────────────────────────────────────

    private List<String> validate(Map<String, Object> payload, List<Template.Field> fields) {
        List<String> errors = new ArrayList<>();

        for (Template.Field field : fields) {
            if (field.isHidden()) continue; // Skip hidden fields

            Object rawValue = payload.get(field.getFieldKey());
            String label = field.getLabel() != null ? field.getLabel() : field.getFieldKey();
            String strValue = rawValue != null ? rawValue.toString().trim() : "";

            // Required check
            if (field.isRequired() && strValue.isEmpty()) {
                String msg = field.getValidation() != null && field.getValidation().getErrorMessage() != null
                        ? field.getValidation().getErrorMessage()
                        : label + " is required.";
                errors.add(msg);
                continue; // Skip further validation if required value is missing
            }

            if (strValue.isEmpty()) continue; // No value, no further rules to check

            Template.ValidationSettings v = field.getValidation();
            if (v == null) continue;

            // Min length
            if (v.getMinLength() != null && strValue.length() < v.getMinLength()) {
                errors.add(label + " must be at least " + v.getMinLength() + " characters.");
            }

            // Max length
            if (v.getMaxLength() != null && strValue.length() > v.getMaxLength()) {
                errors.add(label + " must not exceed " + v.getMaxLength() + " characters.");
            }

            // Regex
            if (v.getRegex() != null && !v.getRegex().isBlank() && !strValue.matches(v.getRegex())) {
                String msg = v.getErrorMessage() != null ? v.getErrorMessage()
                        : label + " format is invalid.";
                errors.add(msg);
            }

            // Allowed values (for Dropdown / Radio / etc.)
            if (v.getAllowedValues() != null && !v.getAllowedValues().isEmpty()
                    && !v.getAllowedValues().contains(strValue)) {
                errors.add(label + " has an invalid value: '" + strValue + "'.");
            }

            // Numeric range validation
            if (v.getMinValue() != null || v.getMaxValue() != null) {
                try {
                    double numVal = Double.parseDouble(strValue);
                    if (v.getMinValue() != null && numVal < v.getMinValue()) {
                        errors.add(label + " must be >= " + v.getMinValue());
                    }
                    if (v.getMaxValue() != null && numVal > v.getMaxValue()) {
                        errors.add(label + " must be <= " + v.getMaxValue());
                    }
                } catch (NumberFormatException ignored) {
                    errors.add(label + " must be a numeric value.");
                }
            }
        }

        return errors;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BOOKMARKS HELPER
    // ─────────────────────────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private void saveBookmarks(String messageId, Map<String, Object> payload) {
        Object raw = payload.get("_bookmarks");
        if (raw == null) return;

        Map<String, Boolean> incoming = new LinkedHashMap<>();
        if (raw instanceof Map<?, ?>) {
            for (Map.Entry<?, ?> e : ((Map<?, ?>) raw).entrySet()) {
                if (e.getValue() instanceof Boolean) {
                    incoming.put(e.getKey().toString(), (Boolean) e.getValue());
                }
            }
        }

        MessageBookmarks mb = messageBookmarksRepository.findByMessageId(messageId)
                .orElse(MessageBookmarks.builder().messageId(messageId).build());
        mb.getBookmarks().putAll(incoming);
        messageBookmarksRepository.save(mb);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // NOTES HELPER
    // ─────────────────────────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private void saveNotes(String messageId, Map<String, Object> payload) {
        Object raw = payload.get("_notes");
        if (raw == null) return;

        Map<String, List<MessageNotes.Note>> incoming = new LinkedHashMap<>();
        if (raw instanceof Map<?, ?>) {
            for (Map.Entry<?, ?> fieldEntry : ((Map<?, ?>) raw).entrySet()) {
                String fieldKey = fieldEntry.getKey().toString();
                if (fieldEntry.getValue() instanceof List<?>) {
                    List<MessageNotes.Note> noteList = new ArrayList<>();
                    for (Object noteRaw : (List<?>) fieldEntry.getValue()) {
                        if (noteRaw instanceof Map<?, ?>) {
                            Map<?, ?> n = (Map<?, ?>) noteRaw;
                            noteList.add(MessageNotes.Note.builder()
                                    .id(str(n, "id"))
                                    .author(str(n, "author"))
                                    .text(str(n, "text"))
                                    .timestamp(str(n, "timestamp"))
                                    .build());
                        }
                    }
                    incoming.put(fieldKey, noteList);
                }
            }
        }

        MessageNotes mn = messageNotesRepository.findByMessageId(messageId)
                .orElse(MessageNotes.builder().messageId(messageId).build());
        mn.getNotes().putAll(incoming);
        messageNotesRepository.save(mn);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RESPONSE BUILDERS
    // ─────────────────────────────────────────────────────────────────────────

    private Map<String, Object> buildResponse(String messageId, Template template,
            List<Template.Field> allFields, Map<String, Object> mongoValues, Map<String, Object> payload) {

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("messageId", messageId);
        response.put("templateId", template.getTemplateId());
        response.put("status", payload.getOrDefault("_status", "Draft"));
        response.put("lastModified", today());

        // Return values in fieldKey space for react-hook-form binding
        Map<String, Object> fieldValues = reverseMap(mongoValues, allFields);
        response.put("formValues", fieldValues);

        // Bookmarks and notes
        addBookmarksAndNotes(messageId, response);

        return response;
    }

    private Map<String, Object> buildFullResponse(MessageFields mf, Template template,
            Map<String, Object> fieldValues) {

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("_id", mf.getId());
        response.put("messageId", mf.getMessageId());
        response.put("templateId", mf.getTemplateId());
        response.put("templateVersion", mf.getTemplateVersion());
        response.put("status", mf.getStatus());
        response.put("lastModified", mf.getLastModified());
        if (template != null) {
            response.put("templateName", template.getTemplateName());
        }
        response.put("formValues", fieldValues);

        addBookmarksAndNotes(mf.getMessageId(), response);
        return response;
    }

    private void addBookmarksAndNotes(String messageId, Map<String, Object> response) {
        MessageBookmarks mb = messageBookmarksRepository.findByMessageId(messageId).orElse(null);
        response.put("_bookmarks", mb != null ? mb.getBookmarks() : Collections.emptyMap());

        MessageNotes mn = messageNotesRepository.findByMessageId(messageId).orElse(null);
        response.put("_notes", mn != null ? mn.getNotes() : Collections.emptyMap());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FIELD MAP UTILITIES
    // ─────────────────────────────────────────────────────────────────────────

    /** Walk all tabs and sections and return a flat ordered list of fields */
    private List<Template.Field> collectAllFields(Template template) {
        if (template == null || template.getTabs() == null) return Collections.emptyList();
        List<Template.Field> fields = new ArrayList<>();
        for (Template.Tab tab : template.getTabs()) {
            if (tab.getSections() == null) continue;
            for (Template.Section section : tab.getSections()) {
                if (section.getFields() != null) {
                    fields.addAll(section.getFields());
                }
            }
        }
        return fields;
    }

    /**
     * Returns the mongoPropertyName for a field, falling back to fieldKey if not
     * configured.
     */
    private String resolveMongoKey(Template.Field field) {
        if (field.getAdvanced() != null
                && field.getAdvanced().getMongoPropertyName() != null
                && !field.getAdvanced().getMongoPropertyName().isBlank()) {
            return field.getAdvanced().getMongoPropertyName().trim();
        }
        return field.getFieldKey();
    }

    /**
     * Build fieldKey -> mongoPropertyName lookup
     */
    private Map<String, String> buildFieldKeyToMongoMap(List<Template.Field> fields) {
        Map<String, String> map = new LinkedHashMap<>();
        for (Template.Field f : fields) {
            map.put(f.getFieldKey(), resolveMongoKey(f));
        }
        return map;
    }

    /**
     * Reverse: mongoPropertyName -> fieldKey lookup
     */
    private Map<String, String> buildMongoToFieldKeyMap(List<Template.Field> fields) {
        Map<String, String> map = new LinkedHashMap<>();
        for (Template.Field f : fields) {
            map.put(resolveMongoKey(f), f.getFieldKey());
        }
        return map;
    }

    /**
     * Convert a mongoPropertyName-keyed map to a fieldKey-keyed map
     */
    private Map<String, Object> reverseMap(Map<String, Object> mongoValues, List<Template.Field> fields) {
        Map<String, String> reverseKeys = buildMongoToFieldKeyMap(fields);
        Map<String, Object> result = new LinkedHashMap<>();
        for (Map.Entry<String, Object> e : mongoValues.entrySet()) {
            String fieldKey = reverseKeys.getOrDefault(e.getKey(), e.getKey());
            result.put(fieldKey, e.getValue());
        }
        return result;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SMALL UTILITIES
    // ─────────────────────────────────────────────────────────────────────────

    private String today() {
        return LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE);
    }

    private String extractString(Map<String, Object> map, String key) {
        Object v = map.get(key);
        return v != null ? v.toString() : null;
    }

    private String str(Map<?, ?> map, String key) {
        Object v = map.get(key);
        return v != null ? v.toString() : null;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // VALIDATION EXCEPTION
    // ─────────────────────────────────────────────────────────────────────────

    public static class ValidationException extends RuntimeException {
        private final List<String> errors;

        public ValidationException(List<String> errors) {
            super("Validation failed: " + String.join("; ", errors));
            this.errors = errors;
        }

        public List<String> getErrors() {
            return errors;
        }
    }
}
