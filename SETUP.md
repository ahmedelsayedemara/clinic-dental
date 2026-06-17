# Clinic App — Setup Guide

## Prerequisites

- Node.js >= 22.11.0 (`nvm use` in repo root uses `.nvmrc`)
- Xcode 15+ (for iOS)
- Android Studio + Android SDK (for Android)
- CocoaPods (`gem install cocoapods` or `brew install cocoapods`)
- Ruby + Bundler (for iOS Pods)
- A Firebase project with Email/Password auth + Firestore + Storage enabled

---

## Step 1: Generate the Native Folders

This repository ships **only the JS/TS source**. The `ios/` and `android/` native folders are not included. Generate them from a fresh React Native 0.84 init:

```bash
# Option A — init into a temp dir then copy native folders (recommended)
npx @react-native-community/cli@20.1.0 init ClinicNative --version 0.84.0 --skip-install
cp -r ClinicNative/ios ./ios
cp -r ClinicNative/android ./android
rm -rf ClinicNative

# Option B — init in-place (will overwrite JS files; merge carefully)
# npx @react-native-community/cli@20.1.0 init ClinicApp --version 0.84.0
```

After copying, update `android/app/src/main/java/.../MainApplication.kt` and `android/app/build.gradle` if the package name differs (default: `com.clinicapp`).

---

## Step 2: Configure Firebase

### 2a. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com) → "Add project"
2. Name it (e.g., `clinic-dental`)
3. Enable Google Analytics (optional)

### 2b. Add iOS App

1. In Firebase Console → Project Settings → Add app → iOS
2. Bundle ID: `com.clinicapp` (match your Xcode project)
3. Download `GoogleService-Info.plist`
4. Place it at: `ios/ClinicApp/GoogleService-Info.plist`

### 2c. Add Android App

1. In Firebase Console → Project Settings → Add app → Android
2. Package name: `com.clinicapp` (match `android/app/build.gradle`)
3. Download `google-services.json`
4. Place it at: `android/app/google-services.json`

### 2d. Enable Firebase Services

In Firebase Console:

1. **Authentication** → Sign-in method → Email/Password → Enable
2. **Firestore Database** → Create database → Start in production mode → Choose region
3. **Storage** → Get started → Start in production mode

---

## Step 3: Deploy Firestore Rules and Indexes

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login
firebase login

# Initialize (select Firestore, use existing project)
firebase init firestore --project YOUR_PROJECT_ID

# Deploy rules (copy content from FIRESTORE_SCHEMA.md)
# Save rules to firestore.rules, indexes to firestore.indexes.json, then:
firebase deploy --only firestore
```

Or deploy individually:
```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

---

## Step 4: Install JavaScript Dependencies

```bash
npm install
```

---

## Step 5: iOS Setup

```bash
cd ios
bundle install        # installs Cocoapods via Gemfile
bundle exec pod install
cd ..
```

### Add IBM Plex Sans Arabic Fonts (iOS)

1. Copy all `.ttf` files from `src/assets/fonts/` into `ios/ClinicApp/`
2. In Xcode: drag them into the project (check "Add to target: ClinicApp")
3. In `ios/ClinicApp/Info.plist` add:

```xml
<key>UIAppFonts</key>
<array>
  <string>IBMPlexSansArabic-Thin.ttf</string>
  <string>IBMPlexSansArabic-ExtraLight.ttf</string>
  <string>IBMPlexSansArabic-Light.ttf</string>
  <string>IBMPlexSansArabic-Regular.ttf</string>
  <string>IBMPlexSansArabic-Medium.ttf</string>
  <string>IBMPlexSansArabic-SemiBold.ttf</string>
  <string>IBMPlexSansArabic-Bold.ttf</string>
</array>
```

---

## Step 6: Android Setup

### Add Firebase Google Services plugin

In `android/build.gradle` (project level):
```gradle
buildscript {
  dependencies {
    classpath 'com.google.gms:google-services:4.4.2'
  }
}
```

In `android/app/build.gradle` (app level), add at the bottom:
```gradle
apply plugin: 'com.google.gms.google-services'
```

### Add IBM Plex Sans Arabic Fonts (Android)

```bash
# react-native.config.js already points to src/assets/fonts/
# Link fonts (RN 0.60+, auto-linking):
npx react-native-asset
```

Or manually: copy `.ttf` files to `android/app/src/main/assets/fonts/`

---

## Step 7: Create Initial Admin User

