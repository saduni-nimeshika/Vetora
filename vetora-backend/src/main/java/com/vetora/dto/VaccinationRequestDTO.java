package com.vetora.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class VaccinationRequestDTO {

    @NotNull(message = "Pet ID is required")
    private Long petId;

    @NotBlank(message = "Vaccine name is required")
    private String vaccineName;

    @NotNull(message = "Vaccination date is required")
    private LocalDate vaccinationDate;

    private LocalDate nextVaccinationDate;
    private String notes;

    // Getters and Setters
    public Long getPetId() { return petId; }
    public void setPetId(Long petId) { this.petId = petId; }

    public String getVaccineName() { return vaccineName; }
    public void setVaccineName(String vaccineName) { this.vaccineName = vaccineName; }

    public LocalDate getVaccinationDate() { return vaccinationDate; }
    public void setVaccinationDate(LocalDate vaccinationDate) { this.vaccinationDate = vaccinationDate; }

    public LocalDate getNextVaccinationDate() { return nextVaccinationDate; }
    public void setNextVaccinationDate(LocalDate nextVaccinationDate) { this.nextVaccinationDate = nextVaccinationDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}