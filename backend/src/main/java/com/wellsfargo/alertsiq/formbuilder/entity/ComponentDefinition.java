package com.wellsfargo.alertsiq.formbuilder.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Represents a single Content Builder component type definition.
 * Stored in the COMPONENT_LIBRARY MongoDB collection.
 *
 * Built-in types are seeded at startup via ComponentLibraryDataInitializer.
 * Custom types can be added/edited/deleted via the Settings > Components UI.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "COMPONENT_LIBRARY")
public class ComponentDefinition {

    @Id
    private String id;

    /** Unique slug used as the key in the canvas (e.g. "paragraph", "cta") */
    private String kind;

    /** Human-readable display name (e.g. "Paragraph", "CTA Button") */
    private String label;

    /** Short description shown in the settings table */
    private String description;

    /**
     * Category for grouping:
     * text | action | media | data | layout | advanced
     */
    private String category;

    /** Lucide icon name rendered in the UI (e.g. "Type", "MousePointerClick") */
    private String icon;

    /** Pre-filled text shown when this component is added to the canvas */
    private String defaultText;

    /** Pre-filled URL (only applicable to action-type components) */
    private String defaultUrl;

    /**
     * false  → built-in (protected, cannot be deleted)
     * true   → user-created custom type
     */
    @Builder.Default
    private boolean custom = false;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
