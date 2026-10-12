package com.trackdue.service;

import com.trackdue.entity.Event;
import com.trackdue.exception.ResourceNotFoundException;
import com.trackdue.repository.EventRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class EventService {

    private final EventRepository repository;
    private final HistoryService historyService;

    public EventService(EventRepository repository, HistoryService historyService) {
        this.repository = repository;
        this.historyService = historyService;
    }

    public Event create(Event event, Long userId, String userName) {
        if (event.getStatus() == null) {
            event.setStatus("UPCOMING");
        }
        event.setCreatedBy(userId);
        Event saved = repository.save(event);

        historyService.log(userId, userName, "CREATE", "EVENT", saved.getId(),
                "Created event: " + saved.getEventName() + " on " + saved.getEventDate());

        return saved;
    }

    public List<Event> getAll() {
        return repository.findAll();
    }

    public List<Event> getByUser(Long userId) {
        if (userId == null) {
            return List.of();
        }
        return repository.findByCreatedBy(userId);
    }

    public Event getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));
    }

    public Event update(Long id, Event newData, Long userId, String userName) {
        Event event = getById(id);
        event.setEventName(newData.getEventName());
        event.setDescription(newData.getDescription());
        event.setCategory(newData.getCategory());
        event.setEventDate(newData.getEventDate());
        event.setEventTime(newData.getEventTime());
        event.setLocation(newData.getLocation());
        if (newData.getStatus() != null) {
            event.setStatus(newData.getStatus());
        }
        Event saved = repository.save(event);

        historyService.log(userId, userName, "UPDATE", "EVENT", saved.getId(),
                "Updated event: " + saved.getEventName() + " (Status: " + saved.getStatus() + ")");

        return saved;
    }

    public void delete(Long id, Long userId, String userName) {
        Event event = getById(id);
        String name = event.getEventName();
        repository.delete(event);

        historyService.log(userId, userName, "DELETE", "EVENT", id,
                "Deleted event: " + name);
    }

    public Event markAsCompleted(Long id, Long userId, String userName) {
        Event event = getById(id);
        event.setStatus("COMPLETED");
        Event saved = repository.save(event);

        historyService.log(userId, userName, "STATUS_CHANGE", "EVENT", saved.getId(),
                "Marked event as COMPLETED / ATTENDED: " + saved.getEventName());

        return saved;
    }

    public Event markAsUpcoming(Long id, Long userId, String userName) {
        Event event = getById(id);
        event.setStatus("UPCOMING");
        Event saved = repository.save(event);

        historyService.log(userId, userName, "STATUS_CHANGE", "EVENT", saved.getId(),
                "Marked event as UPCOMING: " + saved.getEventName());

        return saved;
    }

    public List<Event> getByCategory(String category) {
        return repository.findByCategory(category);
    }

    public List<Event> getUpcomingEvents() {
        return repository.findByEventDateGreaterThanEqual(LocalDate.now());
    }

    public List<Event> getPastEvents() {
        return repository.findByEventDateBefore(LocalDate.now());
    }
}
