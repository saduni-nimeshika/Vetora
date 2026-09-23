package com.vetora.repository;

import com.vetora.entity.User;
import com.vetora.entity.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {
    Optional<VerificationToken> findByToken(String token);
    Optional<VerificationToken> findByUser(User user);

    // ✅ Fix: this used to be a derived `deleteByUser` method, which under the
    // hood loads the entity and calls entityManager.remove() — a delete that
    // only gets flushed to the DB later. Because VerificationToken uses
    // GenerationType.IDENTITY, the very next save() forces an immediate
    // INSERT, which ran *before* the queued DELETE and hit the unique
    // constraint on user_id ("Duplicate entry ... for key
    // verification_tokens.UK..."). A direct bulk-delete query with
    // flushAutomatically = true guarantees the row is actually gone from the
    // DB before we insert the new token.
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("DELETE FROM VerificationToken v WHERE v.user = :user")
    void deleteByUser(@Param("user") User user);
}