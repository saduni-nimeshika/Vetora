package com.vetora.service;

import com.vetora.entity.Doctor;
import com.vetora.entity.User;
import com.vetora.repository.DoctorRepository;
import com.vetora.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminService {

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserRepository userRepository;

    // 1. Admin විසින් Doctor කෙනෙකුව Approve කිරීම
    @Transactional
    public void approveDoctor(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + doctorId));

        doctor.setApproved(true);
        doctorRepository.save(doctor);
    }

    // 2. Pending ඉන්න Doctors ලාගේ List එක ලබාගැනීම
    public List<Doctor> getPendingDoctors() {
        return doctorRepository.findByIsApprovedFalse();
    }

    // 3. Admin විසින් Doctor කෙනෙකුව Reject / Delete කිරීම
    @Transactional
    public void rejectDoctor(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + doctorId));

        // Doctor Record එක සහ ඊට අදාළ User Account එක දෙකම Delete කිරීම
        User user = doctor.getUser();
        doctorRepository.delete(doctor);

        if (user != null) {
            userRepository.delete(user);
        }
    }

    // 4. System එකේ ඉන්න සියලුම Users ලාගේ List එක ලබාගැනීම
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
