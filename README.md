# TrackDue | Centralized Bill & Event Reminder System

An enterprise-grade, full-stack bill and event reminder management system built with Spring Boot and pure modern Web technologies (HTML5, CSS3, Vanilla JavaScript).

---

## Project Structure

The project is cleanly decoupled into standard modular **Backend** and **Frontend** directories:

```
TrackDue/
│
├── backend/
│   ├── pom.xml
│   ├── trackdue_db.sql
│   ├── src/main/java/com/trackdue/
│   │   ├── TrackDueApplication.java
│   │   ├── config/              # WebMvcConfig, DataInitializer
│   │   ├── controller/          # REST Controllers (Auth, Bill, Event, Reminder, Report, etc.)
│   │   ├── dto/                 # Data Transfer Objects (AuthRequest, SummaryReportDTO, etc.)
│   │   ├── entity/              # JPA Entities (User, Bill, Event, Reminder, ActivityLog, etc.)
│   │   ├── exception/           # Global exception handler & custom exceptions
│   │   ├── repository/          # Spring Data JPA repositories
│   │   ├── security/            # SecurityConfig (Authentication, Authorization, CORS)
│   │   └── service/             # Business logic service layer
│   └── src/main/resources/
│       ├── application.properties
│       └── application-mysql.properties
│
└── frontend/
    ├── pages/                   # Main views (index.html, app.html)
    ├── components/              # UI helpers (modal.js, sidebar.js)
    ├── services/                # Centralized REST API client (api.js)
    └── assets/
        ├── css/                 # Modern styling (landing.css, style.css)
        └── js/                  # Page engines (landing.js, app.js)
```

---

## How to Run

### 1. Run Backend (Spring Boot Server)
Open a terminal in the `backend/` directory:

```bash
# Using Maven wrapper or local Maven
mvn spring-boot:run
```

- Server runs at: `http://localhost:8080/`
- In-memory H2 Console: `http://localhost:8080/h2-console`
  - JDBC URL: `jdbc:h2:mem:trackdue_db`
  - User: `SA`, Password: *(blank)*

### 2. Accessing the Application
- **Direct Full-Stack**: Open `http://localhost:8080/` in your browser. Spring Boot will automatically serve the frontend pages and static assets.
- **Decoupled Frontend**: Open `frontend/pages/index.html` directly or via VS Code Live Server (`http://127.0.0.1:5500`). The centralized API client (`api.js`) automatically detects the host and communicates seamlessly with the Spring Boot backend (`http://localhost:8080/api`) via CORS.

---

## Default Accounts

| Role | Email | Password | Access Rights |
|---|---|---|---|
| **System Administrator** | `admin@trackdue.com` | `admin123` | Full Access: User directory, system-wide reports, audit history, reminders, bills, events |
| **Regular User** | Registered users | *(User password)* | Private Access: Personal reminders, personal tasks, my bills, my events, my support tickets (no access to other user accounts) |
