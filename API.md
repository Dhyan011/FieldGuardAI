# API Integration for Datalake 3.0

FieldGuard AI exposes specific hooks and services to allow seamless integration into the existing Datalake 3.0 React Native codebase.

## React Hooks

### `useFaceRecognition(mode, onDetection)`
Initializes the Vision Camera frame processors and handles the AI pipeline execution.
- **`mode`**: `'ENROLLMENT' | 'ATTENDANCE'`
- **`onDetection`**: Callback function triggered when a valid face is detected and processed.
- **Returns**: `{ frameProcessor, setIsProcessing }`

```tsx
import { useFaceRecognition } from './services/useFaceRecognition';

const { frameProcessor } = useFaceRecognition('ATTENDANCE', (result) => {
  if (result.success) {
    console.log('Embedding: ', result.embedding);
  }
});
```

## Services

### `dbService` (DatabaseService.ts)
Handles local SQLite interactions and encryption via SQLCipher.
- `initDatabase(): Promise<void>` - Initializes the encrypted SQLite DB.
- `enrollWorker(name, dept, phone, embedding, supervisorId): Promise<string>`
- `logAttendance(workerId, lat, lng, confidence, challenge, deviceId): Promise<string>`

### `syncService` (SyncService.ts)
Handles offline-to-online AWS sync and data purge.
- `initNetworkListener(): void` - Start listening for network restoration.
- `startSync(): Promise<void>` - Manually trigger batch sync and local purge.

### `LocationService` (LocationService.ts)
- `getCurrentLocation(): Promise<{lat, lng}>` - Requests permissions and fetches high-accuracy GPS coordinates.
