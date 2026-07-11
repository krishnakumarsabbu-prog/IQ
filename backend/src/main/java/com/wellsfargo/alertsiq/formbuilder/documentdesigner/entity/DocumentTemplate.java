package com.wellsfargo.alertsiq.formbuilder.documentdesigner.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "DOCUMENT_LAYOUTS")
public class DocumentTemplate {
    @Id
    private String id;
    private String name;
    private String description;
    private String paper; // A4, A3, Letter, Legal
    private String orientation; // portrait, landscape
    private Margins margins;
    private List<DocumentPage> pages;
    private String version;
    private String status; // draft, published
    private String createdBy;
    private String createdDate;
    private String updatedBy;
    private String updatedDate;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Margins {
        private double top;
        private double right;
        private double bottom;
        private double left;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DocumentPage {
        private String id;
        private List<DocumentElement> elements;
        private List<DocumentElement> header;
        private List<DocumentElement> footer;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DocumentElement {
        private String id;
        private String type;
        private double x;
        private double y;
        private double width;
        private double height;
        private double rotation;
        private boolean visible;
        private boolean locked;
        private double opacity;
        private int zIndex;

        // Content
        private String content;
        private DynamicBinding binding;

        // Style
        private TextStyle textStyle;
        private BorderStyle border;
        private String backgroundColor;
        private double padding;

        // Table specific
        private List<TableColumn> columns;
        private String arrayBinding;
        private String tableType; // grid, keyvalue

        // Image specific
        private String imageUrl;
        private Boolean maintainAspectRatio;

        // Barcode / QR
        private String barcodeType;

        // Page number
        private String pageNumberFormat;

        // Section
        private String sectionId;
        private String sectionLabel;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DynamicBinding {
        private String field;
        private String format;
        private String formatPattern;
        private String defaultValue;
        private String nullValue;
        private String conditionalExpression;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TextStyle {
        private String fontFamily;
        private double fontSize;
        private boolean bold;
        private boolean italic;
        private boolean underline;
        private boolean strikethrough;
        private String align;
        private double letterSpacing;
        private double lineHeight;
        private String color;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BorderStyle {
        private double width;
        private String color;
        private String style;
        private double radius;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TableColumn {
        private String id;
        private String header;
        private String binding;
        private double width;
    }
}
