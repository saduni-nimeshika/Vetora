package com.vetora.validator;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Pattern;

public class EmailValidator {

    // ✅ Layer 1: Email Format Regex
    private static final String EMAIL_PATTERN =
            "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
    private static final Pattern pattern = Pattern.compile(EMAIL_PATTERN);

    // ✅ Layer 2: Disposable Email Domains
    private static final Set<String> DISPOSABLE_DOMAINS = new HashSet<>(Arrays.asList(
            "tempmail.com", "mailinator.com", "10minutemail.com",
            "guerrillamail.com", "yopmail.com", "throwaway.com",
            "temp-mail.org", "getnada.com", "trashmail.com",
            "fakeinbox.com", "dispostable.com", "spam4.me",
            "maildrop.cc", "emailondeck.com", "mailnator.com",
            "throttle.io", "spambox.us", "jetable.com",
            "incognitomail.com", "garbage.com", "mailtemp.net"
    ));

    // ✅ Layer 2: Invalid Domains (Only incomplete or typo domains)
    private static final Set<String> INVALID_DOMAINS = new HashSet<>(Arrays.asList(
            "gmail", "yahoo", "hotmail", "outlook", "icloud",
            "gmail.c", "yahoo.c", "hotmail.c",
            "gmial.com", "yhoo.com", "hotmil.com"
    ));

    // ========== MAIN VALIDATION ==========

    public static String validate(String email) {
        if (email == null || email.trim().isEmpty()) {
            return "Email is required!";
        }

        String trimmedEmail = email.trim();

        // Layer 1: Format Check
        if (!pattern.matcher(trimmedEmail).matches()) {
            return "Invalid email format! Example: user@domain.com";
        }

        // Layer 2: Invalid Domain Check (Exact Match Only)
        String domain = trimmedEmail.substring(trimmedEmail.indexOf('@') + 1).toLowerCase();
        if (INVALID_DOMAINS.contains(domain)) {
            return "Invalid email domain! Please use a valid domain like gmail.com, yahoo.com, etc.";
        }

        // Layer 2: Disposable Email Check
        if (DISPOSABLE_DOMAINS.contains(domain)) {
            return "Temporary/disposable email addresses are not allowed! Please use a permanent email address.";
        }

        return null; // Valid
    }

    public static boolean isValid(String email) {
        return validate(email) == null;
    }

    public static boolean isDisposable(String email) {
        if (email == null || !pattern.matcher(email).matches()) return true;
        String domain = email.substring(email.indexOf('@') + 1).toLowerCase();
        return DISPOSABLE_DOMAINS.contains(domain);
    }

    public static boolean isValidFormat(String email) {
        if (email == null || email.trim().isEmpty()) return false;
        return pattern.matcher(email.trim()).matches();
    }
}
