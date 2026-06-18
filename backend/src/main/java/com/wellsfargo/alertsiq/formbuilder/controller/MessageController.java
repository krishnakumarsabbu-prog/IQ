package com.wellsfargo.alertsiq.formbuilder.controller;

import com.wellsfargo.alertsiq.formbuilder.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST controller for the dynamic message persistence API.
 *
 * All payloads are flat Map<String, Object> — no hardcoded field names.
 * Field validation and mongoPropertyName mapping are driven by the template schema.
 *
 * Endpoints:
 *   POST   /api/messages          – create a new message
 *   PUT    /api/messages/{id}     – update an existing message
 *   GET    /api/messages          – list all messages
 *   GET    /api/messages/{id}     – get a single message
 *   DELETE /api/messages/{id}     – delete a message + its bookmarks + notes
 */
@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    // ─────────────────────────────────────
    // POST /api/messages  →  create
    // ─────────────────────────────────────
    @PostMapping
    public ResponseEntity<?> createMessage(@RequestBody Map<String, Object> payload) {
        try {
            Map<String, Object> result = messageService.saveMessage(payload);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (MessageService.ValidationException ve) {
            return validationError(ve.getErrors());
        } catch (IllegalArgumentException iae) {
            return badRequest(iae.getMessage());
        }
    }

    // ─────────────────────────────────────
    // PUT /api/messages/{id}  →  update
    // ─────────────────────────────────────
    @PutMapping("/{id}")
    public ResponseEntity<?> updateMessage(@PathVariable String id,
                                           @RequestBody Map<String, Object> payload) {
        // Inject the id into the payload so the service can locate the existing doc
        payload.put("_id", id);
        try {
            Map<String, Object> result = messageService.saveMessage(payload);
            return ResponseEntity.ok(result);
        } catch (MessageService.ValidationException ve) {
            return validationError(ve.getErrors());
        } catch (IllegalArgumentException iae) {
            return badRequest(iae.getMessage());
        }
    }

    // ─────────────────────────────────────
    // GET /api/messages  →  list all
    // ─────────────────────────────────────
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllMessages() {
        return ResponseEntity.ok(messageService.getAllMessages());
    }

    // ─────────────────────────────────────
    // GET /api/messages/{id}  →  single
    // ─────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<?> getMessage(@PathVariable String id) {
        try {
            return ResponseEntity.ok(messageService.getMessage(id));
        } catch (IllegalArgumentException iae) {
            return ResponseEntity.notFound().build();
        }
    }

    // ─────────────────────────────────────
    // DELETE /api/messages/{id}
    // ─────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMessage(@PathVariable String id) {
        try {
            messageService.deleteMessage(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException iae) {
            return ResponseEntity.notFound().build();
        }
    }

    // ─────────────────────────────────────
    // Error helpers
    // ─────────────────────────────────────
    private ResponseEntity<Map<String, Object>> validationError(List<String> errors) {
        Map<String, Object> body = new HashMap<>();
        body.put("error", "Validation failed");
        body.put("messages", errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    private ResponseEntity<Map<String, Object>> badRequest(String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("error", message);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }
}
