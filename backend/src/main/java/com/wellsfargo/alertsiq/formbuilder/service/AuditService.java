package com.wellsfargo.alertsiq.formbuilder.service;

import com.wellsfargo.alertsiq.formbuilder.entity.AuditLog;
import com.wellsfargo.alertsiq.formbuilder.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuditService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    public void logAction(String templateId, String templateName, String action, String modifiedBy, String changes) {
        AuditLog log = AuditLog.builder()
                .templateId(templateId)
                .templateName(templateName)
                .action(action)
                .modifiedBy(modifiedBy != null ? modifiedBy : "system_user")
                .modifiedDate(LocalDateTime.now())
                .changes(changes)
                .build();
        auditLogRepository.save(log);
    }

    public List<AuditLog> getAuditHistory(String templateId) {
        return auditLogRepository.findByTemplateIdOrderByModifiedDateDesc(templateId);
    }
}
