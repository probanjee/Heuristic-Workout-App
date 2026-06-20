# Android SDK Setup Guide for HeuristicAI

This guide details how to resolve Android SDK resolution errors and configure the development environment for running HeuristicAI on Android.

---

## 1. Install Android Studio

1. Download and install [Android Studio](https://developer.android.com/studio).
2. During the setup wizard, ensure you check the box to install the **Android SDK** and **Android SDK Command-line Tools**.

---

## 2. Configure Android SDK & Platform Tools

Ensure that the Android SDK platform tools are installed:
1. Open Android Studio.
2. Navigate to **Tools > SDK Manager** (or Settings > Appearance & Behavior > System Settings > Android SDK).
3. Under the **SDK Tools** tab, verify that the following are installed and updated:
   - Android SDK Platform-Tools
   - Android SDK Build-Tools
   - Android SDK Command-line Tools (latest)

---

## 3. Set Up Environment Variables

To make `adb` and the Android build tools recognizable by the terminal, configure your system environment variables.

### Windows (PowerShell/CMD)

1. Find your Android SDK path. By default, it is:
   `C:\Users\<Your-Username>\AppData\Local\Android\Sdk`

2. Open the Start Search, type "env", and select **Edit the system environment variables**.
3. Click on the **Environment Variables...** button.
4. Under **User variables** (or System variables), click **New...** to add `ANDROID_HOME`:
   - **Variable name**: `ANDROID_HOME`
   - **Variable value**: `C:\Users\<Your-Username>\AppData\Local\Android\Sdk` (replace with your actual path)

5. Under **User variables**, select the `Path` variable and click **Edit...**.
6. Click **New** and add the following paths:
   - `%ANDROID_HOME%\platform-tools`
   - `%ANDROID_HOME%\emulator`
   - `%ANDROID_HOME%\tools`
   - `%ANDROID_HOME%\tools\bin`

7. Click **OK** to close all dialogs.
8. Restart your terminal.

---

## 4. Verify Configuration

Open a new command prompt or PowerShell window and run:

```bash
adb --version
```

If configured correctly, the output will print the installed Android Debug Bridge version instead of an error:

```text
Android Debug Bridge version 1.0.41
Version 34.0.5-10900879
Installed as C:\Users\<Your-Username>\AppData\Local\Android\Sdk\platform-tools\adb.exe
```

Now, starting your Expo project on Android will successfully detect the SDK and connected devices:

```bash
npx expo start --android
```
