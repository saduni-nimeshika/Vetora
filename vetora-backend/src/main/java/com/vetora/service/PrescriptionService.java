package com.vetora.service;

import com.vetora.dto.PrescriptionRequestDTO;
import com.vetora.dto.PrescriptionResponseDTO;
import com.vetora.entity.Pet;
import com.vetora.entity.Prescription;
import com.vetora.entity.User;
import com.vetora.repository.PetRepository;
import com.vetora.repository.PrescriptionRepository;
import com.vetora.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PrescriptionService {

    private static final Logger logger = LoggerFactory.getLogger(PrescriptionService.class);
    private final PrescriptionRepository prescriptionRepository;
    private final PetRepository petRepository;
    private final UserRepository userRepository;

    public PrescriptionService(PrescriptionRepository prescriptionRepository,
                               PetRepository petRepository,
                               UserRepository userRepository) {
        this.prescriptionRepository = prescriptionRepository;
        this.petRepository = petRepository;
        this.userRepository = userRepository;
    }

    // ✅ FR-39: Create Prescription
    @Transactional
    public PrescriptionResponseDTO createPrescription(PrescriptionRequestDTO request, String doctorEmail) {
        User doctor = userRepository.findByEmail(doctorEmail)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        Pet pet = petRepository.findById(request.getPetId())
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        Prescription prescription = new Prescription();
        prescription.setPet(pet);
        prescription.setDoctor(doctor);
        prescription.setMedicationName(request.getMedicationName());
        prescription.setDosage(request.getDosage());
        prescription.setFrequency(request.getFrequency());
        prescription.setDuration(request.getDuration());
        prescription.setInstructions(request.getInstructions());
        prescription.setPrescribedDate(request.getPrescribedDate() != null ? request.getPrescribedDate() : LocalDateTime.now());
        prescription.setIsActive(true);

        Prescription savedPrescription = prescriptionRepository.save(prescription);
        logger.info("✅ Prescription created for pet: {} by doctor: {}", pet.getName(), doctorEmail);

        return convertToResponseDTO(savedPrescription);
    }

    // ✅ FR-40: Update Prescription
    @Transactional
    public PrescriptionResponseDTO updatePrescription(Long prescriptionId, PrescriptionRequestDTO request, String doctorEmail) {
        User doctor = userRepository.findByEmail(doctorEmail)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new RuntimeException("Prescription not found"));

        if (!prescription.getDoctor().getId().equals(doctor.getId())) {
            throw new RuntimeException("You can only update your own prescriptions!");
        }

        prescription.setMedicationName(request.getMedicationName());
        prescription.setDosage(request.getDosage());
        prescription.setFrequency(request.getFrequency());
        prescription.setDuration(request.getDuration());
        prescription.setInstructions(request.getInstructions());
        prescription.setPrescribedDate(request.getPrescribedDate() != null ? request.getPrescribedDate() : LocalDateTime.now());

        Prescription updatedPrescription = prescriptionRepository.save(prescription);
        logger.info("✅ Prescription updated: {}", prescriptionId);

        return convertToResponseDTO(updatedPrescription);
    }

    // ✅ FR-42: Get Prescriptions by Pet (Doctor)
    public List<PrescriptionResponseDTO> getPrescriptionsByPet(Long petId) {
        List<Prescription> prescriptions = prescriptionRepository.findByPetIdAndIsActiveTrueOrderByPrescribedDateDesc(petId);
        return prescriptions.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    // ✅ Get Prescription by ID
    public PrescriptionResponseDTO getPrescriptionById(Long prescriptionId) {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new RuntimeException("Prescription not found"));
        return convertToResponseDTO(prescription);
    }

    // ✅ Get My Prescriptions (Doctor)
    public List<PrescriptionResponseDTO> getMyPrescriptions(String doctorEmail) {
        User doctor = userRepository.findByEmail(doctorEmail)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        List<Prescription> prescriptions = prescriptionRepository.findByDoctorIdAndIsActiveTrueOrderByPrescribedDateDesc(doctor.getId());
        return prescriptions.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    // ✅ FR-43: Get Prescriptions by Pet (Pet Owner)
    public List<PrescriptionResponseDTO> getPrescriptionsByPetForOwner(Long petId, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        if (!pet.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("You don't have access to this pet's prescriptions!");
        }

        List<Prescription> prescriptions = prescriptionRepository.findByPetIdAndIsActiveTrueOrderByPrescribedDateDesc(petId);
        return prescriptions.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    // ✅ Delete Prescription (Soft Delete)
    @Transactional
    public void deletePrescription(Long prescriptionId, String email, boolean isAdmin) {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new RuntimeException("Prescription not found"));

        if (!isAdmin) {
            User doctor = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (!prescription.getDoctor().getId().equals(doctor.getId())) {
                throw new RuntimeException("You can only delete your own prescriptions!");
            }
        }

        prescription.setIsActive(false);
        prescriptionRepository.save(prescription);
        logger.info("✅ Prescription deactivated: {}", prescriptionId);
    }

    // ✅ Convert Entity to Response DTO
    private PrescriptionResponseDTO convertToResponseDTO(Prescription prescription) {
        return new PrescriptionResponseDTO(
                prescription.getId(),
                prescription.getPet().getId(),
                prescription.getPet().getName(),
                prescription.getPet().getSpecies(),
                prescription.getDoctor().getId(),
                prescription.getDoctor().getName(),
                prescription.getMedicationName(),
                prescription.getDosage(),
                prescription.getFrequency(),
                prescription.getDuration(),
                prescription.getInstructions(),
                prescription.getPrescribedDate(),
                prescription.getIsActive(),
                prescription.getCreatedAt(),
                prescription.getUpdatedAt()
        );
    }
}
