package com.vetora.controller;

import com.vetora.entity.Doctor;
import com.vetora.entity.User;
import com.vetora.repository.DoctorRepository;
import com.vetora.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/doctor")
@CrossOrigin(origins = "*")
public class DoctorControlle {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;

    public DoctorControlle(DoctorRepository doctorRepository, UserRepository userRepository) {
        this.doctorRepository = doctorRepository;
        this.userRepository = userRepository;
    }

    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }

    // ✅ Get Doctor Profile - Return Type එක ResponseEntity<?> විය යුතුයි!
    @GetMapping("/profile")
    public ResponseEntity<?> getDoctorProfile() {
        try {
            String email = getCurrentUserEmail();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Doctor doctor = doctorRepository.findByUser(user)
                    .orElseThrow(() -> new RuntimeException("Doctor profile not found"));

            Map<String, Object> response = new HashMap<>();
            response.put("id", doctor.getId());
            response.put("name", user.getName());
            response.put("email", user.getEmail());
            response.put("phoneNumber", doctor.getPhoneNumber());
            response.put("specialisation", doctor.getSpecialisation());
            response.put("qualifications", doctor.getQualifications());
            response.put("yearsOfExperience", doctor.getYearsOfExperience());
            response.put("clinicName", doctor.getClinicName());
            response.put("clinicAddress", doctor.getClinicAddress());
            response.put("city", doctor.getCity());
            response.put("district", doctor.getDistrict());
            response.put("isApproved", doctor.isApproved());
            response.put("availableDays", doctor.getAvailableDays());
            response.put("availableStartTime", doctor.getAvailableStartTime());
            response.put("availableEndTime", doctor.getAvailableEndTime());
            response.put("slotDuration", doctor.getSlotDuration());

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ✅ Update Doctor Profile - Return Type එක ResponseEntity<?> විය යුතුයි!
    @PutMapping("/profile")
    public ResponseEntity<?> updateDoctorProfile(@RequestBody Map<String, Object> request) {
        try {
            String email = getCurrentUserEmail();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Doctor doctor = doctorRepository.findByUser(user)
                    .orElseThrow(() -> new RuntimeException("Doctor profile not found"));

            // Update fields
            if (request.containsKey("phoneNumber")) {
                doctor.setPhoneNumber((String) request.get("phoneNumber"));
            }
            if (request.containsKey("specialisation")) {
                doctor.setSpecialisation((String) request.get("specialisation"));
            }
            if (request.containsKey("qualifications")) {
                doctor.setQualifications((String) request.get("qualifications"));
            }
            if (request.containsKey("clinicName")) {
                doctor.setClinicName((String) request.get("clinicName"));
            }
            if (request.containsKey("clinicAddress")) {
                doctor.setClinicAddress((String) request.get("clinicAddress"));
            }
            if (request.containsKey("city")) {
                doctor.setCity((String) request.get("city"));
            }
            if (request.containsKey("district")) {
                doctor.setDistrict((String) request.get("district"));
            }

            Doctor updatedDoctor = doctorRepository.save(doctor);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "✅ Profile updated successfully!");
            response.put("id", updatedDoctor.getId());
            response.put("name", user.getName());

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}