package com.vetora.controller;

import com.vetora.dto.PrescriptionRequestDTO;
import com.vetora.dto.PrescriptionResponseDTO;
import com.vetora.service.PrescriptionService;
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
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    public PrescriptionController(PrescriptionService prescriptionService) {
        this.prescriptionService = prescriptionService;
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

    // ✅ FR-39: Create Prescription
    @PostMapping("/doctor/prescriptions")
    public ResponseEntity<?> createPrescription(@Valid @RequestBody PrescriptionRequestDTO request) {
        try {
            String doctorEmail = getCurrentUserEmail();
            PrescriptionResponseDTO prescription = prescriptionService.createPrescription(request, doctorEmail);

            Map<String, Object> response = new HashMap<>();
            response.put("prescription", prescription);
            response.put("message", "✅ Prescription created successfully!");

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // ✅ FR-40: Update Prescription
    @PutMapping("/doctor/prescriptions/{prescriptionId}")
    public ResponseEntity<?> updatePrescription(@PathVariable Long prescriptionId,
                                                @Valid @RequestBody PrescriptionRequestDTO request) {
        try {
            String doctorEmail = getCurrentUserEmail();
            PrescriptionResponseDTO updatedPrescription = prescriptionService.updatePrescription(prescriptionId, request, doctorEmail);

            Map<String, Object> response = new HashMap<>();
            response.put("prescription", updatedPrescription);
            response.put("message", "✅ Prescription updated successfully!");

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // ✅ FR-42: Get Prescriptions by Pet (Doctor)
    @GetMapping("/doctor/prescriptions/pet/{petId}")
    public ResponseEntity<?> getPrescriptionsByPet(@PathVariable Long petId) {
        try {
            List<PrescriptionResponseDTO> prescriptions = prescriptionService.getPrescriptionsByPet(petId);

            Map<String, Object> response = new HashMap<>();
            response.put("prescriptions", prescriptions);
            response.put("count", prescriptions.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // ✅ Get Prescription by ID
    @GetMapping("/doctor/prescriptions/{prescriptionId}")
    public ResponseEntity<?> getPrescriptionById(@PathVariable Long prescriptionId) {
        try {
            PrescriptionResponseDTO prescription = prescriptionService.getPrescriptionById(prescriptionId);
            return ResponseEntity.ok(prescription);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    // ✅ Get My Prescriptions (Doctor)
    @GetMapping("/doctor/prescriptions/my-prescriptions")
    public ResponseEntity<?> getMyPrescriptions() {
        try {
            String doctorEmail = getCurrentUserEmail();
            List<PrescriptionResponseDTO> prescriptions = prescriptionService.getMyPrescriptions(doctorEmail);

            Map<String, Object> response = new HashMap<>();
            response.put("prescriptions", prescriptions);
            response.put("count", prescriptions.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // ✅ Delete Prescription
    @DeleteMapping("/doctor/prescriptions/{prescriptionId}")
    public ResponseEntity<?> deletePrescription(@PathVariable Long prescriptionId) {
        try {
            String email = getCurrentUserEmail();
            boolean isAdmin = isAdmin();
            prescriptionService.deletePrescription(prescriptionId, email, isAdmin);

            Map<String, String> response = new HashMap<>();
            response.put("message", "✅ Prescription deleted successfully!");

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // ========== PET OWNER ENDPOINTS ==========

    // ✅ FR-43: Get Prescriptions by Pet (Pet Owner)
    @GetMapping("/owner/prescriptions/pet/{petId}")
    public ResponseEntity<?> getPrescriptionsByPetForOwner(@PathVariable Long petId) {
        try {
            String ownerEmail = getCurrentUserEmail();
            List<PrescriptionResponseDTO> prescriptions = prescriptionService.getPrescriptionsByPetForOwner(petId, ownerEmail);

            Map<String, Object> response = new HashMap<>();
            response.put("prescriptions", prescriptions);
            response.put("count", prescriptions.size());

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
}
