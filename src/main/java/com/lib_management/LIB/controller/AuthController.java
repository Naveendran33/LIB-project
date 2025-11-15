package com.lib_management.LIB.controller;



import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.lib_management.LIB.config.JwtUtil;
import com.lib_management.LIB.entity.User;
import com.lib_management.LIB.repository.UserRepository;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(JwtUtil jwtUtil, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        String username = loginRequest.get("username");
        String password = loginRequest.get("password");

        if (username == null || password == null) {
            return ResponseEntity.badRequest().body("Username and password cannot be null");
        }

        try {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));

            if (!passwordEncoder.matches(password, user.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
            }

            String token = jwtUtil.generateToken(username, user.getRole().name());

            return ResponseEntity.ok(Map.of("token", token));
        } catch (UsernameNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Login failed: " + e.getMessage());
        }
    }
}

