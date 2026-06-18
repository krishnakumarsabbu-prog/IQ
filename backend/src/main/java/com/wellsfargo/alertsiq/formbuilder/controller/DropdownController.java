package com.wellsfargo.alertsiq.formbuilder.controller;

import com.wellsfargo.alertsiq.formbuilder.entity.DropdownMaster;
import com.wellsfargo.alertsiq.formbuilder.service.DropdownService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/masters/dropdowns")
public class DropdownController {

    @Autowired
    private DropdownService dropdownService;

    @PostMapping
    public ResponseEntity<DropdownMaster> createDropdown(@RequestBody DropdownMaster dropdownMaster) {
        return new ResponseEntity<>(dropdownService.createDropdown(dropdownMaster), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<DropdownMaster>> getAllDropdowns() {
        return ResponseEntity.ok(dropdownService.getAllDropdowns());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DropdownMaster> getDropdown(@PathVariable String id) {
        return dropdownService.getDropdown(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<DropdownMaster> updateDropdown(@PathVariable String id, @RequestBody DropdownMaster updates) {
        try {
            return ResponseEntity.ok(dropdownService.updateDropdown(id, updates));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDropdown(@PathVariable String id) {
        try {
            dropdownService.deleteDropdown(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
