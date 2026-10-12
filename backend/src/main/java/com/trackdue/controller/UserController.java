package com.trackdue.controller;

import com.trackdue.entity.User;
import com.trackdue.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<User>> getAll() {
        return ResponseEntity.ok(userService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getById(id));
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(@RequestParam Long userId, @RequestBody User user) {
        return ResponseEntity.ok(userService.updateProfile(userId, user));
    }

    @PutMapping("/{id}/profile")
    public ResponseEntity<User> updateProfileById(@PathVariable Long id, @RequestBody User user) {
        return ResponseEntity.ok(userService.updateProfile(id, user));
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<Map<String, String>> changePassword(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");
        userService.changePassword(id, currentPassword, newPassword);
        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<User> updateRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String role = body.get("role");
        return ResponseEntity.ok(userService.updateRole(id, role));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<User> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        return ResponseEntity.ok(userService.updateStatus(id, status));
    }
}
