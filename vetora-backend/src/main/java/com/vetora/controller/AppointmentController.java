package com.vetora.controller;

import com.vetora.dto.AppointmentRequestDTO;
import com.vetora.dto.AppointmentResponseDTO;
import com.vetora.service.AppointmentService;
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
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }

    // ========== PET OWNER ENDPOINTS ==========

    // ✅ Book Appointment
    @PostMapping("/owner/appointments")
    public ResponseEntity<?> bookAppointment(@Valid @RequestBody AppointmentRequestDTO request) {
        try {
            String ownerEmail = getCurrentUserEmail();
            AppointmentResponseDTO appointment = appointmentService.bookAppointment(request, ownerEmail);

            Map<String, Object> response = new HashMap<>();
            response.put("appointment", appointment);
            response.put("message", "✅ Appointment booked successfully! Waiting for doctor approval.");

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // ✅ Cancel Appointment
    @PutMapping("/owner/appointments/{appointmentId}/cancel")
    public ResponseEntity<?> cancelAppointment(@PathVariable Long appointmentId) {
        try {
            String ownerEmail = getCurrentUserEmail();
            AppointmentResponseDTO appointment = appointmentService.cancelAppointment(appointmentId, ownerEmail);

            Map<String, Object> response = new HashMap<>();
            response.put("appointment", appointment);
            response.put("message", "✅ Appointment cancelled successfully!");

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // ✅ Get Owner Appointments
    @GetMapping("/owner/appointments")
    public ResponseEntity<?> getOwnerAppointments() {
        try {
            String ownerEmail = getCurrentUserEmail();
            List<AppointmentResponseDTO> appointments = appointmentService.getAppointmentsByOwner(ownerEmail);

            Map<String, Object> response = new HashMap<>();
            response.put("appointments", appointments);
            response.put("count", appointments.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // ========== DOCTOR ENDPOINTS ==========

    // ✅ Get Doctor Appointments
    @GetMapping("/doctor/appointments")
    public ResponseEntity<?> getDoctorAppointments() {
        try {
            String doctorEmail = getCurrentUserEmail();
            List<AppointmentResponseDTO> appointments = appointmentService.getAppointmentsByDoctor(doctorEmail);

            Map<String, Object> response = new HashMap<>();
            response.put("appointments", appointments);
            response.put("count", appointments.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // ✅ Get Pending Appointments (Doctor)
    @GetMapping("/doctor/appointments/pending")
    public ResponseEntity<?> getPendingAppointments() {
        try {
            String doctorEmail = getCurrentUserEmail();
            List<AppointmentResponseDTO> appointments = appointmentService.getPendingAppointmentsByDoctor(doctorEmail);

            Map<String, Object> response = new HashMap<>();
            response.put("appointments", appointments);
            response.put("count", appointments.size());
            response.put("note", "Pending appointments waiting for your approval");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // ✅ Approve Appointment
    @PutMapping("/doctor/appointments/{appointmentId}/approve")
    public ResponseEntity<?> approveAppointment(@PathVariable Long appointmentId) {
        try {
            String doctorEmail = getCurrentUserEmail();
            AppointmentResponseDTO appointment = appointmentService.approveAppointment(appointmentId, doctorEmail);

            Map<String, Object> response = new HashMap<>();
            response.put("appointment", appointment);
            response.put("message", "✅ Appointment approved successfully! Notification sent to pet owner.");

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // ✅ Reject Appointment
    @PutMapping("/doctor/appointments/{appointmentId}/reject")
    public ResponseEntity<?> rejectAppointment(@PathVariable Long appointmentId,
                                               @RequestParam(required = false) String reason) {
        try {
            String doctorEmail = getCurrentUserEmail();
            AppointmentResponseDTO appointment = appointmentService.rejectAppointment(appointmentId, doctorEmail, reason);

            Map<String, Object> response = new HashMap<>();
            response.put("appointment", appointment);
            response.put("message", "✅ Appointment rejected successfully! Notification sent to pet owner.");

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // ========== SHARED ENDPOINTS ==========

    // ✅ Get Appointment by ID
    @GetMapping("/appointments/{appointmentId}")
    public ResponseEntity<?> getAppointmentById(@PathVariable Long appointmentId) {
        try {
            String userEmail = getCurrentUserEmail();
            AppointmentResponseDTO appointment = appointmentService.getAppointmentById(appointmentId, userEmail);
            return ResponseEntity.ok(appointment);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    // ========== ADMIN ENDPOINTS ==========

    // ✅ Admin: Get All Appointments
    @GetMapping("/admin/appointments")
    public ResponseEntity<?> adminGetAllAppointments() {
        try {
            List<AppointmentResponseDTO> appointments = appointmentService.getAllAppointments();

            Map<String, Object> response = new HashMap<>();
            response.put("appointments", appointments);
            response.put("count", appointments.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
}