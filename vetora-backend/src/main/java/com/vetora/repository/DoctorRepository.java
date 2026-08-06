package com.vetora.repository;

import com.vetora.entity.Doctor;
import com.vetora.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    // User account එකෙන් Doctor Profile එක සොයාගැනීමට
    Optional<Doctor> findByUser(User user);

    // 💡 1. Pending Doctors ලා (isApproved = false අය) අරන් බලන්න
    List<Doctor> findByIsApprovedFalse();

    // 💡 2. Approved Doctors ලා විතරක් අරන් බලන්න
    List<Doctor> findByIsApprovedTrue();

}
