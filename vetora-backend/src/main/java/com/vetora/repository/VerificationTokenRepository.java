package com.vetora.repository;

import com.vetora.entity.User;
import com.vetora.entity.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {
    Optional<VerificationToken> findByToken(String token);
    Optional<VerificationToken> findByUser(User user);

    // ✅ මෙය තියෙනවද Check කරන්න
    @Transactional
    void deleteByUser(User user);
}