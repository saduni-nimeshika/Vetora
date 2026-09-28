package com.vetora.service;

import com.vetora.dto.RatingRequestDTO;
import com.vetora.dto.RatingResponseDTO;
import com.vetora.dto.RatingSummaryDTO;
import com.vetora.entity.Appointment;
import com.vetora.entity.Doctor;
import com.vetora.entity.DoctorRating;
import com.vetora.entity.User;
import com.vetora.repository.AppointmentRepository;
import com.vetora.repository.DoctorRatingRepository;
import com.vetora.repository.DoctorRepository;
import com.vetora.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RatingService {

    private static final Logger logger = LoggerFactory.getLogger(RatingService.class);

    // Most reviews one owner may have posted for the same doctor at a time
    // (deleting one frees a slot). Keeps a single owner from swinging the average.
    private static final int MAX_REVIEWS_PER_OWNER = 3;

    private final DoctorRatingRepository ratingRepository;
    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;

    public RatingService(DoctorRatingRepository ratingRepository,
                         DoctorRepository doctorRepository,
                         UserRepository userRepository,
                         AppointmentRepository appointmentRepository) {
        this.ratingRepository = ratingRepository;
        this.doctorRepository = doctorRepository;
        this.userRepository = userRepository;
        this.appointmentRepository = appointmentRepository;
    }

    // A pet owner can only review a doctor they've actually had a completed
    // appointment with. Appointment.doctor points at the doctor's User
    // account (not the Doctor profile row), so we compare against that.
    private boolean hasCompletedAppointmentWith(Long ownerId, Long doctorUserId) {
        if (doctorUserId == null) return false;
        return appointmentRepository.findByPetOwnerIdOrderByAppointmentDateTimeDesc(ownerId)
                .stream()
                .anyMatch(a -> a.getDoctor() != null
                        && doctorUserId.equals(a.getDoctor().getId())
                        && a.getStatus() == Appointment.AppointmentStatus.COMPLETED);
    }

    private RatingResponseDTO toDTO(DoctorRating r, Long requestingUserId) {
        RatingResponseDTO dto = new RatingResponseDTO();
        dto.setId(r.getId());
        dto.setOwnerName(r.getOwner().getName());
        dto.setRating(r.getRating());
        dto.setComment(r.getComment());
        dto.setDoctorReply(r.getDoctorReply());
        dto.setDoctorRepliedAt(r.getDoctorRepliedAt());
        dto.setCreatedAt(r.getCreatedAt());
        dto.setUpdatedAt(r.getUpdatedAt());
        dto.setMine(requestingUserId != null && requestingUserId.equals(r.getOwner().getId()));
        return dto;
    }

    // The Doctor profile row that belongs to a logged-in doctor's account
    private Doctor findDoctorByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return doctorRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Doctor profile not found"));
    }

    // A review that must belong to the given doctor (used for replying)
    private DoctorRating findReviewForDoctor(Long ratingId, Doctor doctor) {
        DoctorRating rating = ratingRepository.findById(ratingId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        if (!rating.getDoctor().getId().equals(doctor.getId())) {
            throw new RuntimeException("You can only reply to reviews written about you");
        }
        return rating;
    }

    // ✅ Reviews + average for a doctor's profile. Any logged-in user can view
    // them. eligibleToRate is only true for a pet owner with a completed
    // appointment with this doctor; `mine` marks the caller's own reviews.
    @Transactional(readOnly = true)
    public RatingSummaryDTO getSummary(Long doctorId, String requestingUserEmail) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        List<DoctorRating> all = ratingRepository.findByDoctorIdOrderByCreatedAtDesc(doctorId);

        User requestingUser = requestingUserEmail != null
                ? userRepository.findByEmail(requestingUserEmail).orElse(null)
                : null;
        Long requestingUserId = requestingUser != null ? requestingUser.getId() : null;

        Double avg = ratingRepository.findAverageRatingByDoctorId(doctorId);

        RatingSummaryDTO summary = new RatingSummaryDTO();
        summary.setAverageRating(avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0);
        summary.setTotalRatings(all.size());
        summary.setRatings(all.stream().map(r -> toDTO(r, requestingUserId)).collect(Collectors.toList()));

        if (requestingUser != null) {
            Long doctorUserId = doctor.getUser() != null ? doctor.getUser().getId() : null;
            summary.setEligibleToRate(hasCompletedAppointmentWith(requestingUser.getId(), doctorUserId));
            long used = ratingRepository.countByDoctorIdAndOwnerId(doctorId, requestingUser.getId());
            summary.setReviewsLeft((int) Math.max(0, MAX_REVIEWS_PER_OWNER - used));
        }

        return summary;
    }

    // ✅ Doctor: the reviews written about the logged-in doctor
    @Transactional(readOnly = true)
    public RatingSummaryDTO getSummaryForLoggedInDoctor(String doctorEmail) {
        Doctor doctor = findDoctorByEmail(doctorEmail);
        return getSummary(doctor.getId(), doctorEmail);
    }

    // ✅ Pet owner: post a new review. Every post is its own review, so an
    // owner can add more comments over time.
    @Transactional
    public RatingResponseDTO submitRating(Long doctorId, String ownerEmail, RatingRequestDTO request) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Long doctorUserId = doctor.getUser() != null ? doctor.getUser().getId() : null;
        if (!hasCompletedAppointmentWith(owner.getId(), doctorUserId)) {
            throw new RuntimeException("You can review a doctor only after a completed appointment with them");
        }

        if (ratingRepository.countByDoctorIdAndOwnerId(doctorId, owner.getId()) >= MAX_REVIEWS_PER_OWNER) {
            throw new RuntimeException("You can post up to " + MAX_REVIEWS_PER_OWNER
                    + " reviews for the same doctor. Delete an older one to post a new review.");
        }

        String comment = request.getComment() != null ? request.getComment().trim() : null;

        DoctorRating rating = new DoctorRating();
        rating.setDoctor(doctor);
        rating.setOwner(owner);
        rating.setRating(request.getRating());
        rating.setComment(comment == null || comment.isEmpty() ? null : comment);

        DoctorRating saved = ratingRepository.save(rating);
        logger.info("✅ Review posted — doctor {} rated {}/5 by {}", doctorId, request.getRating(), owner.getEmail());
        return toDTO(saved, owner.getId());
    }

    // ✅ Pet owner: delete one of their own reviews
    @Transactional
    public void deleteMyRating(Long ratingId, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        DoctorRating rating = ratingRepository.findById(ratingId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        if (!rating.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("You can only delete your own reviews");
        }
        ratingRepository.delete(rating);
        logger.info("✅ Review {} removed by {}", ratingId, owner.getEmail());
    }

    // ✅ Doctor: reply to (or edit their reply to) a review about them.
    // The rating and comment themselves are never touched.
    @Transactional
    public RatingResponseDTO replyToRating(Long ratingId, String doctorEmail, String reply) {
        Doctor doctor = findDoctorByEmail(doctorEmail);
        DoctorRating rating = findReviewForDoctor(ratingId, doctor);
        rating.setDoctorReply(reply.trim());
        rating.setDoctorRepliedAt(LocalDateTime.now());
        DoctorRating saved = ratingRepository.save(rating);
        logger.info("✅ Doctor {} replied to review {}", doctor.getId(), ratingId);
        return toDTO(saved, null);
    }

    // ✅ Doctor: remove their reply from a review
    @Transactional
    public void deleteReply(Long ratingId, String doctorEmail) {
        Doctor doctor = findDoctorByEmail(doctorEmail);
        DoctorRating rating = findReviewForDoctor(ratingId, doctor);
        rating.setDoctorReply(null);
        rating.setDoctorRepliedAt(null);
        ratingRepository.save(rating);
        logger.info("✅ Doctor {} removed reply on review {}", doctor.getId(), ratingId);
    }
}



