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
@Document(collection = "TEMPLATE_VERSIONS")
public class TemplateVersion {
    @Id
    private String id;
    private String templateId;
    private String templateName;
    private String version; // e.g. "V1.0", "V1.1", "V2.0"
    private String templateMetadataJson; // Full serialized snapshot of the Template structure
    private String createdBy;
    private LocalDateTime createdDate;
    private String changeLog;
}
