/// <reference types="expo/types" />

interface ExpoExtraConfig {
  apiBaseUrl?: string;
}

declare module 'expo-constants' {
  interface Constants {
    expoConfig?: {
      extra?: ExpoExtraConfig;
    };
  }
}
