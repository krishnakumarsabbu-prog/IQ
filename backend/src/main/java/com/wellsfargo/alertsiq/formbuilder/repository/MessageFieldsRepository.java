package com.wellsfargo.alertsiq.formbuilder.repository;

import com.wellsfargo.alertsiq.formbuilder.entity.MessageFields;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageFieldsRepository extends MongoRepository<MessageFields, String> {
    Optional<MessageFields> findByMessageId(String messageId);
    List<MessageFields> findAllByOrderByLastModifiedDesc();
    void deleteByMessageId(String messageId);
}
