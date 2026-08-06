package com.vetora.repository;

import com.vetora.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Email එකෙන් User කෙනෙක්ව හොයාගන්න (Login වලදී ඕන වෙනවා)
    Optional<User> findByEmail(String email);

    // Email එක කලින් DB එකේ තියෙනවද බලන්න (Sign Up වලදී Duplicate Emails නවත්තන්න)
    boolean existsByEmail(String email);
}
