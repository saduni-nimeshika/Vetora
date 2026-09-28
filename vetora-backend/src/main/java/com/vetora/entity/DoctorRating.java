package com.vetora.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

// A pet owner's review of a doctor: a 1–5 star rating with an optional comment.
// An owner can post several reviews over time. The doctor can attach one reply
// to each review, but cannot change the rating or the comment itself.
//
// Table is "doctor_reviews" (the earlier one-rating-per-owner table was
// "doctor_ratings"). A new name lets Hibernate's ddl-auto=update create the
// table without that old unique constraint, which update would never drop.
@Entity
@Table(name = "doctor_reviews")
public class DoctorRating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false)
    private Integer rating; // 1–5

    @Column(columnDefinition = "TEXT")
    private String comment;

    // The doctor's reply to this review (null until they reply)
    @Column(name = "doctor_reply", columnDefinition = "TEXT")
    private String doctorReply;

    @Column(name = "doctor_replied_at")
    private LocalDateTime doctorRepliedAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // ========== GETTERS AND SETTERS ==========
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Doctor getDoctor() { return doctor; }
    public void setDoctor(Doctor doctor) { this.doctor = doctor; }

    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public String getDoctorReply() { return doctorReply; }
    public void setDoctorReply(String doctorReply) { this.doctorReply = doctorReply; }

    public LocalDateTime getDoctorRepliedAt() { return doctorRepliedAt; }
    public void setDoctorRepliedAt(LocalDateTime doctorRepliedAt) { this.doctorRepliedAt = doctorRepliedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}


