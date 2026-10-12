package com.trackdue.controller;

import com.trackdue.entity.NotificationTemplate;
import com.trackdue.service.NotificationTemplateService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notification-templates")
@CrossOrigin(origins = "*")
public class NotificationTemplateController {

    private final NotificationTemplateService templateService;

    public NotificationTemplateController(NotificationTemplateService templateService) {
        this.templateService = templateService;
    }

    @GetMapping("/system")
    public ResponseEntity<List<NotificationTemplate>> getSystemTemplates() {
        return ResponseEntity.ok(templateService.getAllSystemTemplates());
    }

    @PutMapping("/system")
    public ResponseEntity<NotificationTemplate> updateSystemTemplate(@RequestBody Map<String, String> payload) {
        String type = payload.get("type");
        String titleTemplate = payload.get("titleTemplate");
        String messageTemplate = payload.get("messageTemplate");
        return ResponseEntity.ok(templateService.updateSystemTemplate(type, titleTemplate, messageTemplate));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Map<String, Object>> getUserTemplates(@PathVariable Long userId) {
        return ResponseEntity.ok(templateService.getAllEffectiveTemplatesForUser(userId));
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<NotificationTemplate> saveUserTemplate(
            @PathVariable Long userId,
            @RequestBody Map<String, String> payload) {
        String type = payload.get("type");
        String titleTemplate = payload.get("titleTemplate");
        String messageTemplate = payload.get("messageTemplate");
        return ResponseEntity.ok(templateService.saveUserTemplate(userId, type, titleTemplate, messageTemplate));
    }

    @DeleteMapping("/user/{userId}/{type}")
    public ResponseEntity<Map<String, String>> resetUserTemplate(
            @PathVariable Long userId,
            @PathVariable String type) {
        templateService.resetUserTemplate(userId, type);
        return ResponseEntity.ok(Map.of("message", "Template reset to system default for " + type));
    }
}
