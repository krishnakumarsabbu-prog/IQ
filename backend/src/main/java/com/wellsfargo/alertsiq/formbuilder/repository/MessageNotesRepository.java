package com.wellsfargo.alertsiq.formbuilder.repository;

import com.wellsfargo.alertsiq.formbuilder.entity.MessageNotes;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MessageNotesRepository extends MongoRepository<MessageNotes, String> {
    Optional<MessageNotes> findByMessageId(String messageId);
    void deleteByMessageId(String messageId);
}
