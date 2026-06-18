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

/**
 * Stores notes attached to each field of a message.
 * Keyed by fieldKey (frontend key, not mongoPropertyName).
 *
 * Collection: MESSAGE_NOTES
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "MESSAGE_NOTES")
public class MessageNotes {

    @Id
    private String id;

    /** Business-level message identifier e.g. MSG-001 */
    private String messageId;

    /**
     * fieldKey -> list of Note objects
     * e.g. { "messageName": [{ id, author, text, timestamp }] }
     */
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
