package com.vetora.service;

import com.vetora.entity.Doctor;
import com.vetora.entity.User;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalDate;      // ← මෙය Add කරන්න!

import java.time.LocalTime;      // ← මෙය Add කරන්න!

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendVerificationEmail(String toEmail, String userName, String token) {
        if (toEmail == null || token == null) return;
        String confirmationUrl = "http://localhost:8080/api/v1/users/verify-email?token=" + token;

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("📧 Verify Your Email - Vetora Care System");

            String htmlContent = "<div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; max-width: 500px; margin: 0 auto;'>"
                    + "<h2 style='color: #059669; text-align: center;'>Welcome to Vetora, " + (userName != null ? userName : "User") + "!</h2>"
                    + "<p>Thank you for registering. Please click the button below to verify your email address and activate your account:</p>"
                    + "<div style='text-align: center; margin: 30px 0;'>"
                    + "  <a href='" + confirmationUrl + "' style='padding: 12px 24px; background-color: #059669; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;'>Verify Email Address</a>"
                    + "</div>"
                    + "<p style='font-size: 12px; color: #666;'>⏰ This link will expire in 24 hours.</p>"
                    + "<p style='font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 15px;'>"
                    + "If you didn't create an account with Vetora, please ignore this email.</p>"
                    + "</div>";

            helper.setText(htmlContent, true);
            mailSender.send(message);

            logger.info("✅ Verification Email sent successfully to: {}", toEmail);

        } catch (Exception e) {
            logger.error("❌ Error sending verification email to {}: {}", toEmail, e.getMessage());
        }
    }

    @Async
    public void sendLoginNotification(String to, String userName, String loginTime) {
        if (to == null) return;
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("🔐 VETORA - New Login Detected");
            message.setText(
                    "Dear " + userName + ",\n\n" +
                            "We noticed a new login to your VETORA account.\n\n" +
                            "📅 Date & Time: " + loginTime + "\n\n" +
                            "⚠️ If this wasn't you, please contact our support team immediately.\n\n" +
                            "Best Regards,\n" +
                            "VETORA Team"
            );
            mailSender.send(message);
            logger.info("✅ Login notification sent to: {}", to);
        } catch (Exception e) {
            logger.error("❌ Failed to send login notification to: {}", to, e);
        }
    }

    @Async
    public void sendApprovalEmail(String to, String doctorName) {
        if (to == null) return;
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("✅ VETORA - Your Account Has Been Approved!");
            message.setText(
                    "Dear Dr. " + doctorName + ",\n\n" +
                            "🎉 Congratulations! Your VETORA account has been approved by the administrator.\n\n" +
                            "You can now login and start using VETORA.\n\n" +
                            "Best Regards,\n" +
                            "VETORA Team"
            );
            mailSender.send(message);
            logger.info("✅ Approval email sent to: {}", to);
        } catch (Exception e) {
            logger.error("❌ Failed to send approval email to: {}", to, e);
        }
    }

    @Async
    public void sendRejectionEmail(String to, String doctorName, String reason) {
        if (to == null) return;
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("📋 VETORA - Account Registration Update");
            message.setText(
                    "Dear Dr. " + doctorName + ",\n\n" +
                            "We regret to inform you that your VETORA registration has been rejected.\n\n" +
                            "Reason: " + (reason != null ? reason : "Verification failed") + "\n\n" +
                            "Best Regards,\n" +
                            "VETORA Team"
            );
            mailSender.send(message);
            logger.info("✅ Rejection email sent to: {}", to);
        } catch (Exception e) {
            logger.error("❌ Failed to send rejection email to: {}", to, e);
        }
    }

    @Async
    public void sendAdminNewUserNotification(String adminEmail, User user) {
        if (adminEmail == null || user == null) return;
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(adminEmail);
            message.setSubject("🆕 VETORA - New User Registration Alert!");
            message.setText(
                    "Dear Admin,\n\n" +
                            "🆕 A new user has registered on VETORA!\n\n" +
                            "📋 User Details:\n" +
                            "👤 Name: " + user.getName() + "\n" +
                            "📧 Email: " + user.getEmail() + "\n" +
                            "🔑 Role: " + (user.getRole() != null ? user.getRole().name() : "N/A") + "\n" +
                            "📅 Registered: " + LocalDateTime.now() + "\n\n" +
                            (user.getRole() != null && user.getRole().name().equals("DOCTOR") ?
                                    "⚠️ This is a DOCTOR registration that needs your approval!\n" :
                                    "✅ No action needed.\n") +
                            "Best Regards,\n" +
                            "VETORA Team"
            );
            mailSender.send(message);
            logger.info("✅ Admin notification sent for: {}", user.getEmail());
        } catch (Exception e) {
            logger.error("❌ Failed to send admin notification: {}", e.getMessage());
        }
    }

    @Async
    public void sendDoctorApprovalRequest(String adminEmail, User doctor, Doctor doctorProfile) {
        if (adminEmail == null || doctor == null) return;
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(adminEmail);
            message.setSubject("👨‍⚕️ VETORA - New Doctor Needs Approval!");
            message.setText(
                    "Dear Admin,\n\n" +
                            "👨‍⚕️ A new doctor has registered and is waiting for your approval!\n\n" +
                            "📋 Doctor Details:\n" +
                            "👤 Name: " + doctor.getName() + "\n" +
                            "📧 Email: " + doctor.getEmail() + "\n" +
                            "🏥 Clinic: " + (doctorProfile != null ? doctorProfile.getClinicName() : "N/A") + "\n" +
                            "📍 Location: " + (doctorProfile != null ? doctorProfile.getCity() : "") + ", " + (doctorProfile != null ? doctorProfile.getDistrict() : "") + "\n" +
                            "🎓 Qualifications: " + (doctorProfile != null ? doctorProfile.getQualifications() : "N/A") + "\n" +
                            "🔬 Specialisation: " + (doctorProfile != null ? doctorProfile.getSpecialisation() : "N/A") + "\n" +
                            "📅 Experience: " + (doctorProfile != null ? doctorProfile.getYearsOfExperience() : 0) + " years\n\n" +
                            "🔗 Please login to the admin panel to approve or reject this doctor.\n\n" +
                            "Best Regards,\n" +
                            "VETORA Team"
            );
            mailSender.send(message);
            logger.info("✅ Doctor approval request sent to admin");
        } catch (Exception e) {
            logger.error("❌ Failed to send doctor approval request: {}", e.getMessage());
        }
    }

    // ✅ Appointment Request Received (Pet Owner)
    @Async
    public void sendAppointmentRequestReceived(String to, String ownerName, String petName,
                                               String doctorName, LocalDate date, LocalTime time) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("📅 VETORA - Appointment Request Received");
            message.setText(
                    "Dear " + ownerName + ",\n\n" +
                            "✅ Your appointment request has been received!\n\n" +
                            "📋 Details:\n" +
                            "🐕 Pet: " + petName + "\n" +
                            "👨‍⚕️ Doctor: Dr. " + doctorName + "\n" +
                            "📅 Date: " + date + "\n" +
                            "⏰ Time: " + time + "\n\n" +
                            "⏳ Status: PENDING (Waiting for doctor approval)\n\n" +
                            "You will receive a notification once the doctor approves your appointment.\n\n" +
                            "Best Regards,\n" +
                            "VETORA Team"
            );
            mailSender.send(message);
            logger.info("✅ Appointment request received email sent to: {}", to);
        } catch (Exception e) {
            logger.error("❌ Failed to send appointment request email: {}", e.getMessage());
        }
    }

    // ✅ New Appointment Request (Doctor)
    @Async
    public void sendNewAppointmentRequest(String to, String doctorName, String petName,
                                          String ownerName, LocalDate date, LocalTime time,
                                          Long appointmentId) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("📅 VETORA - New Appointment Request");
            message.setText(
                    "Dear Dr. " + doctorName + ",\n\n" +
                            "📅 A new appointment request is waiting for your review!\n\n" +
                            "📋 Details:\n" +
                            "🐕 Pet: " + petName + "\n" +
                            "👤 Owner: " + ownerName + "\n" +
                            "📅 Date: " + date + "\n" +
                            "⏰ Time: " + time + "\n" +
                            "🆔 Appointment ID: " + appointmentId + "\n\n" +
                            "🔗 Please login to the doctor panel to approve or reject this appointment.\n\n" +
                            "Best Regards,\n" +
                            "VETORA Team"
            );
            mailSender.send(message);
            logger.info("✅ New appointment request email sent to doctor: {}", to);
        } catch (Exception e) {
            logger.error("❌ Failed to send new appointment request email: {}", e.getMessage());
        }
    }

    // ✅ Appointment Approved (Pet Owner)
    @Async
    public void sendAppointmentApproved(String to, String ownerName, String petName,
                                        String doctorName, LocalDate date, LocalTime time,
                                        String notes) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("✅ VETORA - Appointment Approved!");
            message.setText(
                    "Dear " + ownerName + ",\n\n" +
                            "✅ Your appointment has been approved by Dr. " + doctorName + "!\n\n" +
                            "📋 Details:\n" +
                            "🐕 Pet: " + petName + "\n" +
                            "👨‍⚕️ Doctor: Dr. " + doctorName + "\n" +
                            "📅 Date: " + date + "\n" +
                            "⏰ Time: " + time + "\n" +
                            (notes != null ? "📝 Notes: " + notes + "\n\n" : "\n") +
                            "Please arrive 10 minutes before the appointment time.\n\n" +
                            "Best Regards,\n" +
                            "VETORA Team"
            );
            mailSender.send(message);
            logger.info("✅ Appointment approved email sent to: {}", to);
        } catch (Exception e) {
            logger.error("❌ Failed to send appointment approved email: {}", e.getMessage());
        }
    }

    // ✅ Appointment Rejected (Pet Owner)
    @Async
    public void sendAppointmentRejected(String to, String ownerName, String petName,
                                        String doctorName, LocalDate date, LocalTime time,
                                        String reason) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("❌ VETORA - Appointment Rejected");
            message.setText(
                    "Dear " + ownerName + ",\n\n" +
                            "❌ Your appointment has been rejected by Dr. " + doctorName + ".\n\n" +
                            "📋 Details:\n" +
                            "🐕 Pet: " + petName + "\n" +
                            "📅 Date: " + date + "\n" +
                            "⏰ Time: " + time + "\n" +
                            "Reason: " + (reason != null ? reason : "No reason provided") + "\n\n" +
                            "Please try booking another date or time.\n\n" +
                            "Best Regards,\n" +
                            "VETORA Team"
            );
            mailSender.send(message);
            logger.info("✅ Appointment rejected email sent to: {}", to);
        } catch (Exception e) {
            logger.error("❌ Failed to send appointment rejected email: {}", e.getMessage());
        }
    }
}