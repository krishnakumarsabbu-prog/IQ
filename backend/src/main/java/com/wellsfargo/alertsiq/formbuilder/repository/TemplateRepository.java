package com.wellsfargo.alertsiq.formbuilder.repository;

import com.wellsfargo.alertsiq.formbuilder.entity.Template;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TemplateRepository extends MongoRepository<Template, String> {
    Optional<Template> findByTemplateId(String templateId);
}
