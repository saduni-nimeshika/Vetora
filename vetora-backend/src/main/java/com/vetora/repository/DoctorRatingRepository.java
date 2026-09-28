package com.vetora.repository;

import com.vetora.entity.DoctorRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorRatingRepository extends JpaRepository<DoctorRating, Long> {

    // Newest reviews first, for display on the doctor's profile
    List<DoctorRating> findByDoctorIdOrderByCreatedAtDesc(Long doctorId);

    @Query("SELECT AVG(r.rating) FROM DoctorRating r WHERE r.doctor.id = :doctorId")
    Double findAverageRatingByDoctorId(@Param("doctorId") Long doctorId);

    long countByDoctorId(Long doctorId);

    // How many reviews one owner has already posted for one doctor
    long countByDoctorIdAndOwnerId(Long doctorId, Long ownerId);
}


