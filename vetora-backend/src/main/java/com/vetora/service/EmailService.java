package com.vetora.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendVerificationEmail(String toEmail, String token) {
        // Verification Link එක (Frontend react link එක හෝ Backend endpoint එක)
        String confirmationUrl = "http://localhost:8080/api/v1/users/verify-email?token=" + token;

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Verify Your Email - Vetora Care System");

            // HTML Email Template
            String htmlContent = "<div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; max-width: 500px; margin: 0 auto;'>"
                    + "<h2 style='color: #059669; text-align: center;'>Welcome to Vetora!</h2>"
                    + "<p>Thank you for registering. Please click the button below to verify your email address and activate your account:</p>"
                    + "<div style='text-align: center; margin: 30px 0;'>"
                    + "  <a href='" + confirmationUrl + "' style='padding: 12px 24px; background-color: #059669; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;'>Verify Email Address</a>"
                    + "</div>"
                    + "<p style='font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 15px;'>"
                    + "If you didn't create an account with Vetora, please ignore this email.</p>"
                    + "</div>";

            helper.setText(htmlContent, true);
            mailSender.send(message);

            System.out.println("✅ Verification Email sent successfully to: " + toEmail);

        } catch (Exception e) {
            System.err.println("❌ Error sending email to " + toEmail + ": " + e.getMessage());
            e.printStackTrace();
        }
    }
}