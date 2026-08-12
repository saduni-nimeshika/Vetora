package com.vetora.service;

import com.vetora.dto.PetRequestDTO;
import com.vetora.dto.PetResponseDTO;
import com.vetora.entity.Pet;
import com.vetora.entity.User;
import com.vetora.repository.PetRepository;
import com.vetora.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PetService {

    private static final Logger logger = LoggerFactory.getLogger(PetService.class);
    private final PetRepository petRepository;
    private final UserRepository userRepository;

    public PetService(PetRepository petRepository, UserRepository userRepository) {
        this.petRepository = petRepository;
        this.userRepository = userRepository;
    }

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
        pet.setProfileImage(request.getProfileImage());  // Image
        pet.setOwner(owner);
        pet.setIsActive(true);

        Pet savedPet = petRepository.save(pet);
        logger.info("✅ Pet created successfully: {} for owner: {}", savedPet.getName(), ownerEmail);

        return convertToResponseDTO(savedPet);
    }

    // ✅ FR-10: Get all pets for a user
    public List<PetResponseDTO> getPetsByOwner(String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Pet> pets = petRepository.findByOwnerAndIsActiveTrue(owner);
        return pets.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    // ✅ FR-10: Get pet by ID
    public PetResponseDTO getPetById(Long petId, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Pet pet = petRepository.findByIdAndOwner(petId, owner)
                .orElseThrow(() -> new RuntimeException("Pet not found or you don't have access"));

        return convertToResponseDTO(pet);
    }

    // ✅ FR-11: Update pet information
    @Transactional
    public PetResponseDTO updatePet(Long petId, PetRequestDTO request, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Pet pet = petRepository.findByIdAndOwner(petId, owner)
                .orElseThrow(() -> new RuntimeException("Pet not found or you don't have access"));

        pet.setName(request.getName());
        pet.setSpecies(request.getSpecies());
        pet.setBreed(request.getBreed());
        pet.setDateOfBirth(request.getDateOfBirth());
        pet.setGender(request.getGender());
        pet.setColor(request.getColor());
        pet.setWeight(request.getWeight());
        pet.setMedicalHistory(request.getMedicalHistory());
        pet.setProfileImage(request.getProfileImage());  // Image

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

        pet.setIsActive(false);
        petRepository.save(pet);
        logger.info("✅ Pet deactivated successfully: {}", pet.getName());
    }

    // ✅ Admin: Get all pets
    public List<PetResponseDTO> getAllPets() {
        return petRepository.findAll()
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    // ✅ Admin: Get pets by species
    public List<PetResponseDTO> getPetsBySpecies(String species) {
        return petRepository.findBySpecies(species)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    // ✅ Search pets by name
    public List<PetResponseDTO> searchPetsByName(String name) {
        return petRepository.findByNameContainingIgnoreCase(name)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    // ========== DOCTOR METHODS ==========

    // ✅ Get Pet Entity by ID (for Doctor)
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
        history.put("ownerName", pet.getOwner().getName());
        history.put("ownerEmail", pet.getOwner().getEmail());

        return history;
    }

    // ✅ Get Pet by ID (for Doctor)
    public PetResponseDTO getPetByIdForDoctor(Long petId) {
        Pet pet = getPetEntityById(petId);
        return convertToResponseDTO(pet);
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