package com.wellsfargo.alertsiq.formbuilder.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "DROPDOWN_MASTERS")
public class DropdownMaster {
    @Id
    private String id;
    private String masterId;
    private String masterName;
    
    @Builder.Default
    private List<DropdownItem> items = new ArrayList<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DropdownItem {
        private String label;
        private String value;
    }
}
