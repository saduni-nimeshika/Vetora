package com.vetora.controller;

import com.vetora.dto.VaccinationRequestDTO;
import com.vetora.dto.VaccinationResponseDTO;
import com.vetora.service.VaccinationService;
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
public class VaccinationController {

    private final VaccinationService vaccinationService;

    public VaccinationController(VaccinationService vaccinationService) {
        this.vaccinationService = vaccinationService;
    }

    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }

    @PostMapping("/doctor/vaccinations")
    public ResponseEntity<?> addVaccination(@Valid @RequestBody VaccinationRequestDTO request) {
        try {
            String doctorEmail = getCurrentUserEmail();
            VaccinationResponseDTO vaccination = vaccinationService.addVaccination(request, doctorEmail);

            Map<String, Object> response = new HashMap<>();
            response.put("vaccination", vaccination);
            response.put("message", "✅ Vaccination added successfully!");

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @PutMapping("/doctor/vaccinations/{vaccinationId}")
    public ResponseEntity<?> updateVaccination(@PathVariable Long vaccinationId,
                                               @Valid @RequestBody VaccinationRequestDTO request) {
        try {
            String doctorEmail = getCurrentUserEmail();
            VaccinationResponseDTO updatedVaccination = vaccinationService.updateVaccination(vaccinationId, request, doctorEmail);

            Map<String, Object> response = new HashMap<>();
            response.put("vaccination", updatedVaccination);
            response.put("message", "✅ Vaccination updated successfully!");

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @GetMapping("/doctor/vaccinations/pet/{petId}")
    public ResponseEntity<?> getVaccinationsByPet(@PathVariable Long petId) {
        try {
            List<VaccinationResponseDTO> vaccinations = vaccinationService.getVaccinationsByPet(petId);

            Map<String, Object> response = new HashMap<>();
            response.put("vaccinations", vaccinations);
            response.put("count", vaccinations.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @GetMapping("/doctor/vaccinations/upcoming")
    public ResponseEntity<?> getUpcomingVaccinations() {
        try {
            List<VaccinationResponseDTO> vaccinations = vaccinationService.getUpcomingVaccinations();

            Map<String, Object> response = new HashMap<>();
            response.put("vaccinations", vaccinations);
            response.put("count", vaccinations.size());
            response.put("message", "Vaccinations due within next month");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @DeleteMapping("/doctor/vaccinations/{vaccinationId}")
    public ResponseEntity<?> deleteVaccination(@PathVariable Long vaccinationId) {
        try {
            String doctorEmail = getCurrentUserEmail();
            vaccinationService.deleteVaccination(vaccinationId, doctorEmail);

            Map<String, String> response = new HashMap<>();
            response.put("message", "✅ Vaccination deleted successfully!");

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @GetMapping("/owner/vaccinations/pet/{petId}")
    public ResponseEntity<?> getVaccinationsByPetForOwner(@PathVariable Long petId) {
        try {
            String ownerEmail = getCurrentUserEmail();
            List<VaccinationResponseDTO> vaccinations = vaccinationService.getVaccinationsByPetForOwner(petId, ownerEmail);

            Map<String, Object> response = new HashMap<>();
            response.put("vaccinations", vaccinations);
            response.put("count", vaccinations.size());

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
}
