# Melody4U Mobile Startup Diagnosis (Expo Android)

## ROOT CAUSE
The observed error (`java.io.IOException: Failed to download remote update`) is not caused by app screen code. It is caused by launch mode mismatch:

- users launched an installed native/dev build expecting OTA update behavior,
- or tunnel-based startup failed and the client fell back to stale/cached update state.

In this repository there is no custom `expo-updates` runtime/channel configuration that would require managed update infrastructure.

## CAN THIS RUN IN EXPO GO? (YES/NO)
**YES.**

Current dependencies are Expo-managed and Expo Go compatible (`expo-av`, `expo-document-picker`, `expo-file-system`, `expo-router`, `react-native-safe-area-context`).

## WHAT EXACTLY BREAKS IT
1. Using `expo run:android` without full Android SDK/ADB setup (seen in previous logs).
2. Tunnel startup instability (`ngrok` error path), causing startup confusion and stale launch retries.
3. Outdated package alignment (`expo-router` older than Expo SDK 53 recommendation) increased tooling instability risk.

## RECOMMENDED FIX
1. Standardize development on **Expo Go first**.
2. Remove dev-client scripts from default workflow to avoid accidental `run:android` usage.
3. Keep stable start scripts (`start`, `start:lan`, `start:localhost`, `android`, `ios`).
4. Align package versions with Expo SDK (`expo-router ~5.1.11`, `react-native 0.79.6`).
5. Update README to one clear truth: this project runs in Expo Go.

## REQUIRED FILE CHANGES
- `mobile/package.json`
  - remove `android:devclient` and `ios:devclient`
  - keep Expo Go scripts
  - update `expo-router` to SDK-compatible range
- `mobile/package-lock.json`
  - lockfile refresh after dependency/script changes
- `mobile/README.md`
  - clearly document Expo Go-first setup and Android emulator via Expo Go
  - troubleshooting for stale update and tunnel/network issues
