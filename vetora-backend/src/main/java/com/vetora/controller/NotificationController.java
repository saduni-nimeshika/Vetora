package com.vetora.controller;

import com.vetora.dto.NotificationResponseDTO;
import com.vetora.service.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

// In-app notifications (the bell icon). Available to every logged-in role —
// covered by the existing anyRequest().authenticated() rule.
@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    private String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? auth.getName() : null;
    }

    private ResponseEntity<Map<String, String>> error(HttpStatus status, String message) {
        Map<String, String> body = new HashMap<>();
        body.put("error", message);
        return ResponseEntity.status(status).body(body);
    }

    // ✅ Latest notifications + how many are unread
    @GetMapping
    public ResponseEntity<?> getMyNotifications() {
        try {
            String email = getCurrentUserEmail();
            List<NotificationResponseDTO> list = notificationService.getMyNotifications(email);
            Map<String, Object> response = new HashMap<>();
            response.put("notifications", list);
            response.put("unreadCount", notificationService.getUnreadCount(email));
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return error(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount() {
        try {
            Map<String, Object> response = new HashMap<>();
            response.put("unreadCount", notificationService.getUnreadCount(getCurrentUserEmail()));
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return error(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markRead(@PathVariable Long id) {
        try {
            notificationService.markRead(id, getCurrentUserEmail());
            Map<String, String> response = new HashMap<>();
            response.put("message", "Marked as read");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return error(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllRead() {
        try {
            notificationService.markAllRead(getCurrentUserEmail());
            Map<String, String> response = new HashMap<>();
            response.put("message", "All notifications marked as read");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return error(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
}

