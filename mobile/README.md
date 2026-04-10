# Melody4U Mobile (Expo Go)

This mobile project is configured to run in **Expo Go** (Android and iOS).

## Environment
Create `.env` in `mobile/`:

```bash
EXPO_PUBLIC_API_BASE=https://melody4u-api.onrender.com
```

## Install
```bash
cd mobile
npm install
```

## Start (recommended)
```bash
npm run start:lan
```

Then open **Expo Go** and scan the QR code.

## Available scripts
```bash
npm run start            # clear cache, default host
npm run start:lan        # same Wi-Fi network (recommended for phone)
npm run start:localhost  # local emulator on same machine
npm run start:tunnel     # remote network fallback (ngrok; can be unstable)
npm run android          # open Android Expo Go
npm run ios              # open iOS Expo Go
```

## Android phone (Windows) – exact steps
1. `cd mobile`
2. `npm install`
3. `npm run start:lan`
4. In Expo Go on phone scan QR.

## Android emulator (Android Studio) – exact steps
1. Start an Android emulator in Android Studio Device Manager.
2. In `mobile/` run:
   ```bash
   npm run start:localhost
   ```
3. In second terminal run:
   ```bash
   npm run android
   ```

## Fix: `Failed to download remote update`
This usually means Expo opened stale cached state or tunnel failed.

Try:
1. Close Expo Go fully.
2. Stop Metro terminal.
3. Run:
   ```bash
   npm run start
   ```
4. Re-open Expo Go from QR (do not launch old cached project tile).
5. If still failing, clear Expo Go cache / reinstall Expo Go.

## Fix: tunnel error `Cannot read properties of undefined (reading 'body')`
This is typically ngrok/tunnel-side, not app code.

Use LAN first:
```bash
npm run start:lan
```
If tunnel is required, retry later and check https://status.ngrok.com/.
