package com.vetora.controller;

import com.vetora.dto.SignUpRequest;
import com.vetora.entity.Doctor;
import com.vetora.entity.User;
import com.vetora.enums.Role;
import com.vetora.repository.DoctorRepository;
import com.vetora.repository.UserRepository;
import com.vetora.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserService userService;

    // 1. REGISTER ENDPOINT
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody SignUpRequest request) {
        try {
            // Email Validation
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Email is required!");
            }

            if (userRepository.existsByEmail(request.getEmail().trim())) {
                return ResponseEntity.badRequest().body("Email is already registered!");
            }

            // Registration Logic execution
            User savedUser = userService.registerUser(request);
            return ResponseEntity.ok(savedUser);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error during registration: " + e.getMessage());
        }
    }

    // 2. LOGIN ENDPOINT
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User loginData) {
        try {
            if (loginData.getEmail() == null || loginData.getPassword() == null) {
                return ResponseEntity.badRequest().body("Email and password are required!");
            }

            String inputEmail = loginData.getEmail().trim();
            String inputPassword = loginData.getPassword().trim();

            Optional<User> userOptional = userRepository.findByEmail(inputEmail);

            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password.");
            }

            User user = userOptional.get();

            // Password Check
            if (!user.getPassword().trim().equals(inputPassword)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password.");
            }

            // Doctor Approval Check
            if (user.getRole() == Role.DOCTOR) {
                Optional<Doctor> doctorOptional = doctorRepository.findByUser(user);
                if (doctorOptional.isPresent() && !doctorOptional.get().isApproved()) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body("Your account is pending Admin approval. Please try again later.");
                }
            }

            return ResponseEntity.ok(user);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error during login: " + e.getMessage());
        }
    }
}