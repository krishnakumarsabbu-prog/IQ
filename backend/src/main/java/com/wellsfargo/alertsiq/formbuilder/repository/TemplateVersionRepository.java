package com.wellsfargo.alertsiq.formbuilder.repository;

import com.wellsfargo.alertsiq.formbuilder.entity.TemplateVersion;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TemplateVersionRepository extends MongoRepository<TemplateVersion, String> {
    List<TemplateVersion> findByTemplateIdOrderByCreatedDateDesc(String templateId);
    Optional<TemplateVersion> findByTemplateIdAndVersion(String templateId, String version);
}
