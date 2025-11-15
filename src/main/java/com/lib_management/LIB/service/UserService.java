package com.lib_management.LIB.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.lib_management.LIB.entity.User;
import com.lib_management.LIB.repository.BorrowRepository; // Correct
import com.lib_management.LIB.repository.UserRepository;

import jakarta.transaction.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final BorrowRepository borrowRepository;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, BorrowRepository borrowRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.borrowRepository = borrowRepository;
    }

    public User registerUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public User updateUser(Long id, User updatedUser) {
        return userRepository.findById(id).map(user -> {
            user.setUsername(updatedUser.getUsername());
            user.setEmail(updatedUser.getEmail());
            user.setRole(updatedUser.getRole());
            if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
                user.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
            }
            return userRepository.save(user);
        }).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Correct: Delete all borrow records for this user first
        borrowRepository.deleteByUserId(user.getId());
        
        // Then, delete the user
        userRepository.delete(user);
    }
}