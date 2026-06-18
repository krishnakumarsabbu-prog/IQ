package com.wellsfargo.alertsiq.formbuilder.controller;

import com.wellsfargo.alertsiq.formbuilder.entity.AuditLog;
import com.wellsfargo.alertsiq.formbuilder.service.AuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/audit")
public class AuditController {

    @Autowired
    private AuditService auditService;

    @GetMapping("/{templateId}")
    public ResponseEntity<List<AuditLog>> getAuditHistory(@PathVariable String templateId) {
        return ResponseEntity.ok(auditService.getAuditHistory(templateId));
    }
}
