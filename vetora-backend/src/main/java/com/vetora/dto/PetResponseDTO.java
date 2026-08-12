package com.vetora.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class PetResponseDTO {

    private Long id;
    private String name;
    private String profileImage;
    private String species;
    private String breed;
    private LocalDate dateOfBirth;
    private String gender;
    private String color;
    private Double weight;
    private String medicalHistory;
    private Boolean isActive;
    private Long ownerId;
    private String ownerName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public PetResponseDTO() {}

    public PetResponseDTO(Long id, String name, String species, String breed,
                          LocalDate dateOfBirth, String gender, String color,
                          Double weight, String medicalHistory, Boolean isActive,
                          Long ownerId, String ownerName, LocalDateTime createdAt,
                          LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.species = species;
        this.breed = breed;
        this.dateOfBirth = dateOfBirth;
        this.gender = gender;
        this.color = color;
        this.weight = weight;
        this.medicalHistory = medicalHistory;
        this.isActive = isActive;
        this.ownerId = ownerId;
        this.ownerName = ownerName;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSpecies() { return species; }
    public void setSpecies(String species) { this.species = species; }

    public String getBreed() { return breed; }
    public void setBreed(String breed) { this.breed = breed; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }

    public String getMedicalHistory() { return medicalHistory; }
    public void setMedicalHistory(String medicalHistory) { this.medicalHistory = medicalHistory; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }

    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getProfileImage() { return profileImage; }
    public void setProfileImage(String profileImage) { this.profileImage = profileImage; }
}
