package com.wellsfargo.alertsiq.formbuilder.repository;

import com.wellsfargo.alertsiq.formbuilder.entity.MessageBookmarks;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MessageBookmarksRepository extends MongoRepository<MessageBookmarks, String> {
    Optional<MessageBookmarks> findByMessageId(String messageId);
    void deleteByMessageId(String messageId);
}
