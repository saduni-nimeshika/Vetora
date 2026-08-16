package com.vetora.service;

import com.vetora.dto.VaccinationRequestDTO;
import com.vetora.dto.VaccinationResponseDTO;
import com.vetora.entity.Pet;
import com.vetora.entity.User;
import com.vetora.entity.Vaccination;
import com.vetora.repository.PetRepository;
import com.vetora.repository.UserRepository;
import com.vetora.repository.VaccinationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VaccinationService {

    private static final Logger logger = LoggerFactory.getLogger(VaccinationService.class);
    private final VaccinationRepository vaccinationRepository;
    private final PetRepository petRepository;
    private final UserRepository userRepository;

    public VaccinationService(VaccinationRepository vaccinationRepository,
                              PetRepository petRepository,
                              UserRepository userRepository) {
        this.vaccinationRepository = vaccinationRepository;
        this.petRepository = petRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public VaccinationResponseDTO addVaccination(VaccinationRequestDTO request, String doctorEmail) {
        User doctor = userRepository.findByEmail(doctorEmail)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        Pet pet = petRepository.findById(request.getPetId())
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        Vaccination vaccination = new Vaccination();
        vaccination.setPet(pet);
        vaccination.setDoctor(doctor);
        vaccination.setVaccineName(request.getVaccineName());
        vaccination.setVaccinationDate(request.getVaccinationDate());
        vaccination.setNextVaccinationDate(request.getNextVaccinationDate());
        vaccination.setNotes(request.getNotes());

        Vaccination savedVaccination = vaccinationRepository.save(vaccination);
        logger.info("✅ Vaccination added for pet: {}", pet.getName());

        return convertToResponseDTO(savedVaccination);
    }

    @Transactional
    public VaccinationResponseDTO updateVaccination(Long vaccinationId, VaccinationRequestDTO request, String doctorEmail) {
        User doctor = userRepository.findByEmail(doctorEmail)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        Vaccination vaccination = vaccinationRepository.findById(vaccinationId)
                .orElseThrow(() -> new RuntimeException("Vaccination not found"));

        if (!vaccination.getDoctor().getId().equals(doctor.getId())) {
            throw new RuntimeException("You can only update your own vaccination records!");
        }

        vaccination.setVaccineName(request.getVaccineName());
        vaccination.setVaccinationDate(request.getVaccinationDate());
        vaccination.setNextVaccinationDate(request.getNextVaccinationDate());
        vaccination.setNotes(request.getNotes());

        Vaccination updatedVaccination = vaccinationRepository.save(vaccination);
        logger.info("✅ Vaccination updated: {}", vaccinationId);

        return convertToResponseDTO(updatedVaccination);
    }

    public List<VaccinationResponseDTO> getVaccinationsByPet(Long petId) {
        List<Vaccination> vaccinations = vaccinationRepository.findByPetIdAndIsActiveTrueOrderByVaccinationDateDesc(petId);
        return vaccinations.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    public List<VaccinationResponseDTO> getVaccinationsByPetForOwner(Long petId, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        if (!pet.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("You don't have access to this pet!");
        }

        return getVaccinationsByPet(petId);
    }

    public List<VaccinationResponseDTO> getUpcomingVaccinations() {
        LocalDate nextMonth = LocalDate.now().plusMonths(1);
        List<Vaccination> vaccinations = vaccinationRepository
                .findByNextVaccinationDateBeforeAndIsActiveTrue(nextMonth);
        return vaccinations.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteVaccination(Long vaccinationId, String doctorEmail) {
        User doctor = userRepository.findByEmail(doctorEmail)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        Vaccination vaccination = vaccinationRepository.findById(vaccinationId)
                .orElseThrow(() -> new RuntimeException("Vaccination not found"));

        if (!vaccination.getDoctor().getId().equals(doctor.getId())) {
            throw new RuntimeException("You can only delete your own vaccination records!");
        }

        vaccination.setIsActive(false);
        vaccinationRepository.save(vaccination);
        logger.info("✅ Vaccination deleted: {}", vaccinationId);
    }

    private VaccinationResponseDTO convertToResponseDTO(Vaccination vaccination) {
        return new VaccinationResponseDTO(
                vaccination.getId(),
                vaccination.getPet().getId(),
                vaccination.getPet().getName(),
                vaccination.getPet().getSpecies(),
                vaccination.getDoctor().getId(),
                vaccination.getDoctor().getName(),
                vaccination.getVaccineName(),
                vaccination.getVaccinationDate(),
                vaccination.getNextVaccinationDate(),
                vaccination.getNotes(),
                vaccination.getIsActive(),
                vaccination.getCreatedAt(),
                vaccination.getUpdatedAt()
        );
    }
}