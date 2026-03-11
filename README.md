# 🏪 ShowGo Merchant — Admin App

> The **ShowGo Merchant** app lets merchants manage their theatres, screens, shows, movies, and scan tickets.
> Built with **React Native** & **Expo SDK 54**.

---

## 📖 What is Expo?

**Expo** is a platform that sits on top of React Native and handles all the complex build tooling for you. Instead of manually setting up Android Studio, Gradle, Xcode, etc., Expo does it all with simple commands.

### Key Concepts for Beginners

| Term | What it means |
|---|---|
| **Expo Go** | A free app you install on your phone. During development, you scan a QR code and see your app instantly — no build needed. |
| **EAS Build** | Expo's cloud build service. You run one command and it compiles your app into an `.apk` (Android) or `.ipa` (iOS) in the cloud. |
| **`app.json`** | The main configuration file — controls your app's name, icon, splash screen, package ID, and plugins. |
| **`eas.json`** | Controls build profiles (development, preview, production). |
| **`.env`** | Stores environment variables like the backend API URL. |
| **`expo-router`** | File-based routing — every `.tsx` file inside `app/` automatically becomes a screen. |

---

## 🚀 Getting Started (Step-by-Step for Beginners)

### Step 1: Install Prerequisites

Install these on your computer first:

1. **Node.js** (LTS version) — [Download here](https://nodejs.org/)
   ```bash
   # Verify installation:
   node --version    # Should print v20.x.x or similar
   npm --version     # Should print 10.x.x or similar
   ```

2. **Git** — [Download here](https://git-scm.com/)
   ```bash
   git --version
   ```

3. **Expo Go** on your phone (for testing):
   - [Android (Play Store)](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS (App Store)](https://apps.apple.com/app/expo-go/id982107779)

### Step 2: Clone & Install

```bash
# Clone the repo
git clone <YOUR_REPO_URL>

# Go into the merchant folder
cd Movie-app/merchant

# Install dependencies (may take a few minutes)
npm install
```

### Step 3: Configure the Backend URL

The app needs to communicate with the backend server. You tell it WHERE the server is via the `.env` file.

1. Open the **`.env`** file in the `merchant/` folder.
2. Set the URL to your backend:

```env
# If backend is on AWS EC2:
EXPO_PUBLIC_API_URL=http://YOUR_EC2_PUBLIC_IP:8000

# If backend is running locally on your computer:
EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_IP:8000
```

> [!IMPORTANT]
> **Never use `localhost` or `127.0.0.1`!**
> When testing on a physical phone, `localhost` points to the phone itself, not your computer. Use your computer's actual network IP address.
>
> **Find your IP:**
> - **Mac**: Terminal → `ipconfig getifaddr en0`
> - **Windows**: CMD → `ipconfig` → look for "IPv4 Address"
> - **Linux**: Terminal → `hostname -I`

### Step 4: Start the Development Server

```bash
npx expo start
```

A **QR code** will appear in the terminal:

- **Android**: Open **Expo Go** → Scan QR code
- **iPhone**: Open **Camera** app → Point at QR code → Tap the notification

> [!TIP]
> Both your phone and computer must be on the **same Wi-Fi network**.

---

## ⚙️ Understanding the Project Files

### Folder Structure

```
merchant/
├── app/                    # 📱 All screens (file-based routing)
│   ├── (tabs)/             #   Tab nav screens (Dashboard, Theatres, Shows, etc.)
│   ├── _layout.tsx         #   Root layout — navigation structure
│   ├── auth.tsx            #   Merchant login screen
│   ├── index.tsx           #   Entry point / redirect
│   ├── notifications.tsx   #   Notifications screen
│   ├── scan.tsx            #   QR code scanner for ticket check-in
│   └── modal.tsx           #   Modal screen
├── assets/                 # 🖼️ App icons, splash screen, images
│   ├── images/             #   All image assets
│   └── alerts/             #   Alert sound files
├── components/             # 🧩 Reusable UI components
│   └── dashboard/          #   Dashboard-specific components
├── config/                 # ⚙️ Configuration files
│   ├── api.ts              #   Backend API endpoint URLs
│   └── notifications.ts    #   Push notification setup
├── constants/              # 📌 App-wide constants (colors, sizes)
├── hooks/                  # 🪝 Custom React hooks
├── .env                    # 🔐 Environment variables (backend URL)
├── app.json                # 📋 App configuration
├── eas.json                # 🏗️ Build profiles
├── package.json            # 📦 Dependencies
├── babel.config.js         # ⚙️ Babel config
└── tsconfig.json           # ⚙️ TypeScript config
```

### How Screens Work (File-Based Routing)

Every `.tsx` file in `app/` is automatically a screen:

| File | What it is |
|---|---|
| `app/index.tsx` | First screen shown on app open |
| `app/auth.tsx` | Merchant login (phone + OTP) |
| `app/(tabs)/dashboard.tsx` | Main dashboard with stats |
| `app/(tabs)/theatres.tsx` | Manage theatres and screens |
| `app/scan.tsx` | QR scanner for ticket check-in |
| `app/notifications.tsx` | Notification list |

To add a new screen, just create a new `.tsx` file in `app/` — no router config needed.

---

## 📋 Understanding `app.json` (App Configuration)

Here's what every important field means:

```jsonc
{
  "expo": {
    "name": "ShowGo Merchant",     // 👈 Name shown on phone home screen
    "slug": "merchant",            // 👈 Expo internal ID (don't change after first build)
    "version": "1.0.0",           // 👈 App version
    "scheme": "merchant",         // 👈 Deep link scheme
    "orientation": "portrait",    // 👈 Lock to portrait mode
    "icon": "./assets/images/icon.png",  // 👈 App icon (1024x1024 PNG)

    "android": {
      "package": "com.maheshbisai.showgomerchant",  // 👈 Unique Play Store ID
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/android-icon-foreground.png",
        "backgroundImage": "./assets/images/android-icon-background.png",
        "backgroundColor": "#000000"
      }
    },

    "ios": {
      "supportsTablet": true,
      // bundleIdentifier would go here for App Store
    },

    "plugins": [
      "expo-router",              // File-based routing
      ["expo-splash-screen", {    // Splash screen config
        "image": "./assets/images/splash-icon.png",
        "backgroundColor": "#000000"
      }],
      "expo-secure-store",        // Secure token storage
      ["expo-build-properties", { // Native build settings
        "android": { "usesCleartextTraffic": true }  // Allow HTTP (not HTTPS) for dev
      }]
    ],

    "extra": {
      "eas": {
        "projectId": "1ff329c3-..."  // 👈 Auto-generated Expo project ID
      }
    },
    "owner": "mahesh-bisai"  // 👈 Expo account owner
  }
}
```

> [!WARNING]
> **Never change `android.package` after your first EAS build!**
> It's permanently linked to your signing key. Changing it means you'd need a new keystore and existing installs won't get updates.

### Common `app.json` Edits

| What you want to do | What to change |
|---|---|
| Change app name | `"name": "Your New Name"` |
| Change app icon | Replace `assets/images/icon.png` (1024×1024 PNG) |
| Change splash screen image | Replace `assets/images/splash-icon.png` |
| Change splash background color | `"splash-screen" plugin → "backgroundColor"` |
| Update version | `"version": "1.1.0"` |

---

## 📋 Understanding `eas.json` (Build Configuration)

```jsonc
{
  "build": {
    "development": {              // 🧪 Dev build with debugging tools
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {                  // 👀 Shareable test build
      "distribution": "internal",
      "android": {
        "buildType": "apk"       // Direct-install .apk file
      }
    },
    "production": {               // 🚀 Final release build
      "autoIncrement": true       // Auto-bump version each build
    }
  }
}
```

---

## 🛠️ Development Commands

| Command | What it does |
|---|---|
| `npx expo start` | Start dev server & show QR code |
| `npx expo start -c` | Start with cleared cache (use when things look broken) |
| Press `a` | Open in Android Emulator |
| Press `i` | Open in iOS Simulator |
| `npx expo install --fix` | Fix dependency version mismatches |
| `npx expo-doctor` | Diagnose project issues |

---

## 📦 Building an Installable APK (Step-by-Step)

### Step 1: Install EAS CLI (one time)

```bash
npm install -g eas-cli
```

### Step 2: Create an Expo Account (one time)

1. Go to [expo.dev](https://expo.dev) → Sign up (free).
2. Log in from terminal:
   ```bash
   eas login
   ```

### Step 3: Link Your Project (one time)

```bash
eas project:init
```

Skip this if `app.json → extra → eas → projectId` already has a value.

### Step 4: Build

```bash
# Test/Preview APK:
eas build --profile preview --platform android

# Production APK:
eas build --profile production --platform android
```

**What happens:**
1. First time: EAS asks *"Generate a new Android Keystore?"* → Press **Enter** (Yes).
2. Code uploads to Expo's cloud. Build takes ~10–20 minutes.
3. When done, you get a **download link** for the `.apk` file.

> [!TIP]
> View all builds at [expo.dev](https://expo.dev) → Your Project → Builds.

---

## ❌ Common Errors & Fixes

### "Network Request Failed"
- **Fix**: Check `.env` IP. Ensure phone & computer are on same Wi-Fi. If EC2, open port `8000` in Security Group.

### "Duplicate native module dependencies"
- **Fix**: `npx expo-doctor` → `npx expo install --fix`

### "JavaScript heap out of memory"
- **Fix**: `export NODE_OPTIONS=--max-old-space-size=4096`

### EAS Build "Project ID" error
- **Fix**: `eas project:init`

### Blank white screen on launch
- **Fix**: `npx expo start -c` (clear cache). Check terminal for errors.

### QR code won't scan / can't connect
- **Fix**: Same Wi-Fi for both devices. Disable VPN. Try `npx expo start --tunnel`.

---

## 📝 How to Make Changes

### Adding a New Screen
1. Create a file in `app/`, e.g. `app/settings.tsx`.
2. Export a component:
   ```tsx
   import { View, Text } from 'react-native';

   export default function SettingsScreen() {
     return (
       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
         <Text>Settings</Text>
       </View>
     );
   }
   ```
3. Navigate to it: `router.push('/settings')`

### Changing the Backend URL
1. Edit `.env` → change `EXPO_PUBLIC_API_URL`.
2. **Restart** the server: `Ctrl+C` then `npx expo start -c`.

### Changing App Icon
1. Create a 1024×1024 PNG image.
2. Replace `assets/images/icon.png`.
3. For Android, also update the adaptive icon images in `assets/images/`.
4. Rebuild with EAS for changes to appear.

---

## 🎨 Tech Stack

| Technology | Purpose |
|---|---|
| React Native | Cross-platform mobile framework |
| Expo SDK 54 | Development & build platform |
| expo-router | File-based navigation |
| TypeScript | Type-safe JavaScript |
| expo-secure-store | Auth token storage |
| expo-camera | QR code scanning for check-in |
| lucide-react-native | Icon library |
| react-native-reanimated | Smooth animations |
| expo-notifications | Push notifications |

---

Happy building! 🏪
