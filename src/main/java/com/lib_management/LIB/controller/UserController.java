package com.lib_management.LIB.controller;

import com.lib_management.LIB.entity.User;
import com.lib_management.LIB.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    // ✅ Register (open for all)
    @PostMapping("/register")
    public User registerUser(@RequestBody User user) {
        return userService.registerUser(user);
    }

    // ✅ Get all users (admin only)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/all")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        return userService.updateUser(id, updatedUser);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/admin/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }

    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return userService.getUserById(id).orElse(null);
    }
}
