package com.vetora.dto;

import com.vetora.entity.Reminder;
import java.time.LocalDateTime;

public class ReminderResponseDTO {

    private Long id;
    private Long petId;
    private String petName;
    private String petSpecies;
    private Long doctorId;
    private String doctorName;
    private Reminder.ReminderType type;
    private LocalDateTime reminderDateTime;
    private String message;
    private Boolean isSent;
    private Boolean isRecurring;
    private Integer recurrenceInterval;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ReminderResponseDTO() {}

    public ReminderResponseDTO(Long id, Long petId, String petName, String petSpecies,
                               Long doctorId, String doctorName, Reminder.ReminderType type,
                               LocalDateTime reminderDateTime, String message,
                               Boolean isSent, Boolean isRecurring, Integer recurrenceInterval,
                               Boolean isActive, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.petId = petId;
        this.petName = petName;
        this.petSpecies = petSpecies;
        this.doctorId = doctorId;
        this.doctorName = doctorName;
        this.type = type;
        this.reminderDateTime = reminderDateTime;
        this.message = message;
        this.isSent = isSent;
        this.isRecurring = isRecurring;
        this.recurrenceInterval = recurrenceInterval;
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

    public Reminder.ReminderType getType() { return type; }
    public void setType(Reminder.ReminderType type) { this.type = type; }

    public LocalDateTime getReminderDateTime() { return reminderDateTime; }
    public void setReminderDateTime(LocalDateTime reminderDateTime) { this.reminderDateTime = reminderDateTime; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Boolean getIsSent() { return isSent; }
    public void setIsSent(Boolean isSent) { this.isSent = isSent; }

    public Boolean getIsRecurring() { return isRecurring; }
    public void setIsRecurring(Boolean isRecurring) { this.isRecurring = isRecurring; }

    public Integer getRecurrenceInterval() { return recurrenceInterval; }
    public void setRecurrenceInterval(Integer recurrenceInterval) { this.recurrenceInterval = recurrenceInterval; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
