package com.wellsfargo.alertsiq.formbuilder.service;

import com.wellsfargo.alertsiq.formbuilder.entity.ComponentDefinition;
import com.wellsfargo.alertsiq.formbuilder.repository.ComponentDefinitionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Business logic for the Content Builder component library.
 *
 * Rules:
 *  - Built-in components (custom=false) are protected: they can be read
 *    but NOT deleted. Their label/description/defaultText CAN be updated.
 *  - Custom components (custom=true) can be fully created, updated, deleted.
 *  - Kind slugs are globally unique (enforced at creation time).
 */
@Service
public class ComponentLibraryService {

    @Autowired
    private ComponentDefinitionRepository repository;

    // ── CRUD ──────────────────────────────────────────────────────────────────

    /** Return all component definitions (built-in + custom), ordered by category then label */
    public List<ComponentDefinition> getAll() {
        return repository.findAll();
    }

    /** Return all custom (user-created) definitions */
    public List<ComponentDefinition> getCustomOnly() {
        return repository.findByCustomTrue();
    }

    /** Fetch a single definition by MongoDB _id or by kind slug */
    public Optional<ComponentDefinition> getById(String id) {
        Optional<ComponentDefinition> byId = repository.findById(id);
        if (byId.isPresent()) return byId;
        return repository.findByKind(id);
    }

    /**
     * Create a new custom component definition.
     * Validates that the kind slug is unique.
     */
    public ComponentDefinition create(ComponentDefinition def) {
        // Ensure a kind is provided
        if (def.getKind() == null || def.getKind().isBlank()) {
            throw new IllegalArgumentException("Component kind (slug) is required.");
        }

        // Kind must be unique
        if (repository.existsByKind(def.getKind())) {
            throw new IllegalArgumentException(
                "Component kind '" + def.getKind() + "' already exists.");
        }

        // Auto-generate id if missing
        if (def.getId() == null || def.getId().isBlank()) {
            def.setId("cmp_" + UUID.randomUUID().toString().replace("-", "").substring(0, 10));
        }

        def.setCustom(true);  // user-created components are always custom
        def.setCreatedAt(LocalDateTime.now());
        def.setUpdatedAt(LocalDateTime.now());

        return repository.save(def);
    }

    /**
     * Update an existing definition.
     * Built-in components can have their display properties updated,
     * but their kind slug cannot be changed.
     */
    public ComponentDefinition update(String id, ComponentDefinition updates) {
        ComponentDefinition existing = getById(id)
            .orElseThrow(() -> new IllegalArgumentException(
                "Component definition not found: " + id));

        // Update allowed fields
        if (updates.getLabel() != null)       existing.setLabel(updates.getLabel());
        if (updates.getDescription() != null) existing.setDescription(updates.getDescription());
        if (updates.getCategory() != null)    existing.setCategory(updates.getCategory());
        if (updates.getIcon() != null)        existing.setIcon(updates.getIcon());
        if (updates.getDefaultText() != null) existing.setDefaultText(updates.getDefaultText());
        if (updates.getDefaultUrl() != null)  existing.setDefaultUrl(updates.getDefaultUrl());

        // Kind can only be changed for custom components (built-ins are protected)
        if (existing.isCustom() && updates.getKind() != null
                && !updates.getKind().equals(existing.getKind())) {
            if (repository.existsByKind(updates.getKind())) {
                throw new IllegalArgumentException(
                    "Component kind '" + updates.getKind() + "' already exists.");
            }
            existing.setKind(updates.getKind());
        }

        existing.setUpdatedAt(LocalDateTime.now());
        return repository.save(existing);
    }

    /**
     * Delete a custom component.
     * Built-in (custom=false) components cannot be deleted.
     */
    public void delete(String id) {
        ComponentDefinition existing = getById(id)
            .orElseThrow(() -> new IllegalArgumentException(
                "Component definition not found: " + id));

        if (!existing.isCustom()) {
            throw new IllegalStateException(
                "Built-in component '" + existing.getKind() + "' cannot be deleted.");
        }

        repository.delete(existing);
    }

    // ── Seeding ───────────────────────────────────────────────────────────────

    /**
     * Called at startup by ComponentLibraryDataInitializer.
     * Inserts a built-in definition only if its kind does not already exist.
     */
    public void seedIfAbsent(ComponentDefinition def) {
        if (!repository.existsByKind(def.getKind())) {
            def.setCustom(false);
            def.setCreatedAt(LocalDateTime.now());
            def.setUpdatedAt(LocalDateTime.now());
            repository.save(def);
        }
    }
}
