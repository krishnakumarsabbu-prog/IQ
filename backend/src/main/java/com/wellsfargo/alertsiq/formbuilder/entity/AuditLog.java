package com.wellsfargo.alertsiq.formbuilder.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "TEMPLATE_AUDIT_LOGS")
public class AuditLog {
    @Id
    private String id;
    private String templateId;
    private String templateName;
    private String action; // e.g. "CREATE", "UPDATE", "DELETE", "ROLLBACK"
    private String modifiedBy;
    private LocalDateTime modifiedDate;
    private String changes; // JSON string or text summary of what changed
}
