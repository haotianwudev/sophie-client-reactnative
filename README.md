# SOPHIE - Stock/Option Portfolio Helper Intelligent Engine

A React Native mobile app that provides AI-powered financial analysis for stocks. The app is designed to work as an Android Instant App and can be easily adapted to full Android and iOS applications.

## Features

- **AI-Powered Analysis**: Intelligent stock analysis based on fundamentals, technicals, and sentiment
- **Trend Detection**: Discover trending stocks and market patterns
- **Investor Education**: Learn investment concepts and strategies
- **Real-time Charts**: View interactive stock charts with technical indicators
- **Dark Mode Support**: Adjusts to system's dark/light mode preference

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-repo/sophie-client-reactnative.git
cd sophie-client-reactnative
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on a device or emulator:
```bash
# For Android
npm run android

# For iOS
npm run ios
```

## Android Instant App Configuration

This project is set up to work as an Android Instant App. The app can be accessed via web links without requiring a full installation. To modify the instant app settings, check the following files:

- `app.json`: Contains configuration for Android intent filters
- `android/app/src/main/AndroidManifest.xml`: Generated from app.json with appropriate instant app settings

## Project Structure

```
├── app/                   # Main app code
│   ├── components/        # Reusable UI components
│   │   ├── layout/        # Layout components
│   │   ├── search/        # Search components
│   │   ├── stock/         # Stock-related components
│   │   ├── ui/            # UI components
│   │   └── icons/         # Icon components
│   ├── screens/           # App screens
│   └── types/             # TypeScript type definitions
├── assets/                # Static assets
├── App.tsx                # Main app component
└── index.tsx              # Entry point
```

## Libraries Used

- **React Native**: Mobile app framework
- **Expo**: Development platform
- **React Navigation**: Navigation library
- **Apollo Client**: GraphQL client
- **Vector Icons**: Icon library

## License

This project is licensed under the MIT License - see the LICENSE file for details.
