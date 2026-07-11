package com.wellsfargo.alertsiq.formbuilder.documentdesigner.service;

import com.wellsfargo.alertsiq.formbuilder.documentdesigner.entity.DocumentTemplate;
import com.wellsfargo.alertsiq.formbuilder.documentdesigner.model.MongoField;
import com.wellsfargo.alertsiq.formbuilder.documentdesigner.repository.DocumentTemplateRepository;
import com.wellsfargo.alertsiq.formbuilder.entity.Template;
import com.wellsfargo.alertsiq.formbuilder.repository.TemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class DocumentTemplateService {

    @Autowired
    private DocumentTemplateRepository documentTemplateRepository;

    @Autowired
    private TemplateRepository templateRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

    public List<DocumentTemplate> getAllLayouts() {
        List<DocumentTemplate> layouts = documentTemplateRepository.findAll();
        if (layouts.isEmpty()) {
            // Seed a default template if none exist
            DocumentTemplate seed = createDefaultWelcomeLetter();
            seed = documentTemplateRepository.save(seed);
            return Collections.singletonList(seed);
        }
        return layouts;
    }

    public Optional<DocumentTemplate> getLayout(String id) {
        return documentTemplateRepository.findById(id);
    }

    public DocumentTemplate saveLayout(DocumentTemplate layout) {
        String now = LocalDateTime.now().format(DATE_FORMATTER);
        if (layout.getId() == null || layout.getId().isEmpty()) {
            layout.setId("layout_" + System.currentTimeMillis());
            layout.setCreatedDate(now);
            if (layout.getCreatedBy() == null) {
                layout.setCreatedBy("Padma N");
            }
        }
        layout.setUpdatedDate(now);
        if (layout.getUpdatedBy() == null) {
            layout.setUpdatedBy("Padma N");
        }
        return documentTemplateRepository.save(layout);
    }

    public void deleteLayout(String id) {
        documentTemplateRepository.deleteById(id);
    }

    public List<MongoField> getMongoFields(String templateId) {
        Map<String, MongoField> fieldMap = new LinkedHashMap<>();

        // Add standard fallback / system fields first
        addSystemField(fieldMap, "customerName", "Customer Name", "text");
        addSystemField(fieldMap, "customerId", "Customer ID", "text");
        addSystemField(fieldMap, "customerAddress", "Customer Address", "text");
        addSystemField(fieldMap, "customerNumber", "Customer Number", "text");
        addSystemField(fieldMap, "loanNumber", "Loan Number", "text");
        addSystemField(fieldMap, "loanAmount", "Loan Amount", "currency");
        addSystemField(fieldMap, "interestRate", "Interest Rate", "number");
        addSystemField(fieldMap, "loanStatus", "Loan Status", "text");
        addSystemField(fieldMap, "companyName", "Company Name", "text");
        addSystemField(fieldMap, "companyAddress", "Company Address", "text");
        addSystemField(fieldMap, "companyPhone", "Company Phone", "phone");
        addSystemField(fieldMap, "companyEmail", "Company Email", "email");
        addSystemField(fieldMap, "today", "Today Date", "date");
        addSystemField(fieldMap, "pageNumber", "Page Number", "number");
        addSystemField(fieldMap, "totalPages", "Total Pages", "number");
        addSystemField(fieldMap, "employeeId", "Employee ID", "text");
        addSystemField(fieldMap, "branchCode", "Branch Code", "text");
        addSystemField(fieldMap, "accountBalance", "Account Balance", "currency");
        addSystemField(fieldMap, "dueDate", "Due Date", "date");
        addSystemField(fieldMap, "referenceNumber", "Reference Number", "text");

        // Dynamically harvest fields from templates in MongoDB
        List<Template> templates;
        if (templateId != null && !templateId.isEmpty()) {
            Optional<Template> optionalTemplate = templateRepository.findByTemplateId(templateId);
            if (optionalTemplate.isPresent()) {
                templates = Collections.singletonList(optionalTemplate.get());
            } else {
                Optional<Template> byId = templateRepository.findById(templateId);
                templates = byId.map(Collections::singletonList).orElse(Collections.emptyList());
            }
        } else {
            templates = templateRepository.findAll();
        }

        for (Template template : templates) {
            if (template.getTabs() != null) {
                for (Template.Tab tab : template.getTabs()) {
                    if (tab.getSections() != null) {
                        for (Template.Section section : tab.getSections()) {
                            if (section.getFields() != null) {
                                for (Template.Field field : section.getFields()) {
                                    String fieldKey = field.getFieldKey();
                                    if (field.getAdvanced() != null && field.getAdvanced().getMongoPropertyName() != null && !field.getAdvanced().getMongoPropertyName().isEmpty()) {
                                        fieldKey = field.getAdvanced().getMongoPropertyName();
                                    }
                                    if (fieldKey != null && !fieldKey.isEmpty()) {
                                        MongoField mf = MongoField.builder()
                                                .id(fieldKey)
                                                .label(field.getLabel() != null ? field.getLabel() : fieldKey)
                                                .type(field.getFieldType() != null ? field.getFieldType().toLowerCase() : "text")
                                                .path(field.getAdvanced() != null ? field.getAdvanced().getApiMapping() : null)
                                                .build();
                                        fieldMap.put(fieldKey, mf);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        return new ArrayList<>(fieldMap.values());
    }

    private void addSystemField(Map<String, MongoField> map, String id, String label, String type) {
        map.put(id, MongoField.builder().id(id).label(label).type(type).build());
    }

    private DocumentTemplate createDefaultWelcomeLetter() {
        String now = LocalDateTime.now().format(DATE_FORMATTER);

        // margins
        DocumentTemplate.Margins margins = DocumentTemplate.Margins.builder()
                .top(40).right(40).bottom(40).left(40)
                .build();

        // pages
        DocumentTemplate.DocumentPage page = DocumentTemplate.DocumentPage.builder()
                .id("page_" + System.currentTimeMillis())
                .elements(new ArrayList<>())
                .header(new ArrayList<>())
                .footer(new ArrayList<>())
                .build();

        // Title
        DocumentTemplate.DocumentElement title = createBaseElement("statictext", 40, 40, 515, 40);
        title.setContent("LOAN ACCOUNT AGREEMENT & WELCOME LETTER");
        title.setTextStyle(DocumentTemplate.TextStyle.builder()
                .fontFamily("Arial").fontSize(16).bold(true).italic(false).underline(false).strikethrough(false)
                .color("#1e3a8a").align("center").lineHeight(1.2).letterSpacing(0)
                .build());

        // Date
        DocumentTemplate.DocumentElement dateField = createBaseElement("dynamicfield", 40, 100, 150, 20);
        dateField.setBinding(DocumentTemplate.DynamicBinding.builder().field("today").format("none").build());
        dateField.setTextStyle(DocumentTemplate.TextStyle.builder()
                .fontFamily("Arial").fontSize(10).bold(false).italic(true).underline(false).strikethrough(false)
                .color("#475569").align("left").lineHeight(1.2).letterSpacing(0)
                .build());

        // Body
        DocumentTemplate.DocumentElement body = createBaseElement("statictext", 40, 130, 515, 80);
        body.setContent("Dear {{customerName}},\n\nWe are pleased to inform you that your application for a loan with Wells Fargo Bank, N.A. has been approved. Below is a summary of your account details. Please review this information carefully and contact your support representative if you have any questions.");
        body.setTextStyle(DocumentTemplate.TextStyle.builder()
                .fontFamily("Arial").fontSize(11).bold(false).italic(false).underline(false).strikethrough(false)
                .color("#334155").align("left").lineHeight(1.4).letterSpacing(0)
                .build());

        // Table
        DocumentTemplate.DocumentElement table = createBaseElement("table", 40, 230, 515, 150);
        table.setTableType("keyvalue");
        table.setColumns(Arrays.asList(
                DocumentTemplate.TableColumn.builder().id("col_1").header("Customer Name").binding("customerName").width(250).build(),
                DocumentTemplate.TableColumn.builder().id("col_2").header("Customer ID").binding("customerId").width(250).build(),
                DocumentTemplate.TableColumn.builder().id("col_3").header("Loan Number").binding("loanNumber").width(250).build(),
                DocumentTemplate.TableColumn.builder().id("col_4").header("Loan Amount").binding("loanAmount").width(250).build(),
                DocumentTemplate.TableColumn.builder().id("col_5").header("Interest Rate").binding("interestRate").width(250).build()
        ));

        // Signature Label
        DocumentTemplate.DocumentElement sigLabel = createBaseElement("statictext", 40, 400, 250, 20);
        sigLabel.setContent("Authorized Representative Signature:");
        sigLabel.setTextStyle(DocumentTemplate.TextStyle.builder()
                .fontFamily("Arial").fontSize(10).bold(true).italic(false).underline(false).strikethrough(false)
                .color("#334155").align("left").lineHeight(1.2).letterSpacing(0)
                .build());

        // Signature line
        DocumentTemplate.DocumentElement sigLine = createBaseElement("hline", 40, 450, 200, 10);
        sigLine.setBorder(DocumentTemplate.BorderStyle.builder().width(1).color("#94a3b8").style("solid").radius(0).build());

        // Company Name
        DocumentTemplate.DocumentElement companyName = createBaseElement("statictext", 40, 465, 200, 20);
        companyName.setContent("Wells Fargo Bank, N.A.");
        companyName.setTextStyle(DocumentTemplate.TextStyle.builder()
                .fontFamily("Arial").fontSize(10).bold(false).italic(false).underline(false).strikethrough(false)
                .color("#475569").align("left").lineHeight(1.2).letterSpacing(0)
                .build());

        page.getElements().addAll(Arrays.asList(title, dateField, body, table, sigLabel, sigLine, companyName));

        return DocumentTemplate.builder()
                .id("layout_welcome_letter")
                .name("Welcome Letter Layout")
                .description("Default layout for welcome letter template.")
                .paper("A4")
                .orientation("portrait")
                .margins(margins)
                .pages(Collections.singletonList(page))
                .status("published")
                .version("1.0")
                .createdBy("Padma N")
                .createdDate(now)
                .updatedBy("Padma N")
                .updatedDate(now)
                .build();
    }

    private DocumentTemplate.DocumentElement createBaseElement(String type, double x, double y, double w, double h) {
        return DocumentTemplate.DocumentElement.builder()
                .id("el_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 5))
                .type(type)
                .x(x).y(y).width(w).height(h)
                .rotation(0).visible(true).locked(false).opacity(1.0).zIndex(0)
                .content("")
                .textStyle(DocumentTemplate.TextStyle.builder()
                        .fontFamily("Arial").fontSize(12).bold(false).italic(false).underline(false).strikethrough(false)
                        .color("#1e293b").align("left").lineHeight(1.4).letterSpacing(0)
                        .build())
                .border(DocumentTemplate.BorderStyle.builder()
                        .width(0).color("#cbd5e1").style("solid").radius(0)
                        .build())
                .backgroundColor("transparent")
                .padding(4)
                .build();
    }
}
