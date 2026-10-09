package com.trackdue.service;

import com.trackdue.entity.Bill;
import com.trackdue.entity.Event;
import com.trackdue.entity.NotificationTemplate;
import com.trackdue.repository.NotificationTemplateRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class NotificationTemplateService {

    public static final String DEFAULT_BILL_TITLE = "Bill Due Reminder: {billName}";
    public static final String DEFAULT_BILL_MESSAGE = "Reminder: Your bill \"{billName}\" of LKR {amount} is due on {dueDate}. Please ensure timely settlement.";

    public static final String DEFAULT_EVENT_TITLE = "Event Reminder: {eventName}";
    public static final String DEFAULT_EVENT_MESSAGE = "Reminder: Upcoming event \"{eventName}\" scheduled on {eventDate} at {location}.";

    private final NotificationTemplateRepository repository;
    private final HistoryService historyService;

    public NotificationTemplateService(NotificationTemplateRepository repository, HistoryService historyService) {
        this.repository = repository;
        this.historyService = historyService;
    }

    public NotificationTemplate getSystemTemplate(String type) {
        return repository.findByTypeAndUserIdIsNull(type.toUpperCase())
                .orElseGet(() -> {
                    String title = "BILL".equalsIgnoreCase(type) ? DEFAULT_BILL_TITLE : DEFAULT_EVENT_TITLE;
                    String message = "BILL".equalsIgnoreCase(type) ? DEFAULT_BILL_MESSAGE : DEFAULT_EVENT_MESSAGE;
                    NotificationTemplate created = NotificationTemplate.builder()
                            .type(type.toUpperCase())
                            .userId(null)
                            .titleTemplate(title)
                            .messageTemplate(message)
                            .build();
                    return repository.save(created);
                });
    }

    public List<NotificationTemplate> getAllSystemTemplates() {
        // Ensure both exist
        getSystemTemplate("BILL");
        getSystemTemplate("EVENT");
        return repository.findByUserIdIsNull();
    }

    public NotificationTemplate updateSystemTemplate(String type, String titleTemplate, String messageTemplate) {
        NotificationTemplate template = getSystemTemplate(type);
        template.setTitleTemplate(titleTemplate);
        template.setMessageTemplate(messageTemplate);
        NotificationTemplate saved = repository.save(template);

        historyService.log(1L, "System Administrator", "UPDATE", "TEMPLATE", saved.getId(),
                "Updated global system default notification template for " + type);

        return saved;
    }

    public Map<String, Object> getEffectiveTemplateForUser(String type, Long userId) {
        NotificationTemplate systemTemplate = getSystemTemplate(type);
        Optional<NotificationTemplate> userOverride = userId != null
                ? repository.findByTypeAndUserId(type.toUpperCase(), userId)
                : Optional.empty();

        Map<String, Object> res = new HashMap<>();
        res.put("type", type.toUpperCase());
        res.put("userId", userId);
        res.put("isCustomized", userOverride.isPresent());
        res.put("titleTemplate", userOverride.map(NotificationTemplate::getTitleTemplate).orElse(systemTemplate.getTitleTemplate()));
        res.put("messageTemplate", userOverride.map(NotificationTemplate::getMessageTemplate).orElse(systemTemplate.getMessageTemplate()));
        res.put("systemDefaultTitle", systemTemplate.getTitleTemplate());
        res.put("systemDefaultMessage", systemTemplate.getMessageTemplate());
        return res;
    }

    public Map<String, Object> getAllEffectiveTemplatesForUser(Long userId) {
        Map<String, Object> result = new HashMap<>();
        result.put("BILL", getEffectiveTemplateForUser("BILL", userId));
        result.put("EVENT", getEffectiveTemplateForUser("EVENT", userId));
        return result;
    }

    public NotificationTemplate saveUserTemplate(Long userId, String type, String titleTemplate, String messageTemplate) {
        NotificationTemplate template = repository.findByTypeAndUserId(type.toUpperCase(), userId)
                .orElseGet(() -> NotificationTemplate.builder()
                        .type(type.toUpperCase())
                        .userId(userId)
                        .build());

        template.setTitleTemplate(titleTemplate);
        template.setMessageTemplate(messageTemplate);
        NotificationTemplate saved = repository.save(template);

        historyService.log(userId, "User", "UPDATE", "TEMPLATE", saved.getId(),
                "Customized personal notification template for " + type);

        return saved;
    }

    public void resetUserTemplate(Long userId, String type) {
        repository.findByTypeAndUserId(type.toUpperCase(), userId).ifPresent(t -> {
            repository.delete(t);
            historyService.log(userId, "User", "DELETE", "TEMPLATE", t.getId(),
                    "Reset personal notification template to system default for " + type);
        });
    }

    public Map<String, String> formatBillNotification(Bill bill, Long userId) {
        Map<String, Object> templateData = getEffectiveTemplateForUser("BILL", userId);
        String titleTpl = (String) templateData.get("titleTemplate");
        String msgTpl = (String) templateData.get("messageTemplate");

        String amountStr = bill.getAmount() != null ? String.format("%,.2f", bill.getAmount()) : "0.00";
        String dueDateStr = bill.getDueDate() != null ? bill.getDueDate().toString() : "";
        String billName = bill.getBillName() != null ? bill.getBillName() : "Bill";
        String category = bill.getCategory() != null ? bill.getCategory() : "General";

        String title = titleTpl
                .replace("{billName}", billName)
                .replace("{amount}", amountStr)
                .replace("{dueDate}", dueDateStr)
                .replace("{category}", category);

        String message = msgTpl
                .replace("{billName}", billName)
                .replace("{amount}", amountStr)
                .replace("{dueDate}", dueDateStr)
                .replace("{category}", category);

        return Map.of("title", title, "message", message);
    }

    public Map<String, String> formatEventNotification(Event event, Long userId) {
        Map<String, Object> templateData = getEffectiveTemplateForUser("EVENT", userId);
        String titleTpl = (String) templateData.get("titleTemplate");
        String msgTpl = (String) templateData.get("messageTemplate");

        String eventName = event.getEventName() != null ? event.getEventName() : "Event";
        String eventDateStr = event.getEventDate() != null ? event.getEventDate().toString() : "";
        String eventTimeStr = event.getEventTime() != null ? event.getEventTime().toString() : "";
        String location = event.getLocation() != null ? event.getLocation() : "Designated Venue";
        String category = event.getCategory() != null ? event.getCategory() : "General";

        String title = titleTpl
                .replace("{eventName}", eventName)
                .replace("{eventDate}", eventDateStr)
                .replace("{eventTime}", eventTimeStr)
                .replace("{location}", location)
                .replace("{category}", category);

        String message = msgTpl
                .replace("{eventName}", eventName)
                .replace("{eventDate}", eventDateStr)
                .replace("{eventTime}", eventTimeStr)
                .replace("{location}", location)
                .replace("{category}", category);

        return Map.of("title", title, "message", message);
    }
}
