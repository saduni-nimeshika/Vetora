package com.vetora.repository;

import com.vetora.entity.Doctor;
import com.vetora.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    // ✅ User අනුව Doctor සොයාගැනීමට
    Optional<Doctor> findByUser(User user);

    // ✅ Admin approve නොකළ (Pending) Doctors ලා ලබාගැනීමට (මෙම Method එක එකතු කරන්න)
    List<Doctor> findByApprovedFalse();

    // ✅ Approve වූ Doctors ලා පමණක් ලබාගැනීමට
    List<Doctor> findByApprovedTrue();
}