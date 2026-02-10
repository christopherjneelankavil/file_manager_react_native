# UsbOtgApp

A robust React Native application designed for managing files on USB OTG devices with ease. This app allows users to browse, filter, and copy files from USB drives to their Android device's internal storage, featuring a modern UI with Dark Mode support.

## 🚀 Features

- **USB File Browsing**: Seamless navigation of files and folders on connected USB OTG drives.
- **File Management**:
  - **Copy to Internal Storage**: Select multiple files and copy them to your device.
  - **Breadcrumb Navigation**: Easily traverse through folder hierarchies.
- **Advanced Filtering**: Filter files by date range to quickly find what you need.
- **Modern UI/UX**:
  - **Dark Mode Support**: Automatically adapts to system theme or user preference.
  - **Progress Tracking**: Real-time progress bars for file copy operations.
- **Native Performance**: Utilizes custom Native Modules for efficient file operations on Android.

## 🛠️ Tech Stack

- **React Native**: Core framework.
- **TypeScript**: For type-safe code.
- **Native Modules**: Custom Kotlin/Java modules for direct USB file access.
- **React Native Safe Area Context**: Handling safe areas on modern devices.

## 📥 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/christopherjneelankavil/file_manager_react_native.git
   cd UsbOtgApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run on Android**
   Connect your Android device via USB and ensure USB Debugging is enabled.
   ```bash
   npm run android
   ```

## 📱 Usage

1. **Connect USB Drive**: Plug in your USB OTG drive to your Android device.
2. **Grant Permissions**: The app will request permission to access the USB drive.
3. **Browse Files**: Use the interface to navigate folders.
4. **Select & Copy**: Long press to enter selection mode, select files, and tap the copy icon.
5. **Filter**: Use the calendar icon to filter files by date.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
