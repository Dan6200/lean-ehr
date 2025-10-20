# Security Model: Application-Layer vs. Infrastructure-Layer Roles

This document explains the two different security models used within the application to control access to sensitive data.

---

### 1. Standard Roles (e.g., Nurse, Caregiver, Viewer)

For standard, day-to-day users, access control is managed at the **Application Layer**.

- **Mechanism:** There is a single, powerful service account for the application backend (e.g., `assisted-living-app@...`). This service account has broad permissions to decrypt all standard Key Encryption Keys (KEKs).
- **Enforcement:** The application code itself is responsible for enforcing who can see what. When a user makes a request, a server action (like `getResidentData`) inspects the user's role from their authentication token. Based on the role, the code conditionally decides which data to decrypt and return.
- **Analogy:** The application is like a librarian who has the keys to all the locked rooms in the library. When a person asks for a book, the librarian first checks their library card (their role) and then decides which rooms to unlock for them.
- **Use Case:** This model is ideal for trusted, internal users who interact with the application daily. It provides the flexibility to manage complex business logic directly in the code.

### 2. Emergency Role (First Responder / EMS)

For exceptional, high-risk emergency access, control is moved to the **Infrastructure Layer (IAM)**.

- **Mechanism:** A separate, dedicated IAM role (`ems_decrypter`) and service account (`ems-responder-sa`) are created. The main application **cannot** use these permissions directly.
- **Enforcement:** The application must request temporary, short-lived credentials (an access token) from Google Cloud's Security Token Service (STS). It is Google Cloud itself that strictly enforces access. The KMS will only allow decryption if the request is made with a valid, unexpired token corresponding to the `ems_decrypter` role.
- **Analogy:** This is like a bank vault. The bank manager (the application) cannot open the vault on their own. They must go through a formal, audited procedure to get a temporary, single-use key from a security officer (the STS). The key only works for a few minutes, and the entire event is logged on camera.
- **Use Case:** This model is essential for high-risk scenarios. It provides a robust, auditable, and automatically expiring access method that isn't dependent on the application code for security enforcement.

### Summary

| **Access Type**    | **Who Controls Access?**     | **Why?**                                                                                                         |
| :----------------- | :--------------------------- | :--------------------------------------------------------------------------------------------------------------- |
| **Standard Roles** | **Application Code**         | Provides flexibility and performance for trusted, everyday users.                                                |
| **Emergency Role** | **Cloud IAM Infrastructure** | Provides maximum security, auditability, and automatically expiring access for exceptional, high-risk scenarios. |
