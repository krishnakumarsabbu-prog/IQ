package com.wellsfargo.alertsiq.formbuilder.repository;

import com.wellsfargo.alertsiq.formbuilder.entity.ComponentDefinition;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * MongoDB repository for ComponentDefinition.
 * Spring Data auto-implements all CRUD from MongoRepository.
 */
@Repository
public interface ComponentDefinitionRepository extends MongoRepository<ComponentDefinition, String> {

    /** Find by the unique kind slug (e.g. "paragraph", "cta") */
    Optional<ComponentDefinition> findByKind(String kind);

    /** Get all components in a specific category */
    List<ComponentDefinition> findByCategory(String category);

    /** Get only custom (user-created) component types */
    List<ComponentDefinition> findByCustomTrue();

    /** Get only built-in (protected) component types */
    List<ComponentDefinition> findByCustomFalse();

    /** Check if a kind slug already exists */
    boolean existsByKind(String kind);
}