Firebase Auth doesn't allow creating users from the app without a sign-up flow. Create the first staff user via Firebase Console:

1. Firebase Console → Authentication → Users → Add user
2. Enter email and password for the dentist/staff member

---

## Step 8: Run the App

```bash
# Start Metro bundler
npm start

# iOS (in another terminal)
npm run ios

# Android
npm run android
```

---

## Environment Notes

- `google-services.json` and `GoogleService-Info.plist` are in `.gitignore` — never commit them
- There is no `.env` file; Firebase config is embedded in the native config files
- Firestore emulator: `firebase emulators:start --only firestore` for local dev

---

---

## Step 9: Notifee Local Notifications Setup (Phase 3a)

`@notifee/react-native ^9.1.8` is used for appointment reminders.

### iOS

1. After running `bundle exec pod install`, Notifee links automatically via CocoaPods.
2. No `Info.plist` key is required — Notifee requests permission at runtime via `notifee.requestPermission()`.
3. To support background notification delivery, enable **Background Modes → Remote notifications** in Xcode Capabilities (only needed if you later add remote push; not required for local trigger notifications).

### Android

1. Notifee auto-links via Gradle. No `build.gradle` changes are needed beyond the standard Firebase setup already done.
2. Add the following permission to `android/app/src/main/AndroidManifest.xml` inside `<manifest>` (required for `TriggerType.TIMESTAMP` on Android 12+):

```xml
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
```

Or, for Android 13+ (API 33+), add both:

```xml
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
<uses-permission android:name="android.permission.USE_EXACT_ALARM" />
```

3. Notifee creates a default notification channel automatically on Android, but the app also creates `clinic_appointments` channel with HIGH importance on first reminder schedule.

### Behaviour Notes

- Reminders are local trigger notifications — they fire even if the app is killed (no FCM/APNS required).
- `reminderId` (the Notifee notification ID) is stored on the Firestore appointment document so it can be cancelled when the appointment is rescheduled, cancelled, or deleted.
- All reminder calls are wrapped in `try/catch`. A denied permission or a past-date `reminderAt` silently skips scheduling without blocking the appointment save.

---

## Step 10: Image Picker & Document Picker Setup (Phase 3b)

Phase 3b adds attachment uploads. Two new packages are required:

- `react-native-image-picker ^8.2.1` — camera and photo library access for images and X-rays
- `react-native-document-picker ^9.3.1` — PDF file selection from the device file system

### iOS

1. After `npm install`, run `bundle exec pod install` to link both packages.

2. Add usage description strings to `ios/ClinicApp/Info.plist` (required by App Store):

```xml
<key>NSCameraUsageDescription</key>
<string>لالتقاط صور أشعة ومرفقات المرضى</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>لاختيار صور المرضى والمرفقات من مكتبة الصور</string>
<key>NSPhotoLibraryAddUsageDescription</key>
<string>لحفظ صور المرضى في مكتبة الصور</string>
```

3. No additional Xcode Capabilities are needed — both packages use standard iOS permission APIs.

### Android

1. Both packages auto-link via Gradle. No `build.gradle` changes are needed.

2. Add the following permissions to `android/app/src/main/AndroidManifest.xml` inside `<manifest>`:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"
    android:maxSdkVersion="32" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
```

`READ_MEDIA_IMAGES` is the replacement for `READ_EXTERNAL_STORAGE` on Android 13+ (API 33+).

3. For Android 11+ (API 30+), `react-native-document-picker` requires the `MANAGE_EXTERNAL_STORAGE` permission or the `ACTION_OPEN_DOCUMENT` intent (the package uses the latter by default — no extra config needed).

### Firebase Storage Rules

Deploy `storage.rules` from the repo root to enforce file-type and size limits:

```bash
firebase deploy --only storage
```

Or initialize Storage rules interactively:

```bash
firebase init storage --project YOUR_PROJECT_ID
# When prompted for rules file, enter: storage.rules
firebase deploy --only storage
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Pod install` fails | Run `bundle exec pod install --repo-update` |
| Firebase not initialized | Ensure plist/json files are in the correct native paths and re-run pod install |
| Fonts not loading | Run `npx react-native-asset` then rebuild |
| Firestore permission denied | Check `firestore.rules` — ensure user is authenticated |
| Search returns no results | Ensure `firestore.indexes.json` has been deployed with `firebase deploy --only firestore:indexes` |
| Metro bundler crash | Clear cache: `npm start -- --reset-cache` |
