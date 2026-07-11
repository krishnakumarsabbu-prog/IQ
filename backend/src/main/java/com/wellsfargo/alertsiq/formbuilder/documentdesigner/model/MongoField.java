package com.wellsfargo.alertsiq.formbuilder.documentdesigner.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MongoField {
    private String id;
    private String label;
    private String type;
    private String path;
    private String arrayPath;
}
