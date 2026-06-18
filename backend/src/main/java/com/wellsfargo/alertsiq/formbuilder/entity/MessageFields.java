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
 * Stores the actual field values for a created message.
 * Keys are mongoPropertyName (from template field definitions).
 * The document is flat — no nesting of tabs or sections.
 *
 * Collection: MESSAGE_FIELDS
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "MESSAGE_FIELDS")
public class MessageFields {

    @Id
    private String id;

    /** Business-level message identifier e.g. MSG-001 */
    private String messageId;

    /** Which template schema this message was built from */
    private String templateId;

    /** Template version at time of save – for audit trail */
    private String templateVersion;

    /** ISO date of last save e.g. 2026-06-18 */
    private String lastModified;

    /** Draft / Active / Archived */
    private String status;

    /**
     * The actual field data stored flat, keyed by mongoPropertyName.
     * e.g. { "msg_name": "Welcome Email", "msg_priority": "High" }
     */
    @Builder.Default
    private Map<String, Object> fieldValues = new HashMap<>();
}
