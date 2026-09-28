package com.vetora.controller;

import com.vetora.dto.RatingReplyRequestDTO;
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

    private ResponseEntity<Map<String, String>> error(HttpStatus status, String message) {
        Map<String, String> body = new HashMap<>();
        body.put("error", message);
        return ResponseEntity.status(status).body(body);
    }

    private ResponseEntity<Map<String, String>> message(String text) {
        Map<String, String> body = new HashMap<>();
        body.put("message", text);
        return ResponseEntity.ok(body);
    }

    // ✅ Any logged-in user (including a newly registered owner) can view a
    // doctor's reviews + average on the doctor's profile page.
    @GetMapping("/doctors/{doctorId}/ratings")
    public ResponseEntity<?> getRatings(@PathVariable Long doctorId) {
        try {
            RatingSummaryDTO summary = ratingService.getSummary(doctorId, getCurrentUserEmail());
            return ResponseEntity.ok(summary);
        } catch (RuntimeException e) {
            return error(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    // ✅ Pet owner: post a review (can post more than one over time)
    @PostMapping("/owner/doctors/{doctorId}/ratings")
    public ResponseEntity<?> submitRating(@PathVariable Long doctorId, @Valid @RequestBody RatingRequestDTO request) {
        try {
            RatingResponseDTO dto = ratingService.submitRating(doctorId, getCurrentUserEmail(), request);
            Map<String, Object> response = new HashMap<>();
            response.put("rating", dto);
            response.put("message", "✅ Thanks for your feedback!");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return error(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    // ✅ Pet owner: delete one of their own reviews
    @DeleteMapping("/owner/doctors/ratings/{ratingId}")
    public ResponseEntity<?> deleteRating(@PathVariable Long ratingId) {
        try {
            ratingService.deleteMyRating(ratingId, getCurrentUserEmail());
            return message("✅ Review removed");
        } catch (RuntimeException e) {
            return error(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    // ✅ Doctor: the reviews written about the logged-in doctor
    @GetMapping("/doctor/ratings")
    public ResponseEntity<?> getMyRatings() {
        try {
            RatingSummaryDTO summary = ratingService.getSummaryForLoggedInDoctor(getCurrentUserEmail());
            return ResponseEntity.ok(summary);
        } catch (RuntimeException e) {
            return error(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    // ✅ Doctor: reply to a review (posting again edits the reply)
    @PostMapping("/doctor/ratings/{ratingId}/reply")
    public ResponseEntity<?> replyToRating(@PathVariable Long ratingId, @Valid @RequestBody RatingReplyRequestDTO request) {
        try {
            RatingResponseDTO dto = ratingService.replyToRating(ratingId, getCurrentUserEmail(), request.getReply());
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return error(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    // ✅ Doctor: remove their reply
    @DeleteMapping("/doctor/ratings/{ratingId}/reply")
    public ResponseEntity<?> deleteReply(@PathVariable Long ratingId) {
        try {
            ratingService.deleteReply(ratingId, getCurrentUserEmail());
            return message("✅ Reply removed");
        } catch (RuntimeException e) {
            return error(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
}

