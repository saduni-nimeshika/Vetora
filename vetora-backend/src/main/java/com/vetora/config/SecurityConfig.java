package com.vetora.config;

import com.vetora.security.JwtAuthenticationFilter;
import com.vetora.service.UserDetailsServiceImp;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsServiceImp userDetailsService;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter, UserDetailsServiceImp userDetailsService) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.disable())
                .authorizeHttpRequests(auth -> auth
                        // ✅ Public Endpoints
                        .requestMatchers(
                                "/api/v1/users/register",
                                "/api/v1/users/login",
                                "/api/v1/users/verify-email",
                                "/api/v1/auth/verify",
                                "/api/v1/auth/resend-verification",
                                "/api/v1/auth/verification-status"
                        ).permitAll()

                        // ✅ Admin only
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")

                        // ✅ Doctor only
                        .requestMatchers("/api/v1/doctor/**").hasRole("DOCTOR")

                        // ✅ Pet Owner only - හැම Pet Endpoint එකම
                        .requestMatchers("/api/v1/owner/pets/**").hasRole("PET_OWNER")

                        // ✅ Admin Pet Management (Adminට Pet ඔක්කොම බලන්න)
                        .requestMatchers("/api/v1/owner/pets/admin/**").hasRole("ADMIN")

                        // Doctor only - Pet View Endpoints
                        .requestMatchers("/api/v1/doctor/pets/**").hasRole("DOCTOR")

                        // All other requests need authentication
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}