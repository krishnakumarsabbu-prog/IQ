package com.wellsfargo.alertsiq.formbuilder.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.HashMap;
import java.util.Map;

/**
 * Stores bookmark state for each field of a message.
 * Keyed by fieldKey (frontend key, not mongoPropertyName).
 *
 * Collection: MESSAGE_BOOKMARKS
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "MESSAGE_BOOKMARKS")
public class MessageBookmarks {

    @Id
    private String id;

    /** Business-level message identifier e.g. MSG-001 */
    private String messageId;

    /**
     * fieldKey -> true/false
     * e.g. { "messageName": true, "priority": false }
     */
    @Builder.Default
    private Map<String, Boolean> bookmarks = new HashMap<>();
}
