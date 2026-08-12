package com.vetora.controller;

import com.vetora.dto.PetRequestDTO;
import com.vetora.dto.PetResponseDTO;
import com.vetora.entity.Pet;  // ✅ මෙය Add කරන්න!
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
@CrossOrigin(origins = "*")
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

    @GetMapping("/owner/pets/admin/all")
    public ResponseEntity<?> adminGetAllPets() {
        try {
            List<PetResponseDTO> pets = petService.getAllPets();

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

    @GetMapping("/owner/pets/admin/species/{species}")
    public ResponseEntity<?> adminGetPetsBySpecies(@PathVariable String species) {
        try {
            List<PetResponseDTO> pets = petService.getPetsBySpecies(species);

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

    // ========== DOCTOR ENDPOINTS ==========

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
