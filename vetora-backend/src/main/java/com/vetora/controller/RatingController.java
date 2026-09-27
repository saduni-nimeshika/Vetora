package com.vetora.controller;

import com.vetora.dto.RatingRequestDTO;
import com.vetora.dto.RatingResponseDTO;
import com.vetora.dto.RatingSummaryDTO;
import com.vetora.service.RatingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class RatingController {

    private final RatingService ratingService;

    public RatingController(RatingService ratingService) {
        this.ratingService = ratingService;
    }

    private String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (auth != null && auth.isAuthenticated()) ? auth.getName() : null;
    }

    // ✅ Any authenticated user can view a doctor's ratings + average (shown
    // on the doctor's public profile page). If the caller is the pet owner
    // themselves, their own rating and rate-eligibility are included too.
    @GetMapping("/doctors/{doctorId}/ratings")
    public ResponseEntity<?> getRatings(@PathVariable Long doctorId) {
        try {
            RatingSummaryDTO summary = ratingService.getSummary(doctorId, getCurrentUserEmail());
            return ResponseEntity.ok(summary);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    // ✅ Pet owner: submit a rating, or update their existing one for this doctor
    @PostMapping("/owner/doctors/{doctorId}/ratings")
    public ResponseEntity<?> submitRating(@PathVariable Long doctorId, @Valid @RequestBody RatingRequestDTO request) {
        try {
            RatingResponseDTO dto = ratingService.submitRating(doctorId, getCurrentUserEmail(), request);
            Map<String, Object> response = new HashMap<>();
            response.put("rating", dto);
            response.put("message", "✅ Thanks for your feedback!");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // ✅ Pet owner: remove their own rating for a doctor
    @DeleteMapping("/owner/doctors/{doctorId}/ratings")
    public ResponseEntity<?> deleteRating(@PathVariable Long doctorId) {
        try {
            ratingService.deleteMyRating(doctorId, getCurrentUserEmail());
            Map<String, String> response = new HashMap<>();
            response.put("message", "✅ Rating removed");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}

