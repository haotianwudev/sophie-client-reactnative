# SophieClient React Native App

A Hello World React Native app with Android Instant App support.

## Development Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

## Building for Android

### Instant App
```bash
expo run:android --variant=instant
```

### Full APK
```bash
expo run:android
```

## Building for iOS (requires macOS)
```bash
expo run:ios
```

## Configuration Notes

- Android package name: com.example.sophieclient
- Uses Expo development client for Instant App testing
- Intent filter configured for https://*.example.com

## Converting to Full Apps

### Android APK
1. Run `expo run:android`
2. Follow Expo CLI prompts to build and sign APK

### iOS App
1. Run `expo run:ios`
2. Use Xcode to archive and export IPA
