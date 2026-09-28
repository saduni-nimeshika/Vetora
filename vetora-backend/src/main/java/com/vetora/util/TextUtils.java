package com.vetora.util;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.regex.Pattern;

// Small text helpers shared by notifications and reminders.
public final class TextUtils {

    private static final Pattern DR_PREFIX =
            Pattern.compile("^dr\\.?\\s.*", Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("MMM d, yyyy", Locale.ENGLISH);
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("h:mm a", Locale.ENGLISH);

    private TextUtils() {}

    // Doctors often register as "Dr. Kamal Perera", so only add "Dr." when it
    // is missing — avoids "Dr. Dr. Kamal Perera" in messages.
    public static String doctorLabel(String name) {
        String n = name == null ? "" : name.trim();
        if (n.isEmpty()) return "The doctor";
        return DR_PREFIX.matcher(n).matches() ? n : "Dr. " + n;
    }

    // "Sep 28, 2026 at 10:30 AM"
    public static String whenLabel(LocalDate date, LocalTime time) {
        if (date == null) return "";
        String d = date.format(DATE_FMT);
        return time != null ? d + " at " + time.format(TIME_FMT) : d;
    }
}

