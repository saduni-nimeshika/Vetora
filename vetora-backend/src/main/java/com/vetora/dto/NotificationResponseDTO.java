package com.vetora.dto;

import com.vetora.entity.Notification;

import java.time.LocalDateTime;

public class NotificationResponseDTO {

    private Long id;
    private String type;
    private String title;
    private String message;
    private String link;
    private Long appointmentId;
    private Boolean isRead;
    private LocalDateTime createdAt;

    public static NotificationResponseDTO from(Notification n) {
        NotificationResponseDTO dto = new NotificationResponseDTO();
        dto.id = n.getId();
        dto.type = n.getType() != null ? n.getType().name() : null;
        dto.title = n.getTitle();
        dto.message = n.getMessage();
        dto.link = n.getLink();
        dto.appointmentId = n.getAppointmentId();
        dto.isRead = n.getIsRead();
        dto.createdAt = n.getCreatedAt();
        return dto;
    }

    public Long getId() { return id; }
    public String getType() { return type; }
    public String getTitle() { return title; }
    public String getMessage() { return message; }
    public String getLink() { return link; }
    public Long getAppointmentId() { return appointmentId; }
    public Boolean getIsRead() { return isRead; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}

