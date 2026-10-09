package com.trackdue.dto;

public class AuthResponse {
    private String token;
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private String message;

    public AuthResponse() {}

    public AuthResponse(String token, Long userId, String firstName, String lastName, String email, String role, String message) {
        this.token = token;
        this.userId = userId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.role = role;
        this.message = message;
    }

    public static AuthResponseBuilder builder() {
        return new AuthResponseBuilder();
    }

    public static class AuthResponseBuilder {
        private String token;
        private Long userId;
        private String firstName;
        private String lastName;
        private String email;
        private String role;
        private String message;

        public AuthResponseBuilder token(String token) { this.token = token; return this; }
        public AuthResponseBuilder userId(Long userId) { this.userId = userId; return this; }
        public AuthResponseBuilder firstName(String firstName) { this.firstName = firstName; return this; }
        public AuthResponseBuilder lastName(String lastName) { this.lastName = lastName; return this; }
        public AuthResponseBuilder email(String email) { this.email = email; return this; }
        public AuthResponseBuilder role(String role) { this.role = role; return this; }
        public AuthResponseBuilder message(String message) { this.message = message; return this; }

        public AuthResponse build() {
            return new AuthResponse(token, userId, firstName, lastName, email, role, message);
        }
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
