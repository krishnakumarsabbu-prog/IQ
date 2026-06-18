package com.wellsfargo.alertsiq.formbuilder.service;

import com.wellsfargo.alertsiq.formbuilder.entity.MessageInstance;
import com.wellsfargo.alertsiq.formbuilder.entity.Template;
import com.wellsfargo.alertsiq.formbuilder.repository.TemplateRepository;
import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MessageInstanceService {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private TemplateRepository templateRepository;

    private static final String COLLECTION_NAME = "CREATED_MESSAGES";

    // Helper: Map frontend MessageInstance to flat DB Document
    private Document mapToDbDocument(MessageInstance msg) {
        Document doc = new Document();
        if (msg.getId() != null && !msg.getId().isEmpty()) {
            doc.put("_id", msg.getId());
        } else {
            doc.put("_id", UUID.randomUUID().toString());
        }
        
        doc.put("messageId", msg.getMessageId() != null ? msg.getMessageId() : "MSG-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        doc.put("messageName", msg.getMessageName());
        doc.put("messageType", msg.getMessageType());
        doc.put("channels", msg.getChannels());
        doc.put("status", msg.getStatus() != null ? msg.getStatus() : "Draft");
        doc.put("lastModified", LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE));
        doc.put("templateId", msg.getTemplateId());
        
        // Metadata fields
        doc.put("_bookmarks", msg.getBookmarks());
        doc.put("_notes", msg.getNotes());

        // Dynamic form values mapping to mongoPropertyName
        if (msg.getFormValues() != null) {
            Template template = templateRepository.findByTemplateId(msg.getTemplateId()).orElse(null);
            Map<String, String> keyMap = getFieldKeyToMongoPropertyMap(template);
            
            for (Map.Entry<String, Object> entry : msg.getFormValues().entrySet()) {
                String dbKey = keyMap.getOrDefault(entry.getKey(), entry.getKey());
                doc.put(dbKey, entry.getValue());
            }
        }
        
        return doc;
    }

    // Helper: Map flat DB Document to frontend MessageInstance
    private MessageInstance mapToMessageInstance(Document doc) {
        if (doc == null) return null;

        MessageInstance msg = new MessageInstance();
        msg.setId(doc.get("_id") != null ? doc.get("_id").toString() : null);
        msg.setMessageId(doc.getString("messageId"));
        msg.setMessageName(doc.getString("messageName"));
        msg.setMessageType(doc.getString("messageType"));
        
        List<?> rawChannels = doc.get("channels", List.class);
        if (rawChannels != null) {
            msg.setChannels(rawChannels.stream().map(Object::toString).collect(Collectors.toList()));
        } else {
            msg.setChannels(new ArrayList<>());
        }
        
        msg.setStatus(doc.getString("status"));
        msg.setLastModified(doc.getString("lastModified"));
        msg.setTemplateId(doc.getString("templateId"));

        // Bookmarks mapping
        Document rawBookmarks = (Document) doc.get("_bookmarks");
        Map<String, Boolean> bookmarks = new HashMap<>();
        if (rawBookmarks != null) {
            for (String key : rawBookmarks.keySet()) {
                bookmarks.put(key, rawBookmarks.getBoolean(key));
            }
        }
        msg.setBookmarks(bookmarks);

        // Notes mapping
        Document rawNotes = (Document) doc.get("_notes");
        Map<String, List<MessageInstance.Note>> notes = new HashMap<>();
        if (rawNotes != null) {
            for (String key : rawNotes.keySet()) {
                List<?> noteList = rawNotes.get(key, List.class);
                if (noteList != null) {
                    List<MessageInstance.Note> list = new ArrayList<>();
                    for (Object noteObj : noteList) {
                        if (noteObj instanceof Document) {
                            Document dNote = (Document) noteObj;
                            list.add(MessageInstance.Note.builder()
                                    .id(dNote.getString("id"))
                                    .author(dNote.getString("author"))
                                    .text(dNote.getString("text"))
                                    .timestamp(dNote.getString("timestamp"))
                                    .build());
                        }
                    }
                    notes.put(key, list);
                }
            }
        }
        msg.setNotes(notes);

        // FormValues reverse mapping
        Map<String, Object> formValues = new HashMap<>();
        Template template = templateRepository.findByTemplateId(msg.getTemplateId()).orElse(null);
        Map<String, String> reverseKeyMap = getMongoPropertyToFieldKeyMap(template);

        // Standard metadata fields to exclude from formValues
        Set<String> excludeKeys = new HashSet<>(Arrays.asList(
            "_id", "messageId", "messageName", "messageType", "channels", "status", "lastModified", "templateId", "_bookmarks", "_notes"
        ));

        // Add mapped template mongo properties to exclude from raw dynamic properties, or map them
        for (Map.Entry<String, Object> entry : doc.entrySet()) {
            if (excludeKeys.contains(entry.getKey())) continue;
            
            String frontendKey = reverseKeyMap.get(entry.getKey());
            if (frontendKey != null) {
                formValues.put(frontendKey, entry.getValue());
            } else {
                formValues.put(entry.getKey(), entry.getValue());
            }
        }

        // Failsafe: make sure core fields are set in formValues too
        if (!formValues.containsKey("messageId")) formValues.put("messageId", msg.getMessageId());
        if (!formValues.containsKey("messageName")) formValues.put("messageName", msg.getMessageName());
        if (!formValues.containsKey("messageType")) formValues.put("messageType", msg.getMessageType());

        msg.setFormValues(formValues);
        return msg;
    }

    private Map<String, String> getFieldKeyToMongoPropertyMap(Template template) {
        Map<String, String> map = new HashMap<>();
        if (template == null || template.getTabs() == null) return map;
        for (Template.Tab tab : template.getTabs()) {
            if (tab.getSections() == null) continue;
            for (Template.Section section : tab.getSections()) {
                if (section.getFields() == null) continue;
                for (Template.Field field : section.getFields()) {
                    if (field.getFieldKey() != null) {
                        String mongoProp = null;
                        if (field.getAdvanced() != null) {
                            mongoProp = field.getAdvanced().getMongoPropertyName();
                        }
                        if (mongoProp != null && !mongoProp.trim().isEmpty()) {
                            map.put(field.getFieldKey(), mongoProp.trim());
                        } else {
                            map.put(field.getFieldKey(), field.getFieldKey());
                        }
                    }
                }
            }
        }
        return map;
    }

    private Map<String, String> getMongoPropertyToFieldKeyMap(Template template) {
        Map<String, String> map = new HashMap<>();
        if (template == null || template.getTabs() == null) return map;
        for (Template.Tab tab : template.getTabs()) {
            if (tab.getSections() == null) continue;
            for (Template.Section section : tab.getSections()) {
                if (section.getFields() == null) continue;
                for (Template.Field field : section.getFields()) {
                    if (field.getFieldKey() != null) {
                        String mongoProp = null;
                        if (field.getAdvanced() != null) {
                            mongoProp = field.getAdvanced().getMongoPropertyName();
                        }
                        if (mongoProp != null && !mongoProp.trim().isEmpty()) {
                            map.put(mongoProp.trim(), field.getFieldKey());
                        } else {
                            map.put(field.getFieldKey(), field.getFieldKey());
                        }
                    }
                }
            }
        }
        return map;
    }

    public MessageInstance createMessage(MessageInstance message) {
        Document doc = mapToDbDocument(message);
        mongoTemplate.save(doc, COLLECTION_NAME);
        return mapToMessageInstance(doc);
    }

    public List<MessageInstance> getAllMessages() {
        List<Document> docs = mongoTemplate.findAll(Document.class, COLLECTION_NAME);
        List<MessageInstance> list = new ArrayList<>();
        for (Document doc : docs) {
            list.add(mapToMessageInstance(doc));
        }
        return list;
    }

    public Optional<MessageInstance> getMessage(String id) {
        Document doc = mongoTemplate.findById(id, Document.class, COLLECTION_NAME);
        if (doc == null) {
            // Fallback: search by messageId field
            List<Document> list = mongoTemplate.find(
                new org.springframework.data.mongodb.core.query.Query(
                    org.springframework.data.mongodb.core.query.Criteria.where("messageId").is(id)
                ), Document.class, COLLECTION_NAME
            );
            if (!list.isEmpty()) {
                doc = list.get(0);
            }
        }
        return Optional.ofNullable(mapToMessageInstance(doc));
    }

    public MessageInstance updateMessage(String id, MessageInstance messageUpdates) {
        Optional<MessageInstance> existingOpt = getMessage(id);
        if (!existingOpt.isPresent()) {
            throw new IllegalArgumentException("Message not found with ID: " + id);
        }
        MessageInstance existing = existingOpt.get();
        
        // Merge updates
        existing.setMessageName(messageUpdates.getMessageName());
        existing.setMessageType(messageUpdates.getMessageType());
        existing.setChannels(messageUpdates.getChannels());
        existing.setStatus(messageUpdates.getStatus());
        existing.setLastModified(LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE));
        existing.setFormValues(messageUpdates.getFormValues());
        existing.setBookmarks(messageUpdates.getBookmarks());
        existing.setNotes(messageUpdates.getNotes());

        Document doc = mapToDbDocument(existing);
        mongoTemplate.save(doc, COLLECTION_NAME);
        return mapToMessageInstance(doc);
    }

    public void deleteMessage(String id) {
        Optional<MessageInstance> existing = getMessage(id);
        if (existing.isPresent()) {
            Document doc = new Document("_id", existing.get().getId());
            mongoTemplate.remove(doc, COLLECTION_NAME);
        } else {
            throw new IllegalArgumentException("Message not found with ID: " + id);
        }
    }
}
