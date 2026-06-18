package com.wellsfargo.alertsiq.formbuilder.repository;

import com.wellsfargo.alertsiq.formbuilder.entity.MessageInstance;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MessageInstanceRepository extends MongoRepository<MessageInstance, String> {
    Optional<MessageInstance> findByMessageId(String messageId);
}
