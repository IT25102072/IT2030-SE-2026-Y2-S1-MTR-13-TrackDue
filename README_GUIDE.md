# MEMBER 1: Wijebandara J. (IT25102070)
**Major Function 6.1:** User Account Management & Authentication
**Target GitHub Branch:** `feature/user-management-IT25102070`

---

## 1. Assigned Files in this Package:

### Backend Files:
- `backend/src/main/java/com/trackdue/entity/User.java`
- `backend/src/main/java/com/trackdue/repository/UserRepository.java`
- `backend/src/main/java/com/trackdue/service/UserService.java`
- `backend/src/main/java/com/trackdue/controller/UserController.java`
- `backend/src/main/java/com/trackdue/controller/AuthController.java`
- `backend/src/main/java/com/trackdue/dto/AuthRequest.java`
- `backend/src/main/java/com/trackdue/dto/AuthResponse.java`
- `backend/src/main/java/com/trackdue/security/SecurityConfig.java`

### Frontend Files:
- `frontend/assets/js/landing.js` (Auth handling, registration validation, login session)
- `frontend/pages/index.html` (Landing hero, authentication modal, role badges)
- `frontend/pages/app.html` (`#view-users` Registered User Directory for Admin, `#view-profile` User Profile & Security)

---

## 2. Step-by-Step GitHub Upload Guide:

### Step 1: Clone Repository & Switch to Your Branch
Open Git Bash / Terminal:
```bash
git clone <GITHUB_REPOSITORY_URL>
cd <REPOSITORY_NAME>
git fetch origin
git checkout feature/user-management-IT25102070
```

### Step 2: Copy Your Files
Copy the `backend` and `frontend` folders from this package into your cloned repository root.

### Step 3: Stage, Commit & Push
```bash
git add backend/src/main/java/com/trackdue/entity/User.java
git add backend/src/main/java/com/trackdue/repository/UserRepository.java
git add backend/src/main/java/com/trackdue/service/UserService.java
git add backend/src/main/java/com/trackdue/controller/UserController.java
git add backend/src/main/java/com/trackdue/controller/AuthController.java
git add backend/src/main/java/com/trackdue/dto/AuthRequest.java
git add backend/src/main/java/com/trackdue/dto/AuthResponse.java
git add backend/src/main/java/com/trackdue/security/SecurityConfig.java
git add frontend/assets/js/landing.js

git commit -m "feat(auth): implement user account management, authentication, and security config"
git push origin feature/user-management-IT25102070
```

### Step 4: Open Pull Request
Go to GitHub, create a Pull Request:
- **Base:** `develop`
- **Compare:** `feature/user-management-IT25102070`
- **Title:** `[MF-6.1] Implement User Account Management & Authentication - IT25102070`

---

## 3. CRUD Operations to Explain at Viva:
- **Create:** User registration with password hashing, email validation, mobile number, and role assignment.
- **Read:** Login authentication via `/api/auth/login`, retrieving user profile details via `/api/users/{id}`, Admin listing all users via `/api/users`.
- **Update:** Updating personal profile (first name, last name, phone, notification channels) via `/api/users/{id}`, changing password.
- **Delete:** Admin suspending or deactivating user accounts, self-account deletion.
