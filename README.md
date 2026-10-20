# TaskPRO ⚡

A high-performance, local-first task and project management mobile application built with **Expo (SDK 57)**, **React Native**, **TypeScript**, and **SQLite**. Designed with a focus on cognitive ergonomics, micro-interactions, and frictionless productivity.

---

## ✨ Features

### 🎯 Intelligent Home Dashboard
- **"Next Focus" Anchor ("Eat That Frog")**: Automatically prioritizes the highest-impact pending task with a 1-tap **"Focus 25m"** launcher.
- **Interactive 7-Day Week Strip**: Quick-switch between days of the week, view task indicator dots, and return to today with a single tap.
- **1-Tap Overdue Resolution**: Dynamic alert banner with 1-tap batch reschedule (**"To Today"**) and direct contextual review.
- **Contextual Metric Strip**: Segmented summary cards (*Today*, *Overdue*, *Upcoming*, *Completed*) that navigate with active filter synchronization.
- **Gamified Day Streak**: Tracks consecutive completion days with a header badge (`🔥 Xd`).
- **Horizontal Project Carousel**: Compact swipeable cards showing live task completion ratios and progress rings.

### 📋 Full-Featured Task Management
- **Priorities & Statuses**: Low, Medium, High, and Urgent priority tags with intuitive color tokens.
- **Subtask Checklists**: Break complex tasks into bite-sized actionable steps with real-time completion counters.
- **Flexible Recurrence**: Daily, Weekly, and Monthly recurring schedules with automatic date calculation.
- **Time Blocking & Due Dates**: Date picking, due times, estimated duration, and scheduled push reminders.
- **Advanced Filtering & Sorting**: Filter by *Today*, *Inbox*, *Upcoming*, *Overdue*, *Completed*, or *Archived*; sort by priority, due date, or title.

### ⏱️ Integrated Pomodoro Focus Timer
- **Task-Linked Sessions**: Link any task directly into an active timer session.
- **Structured Intervals**: 25-minute focus blocks, 5-minute short breaks, and 15-minute long breaks.
- **Session History & Analytics**: Tracks completed focus minutes, session streaks, and productivity trends.

### 📁 Projects & Organization
- Custom color-coded projects with folder icons, descriptions, target deadlines, and progress bars.
- Tagging and category support for multidimensional organization.

### 📊 Productivity Analytics
- Daily momentum scores and completion velocity.
- Total focus time and historical completion trends.
- Project-level distribution and task efficiency metrics.

### 🌙 Premium Design & Ergonomics
- **Full Dark & Light Themes**: Harmonious HSL-tailored color palette with automatic system theme adaptation.
- **Haptic Feedback**: Tactile responses on task completion, timer controls, and day switching (`expo-haptics`).
- **Undo Toast System**: Floating undo toast notifications for non-destructive task operations.
- **Ergonomic Quick Add FAB**: Thumb-friendly floating action button opening a swift capture modal.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | [Expo SDK 57](https://expo.dev) · [React Native 0.86](https://reactnative.dev) · [React 19](https://react.dev) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (Strict Mode) |
| **Navigation** | [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing with typed routes) |
| **Storage & DB** | [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) (Offline-first, WAL journal mode) |
| **State Management** | [Zustand](https://github.com/pmndrs/zustand) |
| **UI & Icons** | [Lucide Icons](https://lucide.dev) · [NativeWind / TailwindCSS](https://www.nativewind.dev/) |
| **Gestures & Animations** | [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) · [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/) |
| **Device Capabilities** | `expo-haptics` · `expo-notifications` · `expo-secure-store` |

---

## 📂 Project Architecture

```
TaskPRO/
├── assets/                    # App icons, splash screens, and images
├── src/
│   ├── app/                   # Expo Router screens & route layouts
│   │   ├── (auth)/            # Authentication / onboarding flow
│   │   ├── (tabs)/            # Main tab bar navigators
│   │   │   ├── index.tsx      # Home Dashboard
│   │   │   ├── tasks.tsx      # Tasks list & advanced filter views
│   │   │   ├── calendar.tsx   # Calendar & Agenda view
│   │   │   ├── projects.tsx   # Projects directory & creation
│   │   │   └── settings.tsx   # User profile, theme, and app preferences
│   │   ├── project/[id].tsx   # Project details & task breakdown
│   │   ├── task/              # Task creation & detail screens
│   │   ├── analytics.tsx      # Productivity stats & charts
│   │   ├── focus.tsx          # Pomodoro Focus Timer
│   │   └── search.tsx         # Full-text task search
│   ├── components/            # Reusable UI components
│   │   ├── common/            # Badges, progress bars, rings, dialogs, empty states
│   │   ├── TaskItem.tsx       # Primary interactive task card
│   │   ├── ProjectCard.tsx    # Project card with progress
│   │   └── QuickAddTaskModal.tsx # Fast task creation bottom sheet
│   ├── context/               # React Context providers (Toast, Theme)
│   ├── db/                    # SQLite database connection & schema migrations
│   ├── repositories/          # Data access layer (Task, Project, Focus, Settings)
│   ├── services/              # Native device services (Haptics, Notifications, Auth)
│   ├── stores/                # Zustand stores (useTaskStore, useProjectStore, etc.)
│   ├── theme/                 # Design tokens, color palettes, and themes
│   ├── types/                 # TypeScript data contracts & models
│   └── utils/                 # Task formatting, date calculations, and streak logic
├── app.json                   # Expo configuration & plugins
└── package.json               # Dependencies and scripts
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- [Expo Go](https://expo.dev/go) on your mobile device (iOS / Android) or an emulator/simulator.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/TaskPRO.git
   cd TaskPRO
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npx expo start
   ```

4. **Launch on your device:**
   - Scan the QR code with **Expo Go** (Android) or the **Camera app** (iOS).
   - Press `a` in the terminal to launch on an Android Emulator.
   - Press `i` to launch on the iOS Simulator.
   - Press `w` to run in the web browser.

---

## 🧪 Quality & Code Verification

Ensure quality standards before building or submitting changes:

```bash
# Typecheck TypeScript definitions
npx tsc --noEmit

# Run ESLint validation
npx expo lint

# Diagnose Expo dependencies & configuration
npx expo-doctor
```

---

## 📦 Building with EAS

TaskPRO supports Continuous Native Generation (CNG) and EAS Cloud Builds:

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure build profile
eas build:configure

# Build development client
eas build --profile development --platform android
eas build --profile development --platform ios
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
