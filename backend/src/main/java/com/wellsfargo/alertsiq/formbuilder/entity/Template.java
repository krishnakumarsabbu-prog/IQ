package com.wellsfargo.alertsiq.formbuilder.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "CONTENT_TEMPLATE")
public class Template {
    @Id
    private String id;
    private String templateId;
    private String templateName;
    private String description;
    
    @Builder.Default
    private List<Tab> tabs = new ArrayList<>();
    
    private String version;
    private String createdBy;
    private LocalDateTime createdDate;
    private String updatedBy;
    private LocalDateTime updatedDate;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Tab {
        private String tabId;
        private String tabName;
        private int order;
        
        @Builder.Default
        private List<Section> sections = new ArrayList<>();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Section {
        private String sectionId;
        private String sectionName;
        private String description;
        private String icon;
        private boolean collapsible;
        private boolean expandedByDefault;
        private int columns; // 1, 2, 3, or 4
        private String backgroundColor;
        private String borderStyle;
        private String visibilityRule;
        private int order;

        @Builder.Default
        private List<Field> fields = new ArrayList<>();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Field {
        private String fieldId;
        private String fieldKey;
        private String fieldType; // TextBox, TextArea, RichText, Dropdown, Toggle, etc.
        private String label;
        private String placeholder;
        private String tooltip;
        private String helpText;
        private String defaultValue;
        
        private boolean required;
        private boolean readOnly;
        private boolean hidden;

        private ValidationSettings validation;
        private AppearanceSettings appearance;
        private List<RuleSetting> rules;
        private AdvancedSettings advanced;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ValidationSettings {
        private Integer minLength;
        private Integer maxLength;
        private String regex;
        private Double minValue;
        private Double maxValue;
        private List<String> allowedValues;
        private String errorMessage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AppearanceSettings {
        private String width; // "25%", "50%", "75%", "100%"
        private String labelPosition; // "top", "left", "right"
        private String displayStyle; // "default", "outlined", "filled"
        private String backgroundColor;
        private String borderRadius;
        private String spacing;
        private String cssClass;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RuleSetting {
        private String ruleId;
        private String triggerField; // Field key to watch
        private String operator; // "==", "!=", ">", etc.
        private String value; // Value to compare with
        private String action; // "SHOW", "HIDE", "MAKE_REQUIRED", "READ_ONLY"
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdvancedSettings {
        private String apiMapping;
        private String mongoPropertyName;
        private String jsonPath;
        private boolean auditEnabled;
        private boolean searchable;
        private boolean exportable;
        private boolean versionControlled;
    }
}
