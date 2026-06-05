# Presentation Deck Outline

**Slide 1: Title**
- FieldGuard AI
- Team Name, Date
- "Secure attendance, anywhere."

**Slide 2: The Problem**
- Field workers in remote locations (mines, rural construction).
- Zero internet connectivity.
- High rates of attendance fraud (proxy attendance, buddy punching).

**Slide 3: Our Solution**
- An offline-first, highly secure facial recognition system.
- Key differentiators: Runs completely on-device, doesn't need internet, highly private (stores embeddings, not photos).

**Slide 4: System Architecture Diagram**
- Show React Native App -> Vision Camera -> TFLite -> SQLite -> AWS Sync.

**Slide 5: AI Pipeline**
- Step 1: BlazeFace for sub-5ms face detection.
- Step 2: CLAHE contrast handling for harsh outdoor Indian lighting.
- Step 3: MobileFaceNet INT8 embedding generation.

**Slide 6: Liveness Detection**
- Hybrid Approach.
- Passive: Texture CNN detects printed photos/screens.
- Active: Anti-replay protocol with randomized 8-second gesture tokens (MediaPipe Face Mesh).

**Slide 7: Security Design**
- Database encrypted with AES-256 (SQLCipher).
- Keys stored in hardware Keystore.
- HMAC-SHA256 GPS signing for tamper-proof timestamps.

**Slide 8: Sync & Purge Mechanism**
- Show flowchart: Offline -> Queue -> NetInfo restored -> Batch 50 AWS Amplify upload -> Auto-purge local records to save space.

**Slide 9: Performance Benchmarks**
- BlazeFace: 3.2ms
- Full end-to-end inference: 282ms (Redmi Note 10).
- Bundle size: 8 MB.

**Slide 10: Admin Dashboard**
- Show screenshots of the Vite React dashboard (Recharts, react-leaflet).

**Slide 11: Phase 2 Roadmap**
- Federated Learning: App trains on edge case drifts and pushes weights, avoiding raw photo uploads.
- Depth-sensor (IR) integration for flagship phones.

**Slide 12: Why We Win**
- Innovation: Hybrid liveness and anti-replay tokens.
- Feasibility: Fits in 10MB, runs on 3GB RAM phones.
- Scalability: Extensible as a module for Datalake 3.0.

**Slide 13: Q&A / Links**
- Live Demo QR Code.
- GitHub Repo Link.
