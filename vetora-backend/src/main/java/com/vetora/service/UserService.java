package com.vetora.service;

import com.vetora.dto.SignUpRequest;
import com.vetora.entity.Doctor;
import com.vetora.entity.User;
import com.vetora.entity.VerificationToken; // ✅ Import එක එකතු කරන ලදී
import com.vetora.enums.Role;
import com.vetora.repository.DoctorRepository;
import com.vetora.repository.UserRepository;
import com.vetora.validator.EmailValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final AdminService adminService;
    private final VerificationService verificationService;

    public UserService(UserRepository userRepository,
                       DoctorRepository doctorRepository,
                       PasswordEncoder passwordEncoder,
                       EmailService emailService,
                       AdminService adminService,
                       VerificationService verificationService) {
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.adminService = adminService;
        this.verificationService = verificationService;
    }

    @Transactional
    public User registerUser(SignUpRequest request, String baseUrl) {

        String email = request.getEmail().trim();

        // ✅ Step 1: Email Validation
        String validationError = EmailValidator.validate(email);
        if (validationError != null) {
            logger.warn("❌ Email validation failed: {} - {}", email, validationError);
            throw new RuntimeException(validationError);
        }

        // ✅ Step 2: Check if email already exists
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email '" + email + "' is already registered!");
        }

        // ✅ Step 3: Create User
        User user = new User();
        user.setName(request.getName());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        user.setRole(request.getRole());
        user.setVerified(false);  // Not verified yet!

        User savedUser = userRepository.save(user);

        // ✅ Step 4: If DOCTOR, create Doctor profile
        Doctor doctorProfile = null;
        if (request.getRole() == Role.DOCTOR) {
            Doctor doctor = new Doctor();
            doctor.setUser(savedUser);
            doctor.setSlvcRegistrationNumber(request.getSlvcRegistrationNumber());
            doctor.setQualifications(request.getQualifications());
            doctor.setSpecialisation(request.getSpecialisation());
            doctor.setYearsOfExperience(request.getYearsOfExperience());
            doctor.setDistrict(request.getDistrict());
            doctor.setCity(request.getCity());
            doctor.setClinicName(request.getClinicName());
            doctor.setClinicAddress(request.getClinicAddress());
            doctor.setApproved(false);
            doctorProfile = doctorRepository.save(doctor);
        }

        // ✅ Step 5: Create Verification Token
        VerificationToken verificationToken = verificationService.createVerificationToken(savedUser);

        // ✅ Step 6: Send Verification Email (Plain Token එක පමණක් pass කරයි)
        try {
            emailService.sendVerificationEmail(savedUser.getEmail(), savedUser.getName(), verificationToken.getToken());
            logger.info("✅ Verification email sent to: {}", savedUser.getEmail());
        } catch (Exception e) {
            logger.error("❌ Failed to send verification email: {}", e.getMessage());
        }

        // ✅ Step 7: Send Admin Notification
        try {
            String adminEmail = adminService.getAdminEmail();
            emailService.sendAdminNewUserNotification(adminEmail, savedUser);

            if (request.getRole() == Role.DOCTOR && doctorProfile != null) {
                emailService.sendDoctorApprovalRequest(adminEmail, savedUser, doctorProfile);
            }
        } catch (Exception e) {
            logger.error("❌ Admin notification failed: {}", e.getMessage());
        }

        logger.info("✅ Registration successful for: {}", savedUser.getEmail());
        return savedUser;
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}