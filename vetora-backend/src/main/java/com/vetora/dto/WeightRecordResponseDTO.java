package com.vetora.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class WeightRecordResponseDTO {

    private Long id;
    private Long petId;
    private Double weight;
    private LocalDate recordedDate;
    private String notes;
    private String source;         // "OWNER" or "DOCTOR"
    private String recordedByName; // e.g. owner's name or "Dr. Perera"
    private String editedByName;   // set only if a doctor later corrected this entry
    private LocalDateTime editedAt;
    private LocalDateTime createdAt;

    public WeightRecordResponseDTO() {}

    public WeightRecordResponseDTO(Long id, Long petId, Double weight, LocalDate recordedDate,
                                   String notes, String source, String recordedByName,
                                   String editedByName, LocalDateTime editedAt,
                                   LocalDateTime createdAt) {
        this.id = id;
        this.petId = petId;
        this.weight = weight;
        this.recordedDate = recordedDate;
        this.notes = notes;
        this.source = source;
        this.recordedByName = recordedByName;
        this.editedByName = editedByName;
        this.editedAt = editedAt;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getPetId() { return petId; }
    public void setPetId(Long petId) { this.petId = petId; }

    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }

    public LocalDate getRecordedDate() { return recordedDate; }
    public void setRecordedDate(LocalDate recordedDate) { this.recordedDate = recordedDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getRecordedByName() { return recordedByName; }
    public void setRecordedByName(String recordedByName) { this.recordedByName = recordedByName; }

    public String getEditedByName() { return editedByName; }
    public void setEditedByName(String editedByName) { this.editedByName = editedByName; }

    public LocalDateTime getEditedAt() { return editedAt; }
    public void setEditedAt(LocalDateTime editedAt) { this.editedAt = editedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}


