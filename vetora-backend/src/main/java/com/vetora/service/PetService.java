package com.vetora.service;

import com.vetora.dto.PetRequestDTO;
import com.vetora.dto.PetResponseDTO;
import com.vetora.dto.WeightRecordRequestDTO;
import com.vetora.dto.WeightRecordResponseDTO;
import com.vetora.entity.Pet;
import com.vetora.entity.User;
import com.vetora.entity.WeightRecord;
import com.vetora.repository.PetRepository;
import com.vetora.repository.UserRepository;
import com.vetora.repository.WeightRecordRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PetService {

    private static final Logger logger = LoggerFactory.getLogger(PetService.class);
    private final PetRepository petRepository;
    private final UserRepository userRepository;
    private final WeightRecordRepository weightRecordRepository;

    public PetService(PetRepository petRepository, UserRepository userRepository,
                      WeightRecordRepository weightRecordRepository) {
        this.petRepository = petRepository;
        this.userRepository = userRepository;
        this.weightRecordRepository = weightRecordRepository;
    }

    // ========== PET OWNER METHODS ==========

    // ✅ FR-08: Register a new pet
    @Transactional
    public PetResponseDTO createPet(PetRequestDTO request, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Pet pet = new Pet();
        pet.setName(request.getName());
        pet.setSpecies(request.getSpecies());
        pet.setBreed(request.getBreed());
        pet.setDateOfBirth(request.getDateOfBirth());
        pet.setGender(request.getGender());
        pet.setColor(request.getColor());
        pet.setWeight(request.getWeight());
        pet.setMedicalHistory(request.getMedicalHistory());
        pet.setProfileImage(request.getProfileImage());
        pet.setOwner(owner);
        pet.setIsActive(true);

        Pet savedPet = petRepository.save(pet);
        logger.info("✅ Pet created successfully: {} for owner: {}", savedPet.getName(), ownerEmail);

        return convertToResponseDTO(savedPet);
    }

    // ✅ FR-10: Get all active pets for a user
    public List<PetResponseDTO> getPetsByOwner(String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Pet> pets = petRepository.findByOwnerAndIsActiveTrue(owner);
        return pets.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    // ✅ FR-10: Get pet by ID (Active only)
    public PetResponseDTO getPetById(Long petId, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Pet pet = petRepository.findByIdAndOwner(petId, owner)
                .orElseThrow(() -> new RuntimeException("Pet not found or you don't have access"));

        if (!pet.getIsActive()) {
            throw new RuntimeException("Pet has been deleted!");
        }

        return convertToResponseDTO(pet);
    }

    // ✅ FR-11: Update pet information
    @Transactional
    public PetResponseDTO updatePet(Long petId, PetRequestDTO request, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Pet pet = petRepository.findByIdAndOwner(petId, owner)
                .orElseThrow(() -> new RuntimeException("Pet not found or you don't have access"));

        if (!pet.getIsActive()) {
            throw new RuntimeException("Cannot update a deleted pet!");
        }

        pet.setName(request.getName());
        pet.setSpecies(request.getSpecies());
        pet.setBreed(request.getBreed());
        pet.setDateOfBirth(request.getDateOfBirth());
        pet.setGender(request.getGender());
        pet.setColor(request.getColor());
        pet.setWeight(request.getWeight());
        pet.setMedicalHistory(request.getMedicalHistory());
        pet.setProfileImage(request.getProfileImage());

        Pet updatedPet = petRepository.save(pet);
        logger.info("✅ Pet updated successfully: {}", updatedPet.getName());

        return convertToResponseDTO(updatedPet);
    }

    // ✅ FR-11: Delete pet (soft delete - set inactive)
    @Transactional
    public void deletePet(Long petId, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Pet pet = petRepository.findByIdAndOwner(petId, owner)
                .orElseThrow(() -> new RuntimeException("Pet not found or you don't have access"));

        if (!pet.getIsActive()) {
            throw new RuntimeException("Pet is already deleted!");
        }

        pet.setIsActive(false);
        petRepository.save(pet);
        logger.info("✅ Pet deactivated successfully: {}", pet.getName());
    }
    // ✅ Admin: Hard Delete (සම්පූර්ණයෙන්ම මකන්න)
    @Transactional
    public void hardDeletePet(Long petId) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        // Optional: Check if pet has active appointments
        // If yes, prevent deletion
        // List<Appointment> appointments = appointmentRepository.findByPetId(petId);
        // if (!appointments.isEmpty()) {
        //     throw new RuntimeException("Cannot delete pet with active appointments!");
        // }

        petRepository.delete(pet);
        logger.info("✅ Pet permanently deleted by Admin: {}", pet.getName());
    }

    // ✅ Search pets by name (Active only)
    public List<PetResponseDTO> searchPetsByName(String name) {
        return petRepository.findByNameContainingIgnoreCase(name)
                .stream()
                .filter(Pet::getIsActive)
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    // ========== ADMIN METHODS ==========

    // ✅ Admin: Get all pets (including deleted)
    public List<PetResponseDTO> getAllPets() {
        return petRepository.findAll()
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    // ✅ Admin: Get pets by species (all, including deleted)
    public List<PetResponseDTO> getPetsBySpecies(String species) {
        return petRepository.findBySpecies(species)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    // ✅ Admin: Get all pets including deleted
    public List<PetResponseDTO> getAllPetsIncludingDeleted() {
        return petRepository.findAll()
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    // ✅ Admin: Get deleted pets only
    public List<PetResponseDTO> getDeletedPets() {
        return petRepository.findByIsActiveFalse()
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    // ✅ Admin: Restore deleted pet
    @Transactional
    public PetResponseDTO restorePet(Long petId) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        if (pet.getIsActive()) {
            throw new RuntimeException("Pet is already active!");
        }

        pet.setIsActive(true);
        Pet restoredPet = petRepository.save(pet);

        logger.info("✅ Pet restored successfully: {}", restoredPet.getName());
        return convertToResponseDTO(restoredPet);
    }

    // ========== DOCTOR METHODS ==========

    // ✅ Get Pet Entity by ID (for Doctor - any status)
    public Pet getPetEntityById(Long petId) {
        return petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));
    }

    // ✅ Get Pet Medical History (for Doctor)
    public Map<String, Object> getPetMedicalHistory(Long petId) {
        Pet pet = getPetEntityById(petId);

        Map<String, Object> history = new HashMap<>();
        history.put("petId", pet.getId());
        history.put("petName", pet.getName());
        history.put("species", pet.getSpecies());
        history.put("breed", pet.getBreed());
        history.put("medicalHistory", pet.getMedicalHistory());
        history.put("dateOfBirth", pet.getDateOfBirth());
        history.put("gender", pet.getGender());
        history.put("weight", pet.getWeight());
        history.put("color", pet.getColor());
        history.put("profileImage", pet.getProfileImage());
        history.put("isActive", pet.getIsActive());
        history.put("ownerName", pet.getOwner().getName());
        history.put("ownerEmail", pet.getOwner().getEmail());

        return history;
    }

    // ✅ Get Pet by ID (for Doctor)
    public PetResponseDTO getPetByIdForDoctor(Long petId) {
        Pet pet = getPetEntityById(petId);
        return convertToResponseDTO(pet);
    }

    // ========== WEIGHT TRACKING METHODS ==========

    // ✅ Owner logs a weight entry — treated as a convenient home reading.
    @Transactional
    public WeightRecordResponseDTO addWeightRecord(Long petId, WeightRecordRequestDTO request, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Pet pet = petRepository.findByIdAndOwner(petId, owner)
                .orElseThrow(() -> new RuntimeException("Pet not found or you don't have access"));

        if (!pet.getIsActive()) {
            throw new RuntimeException("Cannot log weight for a deleted pet!");
        }

        WeightRecord savedRecord = saveWeightRecord(pet, request, WeightRecord.Source.OWNER, owner.getName());
        logger.info("✅ Weight logged (owner) for pet {}: {} kg", pet.getName(), savedRecord.getWeight());
        return convertToWeightRecordDTO(savedRecord);
    }

    // ✅ Doctor logs a weight entry — a clinic-scale reading taken during a
    // visit, which is clinically more reliable than an owner's home reading.
    // Any doctor can log for any active pet, matching the access pattern
    // already used for medical records and prescriptions in this app.
    @Transactional
    public WeightRecordResponseDTO addWeightRecordByDoctor(Long petId, WeightRecordRequestDTO request, String doctorEmail) {
        User doctorUser = userRepository.findByEmail(doctorEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Pet pet = getPetEntityById(petId);

        if (!pet.getIsActive()) {
            throw new RuntimeException("Cannot log weight for a deleted pet!");
        }

        WeightRecord savedRecord = saveWeightRecord(pet, request, WeightRecord.Source.DOCTOR, "Dr. " + doctorUser.getName());
        logger.info("✅ Weight logged (doctor) for pet {}: {} kg", pet.getName(), savedRecord.getWeight());
        return convertToWeightRecordDTO(savedRecord);
    }

    // ✅ Shared save logic: persist the entry, then keep pet.weight in sync
    // with the latest recorded value (by date, tie-broken by insertion order)
    // so the rest of the app keeps showing the current weight automatically —
    // regardless of whether an owner or a doctor logged it.
    private WeightRecord saveWeightRecord(Pet pet, WeightRecordRequestDTO request,
                                          WeightRecord.Source source, String recordedByName) {
        WeightRecord record = new WeightRecord();
        record.setPet(pet);
        record.setWeight(request.getWeight());
        record.setRecordedDate(request.getRecordedDate() != null ? request.getRecordedDate() : LocalDate.now());
        record.setNotes(request.getNotes());
        record.setSource(source);
        record.setRecordedByName(recordedByName);

        WeightRecord savedRecord = weightRecordRepository.save(record);
        syncPetCurrentWeight(pet);
        return savedRecord;
    }

    // ✅ Owner corrects one of their own manually-logged entries. A vet's
    // clinic-recorded entry can only be corrected by a doctor — an owner
    // editing a clinical reading after the fact would undermine the point
    // of having a clinically authoritative measurement.
    @Transactional
    public WeightRecordResponseDTO updateWeightRecordByOwner(Long recordId, WeightRecordRequestDTO request, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        WeightRecord record = weightRecordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("Weight record not found"));

        Pet pet = record.getPet();
        if (pet.getOwner() == null || !pet.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("Pet not found or you don't have access");
        }
        if (!pet.getIsActive()) {
            throw new RuntimeException("Cannot edit weight for a deleted pet!");
        }
        if (record.getSource() != WeightRecord.Source.OWNER) {
            throw new RuntimeException("This entry was recorded by a doctor — ask your vet to correct it.");
        }

        record.setWeight(request.getWeight());
        record.setRecordedDate(request.getRecordedDate() != null ? request.getRecordedDate() : record.getRecordedDate());
        record.setNotes(request.getNotes());

        WeightRecord updatedRecord = weightRecordRepository.save(record);
        syncPetCurrentWeight(pet);

        logger.info("✅ Weight record {} edited by owner {}", recordId, ownerEmail);
        return convertToWeightRecordDTO(updatedRecord);
    }

    // ✅ Owner deletes one of their own manually-logged entries. Same access
    // rule as editing: a vet's clinic-recorded entry can't be deleted by the
    // owner — only a doctor can remove/correct a clinical reading.
    @Transactional
    public void deleteWeightRecordByOwner(Long recordId, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        WeightRecord record = weightRecordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("Weight record not found"));

        Pet pet = record.getPet();
        if (pet.getOwner() == null || !pet.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("Pet not found or you don't have access");
        }
        if (!pet.getIsActive()) {
            throw new RuntimeException("Cannot delete weight for a deleted pet!");
        }
        if (record.getSource() != WeightRecord.Source.OWNER) {
            throw new RuntimeException("This entry was recorded by a doctor — ask your vet to remove it.");
        }

        weightRecordRepository.delete(record);
        syncPetCurrentWeight(pet);

        logger.info("✅ Weight record {} deleted by owner {}", recordId, ownerEmail);
    }

    // ✅ Doctor corrects an existing weight entry (their own, or one the owner
    // logged). The original source/logger is kept for history, but the edit
    // is stamped with who corrected it and when, so nothing changes silently.
    // Because both the owner's and the doctor's pet-profile pages read this
    // same table fresh on every load, the correction is visible on both sides
    // automatically — no separate sync step needed.
    @Transactional
    public WeightRecordResponseDTO updateWeightRecordByDoctor(Long recordId, WeightRecordRequestDTO request, String doctorEmail) {
        User doctorUser = userRepository.findByEmail(doctorEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        WeightRecord record = weightRecordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("Weight record not found"));

        Pet pet = record.getPet();
        if (!pet.getIsActive()) {
            throw new RuntimeException("Cannot edit weight for a deleted pet!");
        }

        record.setWeight(request.getWeight());
        record.setRecordedDate(request.getRecordedDate() != null ? request.getRecordedDate() : record.getRecordedDate());
        record.setNotes(request.getNotes());
        record.setEditedByName("Dr. " + doctorUser.getName());
        record.setEditedAt(LocalDateTime.now());

        WeightRecord updatedRecord = weightRecordRepository.save(record);
        syncPetCurrentWeight(pet);

        logger.info("✅ Weight record {} corrected by Dr. {}", recordId, doctorUser.getName());
        return convertToWeightRecordDTO(updatedRecord);
    }

    // ✅ Recompute pet.weight from the chronologically latest weight entry
    // (by date, tie-broken by insertion order) after any add or edit.
    private void syncPetCurrentWeight(Pet pet) {
        List<WeightRecord> history = weightRecordRepository.findByPetIdOrderByRecordedDateAscIdAsc(pet.getId());
        if (history.isEmpty()) {
            return;
        }
        WeightRecord latest = history.get(history.size() - 1);
        if (!latest.getWeight().equals(pet.getWeight())) {
            pet.setWeight(latest.getWeight());
            petRepository.save(pet);
        }
    }

    // ✅ Get full weight history for a pet, oldest first (for the chart) — owner view
    public List<WeightRecordResponseDTO> getWeightHistory(Long petId, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        petRepository.findByIdAndOwner(petId, owner)
                .orElseThrow(() -> new RuntimeException("Pet not found or you don't have access"));

        return weightRecordRepository.findByPetIdOrderByRecordedDateAscIdAsc(petId)
                .stream()
                .map(this::convertToWeightRecordDTO)
                .collect(Collectors.toList());
    }

    // ✅ Get full weight history for a pet — doctor view (any active pet)
    public List<WeightRecordResponseDTO> getWeightHistoryForDoctor(Long petId) {
        getPetEntityById(petId); // ensures the pet exists

        return weightRecordRepository.findByPetIdOrderByRecordedDateAscIdAsc(petId)
                .stream()
                .map(this::convertToWeightRecordDTO)
                .collect(Collectors.toList());
    }

    private WeightRecordResponseDTO convertToWeightRecordDTO(WeightRecord record) {
        return new WeightRecordResponseDTO(
                record.getId(),
                record.getPet().getId(),
                record.getWeight(),
                record.getRecordedDate(),
                record.getNotes(),
                record.getSource() != null ? record.getSource().name() : null,
                record.getRecordedByName(),
                record.getEditedByName(),
                record.getEditedAt(),
                record.getCreatedAt()
        );
    }

    // ========== CONVERT METHOD ==========

    // ✅ Convert Entity to Response DTO
    private PetResponseDTO convertToResponseDTO(Pet pet) {
        PetResponseDTO dto = new PetResponseDTO();
        dto.setId(pet.getId());
        dto.setName(pet.getName());
        dto.setSpecies(pet.getSpecies());
        dto.setBreed(pet.getBreed());
        dto.setDateOfBirth(pet.getDateOfBirth());
        dto.setGender(pet.getGender());
        dto.setColor(pet.getColor());
        dto.setWeight(pet.getWeight());
        dto.setMedicalHistory(pet.getMedicalHistory());
        dto.setIsActive(pet.getIsActive());
        dto.setProfileImage(pet.getProfileImage());
        dto.setOwnerId(pet.getOwner().getId());
        dto.setOwnerName(pet.getOwner().getName());
        dto.setCreatedAt(pet.getCreatedAt());
        dto.setUpdatedAt(pet.getUpdatedAt());
        return dto;
    }
}