package com.vetora.repository;

import com.vetora.entity.MedicalRecord;
import com.vetora.entity.Pet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {

    // Find all medical records for a pet (ordered by date - newest first)
    List<MedicalRecord> findByPetOrderByRecordDateDesc(Pet pet);

    // Find all medical records for a pet by pet ID
    List<MedicalRecord> findByPetIdOrderByRecordDateDesc(Long petId);

    // Find all medical records by doctor
    List<MedicalRecord> findByDoctorIdOrderByRecordDateDesc(Long doctorId);

    // Find all medical records for a pet (active only)
    List<MedicalRecord> findByPetIdAndPetIsActiveTrueOrderByRecordDateDesc(Long petId);
}
