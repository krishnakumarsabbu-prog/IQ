package com.wellsfargo.alertsiq.formbuilder.service;

import com.wellsfargo.alertsiq.formbuilder.entity.DropdownMaster;
import com.wellsfargo.alertsiq.formbuilder.repository.DropdownMasterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class DropdownService {

    @Autowired
    private DropdownMasterRepository dropdownMasterRepository;

    public DropdownMaster createDropdown(DropdownMaster dropdownMaster) {
        if (dropdownMaster.getMasterId() == null || dropdownMaster.getMasterId().isEmpty()) {
            dropdownMaster.setMasterId("master_" + UUID.randomUUID().toString().substring(0, 8));
        }
        return dropdownMasterRepository.save(dropdownMaster);
    }

    public List<DropdownMaster> getAllDropdowns() {
        return dropdownMasterRepository.findAll();
    }

    public Optional<DropdownMaster> getDropdown(String id) {
        Optional<DropdownMaster> byId = dropdownMasterRepository.findById(id);
        if (byId.isPresent()) return byId;
        return dropdownMasterRepository.findByMasterId(id);
    }

    public DropdownMaster updateDropdown(String id, DropdownMaster updates) {
        DropdownMaster existing = getDropdown(id)
                .orElseThrow(() -> new IllegalArgumentException("Dropdown Master not found with ID: " + id));

        existing.setMasterName(updates.getMasterName());
        if (updates.getItems() != null) {
            existing.setItems(updates.getItems());
        }
        return dropdownMasterRepository.save(existing);
    }

    public void deleteDropdown(String id) {
        DropdownMaster dropdownMaster = getDropdown(id)
                .orElseThrow(() -> new IllegalArgumentException("Dropdown Master not found with ID: " + id));
        dropdownMasterRepository.delete(dropdownMaster);
    }
}
