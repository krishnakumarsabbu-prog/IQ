package com.wellsfargo.alertsiq.formbuilder.service;

import com.wellsfargo.alertsiq.formbuilder.entity.Template;
import com.wellsfargo.alertsiq.formbuilder.repository.TemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class TemplateService {

    @Autowired
    private TemplateRepository templateRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private AuditService auditService;

    @Autowired
    private VersionService versionService;

    // --- TEMPLATE CRUD ---

    public Template createTemplate(Template template) {
        if (template.getTemplateId() == null || template.getTemplateId().isEmpty()) {
            template.setTemplateId("tmpl_" + UUID.randomUUID().toString().substring(0, 8));
        }
        template.setVersion("1.0");
        template.setCreatedDate(LocalDateTime.now());
        template.setUpdatedDate(LocalDateTime.now());
        if (template.getCreatedBy() == null) {
            template.setCreatedBy("system_user");
        }
        template.setUpdatedBy(template.getCreatedBy());

        Template saved = templateRepository.save(template);
        auditService.logAction(saved.getTemplateId(), saved.getTemplateName(), "CREATE", saved.getCreatedBy(), "Created initial template.");
        return saved;
    }

    public List<Template> getAllTemplates() {
        return templateRepository.findAll();
    }

    public Optional<Template> getTemplate(String id) {
        // Try finding by MongoDB generated _id first, then fallback to business key templateId
        Optional<Template> byId = templateRepository.findById(id);
        if (byId.isPresent()) return byId;
        return templateRepository.findByTemplateId(id);
    }

    public Template updateTemplate(String id, Template templateUpdates) {
        Template existing = getTemplate(id)
                .orElseThrow(() -> new IllegalArgumentException("Template not found with ID: " + id));

        existing.setTemplateName(templateUpdates.getTemplateName());
        existing.setDescription(templateUpdates.getDescription());
        if (templateUpdates.getTabs() != null) {
            existing.setTabs(templateUpdates.getTabs());
        }
        existing.setUpdatedDate(LocalDateTime.now());
        existing.setUpdatedBy(templateUpdates.getUpdatedBy() != null ? templateUpdates.getUpdatedBy() : "system_user");

        // Automatically create a version snapshot
        versionService.createVersion(existing, "Updated template configuration.", existing.getUpdatedBy());
        return templateRepository.save(existing);
    }

    public void deleteTemplate(String id) {
        Template template = getTemplate(id)
                .orElseThrow(() -> new IllegalArgumentException("Template not found with ID: " + id));
        templateRepository.delete(template);
        auditService.logAction(template.getTemplateId(), template.getTemplateName(), "DELETE", "system_user", "Deleted template.");
    }

    // --- TAB APIs ---

    public Template addTab(String templateId, Template.Tab tab) {
        Template template = getTemplate(templateId)
                .orElseThrow(() -> new IllegalArgumentException("Template not found with ID: " + templateId));

        if (tab.getTabId() == null || tab.getTabId().isEmpty()) {
            tab.setTabId("tab_" + UUID.randomUUID().toString().substring(0, 8));
        }

        template.getTabs().add(tab);
        template.setUpdatedDate(LocalDateTime.now());
        
        versionService.createVersion(template, "Added tab '" + tab.getTabName() + "'", "system_user");
        return templateRepository.save(template);
    }

    public Template updateTab(String tabId, Template.Tab tabUpdates) {
        Query query = new Query(Criteria.where("tabs.tabId").is(tabId));
        Template template = mongoTemplate.findOne(query, Template.class);
        if (template == null) {
            throw new IllegalArgumentException("Tab not found with ID: " + tabId);
        }

        for (Template.Tab tab : template.getTabs()) {
            if (tab.getTabId().equals(tabId)) {
                if (tabUpdates.getTabName() != null) tab.setTabName(tabUpdates.getTabName());
                tab.setOrder(tabUpdates.getOrder());
                if (tabUpdates.getSections() != null) tab.setSections(tabUpdates.getSections());
                break;
            }
        }

        template.setUpdatedDate(LocalDateTime.now());
        versionService.createVersion(template, "Updated tab '" + tabUpdates.getTabName() + "'", "system_user");
        return templateRepository.save(template);
    }

    public Template deleteTab(String tabId) {
        Query query = new Query(Criteria.where("tabs.tabId").is(tabId));
        Template template = mongoTemplate.findOne(query, Template.class);
        if (template == null) {
            throw new IllegalArgumentException("Tab not found with ID: " + tabId);
        }

        template.getTabs().removeIf(tab -> tab.getTabId().equals(tabId));
        template.setUpdatedDate(LocalDateTime.now());
        versionService.createVersion(template, "Deleted tab with ID " + tabId, "system_user");
        return templateRepository.save(template);
    }

    // --- SECTION APIs ---

    public Template addSection(String tabId, Template.Section section) {
        Query query = new Query(Criteria.where("tabs.tabId").is(tabId));
        Template template = mongoTemplate.findOne(query, Template.class);
        if (template == null) {
            throw new IllegalArgumentException("Tab not found with ID: " + tabId);
        }

        if (section.getSectionId() == null || section.getSectionId().isEmpty()) {
            section.setSectionId("sec_" + UUID.randomUUID().toString().substring(0, 8));
        }

        for (Template.Tab tab : template.getTabs()) {
            if (tab.getTabId().equals(tabId)) {
                tab.getSections().add(section);
                break;
            }
        }

        template.setUpdatedDate(LocalDateTime.now());
        versionService.createVersion(template, "Added section '" + section.getSectionName() + "' to tab " + tabId, "system_user");
        return templateRepository.save(template);
    }

    public Template updateSection(String sectionId, Template.Section sectionUpdates) {
        Query query = new Query(Criteria.where("tabs.sections.sectionId").is(sectionId));
        Template template = mongoTemplate.findOne(query, Template.class);
        if (template == null) {
            throw new IllegalArgumentException("Section not found with ID: " + sectionId);
        }

        for (Template.Tab tab : template.getTabs()) {
            for (Template.Section section : tab.getSections()) {
                if (section.getSectionId().equals(sectionId)) {
                    if (sectionUpdates.getSectionName() != null) section.setSectionName(sectionUpdates.getSectionName());
                    if (sectionUpdates.getDescription() != null) section.setDescription(sectionUpdates.getDescription());
                    if (sectionUpdates.getIcon() != null) section.setIcon(sectionUpdates.getIcon());
                    section.setCollapsible(sectionUpdates.isCollapsible());
                    section.setExpandedByDefault(sectionUpdates.isExpandedByDefault());
                    if (sectionUpdates.getColumns() > 0) section.setColumns(sectionUpdates.getColumns());
                    if (sectionUpdates.getBackgroundColor() != null) section.setBackgroundColor(sectionUpdates.getBackgroundColor());
                    if (sectionUpdates.getBorderStyle() != null) section.setBorderStyle(sectionUpdates.getBorderStyle());
                    if (sectionUpdates.getVisibilityRule() != null) section.setVisibilityRule(sectionUpdates.getVisibilityRule());
                    section.setOrder(sectionUpdates.getOrder());
                    if (sectionUpdates.getFields() != null) section.setFields(sectionUpdates.getFields());
                    break;
                }
            }
        }

        template.setUpdatedDate(LocalDateTime.now());
        versionService.createVersion(template, "Updated section with ID " + sectionId, "system_user");
        return templateRepository.save(template);
    }

    public Template deleteSection(String sectionId) {
        Query query = new Query(Criteria.where("tabs.sections.sectionId").is(sectionId));
        Template template = mongoTemplate.findOne(query, Template.class);
        if (template == null) {
            throw new IllegalArgumentException("Section not found with ID: " + sectionId);
        }

        for (Template.Tab tab : template.getTabs()) {
            tab.getSections().removeIf(section -> section.getSectionId().equals(sectionId));
        }

        template.setUpdatedDate(LocalDateTime.now());
        versionService.createVersion(template, "Deleted section with ID " + sectionId, "system_user");
        return templateRepository.save(template);
    }

    // --- FIELD APIs ---

    public Template addField(String sectionId, Template.Field field) {
        Query query = new Query(Criteria.where("tabs.sections.sectionId").is(sectionId));
        Template template = mongoTemplate.findOne(query, Template.class);
        if (template == null) {
            throw new IllegalArgumentException("Section not found with ID: " + sectionId);
        }

        if (field.getFieldId() == null || field.getFieldId().isEmpty()) {
            field.setFieldId("fld_" + UUID.randomUUID().toString().substring(0, 8));
        }

        for (Template.Tab tab : template.getTabs()) {
            for (Template.Section section : tab.getSections()) {
                if (section.getSectionId().equals(sectionId)) {
                    section.getFields().add(field);
                    break;
                }
            }
        }

        template.setUpdatedDate(LocalDateTime.now());
        versionService.createVersion(template, "Added field '" + field.getLabel() + "' to section " + sectionId, "system_user");
        return templateRepository.save(template);
    }

    public Template updateField(String fieldId, Template.Field fieldUpdates) {
        Query query = new Query(Criteria.where("tabs.sections.fields.fieldId").is(fieldId));
        Template template = mongoTemplate.findOne(query, Template.class);
        if (template == null) {
            throw new IllegalArgumentException("Field not found with ID: " + fieldId);
        }

        for (Template.Tab tab : template.getTabs()) {
            for (Template.Section section : tab.getSections()) {
                for (int i = 0; i < section.getFields().size(); i++) {
                    Template.Field field = section.getFields().get(i);
                    if (field.getFieldId().equals(fieldId)) {
                        // Merge updates
                        if (fieldUpdates.getFieldKey() != null) field.setFieldKey(fieldUpdates.getFieldKey());
                        if (fieldUpdates.getFieldType() != null) field.setFieldType(fieldUpdates.getFieldType());
                        if (fieldUpdates.getLabel() != null) field.setLabel(fieldUpdates.getLabel());
                        if (fieldUpdates.getPlaceholder() != null) field.setPlaceholder(fieldUpdates.getPlaceholder());
                        if (fieldUpdates.getTooltip() != null) field.setTooltip(fieldUpdates.getTooltip());
                        if (fieldUpdates.getHelpText() != null) field.setHelpText(fieldUpdates.getHelpText());
                        if (fieldUpdates.getDefaultValue() != null) field.setDefaultValue(fieldUpdates.getDefaultValue());
                        field.setRequired(fieldUpdates.isRequired());
                        field.setReadOnly(fieldUpdates.isReadOnly());
                        field.setHidden(fieldUpdates.isHidden());
                        if (fieldUpdates.getValidation() != null) field.setValidation(fieldUpdates.getValidation());
                        if (fieldUpdates.getAppearance() != null) field.setAppearance(fieldUpdates.getAppearance());
                        if (fieldUpdates.getRules() != null) field.setRules(fieldUpdates.getRules());
                        if (fieldUpdates.getAdvanced() != null) field.setAdvanced(fieldUpdates.getAdvanced());
                        break;
                    }
                }
            }
        }

        template.setUpdatedDate(LocalDateTime.now());
        versionService.createVersion(template, "Updated field with ID " + fieldId, "system_user");
        return templateRepository.save(template);
    }

    public Template deleteField(String fieldId) {
        Query query = new Query(Criteria.where("tabs.sections.fields.fieldId").is(fieldId));
        Template template = mongoTemplate.findOne(query, Template.class);
        if (template == null) {
            throw new IllegalArgumentException("Field not found with ID: " + fieldId);
        }

        for (Template.Tab tab : template.getTabs()) {
            for (Template.Section section : tab.getSections()) {
                section.getFields().removeIf(field -> field.getFieldId().equals(fieldId));
            }
        }

        template.setUpdatedDate(LocalDateTime.now());
        versionService.createVersion(template, "Deleted field with ID " + fieldId, "system_user");
        return templateRepository.save(template);
    }
}
