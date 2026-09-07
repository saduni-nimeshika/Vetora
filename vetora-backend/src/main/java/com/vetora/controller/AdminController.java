package com.vetora.controller;

import com.vetora.entity.Doctor;
import com.vetora.entity.User;
import com.vetora.service.AdminService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // Never serialise User/Doctor entities directly — User implements
    // UserDetails, whose getPassword() has no @JsonIgnore, so returning the
    // raw entity (or a Doctor with its nested User) leaks every user's
    // BCrypt hash straight into the JSON response.
    private Map<String, Object> toSafeUserMap(User user) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", user.getId());
        map.put("name", user.getName());
        map.put("email", user.getEmail());
        map.put("phone", user.getPhone());
        map.put("address", user.getAddress());
        map.put("role", user.getRole());
        map.put("isVerified", user.isVerified());
        map.put("enabled", user.getEnabled());
        map.put("createdAt", user.getCreatedAt());
        return map;
    }

    private Map<String, Object> toSafeDoctorMap(Doctor doctor) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", doctor.getId());
        if (doctor.getUser() != null) {
            map.put("user", toSafeUserMap(doctor.getUser()));
        }
        map.put("specialisation", doctor.getSpecialisation());
        map.put("qualifications", doctor.getQualifications());
        map.put("yearsOfExperience", doctor.getYearsOfExperience());
        map.put("phoneNumber", doctor.getPhoneNumber());
        map.put("clinicName", doctor.getClinicName());
        map.put("clinicAddress", doctor.getClinicAddress());
        map.put("district", doctor.getDistrict());
        map.put("city", doctor.getCity());
        map.put("approved", doctor.isApproved());
        return map;
    }

    // Only ADMIN can access these endpoints
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/doctors/{doctorId}/approve")
    public ResponseEntity<?> approveDoctor(@PathVariable Long doctorId) {
        try {
            adminService.approveDoctor(doctorId);
            return ResponseEntity.ok("Doctor approved successfully!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error approving doctor: " + e.getMessage());
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/doctors/pending")
    public ResponseEntity<List<Map<String, Object>>> getPendingDoctors() {
        List<Doctor> pendingDoctors = adminService.getPendingDoctors();
        List<Map<String, Object>> safe = pendingDoctors.stream()
                .map(this::toSafeDoctorMap)
                .collect(Collectors.toList());
        return ResponseEntity.ok(safe);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/doctors/{doctorId}/reject")
    public ResponseEntity<?> rejectDoctor(@PathVariable Long doctorId) {
        try {
            adminService.rejectDoctor(doctorId);
            return ResponseEntity.ok("Doctor registration rejected and account deleted!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error rejecting doctor: " + e.getMessage());
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<User> users = adminService.getAllUsers();
        List<Map<String, Object>> safe = users.stream()
                .map(this::toSafeUserMap)
                .collect(Collectors.toList());
        return ResponseEntity.ok(safe);
    }
}