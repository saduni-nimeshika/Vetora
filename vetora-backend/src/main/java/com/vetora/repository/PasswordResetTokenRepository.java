package com.vetora.repository;

import com.vetora.entity.PasswordResetToken;
import com.vetora.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);
    Optional<PasswordResetToken> findByUser(User user);

    // ✅ Fix: same issue as VerificationTokenRepository — a derived
    // deleteByUser() only queues the delete until flush time, so the next
    // save() (forced immediate by GenerationType.IDENTITY) could insert
    // before the old row is actually removed and hit the unique user_id
    // constraint. A bulk-delete query with flushAutomatically = true avoids
    // that race.
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("DELETE FROM PasswordResetToken p WHERE p.user = :user")
    void deleteByUser(@Param("user") User user);
}



