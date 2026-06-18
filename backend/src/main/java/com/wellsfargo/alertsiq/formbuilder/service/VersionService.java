package com.wellsfargo.alertsiq.formbuilder.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.wellsfargo.alertsiq.formbuilder.entity.Template;
import com.wellsfargo.alertsiq.formbuilder.entity.TemplateVersion;
import com.wellsfargo.alertsiq.formbuilder.repository.TemplateRepository;
import com.wellsfargo.alertsiq.formbuilder.repository.TemplateVersionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class VersionService {

    @Autowired
    private TemplateVersionRepository versionRepository;

    @Autowired
    private TemplateRepository templateRepository;

    @Autowired
    private AuditService auditService;

    private final ObjectMapper objectMapper;

    public VersionService() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    public TemplateVersion createVersion(Template template, String changeLog, String createdBy) {
        try {
            String json = objectMapper.writeValueAsString(template);
            
            // Calculate next version
            String currentVersion = template.getVersion() != null ? template.getVersion() : "1.0";
            String nextVersion = incrementVersion(currentVersion);
            template.setVersion(nextVersion);
            templateRepository.save(template);

            TemplateVersion versionRecord = TemplateVersion.builder()
                    .templateId(template.getTemplateId())
                    .templateName(template.getTemplateName())
                    .version(nextVersion)
                    .templateMetadataJson(json)
                    .createdBy(createdBy != null ? createdBy : "system_user")
                    .createdDate(LocalDateTime.now())
                    .changeLog(changeLog != null ? changeLog : "Saved configuration changes.")
                    .build();

            TemplateVersion saved = versionRepository.save(versionRecord);
            
            auditService.logAction(
                    template.getTemplateId(),
                    template.getTemplateName(),
                    "SAVE_VERSION",
                    createdBy,
                    "Created version " + nextVersion + ". Notes: " + changeLog
            );
            
            return saved;
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize template and create version snapshot", e);
        }
    }

    public List<TemplateVersion> getVersions(String templateId) {
        return versionRepository.findByTemplateIdOrderByCreatedDateDesc(templateId);
    }

    public Template rollback(String templateId, String version, String modifiedBy) {
        try {
            Optional<TemplateVersion> versionSnapshot = versionRepository.findByTemplateIdAndVersion(templateId, version);
            if (versionSnapshot.isEmpty()) {
                throw new IllegalArgumentException("Version " + version + " not found for template " + templateId);
            }

            TemplateVersion snapshot = versionSnapshot.get();
            Template deserializedTemplate = objectMapper.readValue(snapshot.getTemplateMetadataJson(), Template.class);

            // Fetch current template db record to preserve system fields if any
            Optional<Template> currentTemplateOpt = templateRepository.findByTemplateId(templateId);
            if (currentTemplateOpt.isPresent()) {
                Template current = currentTemplateOpt.get();
                deserializedTemplate.setId(current.getId());
            }

            // Bump version on rollback
            String currentVer = deserializedTemplate.getVersion();
            String rolledBackVer = incrementVersion(currentVer) + "-rollback";
            deserializedTemplate.setVersion(rolledBackVer);
            deserializedTemplate.setUpdatedBy(modifiedBy);
            deserializedTemplate.setUpdatedDate(LocalDateTime.now());

            Template saved = templateRepository.save(deserializedTemplate);

            auditService.logAction(
                    templateId,
                    saved.getTemplateName(),
                    "ROLLBACK",
                    modifiedBy,
                    "Rolled back to version " + version + ". New version code: " + rolledBackVer
            );

            return saved;
        } catch (Exception e) {
            throw new RuntimeException("Failed to perform rollback operation", e);
        }
    }

    private String incrementVersion(String currentVersion) {
        if (currentVersion == null || currentVersion.isEmpty()) {
            return "1.0";
        }
        // Remove trailing descriptors like -rollback or V
        String clean = currentVersion.replace("V", "").replace("v", "").split("-")[0];
        try {
            double v = Double.parseDouble(clean);
            return String.format("%.1f", v + 0.1);
        } catch (NumberFormatException e) {
            return currentVersion + ".1";
        }
    }
}
