package com.wellsfargo.alertsiq.formbuilder.documentdesigner.repository;

import com.wellsfargo.alertsiq.formbuilder.documentdesigner.entity.DocumentTemplate;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentTemplateRepository extends MongoRepository<DocumentTemplate, String> {
}
