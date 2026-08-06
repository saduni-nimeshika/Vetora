package com.vetora.service;

import com.vetora.dto.SignUpRequest;
import com.vetora.entity.Doctor;
import com.vetora.entity.User;
import com.vetora.enums.Role;
import com.vetora.repository.DoctorRepository;
import com.vetora.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Transactional
    public User registerUser(SignUpRequest request) {

        // 1. User Account Creation
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail().trim());
        user.setPassword(request.getPassword().trim());

        // Default Role Handling
        if (request.getRole() == null) {
            user.setRole(Role.PET_OWNER);
        } else {
            user.setRole(request.getRole());
        }

        User savedUser = userRepository.save(user);

        // 2. Doctor Mapping (If Role is DOCTOR)
        if (savedUser.getRole() == Role.DOCTOR) {
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

            doctor.setApproved(false); // Admin Approval is required

            doctorRepository.save(doctor);
        }

        return savedUser;
    }

    public void approveDoctor(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + doctorId));

        doctor.setApproved(true);
        doctorRepository.save(doctor);
    }
}