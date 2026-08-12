package com.vetora.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class PetRequestDTO {

    @NotBlank(message = "Pet name is required")
    private String name;

    @NotBlank(message = "Species is required")
    private String species;

    private String breed;

    private String profileImage;

    private LocalDate dateOfBirth;

    private String gender;

    private String color;

    private Double weight;

    private String medicalHistory;

    // Getters and Setters
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

    // Getter and Setter
    public String getProfileImage() { return profileImage; }
    public void setProfileImage(String profileImage) { this.profileImage = profileImage; }

}