package com.vetora.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "weight_records")
public class WeightRecord {

    public enum Source {
        OWNER,
        DOCTOR
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;

    @Column(nullable = false)
    private Double weight;

    @Column(name = "recorded_date", nullable = false)
    private LocalDate recordedDate;

    private String notes;

    // Who logged this entry — a doctor's clinic-scale reading during a visit
    // is the more reliable, clinically authoritative measurement, while an
    // owner's home reading is a convenient in-between data point.
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Source source;

    // Display name of whoever logged it (owner or doctor), so the UI can show
    // "Logged by Dr. Perera" without an extra join.
    @Column(name = "recorded_by_name")
    private String recordedByName;

    // Audit trail: if a doctor corrects an owner-logged (or another) entry,
    // keep the original source/logger but record who edited it and when —
    // clinical data should never silently change with no trace.
    @Column(name = "edited_by_name")
    private String editedByName;

    @Column(name = "edited_at")
    private LocalDateTime editedAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public WeightRecord() {
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.recordedDate == null) {
            this.recordedDate = LocalDate.now();
        }
    }

    // ========== GETTERS AND SETTERS ==========
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Pet getPet() { return pet; }
    public void setPet(Pet pet) { this.pet = pet; }

    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }

    public LocalDate getRecordedDate() { return recordedDate; }
    public void setRecordedDate(LocalDate recordedDate) { this.recordedDate = recordedDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Source getSource() { return source; }
    public void setSource(Source source) { this.source = source; }

    public String getRecordedByName() { return recordedByName; }
    public void setRecordedByName(String recordedByName) { this.recordedByName = recordedByName; }

    public String getEditedByName() { return editedByName; }
    public void setEditedByName(String editedByName) { this.editedByName = editedByName; }

    public LocalDateTime getEditedAt() { return editedAt; }
    public void setEditedAt(LocalDateTime editedAt) { this.editedAt = editedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}


