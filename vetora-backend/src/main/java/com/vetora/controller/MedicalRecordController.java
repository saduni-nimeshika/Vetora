package com.vetora.controller;

import com.vetora.dto.MedicalRecordRequestDTO;
import com.vetora.dto.MedicalRecordResponseDTO;
import com.vetora.service.MedicalRecordService;
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
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    public MedicalRecordController(MedicalRecordService medicalRecordService) {
        this.medicalRecordService = medicalRecordService;
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

    // ========== DOCTOR ENDPOINTS ==========

    // ✅ FR-33: Create Medical Record
    @PostMapping("/doctor/medical-records")
    public ResponseEntity<?> createMedicalRecord(@Valid @RequestBody MedicalRecordRequestDTO request) {
        try {
            String doctorEmail = getCurrentUserEmail();
            MedicalRecordResponseDTO record = medicalRecordService.createMedicalRecord(request, doctorEmail);

            Map<String, Object> response = new HashMap<>();
            response.put("record", record);
            response.put("message", "✅ Medical record created successfully!");

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // ✅ FR-34: Update Medical Record
    @PutMapping("/doctor/medical-records/{recordId}")
    public ResponseEntity<?> updateMedicalRecord(@PathVariable Long recordId,
                                                 @Valid @RequestBody MedicalRecordRequestDTO request) {
        try {
            String doctorEmail = getCurrentUserEmail();
            MedicalRecordResponseDTO updatedRecord = medicalRecordService.updateMedicalRecord(recordId, request, doctorEmail);

            Map<String, Object> response = new HashMap<>();
            response.put("record", updatedRecord);
            response.put("message", "✅ Medical record updated successfully!");

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // ✅ FR-37: Get Medical Records by Pet (Doctor)
    @GetMapping("/doctor/medical-records/pet/{petId}")
    public ResponseEntity<?> getMedicalRecordsByPet(@PathVariable Long petId) {
        try {
            List<MedicalRecordResponseDTO> records = medicalRecordService.getMedicalRecordsByPet(petId);

            Map<String, Object> response = new HashMap<>();
            response.put("records", records);
            response.put("count", records.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // ✅ Get Medical Record by ID
    @GetMapping("/doctor/medical-records/{recordId}")
    public ResponseEntity<?> getMedicalRecordById(@PathVariable Long recordId) {
        try {
            MedicalRecordResponseDTO record = medicalRecordService.getMedicalRecordById(recordId);
            return ResponseEntity.ok(record);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    // ✅ Get All Medical Records by Current Doctor
    @GetMapping("/doctor/medical-records/my-records")
    public ResponseEntity<?> getMyMedicalRecords() {
        try {
            String doctorEmail = getCurrentUserEmail();
            List<MedicalRecordResponseDTO> records = medicalRecordService.getMedicalRecordsByDoctor(doctorEmail);

            Map<String, Object> response = new HashMap<>();
            response.put("records", records);
            response.put("count", records.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // ✅ Delete Medical Record (Doctor or Admin)
    @DeleteMapping("/doctor/medical-records/{recordId}")
    public ResponseEntity<?> deleteMedicalRecord(@PathVariable Long recordId) {
        try {
            String email = getCurrentUserEmail();
            boolean isAdmin = isAdmin();
            medicalRecordService.deleteMedicalRecord(recordId, email, isAdmin);

            Map<String, String> response = new HashMap<>();
            response.put("message", "✅ Medical record deleted successfully!");

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // ========== PET OWNER ENDPOINTS ==========

    // ✅ FR-37: Get Medical Records by Pet (Pet Owner)
    @GetMapping("/owner/medical-records/pet/{petId}")
    public ResponseEntity<?> getMedicalRecordsByPetForOwner(@PathVariable Long petId) {
        try {
            String ownerEmail = getCurrentUserEmail();
            List<MedicalRecordResponseDTO> records = medicalRecordService.getMedicalRecordsByPetForOwner(petId, ownerEmail);

            Map<String, Object> response = new HashMap<>();
            response.put("records", records);
            response.put("count", records.size());

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
}
