package com.vetora.controller;

import com.vetora.dto.PetRequestDTO;
import com.vetora.dto.PetResponseDTO;
import com.vetora.dto.WeightRecordRequestDTO;
import com.vetora.dto.WeightRecordResponseDTO;
import com.vetora.service.PetService;
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
public class PetController {

    private final PetService petService;

    public PetController(PetService petService) {
        this.petService = petService;
    }

    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }

    // ========== PET OWNER ENDPOINTS ==========

    @PostMapping("/owner/pets")
    public ResponseEntity<?> addPet(@Valid @RequestBody PetRequestDTO request) {
        try {
            String ownerEmail = getCurrentUserEmail();
            PetResponseDTO createdPet = petService.createPet(request, ownerEmail);

            Map<String, Object> response = new HashMap<>();
            response.put("pet", createdPet);
            response.put("message", "✅ Pet registered successfully!");

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @GetMapping("/owner/pets")
    public ResponseEntity<?> getAllPets() {
        try {
            String ownerEmail = getCurrentUserEmail();
            List<PetResponseDTO> pets = petService.getPetsByOwner(ownerEmail);

            Map<String, Object> response = new HashMap<>();
            response.put("pets", pets);
            response.put("count", pets.size());
            response.put("note", "Only active pets are shown. Deleted pets are hidden.");

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @GetMapping("/owner/pets/{petId}")
    public ResponseEntity<?> getPetById(@PathVariable Long petId) {
        try {
            String ownerEmail = getCurrentUserEmail();
            PetResponseDTO pet = petService.getPetById(petId, ownerEmail);
            return ResponseEntity.ok(pet);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    @PutMapping("/owner/pets/{petId}")
    public ResponseEntity<?> updatePet(@PathVariable Long petId,
                                       @Valid @RequestBody PetRequestDTO request) {
        try {
            String ownerEmail = getCurrentUserEmail();
            PetResponseDTO updatedPet = petService.updatePet(petId, request, ownerEmail);

            Map<String, Object> response = new HashMap<>();
            response.put("pet", updatedPet);
            response.put("message", "✅ Pet updated successfully!");

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @DeleteMapping("/owner/pets/{petId}")
    public ResponseEntity<?> deletePet(@PathVariable Long petId) {
        try {
            String ownerEmail = getCurrentUserEmail();
            petService.deletePet(petId, ownerEmail);

            Map<String, String> response = new HashMap<>();
            response.put("message", "✅ Pet deleted successfully!");

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // ✅ Log a new weight entry for a pet
    @PostMapping("/owner/pets/{petId}/weight")
    public ResponseEntity<?> addWeightRecord(@PathVariable Long petId,
                                             @Valid @RequestBody WeightRecordRequestDTO request) {
        try {
            String ownerEmail = getCurrentUserEmail();
            WeightRecordResponseDTO record = petService.addWeightRecord(petId, request, ownerEmail);

            Map<String, Object> response = new HashMap<>();
            response.put("record", record);
            response.put("message", "✅ Weight logged successfully!");

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // ✅ Get weight history for a pet (oldest first, for the chart)
    @GetMapping("/owner/pets/{petId}/weight-history")
    public ResponseEntity<?> getWeightHistory(@PathVariable Long petId) {
        try {
            String ownerEmail = getCurrentUserEmail();
            List<WeightRecordResponseDTO> history = petService.getWeightHistory(petId, ownerEmail);

            Map<String, Object> response = new HashMap<>();
            response.put("history", history);
            response.put("count", history.size());

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // ✅ Owner: Edit one of their own manually-logged weight entries
    @PutMapping("/owner/pets/weight/{recordId}")
    public ResponseEntity<?> ownerUpdateWeightRecord(@PathVariable Long recordId,
                                                     @Valid @RequestBody WeightRecordRequestDTO request) {
        try {
            String ownerEmail = getCurrentUserEmail();
            WeightRecordResponseDTO record = petService.updateWeightRecordByOwner(recordId, request, ownerEmail);

            Map<String, Object> response = new HashMap<>();
            response.put("record", record);
            response.put("message", "✅ Weight entry updated successfully!");

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // ✅ Owner: Delete one of their own manually-logged weight entries
    @DeleteMapping("/owner/pets/weight/{recordId}")
    public ResponseEntity<?> ownerDeleteWeightRecord(@PathVariable Long recordId) {
        try {
            String ownerEmail = getCurrentUserEmail();
            petService.deleteWeightRecordByOwner(recordId, ownerEmail);

            Map<String, String> response = new HashMap<>();
            response.put("message", "✅ Weight entry deleted successfully!");

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @GetMapping("/owner/pets/search")
    public ResponseEntity<?> searchPets(@RequestParam String name) {
        try {
            List<PetResponseDTO> pets = petService.searchPetsByName(name);

            Map<String, Object> response = new HashMap<>();
            response.put("pets", pets);
            response.put("count", pets.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
    // ========== ADMIN ENDPOINTS ==========

    // ✅ Admin: Get all pets (including deleted)
    @GetMapping("/owner/pets/admin/all")
    public ResponseEntity<?> adminGetAllPets() {
        try {
            List<PetResponseDTO> pets = petService.getAllPets();

            Map<String, Object> response = new HashMap<>();
            response.put("pets", pets);
            response.put("count", pets.size());
            response.put("note", "Includes both active and deleted pets.");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // ✅ Admin: Get deleted pets only
    @GetMapping("/owner/pets/admin/deleted")
    public ResponseEntity<?> adminGetDeletedPets() {
        try {
            List<PetResponseDTO> pets = petService.getDeletedPets();

            Map<String, Object> response = new HashMap<>();
            response.put("pets", pets);
            response.put("count", pets.size());
            response.put("note", "These pets are soft-deleted and can be restored or permanently deleted.");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // ✅ Admin: Restore soft-deleted pet
    @PutMapping("/owner/pets/admin/restore/{petId}")
    public ResponseEntity<?> adminRestorePet(@PathVariable Long petId) {
        try {
            PetResponseDTO restoredPet = petService.restorePet(petId);

            Map<String, Object> response = new HashMap<>();
            response.put("pet", restoredPet);
            response.put("message", "✅ Pet restored successfully!");

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // ✅ Admin: Hard Delete (සම්පූර්ණයෙන්ම මකන්න)
    @DeleteMapping("/owner/pets/admin/hard-delete/{petId}")
    public ResponseEntity<?> adminHardDeletePet(@PathVariable Long petId) {
        try {
            petService.hardDeletePet(petId);

            Map<String, String> response = new HashMap<>();
            response.put("message", "✅ Pet permanently deleted from the system!");
            response.put("warning", "This action cannot be undone!");

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }



    // ========== DOCTOR ENDPOINTS ==========

    // ✅ Doctor: Log a weight entry for a patient during a visit
    @PostMapping("/doctor/pets/{petId}/weight")
    public ResponseEntity<?> doctorAddWeightRecord(@PathVariable Long petId,
                                                   @Valid @RequestBody WeightRecordRequestDTO request) {
        try {
            String doctorEmail = getCurrentUserEmail();
            WeightRecordResponseDTO record = petService.addWeightRecordByDoctor(petId, request, doctorEmail);

            Map<String, Object> response = new HashMap<>();
            response.put("record", record);
            response.put("message", "✅ Weight logged successfully!");

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // ✅ Doctor: Correct an existing weight entry (their own, or the owner's)
    @PutMapping("/doctor/pets/weight/{recordId}")
    public ResponseEntity<?> doctorUpdateWeightRecord(@PathVariable Long recordId,
                                                      @Valid @RequestBody WeightRecordRequestDTO request) {
        try {
            String doctorEmail = getCurrentUserEmail();
            WeightRecordResponseDTO record = petService.updateWeightRecordByDoctor(recordId, request, doctorEmail);

            Map<String, Object> response = new HashMap<>();
            response.put("record", record);
            response.put("message", "✅ Weight entry updated successfully!");

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // ✅ Doctor: Get weight history for a patient (oldest first, for the chart)
    @GetMapping("/doctor/pets/{petId}/weight-history")
    public ResponseEntity<?> doctorGetWeightHistory(@PathVariable Long petId) {
        try {
            List<WeightRecordResponseDTO> history = petService.getWeightHistoryForDoctor(petId);

            Map<String, Object> response = new HashMap<>();
            response.put("history", history);
            response.put("count", history.size());

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    @GetMapping("/doctor/pets/{petId}")
    public ResponseEntity<?> doctorGetPetById(@PathVariable Long petId) {
        try {
            PetResponseDTO pet = petService.getPetByIdForDoctor(petId);

            Map<String, Object> response = new HashMap<>();
            response.put("pet", pet);
            response.put("message", "✅ Pet profile retrieved successfully");

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    @GetMapping("/doctor/pets/{petId}/medical-history")
    public ResponseEntity<?> doctorGetPetMedicalHistory(@PathVariable Long petId) {
        try {
            Map<String, Object> history = petService.getPetMedicalHistory(petId);
            history.put("message", "✅ Medical history retrieved successfully");
            return ResponseEntity.ok(history);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

}