package com.vetora.repository;

import com.vetora.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {

    // Find all prescriptions for a pet (active only)
    List<Prescription> findByPetIdAndIsActiveTrueOrderByPrescribedDateDesc(Long petId);

    // Find all prescriptions by doctor
    List<Prescription> findByDoctorIdAndIsActiveTrueOrderByPrescribedDateDesc(Long doctorId);

    // Find all prescriptions for a pet (including inactive)
    List<Prescription> findByPetIdOrderByPrescribedDateDesc(Long petId);

    // Find active prescriptions
    List<Prescription> findByIsActiveTrue();
}
