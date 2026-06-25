package com.wellsfargo.alertsiq.formbuilder.controller;

import com.wellsfargo.alertsiq.formbuilder.entity.ComponentDefinition;
import com.wellsfargo.alertsiq.formbuilder.service.ComponentLibraryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for the Content Builder Component Library.
 *
 * Base URL: /api/component-library
 *
 * Endpoints:
 *   GET    /api/component-library          → all definitions (built-in + custom)
 *   GET    /api/component-library/{id}     → single definition by id or kind
 *   POST   /api/component-library          → create custom definition
 *   PUT    /api/component-library/{id}     → update definition
 *   DELETE /api/component-library/{id}     → delete custom definition
 *   GET    /api/component-library/custom   → only user-created definitions
 */
@RestController
@RequestMapping("/api/component-library")
@CrossOrigin(origins = "*")   // Allow Vite dev server (localhost:5173)
public class ComponentLibraryController {

    @Autowired
    private ComponentLibraryService service;

    /** GET all (built-in + custom) */
    @GetMapping
    public ResponseEntity<List<ComponentDefinition>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    /** GET only custom (user-created) */
    @GetMapping("/custom")
    public ResponseEntity<List<ComponentDefinition>> getCustomOnly() {
        return ResponseEntity.ok(service.getCustomOnly());
    }

    /** GET by id or kind slug */
    @GetMapping("/{id}")
    public ResponseEntity<ComponentDefinition> getById(@PathVariable String id) {
        return service.getById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /** POST — create new custom component type */
    @PostMapping
    public ResponseEntity<?> create(@RequestBody ComponentDefinition def) {
        try {
            return new ResponseEntity<>(service.create(def), HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /** PUT — update existing component type */
    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable String id,
            @RequestBody ComponentDefinition updates) {
        try {
            return ResponseEntity.ok(service.update(id, updates));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /** DELETE — only custom components can be deleted */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        try {
            service.delete(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            // Attempt to delete a built-in
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }
}
