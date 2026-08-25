package com.vetora.dto;

import com.vetora.entity.Reminder;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class ReminderRequestDTO {

    @NotNull(message = "Pet ID is required")
    private Long petId;

    @NotNull(message = "Reminder type is required")
    private Reminder.ReminderType type;

    @NotNull(message = "Reminder date and time is required")
    private LocalDateTime reminderDateTime;

    @NotBlank(message = "Message is required")
    private String message;

    private Boolean isRecurring = false;
    private Integer recurrenceInterval;

    // ========== GETTERS AND SETTERS ==========
    public Long getPetId() { return petId; }
    public void setPetId(Long petId) { this.petId = petId; }

    public Reminder.ReminderType getType() { return type; }
    public void setType(Reminder.ReminderType type) { this.type = type; }

    public LocalDateTime getReminderDateTime() { return reminderDateTime; }
    public void setReminderDateTime(LocalDateTime reminderDateTime) { this.reminderDateTime = reminderDateTime; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Boolean getIsRecurring() { return isRecurring; }
    public void setIsRecurring(Boolean isRecurring) { this.isRecurring = isRecurring; }

    public Integer getRecurrenceInterval() { return recurrenceInterval; }
    public void setRecurrenceInterval(Integer recurrenceInterval) { this.recurrenceInterval = recurrenceInterval; }
}