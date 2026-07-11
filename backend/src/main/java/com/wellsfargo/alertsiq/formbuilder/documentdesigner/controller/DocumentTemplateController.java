package com.wellsfargo.alertsiq.formbuilder.documentdesigner.controller;

import com.wellsfargo.alertsiq.formbuilder.documentdesigner.entity.DocumentTemplate;
import com.wellsfargo.alertsiq.formbuilder.documentdesigner.model.MongoField;
import com.wellsfargo.alertsiq.formbuilder.documentdesigner.service.DocumentTemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/document-layouts")
public class DocumentTemplateController {

    @Autowired
    private DocumentTemplateService documentTemplateService;

    @GetMapping
    public ResponseEntity<List<DocumentTemplate>> getAllLayouts() {
        return ResponseEntity.ok(documentTemplateService.getAllLayouts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentTemplate> getLayout(@PathVariable String id) {
        return documentTemplateService.getLayout(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<DocumentTemplate> createLayout(@RequestBody DocumentTemplate layout) {
        return new ResponseEntity<>(documentTemplateService.saveLayout(layout), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DocumentTemplate> updateLayout(@PathVariable String id, @RequestBody DocumentTemplate layout) {
        // Enforce the path ID on the layout
        layout.setId(id);
        return ResponseEntity.ok(documentTemplateService.saveLayout(layout));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLayout(@PathVariable String id) {
        try {
            documentTemplateService.deleteLayout(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/fields")
    public ResponseEntity<List<MongoField>> getMongoFields(@RequestParam(required = false) String templateId) {
        return ResponseEntity.ok(documentTemplateService.getMongoFields(templateId));
    }
}
