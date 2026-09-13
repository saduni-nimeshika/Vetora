package com.vetora.service;

import com.vetora.entity.PasswordResetToken;
import com.vetora.entity.User;
import com.vetora.repository.PasswordResetTokenRepository;
import com.vetora.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {

    private static final Logger logger = LoggerFactory.getLogger(PasswordResetService.class);

    private final PasswordResetTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    public PasswordResetService(PasswordResetTokenRepository tokenRepository,
                                UserRepository userRepository,
                                EmailService emailService,
                                PasswordEncoder passwordEncoder) {
        this.tokenRepository = tokenRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    // Always returns the same generic result regardless of whether the email
    // exists — this prevents the endpoint being used to check which emails
    // are registered in the system (a common account-enumeration mistake).
    @Transactional
    public void requestPasswordReset(String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            logger.info("Password reset requested for unknown email: {}", email);
            return;
        }

        User user = userOptional.get();

        // Remove any previous reset token for this user before issuing a new
        // one — the @OneToOne link means only one row per user is allowed.
        tokenRepository.deleteByUser(user);

        String token = UUID.randomUUID().toString();
        LocalDateTime expiryDate = LocalDateTime.now().plusHours(1);
        PasswordResetToken resetToken = new PasswordResetToken(token, user, expiryDate);
        tokenRepository.save(resetToken);

        emailService.sendPasswordResetEmail(user.getEmail(), user.getName(), token);
        logger.info("✅ Password reset email queued for: {}", user.getEmail());
    }

    // Returns a result code the controller maps to an HTTP response:
    // SUCCESS | INVALID_TOKEN | ALREADY_USED | EXPIRED
    @Transactional
    public String resetPassword(String token, String newPassword) {
        Optional<PasswordResetToken> tokenOptional = tokenRepository.findByToken(token);
        if (tokenOptional.isEmpty()) {
            return "INVALID_TOKEN";
        }

        PasswordResetToken resetToken = tokenOptional.get();

        if (resetToken.isUsed()) {
            return "ALREADY_USED";
        }
        if (resetToken.isExpired()) {
            return "EXPIRED";
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        tokenRepository.save(resetToken);

        logger.info("✅ Password reset successfully for: {}", user.getEmail());
        return "SUCCESS";
    }
}
