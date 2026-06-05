# Security & Data Retention Policy

## Encrypted Storage
- SQLite database is encrypted at rest using **SQLCipher (AES-256)**.
- The encryption key is randomly generated on first boot and stored in the **hardware-backed Keystore/Keychain** via `react-native-keychain`.

## Data Minimization & Privacy
- **Zero Raw Photos**: The system NEVER stores actual facial photographs. Instead, it extracts a 128-dimensional mathematical embedding (~512 bytes) from the face and discards the image immediately. A face cannot be reverse-engineered from this vector.

## Tamper-Proof Attendance Logging
Every attendance record is cryptographically signed using a HMAC-SHA256 signature containing:
`WorkerID + GPS_Lat + GPS_Lng + UnixTimestamp + DeviceID`
If the user modifies the local database directly (e.g., changing the timestamp), the backend will detect a signature mismatch and flag the record as TAMPERED.

## Purge Policy
To preserve local storage space, all attendance logs and sync queues are aggressively purged after receiving an HTTP 200 OK from the AWS synchronization pipeline.
