package com.vetora;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync; // ✅ 1. Import එක එකතු කරන්න
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableAsync // ✅ 2. මෙම Annotation එක එකතු කරන්න
@EnableScheduling // ✅ needed for ReminderService's @Scheduled job — without it reminders never fire
public class VetoraBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(VetoraBackendApplication.class, args);
    }

}