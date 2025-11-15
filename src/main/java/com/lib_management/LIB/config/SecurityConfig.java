package com.lib_management.LIB.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.lib_management.LIB.service.CustomUserDetailsService;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthFilter jwtAuthFilter;

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

/* Corrected and refined SecurityConfig */

@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    return http.csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
    .requestMatchers("/auth/login", "/api/users/register").permitAll()
    // Allow anyone to view/search books (GET)
    .requestMatchers(HttpMethod.GET, "/api/books/**").permitAll()
    // Admin-only book management
    .requestMatchers("/api/books/admin/**").hasRole("ADMIN")
    // Borrow endpoints
    .requestMatchers("/api/borrows/all").hasRole("ADMIN")
    .requestMatchers("/api/borrows/user/**").hasAnyRole("USER","ADMIN")
    // User management admin-only
    .requestMatchers("/api/users/all").hasRole("ADMIN")
    .requestMatchers("/api/users/admin/**").hasRole("ADMIN")
    .anyRequest().authenticated()
)

            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
}



    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @SuppressWarnings("deprecation")
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(customUserDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
