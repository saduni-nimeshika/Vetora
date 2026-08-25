package com.vetora.dto;

import java.time.LocalDateTime;

public class PrescriptionResponseDTO {

    private Long id;
    private Long petId;
    private String petName;
    private String petSpecies;
    private Long doctorId;
    private String doctorName;
    private String medicationName;
    private String dosage;
    private String frequency;
    private String duration;
    private String instructions;
    private LocalDateTime prescribedDate;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ========== CONSTRUCTORS ==========
    public PrescriptionResponseDTO() {}

    public PrescriptionResponseDTO(Long id, Long petId, String petName, String petSpecies,
                                   Long doctorId, String doctorName, String medicationName,
                                   String dosage, String frequency, String duration,
                                   String instructions, LocalDateTime prescribedDate,
                                   Boolean isActive, LocalDateTime createdAt,
                                   LocalDateTime updatedAt) {
        this.id = id;
        this.petId = petId;
        this.petName = petName;
        this.petSpecies = petSpecies;
        this.doctorId = doctorId;
        this.doctorName = doctorName;
        this.medicationName = medicationName;
        this.dosage = dosage;
        this.frequency = frequency;
        this.duration = duration;
        this.instructions = instructions;
        this.prescribedDate = prescribedDate;
        this.isActive = isActive;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // ========== GETTERS AND SETTERS ==========
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getPetId() { return petId; }
    public void setPetId(Long petId) { this.petId = petId; }

    public String getPetName() { return petName; }
    public void setPetName(String petName) { this.petName = petName; }

    public String getPetSpecies() { return petSpecies; }
    public void setPetSpecies(String petSpecies) { this.petSpecies = petSpecies; }

    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public String getMedicationName() { return medicationName; }
    public void setMedicationName(String medicationName) { this.medicationName = medicationName; }

    public String getDosage() { return dosage; }
    public void setDosage(String dosage) { this.dosage = dosage; }

    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }

    public LocalDateTime getPrescribedDate() { return prescribedDate; }
    public void setPrescribedDate(LocalDateTime prescribedDate) { this.prescribedDate = prescribedDate; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
