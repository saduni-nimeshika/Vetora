package com.vetora.controller;

import com.vetora.service.VerificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final VerificationService verificationService;

    public AuthController(VerificationService verificationService) {
        this.verificationService = verificationService;
    }

    // ✅ Verify Email Endpoint
    @GetMapping("/verify")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        String result = verificationService.verifyEmail(token);

        Map<String, Object> response = new HashMap<>();

        switch (result) {
            case "SUCCESS":
                response.put("status", "SUCCESS");
                response.put("message", "✅ Email verified successfully! You can now login.");
                return ResponseEntity.ok(response);

            case "INVALID_TOKEN":
                response.put("status", "ERROR");
                response.put("message", "❌ Invalid verification token!");
                return ResponseEntity.badRequest().body(response);

            case "ALREADY_USED":
                response.put("status", "ERROR");
                response.put("message", "❌ This verification link has already been used!");
                return ResponseEntity.badRequest().body(response);

            case "EXPIRED":
                response.put("status", "ERROR");
                response.put("message", "❌ This verification link has expired! Please request a new one.");
                return ResponseEntity.badRequest().body(response);

            default:
                response.put("status", "ERROR");
                response.put("message", "❌ Verification failed!");
                return ResponseEntity.badRequest().body(response);
        }
    }

    // ✅ Resend Verification Email
    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@RequestParam String email) {
        try {
            // VerificationService එකේ method එකට email එක පමණක් pass කරයි
            String result = verificationService.resendVerificationEmail(email);

            Map<String, String> response = new HashMap<>();

            if ("SUCCESS".equals(result)) {
                response.put("message", "✅ Verification email resent successfully! Please check your inbox.");
                return ResponseEntity.ok(response);
            } else {
                response.put("error", result);
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to resend verification email: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // ✅ Check Verification Status
    @GetMapping("/verification-status")
    public ResponseEntity<?> getVerificationStatus(@RequestParam String email) {
        String status = verificationService.getVerificationStatus(email);
        Map<String, String> response = new HashMap<>();
        response.put("status", status);
        return ResponseEntity.ok(response);
    }
}