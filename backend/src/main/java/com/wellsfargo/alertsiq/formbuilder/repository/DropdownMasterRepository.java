package com.wellsfargo.alertsiq.formbuilder.repository;

import com.wellsfargo.alertsiq.formbuilder.entity.DropdownMaster;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DropdownMasterRepository extends MongoRepository<DropdownMaster, String> {
    Optional<DropdownMaster> findByMasterId(String masterId);
}
