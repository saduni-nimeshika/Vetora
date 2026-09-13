package com.vetora.controller;

import com.vetora.service.PasswordResetService;
import com.vetora.service.VerificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final VerificationService verificationService;
    private final PasswordResetService passwordResetService;

    public AuthController(VerificationService verificationService, PasswordResetService passwordResetService) {
        this.verificationService = verificationService;
        this.passwordResetService = passwordResetService;
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

    // ✅ Request a password reset email. Always responds with the same
    // generic success message whether or not the email exists, so this
    // endpoint can't be used to discover which emails are registered.
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
        passwordResetService.requestPasswordReset(email);
        Map<String, String> response = new HashMap<>();
        response.put("message", "If an account exists for that email, a password reset link has been sent.");
        return ResponseEntity.ok(response);
    }

    // ✅ Complete a password reset using the token from the emailed link.
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");

        if (token == null || token.isBlank() || newPassword == null || newPassword.isBlank()) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Token and new password are required.");
            return ResponseEntity.badRequest().body(response);
        }
        if (newPassword.length() < 6) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Password must be at least 6 characters.");
            return ResponseEntity.badRequest().body(response);
        }

        String result = passwordResetService.resetPassword(token, newPassword);
        Map<String, String> response = new HashMap<>();

        switch (result) {
            case "SUCCESS":
                response.put("message", "✅ Password reset successfully! You can now login with your new password.");
                return ResponseEntity.ok(response);
            case "ALREADY_USED":
                response.put("error", "This reset link has already been used. Please request a new one.");
                return ResponseEntity.badRequest().body(response);
            case "EXPIRED":
                response.put("error", "This reset link has expired. Please request a new one.");
                return ResponseEntity.badRequest().body(response);
            default:
                response.put("error", "Invalid or unrecognized reset link.");
                return ResponseEntity.badRequest().body(response);
        }
    }
}