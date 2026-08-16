package com.vetora.controller;

import com.vetora.entity.Doctor;
import com.vetora.entity.User;
import com.vetora.repository.DoctorRepository;
import com.vetora.repository.UserRepository;
import com.vetora.service.DoctorAvailabilityService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/doctor")
@CrossOrigin(origins = "*")
public class DoctorAvailabilityController {

    private final DoctorAvailabilityService availabilityService;
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;

    public DoctorAvailabilityController(DoctorAvailabilityService availabilityService,
                                        UserRepository userRepository,
                                        DoctorRepository doctorRepository) {
        this.availabilityService = availabilityService;
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
    }

    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }

    private Doctor getCurrentDoctor() {
        String email = getCurrentUserEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return doctorRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Doctor profile not found"));
    }

    // ✅ 1. Set Doctor Availability
    @PutMapping("/availability")
    public ResponseEntity<?> setAvailability(@RequestBody Map<String, Object> request) {
        try {
            Doctor doctor = getCurrentDoctor();

            String availableDays = (String) request.get("availableDays");
            String startTime = (String) request.get("startTime");
            String endTime = (String) request.get("endTime");
            Integer slotDuration = (Integer) request.get("slotDuration");

            Doctor updatedDoctor = availabilityService.updateDoctorAvailability(
                    doctor.getId(), availableDays, startTime, endTime, slotDuration);

            Map<String, Object> response = new HashMap<>();
            response.put("id", updatedDoctor.getId());
            response.put("availableDays", updatedDoctor.getAvailableDays());
            response.put("availableStartTime", updatedDoctor.getAvailableStartTime());
            response.put("availableEndTime", updatedDoctor.getAvailableEndTime());
            response.put("slotDuration", updatedDoctor.getSlotDuration());
            response.put("message", "✅ Availability updated successfully!");

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ✅ 2. Get Doctor Availability (By Doctor ID)
    @GetMapping("/availability/{doctorId}")
    public ResponseEntity<?> getAvailability(@PathVariable Long doctorId,
                                             @RequestParam String startDate,
                                             @RequestParam String endDate) {
        try {
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);

            Map<String, Object> availability = availabilityService.getDoctorAvailability(doctorId, start, end);

            return ResponseEntity.ok(availability);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ✅ 3. Get Current Doctor's Availability
    @GetMapping("/availability/my-availability")
    public ResponseEntity<?> getMyAvailability(@RequestParam String startDate,
                                               @RequestParam String endDate) {
        try {
            Doctor doctor = getCurrentDoctor();
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);

            Map<String, Object> availability = availabilityService.getDoctorAvailability(doctor.getId(), start, end);

            return ResponseEntity.ok(availability);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ✅ 4. Add Unavailable Date (Holiday/Leave)
    @PostMapping("/availability/unavailable")
    public ResponseEntity<?> addUnavailableDate(@RequestBody Map<String, Object> request) {
        try {
            Doctor doctor = getCurrentDoctor();
            LocalDate date = LocalDate.parse((String) request.get("date"));
            String reason = (String) request.get("reason");

            availabilityService.addUnavailableDate(doctor.getId(), date, reason);

            Map<String, String> response = new HashMap<>();
            response.put("message", "✅ Unavailable date added successfully!");
            response.put("date", date.toString());
            response.put("reason", reason != null ? reason : "Unavailable");

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ✅ 5. Add Special Available Date
    @PostMapping("/availability/special-available")
    public ResponseEntity<?> addSpecialAvailableDate(@RequestBody Map<String, Object> request) {
        try {
            Doctor doctor = getCurrentDoctor();
            LocalDate date = LocalDate.parse((String) request.get("date"));
            String startTime = (String) request.get("startTime");
            String endTime = (String) request.get("endTime");

            availabilityService.addSpecialAvailableDate(doctor.getId(), date, startTime, endTime);

            Map<String, String> response = new HashMap<>();
            response.put("message", "✅ Special available date added successfully!");
            response.put("date", date.toString());
            response.put("startTime", startTime);
            response.put("endTime", endTime);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ✅ 6. Remove Exception (Unavailable/Special Available)
    @DeleteMapping("/availability/exception/{exceptionId}")
    public ResponseEntity<?> removeException(@PathVariable Long exceptionId) {
        try {
            availabilityService.removeException(exceptionId);

            Map<String, String> response = new HashMap<>();
            response.put("message", "✅ Exception removed successfully!");

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ✅ 7. Check if a Slot is Available
    @GetMapping("/availability/check-slot")
    public ResponseEntity<?> checkSlotAvailability(@RequestParam Long doctorId,
                                                   @RequestParam String date,
                                                   @RequestParam String time) {
        try {
            LocalDate appointmentDate = LocalDate.parse(date);
            boolean isAvailable = availabilityService.isSlotAvailable(doctorId, appointmentDate, time);

            Map<String, Object> response = new HashMap<>();
            response.put("available", isAvailable);
            response.put("doctorId", doctorId);
            response.put("date", date);
            response.put("time", time);
            response.put("message", isAvailable ? "✅ Slot is available!" : "❌ Slot is not available");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}