# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).

## Generating Android APK

Use the helper scripts in the repository root to check dependencies and build the Android application.

### Unix/macOS
```bash
./scripts/generate-apk.sh --check   # verify required tools
./scripts/generate-apk.sh           # interactive build or open Android Studio
```

### Windows
```bat
scripts\generate-apk.bat --check
scripts\generate-apk.bat
```

The script will list detected tools and then prompt you to either run a CLI build (`npx cap build android`) or launch Android Studio (`npx cap open android`).

