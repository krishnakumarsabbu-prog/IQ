package com.wellsfargo.alertsiq.formbuilder.service;

import com.wellsfargo.alertsiq.formbuilder.entity.*;
import com.wellsfargo.alertsiq.formbuilder.repository.*;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * MessageService — Dynamic flat persistence engine.
 *
 * Saves documents flat in the "messages" collection.
 * No nested "fieldValues" object in the database.
 * Bookmarks and notes remain stored in separate collections.
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
    private MessageBookmarksRepository messageBookmarksRepository;

    @Autowired
    private MessageNotesRepository messageNotesRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    // ─────────────────────────────────────────────────────────────────────────
    // SAVE  (create or update)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Accepts a flat Map from the frontend.
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

        // 4. Build flat field-value map keyed by mongoPropertyName
        Map<String, Object> mongoValues = new LinkedHashMap<>();
        for (Template.Field field : allFields) {
            Object userValue = payload.get(field.getFieldKey());
            if (userValue == null) continue;

            String mongoKey = resolveMongoKey(field);
            mongoValues.put(mongoKey, userValue);
        }

        // 5. Determine if this is a create or update
        String existingId = extractString(payload, "_id");
        String messageId = null;
        Document existingDoc = null;

        if (existingId != null && !existingId.isBlank()) {
            existingDoc = mongoTemplate.findById(parseId(existingId), Document.class, "messages");
            if (existingDoc == null) {
                Query q = new Query(Criteria.where("messageId").is(existingId));
                existingDoc = mongoTemplate.findOne(q, Document.class, "messages");
            }
        }

        if (existingDoc != null) {
            // UPDATE — merge into existing document at root level
            messageId = existingDoc.getString("messageId");
            for (Map.Entry<String, Object> entry : mongoValues.entrySet()) {
                existingDoc.put(entry.getKey(), entry.getValue());
            }
            // Ensure root metadata fields are not overwritten by form values
            existingDoc.put("messageId", messageId);
            existingDoc.put("lastModified", today());
            if (payload.containsKey("_status")) {
                existingDoc.put("status", payload.get("_status"));
            }
            existingDoc.put("templateVersion", template.getVersion());
            mongoTemplate.save(existingDoc, "messages");
        } else {
            // CREATE — generate a new messageId and create flat document
            messageId = "MSG-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            Document newDoc = new Document();

            // Add dynamic form field values first
            for (Map.Entry<String, Object> entry : mongoValues.entrySet()) {
                newDoc.put(entry.getKey(), entry.getValue());
            }

            // Override/set metadata on top
            newDoc.put("messageId", messageId);
            newDoc.put("templateId", templateId);
            newDoc.put("templateVersion", template.getVersion());
            newDoc.put("status", payload.containsKey("_status") ? payload.get("_status") : "Draft");
            newDoc.put("lastModified", today());

            mongoTemplate.save(newDoc, "messages");
        }

        // Align the messageId form field inside mongoValues so the response is consistent
        for (Template.Field field : allFields) {
            if ("messageId".equals(field.getFieldKey())) {
                mongoValues.put(resolveMongoKey(field), messageId);
            }
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
        Query q = new Query(new Criteria().orOperator(
                Criteria.where("_id").is(parseId(id)),
                Criteria.where("messageId").is(id)
        ));
        Document doc = mongoTemplate.findOne(q, Document.class, "messages");
        if (doc == null) {
            throw new IllegalArgumentException("Message not found: " + id);
        }

        String templateId = doc.getString("templateId");
        Template template = templateRepository.findByTemplateId(templateId).orElse(null);
        List<Template.Field> allFields = collectAllFields(template);

        // Extract form values from the flat document
        Map<String, Object> flatValues = extractFormValuesFromDoc(doc, allFields);

        // Reverse-map mongoPropertyName -> fieldKey
        Map<String, Object> fieldValues = reverseMap(flatValues, allFields);

        return buildFullResponse(doc, template, fieldValues);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LOAD ALL
    // ─────────────────────────────────────────────────────────────────────────

    public List<Map<String, Object>> getAllMessages() {
        Query query = new Query();
        query.with(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "lastModified"));
        List<Document> docs = mongoTemplate.find(query, Document.class, "messages");
        List<Map<String, Object>> result = new ArrayList<>();

        for (Document doc : docs) {
            String templateId = doc.getString("templateId");
            Template template = templateRepository.findByTemplateId(templateId).orElse(null);
            List<Template.Field> allFields = collectAllFields(template);
            Map<String, Object> flatValues = extractFormValuesFromDoc(doc, allFields);
            Map<String, Object> fieldValues = reverseMap(flatValues, allFields);
            result.add(buildFullResponse(doc, template, fieldValues));
        }

        return result;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DELETE
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional
    public void deleteMessage(String id) {
        Query q = new Query(new Criteria().orOperator(
                Criteria.where("_id").is(parseId(id)),
                Criteria.where("messageId").is(id)
        ));
        Document doc = mongoTemplate.findAndRemove(q, Document.class, "messages");
        if (doc == null) {
            throw new IllegalArgumentException("Message not found: " + id);
        }

        String messageId = doc.getString("messageId");
        messageBookmarksRepository.deleteByMessageId(messageId);
        messageNotesRepository.deleteByMessageId(messageId);
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

    private Map<String, Object> buildFullResponse(Document doc, Template template,
            Map<String, Object> fieldValues) {

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("_id", doc.get("_id") != null ? doc.get("_id").toString() : null);
        response.put("messageId", doc.getString("messageId"));
        response.put("templateId", doc.getString("templateId"));
        response.put("templateVersion", doc.getString("templateVersion"));
        response.put("status", doc.getString("status"));
        response.put("lastModified", doc.getString("lastModified"));
        if (template != null) {
            response.put("templateName", template.getTemplateName());
        }
        response.put("formValues", fieldValues);

        addBookmarksAndNotes(doc.getString("messageId"), response);
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

    /**
     * Extract form values from the flat document
     */
    private Map<String, Object> extractFormValuesFromDoc(Document doc, List<Template.Field> allFields) {
        Map<String, Object> flatValues = new LinkedHashMap<>();
        Set<String> formKeys = allFields.stream()
                .map(this::resolveMongoKey)
                .collect(Collectors.toSet());

        for (Map.Entry<String, Object> entry : doc.entrySet()) {
            String key = entry.getKey();
            if (formKeys.contains(key)) {
                flatValues.put(key, entry.getValue());
            }
        }
        return flatValues;
    }

    private Object parseId(String id) {
        if (id != null && id.length() == 24 && id.matches("^[0-9a-fA-F]{24}$")) {
            return new ObjectId(id);
        }
        return id;
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
