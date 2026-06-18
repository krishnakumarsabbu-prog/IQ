package com.wellsfargo.alertsiq.formbuilder.controller;

import com.wellsfargo.alertsiq.formbuilder.entity.Template;
import com.wellsfargo.alertsiq.formbuilder.service.TemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class TemplateController {

    @Autowired
    private TemplateService templateService;

    // --- TEMPLATE ENDPOINTS ---

    @PostMapping("/templates")
    public ResponseEntity<Template> createTemplate(@RequestBody Template template) {
        return new ResponseEntity<>(templateService.createTemplate(template), HttpStatus.CREATED);
    }

    @GetMapping("/templates")
    public ResponseEntity<List<Template>> getAllTemplates() {
        return ResponseEntity.ok(templateService.getAllTemplates());
    }

    @GetMapping("/templates/{id}")
    public ResponseEntity<Template> getTemplate(@PathVariable String id) {
        return templateService.getTemplate(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/templates/{id}")
    public ResponseEntity<Template> updateTemplate(@PathVariable String id, @RequestBody Template templateUpdates) {
        try {
            return ResponseEntity.ok(templateService.updateTemplate(id, templateUpdates));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/templates/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable String id) {
        try {
            templateService.deleteTemplate(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // --- TAB ENDPOINTS ---

    @PostMapping("/templates/{id}/tabs")
    public ResponseEntity<Template> addTab(@PathVariable String id, @RequestBody Template.Tab tab) {
        try {
            return new ResponseEntity<>(templateService.addTab(id, tab), HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/tabs/{id}")
    public ResponseEntity<Template> updateTab(@PathVariable String id, @RequestBody Template.Tab tabUpdates) {
        try {
            return ResponseEntity.ok(templateService.updateTab(id, tabUpdates));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/tabs/{id}")
    public ResponseEntity<Template> deleteTab(@PathVariable String id) {
        try {
            return ResponseEntity.ok(templateService.deleteTab(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // --- SECTION ENDPOINTS ---

    @PostMapping("/tabs/{id}/sections")
    public ResponseEntity<Template> addSection(@PathVariable String id, @RequestBody Template.Section section) {
        try {
            return new ResponseEntity<>(templateService.addSection(id, section), HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/sections/{id}")
    public ResponseEntity<Template> updateSection(@PathVariable String id, @RequestBody Template.Section sectionUpdates) {
        try {
            return ResponseEntity.ok(templateService.updateSection(id, sectionUpdates));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/sections/{id}")
    public ResponseEntity<Template> deleteSection(@PathVariable String id) {
        try {
            return ResponseEntity.ok(templateService.deleteSection(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // --- FIELD ENDPOINTS ---

    @PostMapping("/sections/{id}/fields")
    public ResponseEntity<Template> addField(@PathVariable String id, @RequestBody Template.Field field) {
        try {
            return new ResponseEntity<>(templateService.addField(id, field), HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/fields/{id}")
    public ResponseEntity<Template> updateField(@PathVariable String id, @RequestBody Template.Field fieldUpdates) {
        try {
            return ResponseEntity.ok(templateService.updateField(id, fieldUpdates));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/fields/{id}")
    public ResponseEntity<Template> deleteField(@PathVariable String id) {
        try {
            return ResponseEntity.ok(templateService.deleteField(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
