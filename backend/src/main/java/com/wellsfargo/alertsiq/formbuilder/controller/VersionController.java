package com.wellsfargo.alertsiq.formbuilder.controller;

import com.wellsfargo.alertsiq.formbuilder.entity.Template;
import com.wellsfargo.alertsiq.formbuilder.entity.TemplateVersion;
import com.wellsfargo.alertsiq.formbuilder.service.VersionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/templates")
public class VersionController {

    @Autowired
    private VersionService versionService;

    @GetMapping("/{id}/versions")
    public ResponseEntity<List<TemplateVersion>> getVersions(@PathVariable String id) {
        return ResponseEntity.ok(versionService.getVersions(id));
    }

    @PostMapping("/{id}/rollback/{version}")
    public ResponseEntity<Template> rollbackVersion(
            @PathVariable String id,
            @PathVariable String version,
            @RequestParam(required = false, defaultValue = "system_user") String modifiedBy) {
        try {
            Template rolledBack = versionService.rollback(id, version, modifiedBy);
            return ResponseEntity.ok(rolledBack);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
