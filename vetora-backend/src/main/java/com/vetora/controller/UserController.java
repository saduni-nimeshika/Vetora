package com.vetora.controller;

import com.vetora.dto.AuthResponse;
import com.vetora.dto.LoginRequest;
import com.vetora.dto.SignUpRequest;
import com.vetora.entity.Doctor;
import com.vetora.entity.User;
import com.vetora.enums.Role;
import com.vetora.repository.DoctorRepository;
import com.vetora.security.JwtService;
import com.vetora.service.EmailService;
import com.vetora.service.UserService;
import com.vetora.service.VerificationService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;
    private final DoctorRepository doctorRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final EmailService emailService;
    private final VerificationService verificationService;

    public UserController(UserService userService,
                          DoctorRepository doctorRepository,
                          AuthenticationManager authenticationManager,
                          JwtService jwtService,
                          UserDetailsService userDetailsService,
                          EmailService emailService,
                          VerificationService verificationService) {
        this.userService = userService;
        this.doctorRepository = doctorRepository;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.emailService = emailService;
        this.verificationService = verificationService;
    }

    // ✅ REGISTER
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody SignUpRequest request, HttpServletRequest httpRequest) {
        try {
            String baseUrl = "http://localhost:8080";
            User savedUser = userService.registerUser(request, baseUrl);

            Map<String, Object> response = new HashMap<>();
            response.put("user", savedUser);
            response.put("message", "✅ Registration successful! A verification email has been sent to " + savedUser.getEmail());
            response.put("nextStep", "Please check your email and verify your account before logging in.");

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Registration failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // ✅ VERIFY EMAIL (නිවැරදි කරන ලද Endpoint එක)
    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam("token") String token) {
        try {
            String result = verificationService.verifyEmail(token);
            Map<String, String> response = new HashMap<>();

            switch (result) {
                case "SUCCESS":
                    response.put("message", "✅ Email verified successfully! You can now log in.");
                    return ResponseEntity.ok(response);

                case "ALREADY_USED":
                    response.put("message", "This email verification link has already been used.");
                    return ResponseEntity.badRequest().body(response);

                case "EXPIRED":
                    response.put("error", "Verification token has expired. Please request a new one.");
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);

                case "INVALID_TOKEN":
                default:
                    response.put("error", "Invalid verification token.");
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Verification failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // ✅ LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) {
        try {
            String email = loginRequest.getEmail().trim();
            String password = loginRequest.getPassword().trim();

            // 1. Authenticate credentials
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password)
            );

            // 2. Get User
            User user = userService.findByEmail(email);

            // ✅ 3. CHECK EMAIL VERIFICATION
            if (!user.isVerified()) {
                Map<String, Object> response = new HashMap<>();
                response.put("error", "Email not verified!");
                response.put("message", "Please verify your email address first. Check your inbox for the verification link.");
                response.put("canResend", true);
                response.put("resendEndpoint", "/api/v1/auth/resend-verification?email=" + email);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            // ✅ 4. CHECK DOCTOR APPROVAL
            if (user.getRole() == Role.DOCTOR) {
                Optional<Doctor> doctorOptional = doctorRepository.findByUser(user);
                if (doctorOptional.isPresent() && !doctorOptional.get().isApproved()) {
                    Map<String, String> response = new HashMap<>();
                    response.put("error", "Account pending admin approval!");
                    response.put("message", "Your account is pending Admin approval. Please try again later.");
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
                }
            }

            // 5. Generate JWT Token
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);
            String token = jwtService.generateToken(userDetails);

            // 6. Return Auth Response
            AuthResponse authResponse = new AuthResponse(
                    token,
                    user.getId(),
                    user.getName(),
                    user.getEmail(),
                    user.getRole().name()
            );

            return ResponseEntity.ok(authResponse);

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid email or password!");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
    }
}