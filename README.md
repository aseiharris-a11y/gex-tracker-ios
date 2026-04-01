# GEX Tracker — iOS App

Native iOS app for tracking SPY/SPX gamma exposure, gamma flip zones, squeeze setups, and option chain data. Built with React Native + Expo.

## Features

- **Dashboard** — Real-time KPIs (spot price, gamma flip, net GEX, regime), key levels, and GEX by strike chart
- **Option Chain** — Full CBOE option chain with calls/puts, greeks, and ATM highlighting
- **Expiration Explorer** — Browse all 36+ expirations with per-expiry GEX breakdown
- **Squeeze Scanner** — Detects gamma squeeze setups with scoring, confirmation signals, and dealer flow analysis
- **Push Notifications** — Regime change and squeeze alerts via Apple Push Notifications
- **Dark Mode** — Full dark theme matching Bloomberg terminal aesthetics

## Prerequisites

- macOS with Xcode 15+ installed
- Node.js 18+ and npm
- An Apple Developer account ($99/year) — [developer.apple.com](https://developer.apple.com)
- EAS CLI: `npm install -g eas-cli`
- Your GEX Tracker backend server running (the web app)

## Quick Start (Development)

### 1. Configure your API server

Open `src/lib/api.ts` and set your server URL:

```ts
const DEFAULT_API_BASE = 'http://YOUR_SERVER_IP:5000';
```

If running the server locally on your Mac, use your Mac's local network IP (not `localhost`, since the iOS simulator/device needs a reachable address).

### 2. Install dependencies

```bash
cd gex-tracker-ios
npm install
```

### 3. Run in iOS Simulator

```bash
npx expo start --ios
```

Or scan the QR code with the Expo Go app on your iPhone for instant preview.

### 4. Run on physical device (Expo Go)

```bash
npx expo start
```

Scan the QR code with your iPhone camera → opens in Expo Go.

## Build for App Store

### 1. Create an EAS account

```bash
eas login
```

### 2. Configure your Apple credentials

Edit `eas.json` and replace the placeholders:

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your@email.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCDEF1234"
      }
    }
  }
}
```

- **appleId**: Your Apple ID email
- **ascAppId**: Your app's ID in App Store Connect (create the app first at [appstoreconnect.apple.com](https://appstoreconnect.apple.com))
- **appleTeamId**: Your team ID from [developer.apple.com/account](https://developer.apple.com/account) → Membership

### 3. Create the app in App Store Connect

1. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Click "+" → "New App"
3. Name: **GEX Tracker**
4. Bundle ID: **com.gextracker.app**
5. SKU: **gex-tracker-ios**
6. Primary Language: English (U.S.)

### 4. Build the production IPA

```bash
eas build --platform ios --profile production
```

EAS will:
- Ask you to log in to your Apple Developer account
- Generate/manage signing certificates and provisioning profiles automatically
- Build the `.ipa` in the cloud
- Provide a download link when done (~10-15 minutes)

### 5. Submit to App Store

```bash
eas submit --platform ios --profile production
```

Or submit directly after build:

```bash
eas build --platform ios --profile production --auto-submit
```

### 6. Complete App Store listing

In App Store Connect:
- Upload screenshots (use the simulator screenshots)
- Write the description
- Set the category to **Finance**
- Set the age rating
- Submit for review

## Project Structure

```
gex-tracker-ios/
├── app/                      # Expo Router screens
│   ├── _layout.tsx           # Root layout (SafeArea + Settings provider)
│   └── (tabs)/
│       ├── _layout.tsx       # Tab bar configuration
│       ├── index.tsx         # Dashboard screen
│       ├── chain.tsx         # Option Chain screen
│       ├── expirations.tsx   # Expiration Explorer screen
│       ├── scanner.tsx       # Squeeze Scanner screen
│       └── settings.tsx      # Settings screen
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── KpiCard.tsx       # Metric card
│   │   ├── GexBarChart.tsx   # SVG bar chart
│   │   ├── KeyLevels.tsx     # Key levels badges
│   │   ├── RegimeBadge.tsx   # Regime indicator
│   │   ├── ScoreGauge.tsx    # Circular score gauge
│   │   ├── SqueezeCard.tsx   # Squeeze setup card
│   │   ├── ChainTable.tsx    # Option chain table
│   │   ├── ExpirationRow.tsx # Expiration list row
│   │   └── LoadingView.tsx   # Loading/error states
│   └── lib/                  # Utilities and types
│       ├── api.ts            # API client
│       ├── theme.ts          # Design tokens
│       ├── format.ts         # Number formatters
│       ├── types.ts          # TypeScript interfaces
│       └── SettingsContext.tsx # App settings context
├── assets/                   # App icons and splash
├── app.json                  # Expo configuration
├── eas.json                  # EAS Build configuration
├── tsconfig.json             # TypeScript config
└── package.json              # Dependencies
```

## Customization

### Change the API server URL
The app stores the API URL in memory (Settings tab). For a permanent default, edit `src/lib/api.ts`.

### Add your FlashAlpha API key
Go to Settings tab → enter your API key → tap "Save". This is sent to your backend server.

### Push Notifications
The app registers for push notifications via `expo-notifications`. Configure your APNs key in EAS:
```bash
eas credentials
```

## Tech Stack

- **Expo SDK 52** + Expo Router (file-based routing)
- **React Native** with TypeScript
- **react-native-svg** for charts
- **expo-notifications** for push
- **@react-navigation/bottom-tabs** via Expo Router

## License

Private — for personal use.
