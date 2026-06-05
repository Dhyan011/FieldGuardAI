# FieldGuard AI 🌌

An enterprise-ready, AI-powered attendance and enrollment application built with React Native. FieldGuard AI features a modern, fluid user interface inspired by Van Gogh's *Starry Night*, combined with powerful on-device machine learning for secure face recognition.

## ✨ Key Features

* **AI Face Recognition:** Uses advanced device cameras and real-time embedding extraction to calculate cosine similarity for secure attendance logging.
* **Offline-First Architecture:** Powered by an on-device SQLite database ensuring that workers can clock in and out even in remote locations without internet access.
* **Modern Cosmic UI:** Features high-performance 60fps animations, glassmorphism containers, and a custom `@shopify/react-native-skia` background that renders a dynamic *Starry Night* aesthetic.
* **Secure Storage:** Uses native device keychains to securely store supervisor PINs and sensitive configuration data.
* **Cross-Platform:** Built with Bare React Native to fully support both iOS and Android native hardware APIs.

## 🛠 Tech Stack

* **Framework:** React Native (Bare Workflow)
* **Language:** TypeScript
* **Animations & UI:** `react-native-reanimated`, `@shopify/react-native-skia`
* **Camera & ML:** `react-native-vision-camera` (Frame Processors)
* **Database:** `react-native-sqlite-storage`
* **Security:** `react-native-keychain`

## 🚀 Getting Started

Because FieldGuard AI relies on deep native hardware integrations (Camera, SQLite, Native Security), you **must** use a native development environment to run the app. It cannot be run inside a web browser or standard Expo Go.

### Prerequisites

* **Node.js:** v18 or newer
* **Ruby:** Required for iOS CocoaPods
* **iOS Testing:** A Mac with Xcode 15+ and an installed iOS Simulator Runtime (e.g., iOS 17.4).
* **Android Testing:** Android Studio with the Android 14 (API 34) SDK and Java Development Kit (JDK 17 or 21).

### Installation

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   ```

2. **Install iOS Native Pods (Mac Only):**
   ```bash
   npx pod-install ios
   ```

### Running the Application

**Start the Metro Bundler:**
```bash
npm start
```

**Run on iOS Simulator:**
```bash
npx react-native run-ios
```

**Run on Android (Physical Device or Emulator):**
```bash
npx react-native run-android
```
> *Note: For Android, ensure that your device has "Developer Options" and "USB Debugging" enabled if testing on physical hardware.*

## 🎨 UI/UX Design Philosophy
FieldGuard AI abandons the boring corporate aesthetic for something more inspiring. It utilizes deep navy gradients, subtle moving star particles, and soft glowing glass cards to create a professional yet highly engaging enterprise experience.

---
*Built with ❤️ for the future of automated workforce management.*
