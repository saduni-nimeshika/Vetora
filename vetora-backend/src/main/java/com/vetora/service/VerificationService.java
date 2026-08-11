package com.vetora.service;

import com.vetora.entity.User;
import com.vetora.entity.VerificationToken;
import com.vetora.repository.UserRepository;
import com.vetora.repository.VerificationTokenRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class VerificationService {

    private static final Logger logger = LoggerFactory.getLogger(VerificationService.class);
    private final VerificationTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public VerificationService(VerificationTokenRepository tokenRepository,
                               UserRepository userRepository,
                               EmailService emailService) {
        this.tokenRepository = tokenRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    // ✅ Fix 1: Create Verification Token - පරණ Token එක Delete කරලා නව එකක් Save කරන්න
    @Transactional
    public VerificationToken createVerificationToken(User user) {
        // ✅ පරණ Token එක Delete කරන්න
        tokenRepository.deleteByUser(user);

        String token = UUID.randomUUID().toString();
        LocalDateTime expiryDate = LocalDateTime.now().plusHours(24);

        VerificationToken verificationToken = new VerificationToken(token, user, expiryDate);
        return tokenRepository.save(verificationToken);
    }

    // ✅ Fix 2: Verify Email
    @Transactional
    public String verifyEmail(String token) {
        Optional<VerificationToken> tokenOptional = tokenRepository.findByToken(token);

        if (tokenOptional.isEmpty()) {
            return "INVALID_TOKEN";
        }

        VerificationToken verificationToken = tokenOptional.get();

        if (verificationToken.isUsed()) {
            return "ALREADY_USED";
        }

        if (verificationToken.isExpired()) {
            return "EXPIRED";
        }

        verificationToken.setUsed(true);
        tokenRepository.save(verificationToken);

        User user = verificationToken.getUser();
        user.setVerified(true);
        userRepository.save(user);

        logger.info("✅ User verified successfully: {}", user.getEmail());
        return "SUCCESS";
    }

    // ✅ Fix 3: Resend Verification Email
    @Transactional
    public String resendVerificationEmail(String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isEmpty()) {
            return "User not found!";
        }

        User user = userOptional.get();

        if (user.isVerified()) {
            return "This account is already verified!";
        }

        // ✅ පරණ Token එක Delete කරලා නව එකක් Create කරන්න
        VerificationToken token = createVerificationToken(user);

        // Email එක Send කරන්න
        emailService.sendVerificationEmail(user.getEmail(), user.getName(), token.getToken());

        logger.info("✅ Verification email resent successfully to: {}", user.getEmail());
        return "SUCCESS";
    }

    // ✅ Get Verification Status
    public String getVerificationStatus(String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isEmpty()) {
            return "User not found!";
        }

        User user = userOptional.get();

        if (user.isVerified()) {
            return "✅ Email verified!";
        } else {
            return "❌ Email not verified. Please check your inbox for the verification link.";
        }
    }
}