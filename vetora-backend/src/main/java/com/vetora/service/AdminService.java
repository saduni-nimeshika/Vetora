package com.vetora.service;

import com.vetora.entity.Doctor;
import com.vetora.entity.User;
import com.vetora.enums.Role;
import com.vetora.repository.DoctorRepository;
import com.vetora.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private static final Logger logger = LoggerFactory.getLogger(AdminService.class);
    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public AdminService(DoctorRepository doctorRepository,
                        UserRepository userRepository,
                        EmailService emailService) {
        this.doctorRepository = doctorRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    @Transactional
    public Doctor approveDoctor(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        doctor.setApproved(true);
        Doctor savedDoctor = doctorRepository.save(doctor);

        User user = doctor.getUser();

        try {
            emailService.sendApprovalEmail(user.getEmail(), user.getName());
            logger.info("✅ Approval email sent to: {}", user.getEmail());
        } catch (Exception e) {
            logger.error("❌ Failed to send approval email: {}", e.getMessage());
        }

        return savedDoctor;
    }

    @Transactional
    public void rejectDoctor(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        User user = doctor.getUser();

        try {
            emailService.sendRejectionEmail(user.getEmail(), user.getName(), "Registration rejected by admin");
            logger.info("✅ Rejection email sent to: {}", user.getEmail());
        } catch (Exception e) {
            logger.error("❌ Failed to send rejection email: {}", e.getMessage());
        }

        doctorRepository.delete(doctor);
        userRepository.delete(user);
    }

    public Doctor getDoctorById(Long doctorId) {
        return doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
    }

    public List<Doctor> getPendingDoctors() {
        return doctorRepository.findByApprovedFalse();
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public String getAdminEmail() {
        try {
            List<User> admins = userRepository.findByRole(Role.ADMIN);
            if (admins != null && !admins.isEmpty() && admins.get(0).getEmail() != null) {
                return admins.get(0).getEmail();
            }
        } catch (Exception e) {
            logger.warn("⚠️ Could not fetch admin email from DB: {}", e.getMessage());
        }
        return "admin@vetora.com";
    }

    public List<String> getAllAdminEmails() {
        try {
            return userRepository.findByRole(Role.ADMIN)
                    .stream()
                    .map(User::getEmail)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.warn("⚠️ Could not fetch admin emails: {}", e.getMessage());
            return Collections.singletonList("admin@vetora.com");
        }
    }
}