package com.wellsfargo.alertsiq.formbuilder.controller;

import com.wellsfargo.alertsiq.formbuilder.entity.MessageInstance;
import com.wellsfargo.alertsiq.formbuilder.service.MessageInstanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/instances")
public class MessageInstanceController {

    @Autowired
    private MessageInstanceService messageInstanceService;

    @PostMapping("/messages")
    public ResponseEntity<MessageInstance> createMessage(@RequestBody MessageInstance message) {
        return new ResponseEntity<>(messageInstanceService.createMessage(message), HttpStatus.CREATED);
    }

    @GetMapping("/messages")
    public ResponseEntity<List<MessageInstance>> getAllMessages() {
        return ResponseEntity.ok(messageInstanceService.getAllMessages());
    }

    @GetMapping("/messages/{id}")
    public ResponseEntity<MessageInstance> getMessage(@PathVariable String id) {
        return messageInstanceService.getMessage(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/messages/{id}")
    public ResponseEntity<MessageInstance> updateMessage(@PathVariable String id, @RequestBody MessageInstance messageUpdates) {
        try {
            return ResponseEntity.ok(messageInstanceService.updateMessage(id, messageUpdates));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/messages/{id}")
    public ResponseEntity<Void> deleteMessage(@PathVariable String id) {
        try {
            messageInstanceService.deleteMessage(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
