package com.vetora.controller;

import com.vetora.dto.ReminderRequestDTO;
import com.vetora.dto.ReminderResponseDTO;
import com.vetora.service.ReminderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class ReminderController {

    private final ReminderService reminderService;

    public ReminderController(ReminderService reminderService) {
        this.reminderService = reminderService;
    }

    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }

    private boolean isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
    }

    // ========== DOCTOR - MANUAL REMINDER ==========

    @PostMapping("/doctor/reminders")
    public ResponseEntity<?> createManualReminder(@Valid @RequestBody ReminderRequestDTO request) {
        try {
            String doctorEmail = getCurrentUserEmail();
            ReminderResponseDTO reminder = reminderService.createManualReminder(request, doctorEmail);

            Map<String, Object> response = new HashMap<>();
            response.put("reminder", reminder);
            response.put("message", "✅ Reminder created successfully!");

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @PutMapping("/doctor/reminders/{reminderId}")
    public ResponseEntity<?> updateReminder(@PathVariable Long reminderId,
                                            @Valid @RequestBody ReminderRequestDTO request) {
        try {
            String doctorEmail = getCurrentUserEmail();
            ReminderResponseDTO updatedReminder = reminderService.updateReminder(reminderId, request, doctorEmail);

            Map<String, Object> response = new HashMap<>();
            response.put("reminder", updatedReminder);
            response.put("message", "✅ Reminder updated successfully!");

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @GetMapping("/doctor/reminders/my-reminders")
    public ResponseEntity<?> getMyReminders() {
        try {
            String doctorEmail = getCurrentUserEmail();
            List<ReminderResponseDTO> reminders = reminderService.getMyReminders(doctorEmail);

            Map<String, Object> response = new HashMap<>();
            response.put("reminders", reminders);
            response.put("count", reminders.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @GetMapping("/doctor/reminders/pet/{petId}")
    public ResponseEntity<?> getRemindersByPet(@PathVariable Long petId) {
        try {
            List<ReminderResponseDTO> reminders = reminderService.getRemindersByPet(petId);

            Map<String, Object> response = new HashMap<>();
            response.put("reminders", reminders);
            response.put("count", reminders.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @GetMapping("/doctor/reminders/upcoming/{petId}")
    public ResponseEntity<?> getUpcomingReminders(@PathVariable Long petId) {
        try {
            List<ReminderResponseDTO> reminders = reminderService.getUpcomingReminders(petId);

            Map<String, Object> response = new HashMap<>();
            response.put("reminders", reminders);
            response.put("count", reminders.size());
            response.put("note", "Reminders that are not yet sent");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @DeleteMapping("/doctor/reminders/{reminderId}")
    public ResponseEntity<?> deleteReminder(@PathVariable Long reminderId) {
        try {
            String email = getCurrentUserEmail();
            boolean isAdmin = isAdmin();
            reminderService.deleteReminder(reminderId, email, isAdmin);

            Map<String, String> response = new HashMap<>();
            response.put("message", "✅ Reminder deleted successfully!");

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // ========== PET OWNER ==========

    @GetMapping("/owner/reminders/pet/{petId}")
    public ResponseEntity<?> getRemindersByPetForOwner(@PathVariable Long petId) {
        try {
            String ownerEmail = getCurrentUserEmail();
            List<ReminderResponseDTO> reminders = reminderService.getRemindersByPetForOwner(petId, ownerEmail);

            Map<String, Object> response = new HashMap<>();
            response.put("reminders", reminders);
            response.put("count", reminders.size());

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @GetMapping("/owner/reminders/upcoming/{petId}")
    public ResponseEntity<?> getUpcomingRemindersForOwner(@PathVariable Long petId) {
        try {
            String ownerEmail = getCurrentUserEmail();
            List<ReminderResponseDTO> reminders = reminderService.getUpcomingReminders(petId);

            Map<String, Object> response = new HashMap<>();
            response.put("reminders", reminders);
            response.put("count", reminders.size());
            response.put("note", "Reminders that are not yet sent");

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
}
