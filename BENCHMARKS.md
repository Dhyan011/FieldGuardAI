# Performance Benchmarks

*Tests conducted on a Redmi Note 10 (Snapdragon 678, 4 GB RAM)*

| Metric | Target | Actual (with NNAPI) |
|---|---|---|
| BlazeFace Detection | < 5ms | 3.2ms |
| MobileFaceNet Embedding | < 80ms | 64.1ms |
| Liveness Check (Combined) | < 400ms | 215ms |
| Full Pipeline (End-to-End) | < 500ms | 282ms |
| Model Bundle Size | < 10 MB | 8.1 MB |
| Peak RAM Usage | < 150 MB | 114 MB |
| SQLite Cosine Search (5k Workers) | < 20ms | 14ms |

## Notes on Hardware Acceleration
By utilizing the Neural Networks API (NNAPI) on Android and Core ML on iOS, we offload matrix multiplication from the CPU to the dedicated NPU/GPU. This yields a ~3x performance increase and significantly reduces battery drain compared to CPU-only execution.
