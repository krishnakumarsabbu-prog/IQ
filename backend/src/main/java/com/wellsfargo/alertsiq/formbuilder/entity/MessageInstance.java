package com.wellsfargo.alertsiq.formbuilder.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "CREATED_MESSAGES")
public class MessageInstance {
    @Id
    private String id;
    private String messageId;
    private String messageName;
    private String messageType;
    
    @Builder.Default
    private List<String> channels = new ArrayList<>();
    
    private String status;
    private String lastModified;
    private String templateId;
    
    @Builder.Default
    private Map<String, Object> formValues = new HashMap<>();
    
    @Builder.Default
    private Map<String, Boolean> bookmarks = new HashMap<>();
    
    @Builder.Default
    private Map<String, List<Note>> notes = new HashMap<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Note {
        private String id;
        private String author;
        private String text;
        private String timestamp;
    }
}
