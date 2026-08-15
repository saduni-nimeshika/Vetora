package com.vetora.service;

import com.vetora.dto.MedicalRecordRequestDTO;
import com.vetora.dto.MedicalRecordResponseDTO;
import com.vetora.entity.MedicalRecord;
import com.vetora.entity.Pet;
import com.vetora.entity.User;
import com.vetora.repository.MedicalRecordRepository;
import com.vetora.repository.PetRepository;
import com.vetora.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MedicalRecordService {

    private static final Logger logger = LoggerFactory.getLogger(MedicalRecordService.class);
    private final MedicalRecordRepository medicalRecordRepository;
    private final PetRepository petRepository;
    private final UserRepository userRepository;

    public MedicalRecordService(MedicalRecordRepository medicalRecordRepository,
                                PetRepository petRepository,
                                UserRepository userRepository) {
        this.medicalRecordRepository = medicalRecordRepository;
        this.petRepository = petRepository;
        this.userRepository = userRepository;
    }

    // ✅ FR-33: Create medical record
    @Transactional
    public MedicalRecordResponseDTO createMedicalRecord(MedicalRecordRequestDTO request, String doctorEmail) {
        User doctor = userRepository.findByEmail(doctorEmail)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        Pet pet = petRepository.findById(request.getPetId())
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        MedicalRecord record = new MedicalRecord();
        record.setPet(pet);
        record.setDoctor(doctor);
        record.setDiagnosis(request.getDiagnosis());
        record.setTreatment(request.getTreatment());
        record.setNotes(request.getNotes());
        record.setRecordDate(request.getRecordDate() != null ? request.getRecordDate() : LocalDateTime.now());

        MedicalRecord savedRecord = medicalRecordRepository.save(record);
        logger.info("✅ Medical record created for pet: {} by doctor: {}", pet.getName(), doctorEmail);

        return convertToResponseDTO(savedRecord);
    }

    // ✅ FR-34: Update medical record
    @Transactional
    public MedicalRecordResponseDTO updateMedicalRecord(Long recordId, MedicalRecordRequestDTO request, String doctorEmail) {
        User doctor = userRepository.findByEmail(doctorEmail)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        MedicalRecord record = medicalRecordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("Medical record not found"));

        // Check if this doctor created this record
        if (!record.getDoctor().getId().equals(doctor.getId())) {
            throw new RuntimeException("You can only update your own medical records!");
        }

        record.setDiagnosis(request.getDiagnosis());
        record.setTreatment(request.getTreatment());
        record.setNotes(request.getNotes());

        MedicalRecord updatedRecord = medicalRecordRepository.save(record);
        logger.info("✅ Medical record updated: {} by doctor: {}", recordId, doctorEmail);

        return convertToResponseDTO(updatedRecord);
    }

    // ✅ FR-37: Get medical records by pet (for Doctor)
    public List<MedicalRecordResponseDTO> getMedicalRecordsByPet(Long petId) {
        List<MedicalRecord> records = medicalRecordRepository.findByPetIdOrderByRecordDateDesc(petId);
        return records.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    // ✅ Get medical record by ID
    public MedicalRecordResponseDTO getMedicalRecordById(Long recordId) {
        MedicalRecord record = medicalRecordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("Medical record not found"));
        return convertToResponseDTO(record);
    }

    // ✅ Get all medical records by doctor
    public List<MedicalRecordResponseDTO> getMedicalRecordsByDoctor(String doctorEmail) {
        User doctor = userRepository.findByEmail(doctorEmail)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        List<MedicalRecord> records = medicalRecordRepository.findByDoctorIdOrderByRecordDateDesc(doctor.getId());
        return records.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    // ✅ FR-37: Get medical records by pet (for Pet Owner)
    public List<MedicalRecordResponseDTO> getMedicalRecordsByPetForOwner(Long petId, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        // Check if pet belongs to this owner
        if (!pet.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("You don't have access to this pet's medical records!");
        }

        List<MedicalRecord> records = medicalRecordRepository.findByPetIdOrderByRecordDateDesc(petId);
        return records.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    // ✅ Get medical records by pet (active only)
    public List<MedicalRecordResponseDTO> getActiveMedicalRecordsByPet(Long petId) {
        List<MedicalRecord> records = medicalRecordRepository.findByPetIdAndPetIsActiveTrueOrderByRecordDateDesc(petId);
        return records.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    // ✅ Delete medical record (Only doctor who created it or admin)
    @Transactional
    public void deleteMedicalRecord(Long recordId, String email, boolean isAdmin) {
        MedicalRecord record = medicalRecordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("Medical record not found"));

        if (!isAdmin) {
            User doctor = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (!record.getDoctor().getId().equals(doctor.getId())) {
                throw new RuntimeException("You can only delete your own medical records!");
            }
        }

        medicalRecordRepository.delete(record);
        logger.info("✅ Medical record deleted: {}", recordId);
    }

    // ✅ Convert Entity to Response DTO
    private MedicalRecordResponseDTO convertToResponseDTO(MedicalRecord record) {
        return new MedicalRecordResponseDTO(
                record.getId(),
                record.getPet().getId(),
                record.getPet().getName(),
                record.getPet().getSpecies(),
                record.getDoctor().getId(),
                record.getDoctor().getName(),
                record.getDiagnosis(),
                record.getTreatment(),
                record.getNotes(),
                record.getRecordDate(),
                record.getCreatedAt(),
                record.getUpdatedAt()
        );
    }
}
