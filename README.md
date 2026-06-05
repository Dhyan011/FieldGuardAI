# FieldGuard AI 🛡️

FieldGuard AI is an offline-first, mobile facial recognition application engineered specifically for tracking worker attendance in remote, disconnected environments. 

In many real-world industries—such as deep-site construction, rural agriculture, and underground mining—traditional biometric scanners fail due to lack of stable internet, while paper-based attendance is prone to buddy-punching and time fraud. FieldGuard AI solves this by bringing AI-powered facial recognition directly to the edge (the mobile device), ensuring absolute accountability even when hundreds of miles from a cell tower.

---

## 🌍 Real-Life Applications

FieldGuard AI is designed for scenarios where internet connectivity is a luxury, not a guarantee:

*   **🚧 Construction Sites:** Large commercial sites or underground foundation work where 4G/5G penetration is non-existent. Site supervisors can use a single tablet to securely log in hundreds of daily laborers.
*   **🚜 Agricultural Fields:** Logging attendance for seasonal farm workers across massive, remote rural landscapes without Wi-Fi coverage.
*   **⛏️ Mining & Extraction:** Secure tracking of personnel entering and exiting deep shafts or remote extraction sites.
*   **⛺ Disaster Relief & Remote Camps:** Registering volunteers or personnel in hurricane zones, refugee camps, or remote scientific outposts where infrastructure has collapsed or never existed.

---

## 🌟 Key Features

*   **Edge AI Facial Recognition:** Fast, localized AI inference for worker identification. The face embeddings stay on the device, eliminating the need to stream video to the cloud.
*   **100% Offline-First Architecture:** The core attendance loop—scanning, verifying, and logging—works completely disconnected from the internet. 
*   **Auto-Sync Network Daemon:** When a supervisor's device finally reaches Wi-Fi (e.g., returning to the main office at the end of the day), a background worker automatically wakes up, batches the offline records, and synchronizes them to the cloud.
*   **Encrypted Edge Database:** Uses WeChat's MMKV engine for blazing-fast (30x faster than traditional storage), encrypted-at-rest local data persistence.
*   **Cryptographic Integrity (HMAC):** Every attendance log is cryptographically signed using SHA-256 HMAC at the moment of capture. This prevents advanced time-fraud where a user might try to alter device timestamps or spoof GPS coordinates before the sync occurs.
*   **Supervisor Authentication:** Secure, PIN-based supervisor access with auto-expiring sessions to protect the device if left unattended on a busy site.

---

## 📱 Usage Guide & Workflow

FieldGuard AI is designed to be operated by a Site Supervisor or Foreperson on a company-issued device.

### 1. Supervisor Authentication
*   The supervisor opens the app and enters their secure PIN (Default Demo PIN: `123456`).
*   This unlocks the Dashboard, revealing real-time metrics for the day.

### 2. Worker Enrollment (One-Time)
*   Tap **Enroll Worker**.
*   Enter the worker's Name, Department, and Phone Number.
*   The app uses the front-facing camera to capture a live face scan, converting it into a mathematical embedding.
*   The worker is now saved to the encrypted local MMKV store and ready for immediate offline scanning.

### 3. Daily Attendance Scanning
*   As workers arrive on site, the supervisor taps **Scan Attendance**.
*   The app opens a live camera view with an augmented-reality targeting overlay.
*   Workers step in front of the camera, and the app instantly verifies their identity against the local database.
*   Attendance is cryptographically signed (including GPS coordinates and timestamp) and logged locally.

### 4. End-of-Day Synchronization
*   Go to **Sync Data**.
*   You can manually trigger a push, or simply let the Auto-Sync daemon detect when the device connects to the internet.
*   The dashboard will update to show `All Synced` once the data successfully reaches the main server.

---

## 🛠️ Technology Stack

*   **Framework:** React Native (0.76.x) with TypeScript
*   **Navigation:** React Navigation (Native Stack)
*   **Camera & Vision:** React Native Vision Camera
*   **Animations:** React Native Reanimated (v3)
*   **Data Persistence:** React Native MMKV (C++ backed, memory-mapped storage)
*   **Security:** Crypto-JS (SHA-256, HMAC)
*   **Network Intelligence:** React Native Community NetInfo

---

## 🚀 How to Build and Run (Android)

### Prerequisites
*   Node.js (v18+)
*   Java Development Kit (JDK 21)
*   Android SDK

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Debug Build (Requires Emulator/Device)
```bash
npm run android
```

### 3. Generate Production Release APK
To build a highly optimized, standalone APK that can be deployed to supervisor tablets directly:

```bash
cd android
./gradlew assembleRelease
```
*The output APK will be located at:* `android/app/build/outputs/apk/release/app-release.apk`

---

## 🔒 Security Posture

*   **Data at Rest:** All local MMKV data (worker profiles, offline logs) is secured via AES encryption.
*   **Data in Transit:** Synchronized batch uploads are protected via HTTPS and prepared for Bearer token authorization.
*   **Tamper Resistance:** Modifying local device files will invalidate the HMAC signature of the attendance logs. The cloud sync engine acts as the final arbiter, instantly rejecting any log where the cryptographic signature does not perfectly match the payload.
