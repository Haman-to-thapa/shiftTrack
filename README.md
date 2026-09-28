# ShiftTrack — Staff Shift Tracking Mobile App

A React Native & Expo mobile application built with TypeScript for staff members to log in securely, view weekly shifts, manually create shifts with validation, and track active shifts in real-time with background/reboot persistence.

---

## 🚀 Features & Assessment Coverage

| Requirement | Implementation Details | Status |
|---|---|---|
| **Authentication** | Secure email & password authentication with show/hide password toggle | ✅ Complete |
| **Wrong Credentials Error** | Validates credentials and provides clear error feedback | ✅ Complete |
| **Secure Session Storage** | Stores token & user data using `expo-secure-store` | ✅ Complete |
| **Session Persistence** | Auto-restores session on app restart / cold boot | ✅ Complete |
| **Logout** | Clears secure session and resets navigation state | ✅ Complete |
| **Weekly Shifts (`GET /shifts`)** | Fetches shifts filtered by `weekStart=YYYY-MM-DD` | ✅ Complete |
| **Create Shift (`POST /shifts`)** | Manual shift creation with date, start/end time, and break minutes | ✅ Complete |
| **Validation** | Enforces required fields & validates `endTime > startTime` | ✅ Complete |
| **Double Submission Prevention** | Disables submit button & prevents duplicate concurrent API calls | ✅ Complete |
| **Active Shift (`POST /shifts` & `PATCH /shifts/:id`)** | Starts an open shift, tracks live elapsed time, and ends shift with timestamp | ✅ Complete |
| **Live Timer Persistence** | Calculates `Date.now() - startTime`; stays accurate across backgrounding & full app restart | ✅ Complete |
| **State Handling** | Comprehensive Loading spinners, Error banners with Retry buttons, and Empty state displays | ✅ Complete |

---

## 🔑 Test Credentials

- **Email**: `staff@shifttrack.test`
- **Password**: `Password123`

---

## 🛠️ Tech Stack

- **Framework**: [Expo](https://expo.dev/) (SDK 57) + React Native
- **Language**: TypeScript
- **Navigation**: React Navigation (`@react-navigation/native-stack`)
- **Storage**:
  - `expo-secure-store` for authentication tokens and user credentials
  - `@react-native-async-storage/async-storage` for active shift persistence
- **Icons**: `@expo/vector-icons` (`Ionicons`)

---

## 📁 Project Structure

```
ShiftTrack/
├── src/
│   ├── screens/
│   │   ├── LoginScreen.tsx        # Authentication & password visibility toggle
│   │   ├── ShiftsScreen.tsx       # Weekly shifts list, loading/error/empty states, retry
│   │   ├── CreateShiftScreen.tsx  # Shift creation form & validations
│   │   └── ActiveShiftScreen.tsx  # Live timer, start/end shift, AsyncStorage persistence
│   ├── services/
│   │   └── api.ts                 # Mock API endpoints (GET, POST, PATCH, error toggle)
│   ├── storage/
│   │   ├── authStorage.ts         # SecureStore wrapper for auth session
│   │   └── shiftStorage.ts        # AsyncStorage wrapper for active shift state
│   └── types/
│       └── shift.ts               # TypeScript definitions for Shift model
├── App.tsx                        # Navigation stack & cold-start route resolver
└── package.json
```

---

## ⏱️ Live Timer Architecture

Instead of relying on a fragile client-side counter interval (which freezes in background and resets on app kill), ShiftTrack implements an **absolute timestamp delta**:
1. When a shift starts, `startTime` is recorded as an ISO timestamp and saved in `AsyncStorage`.
2. The UI calculates:
   $$\text{Elapsed Seconds} = \max\left(0, \left\lfloor\frac{\text{Date.now}() - \text{startTime.getTime}()}{1000}\right\rfloor\right)$$
3. If the user minimizes the app, leaves it in the background, or restarts the phone, the timer recalculates from the persistent `startTime` upon resume.

---

## 🏃 Running the Project Locally

```bash
# 1. Install dependencies
npm install

# 2. Start Expo dev server
npx expo start
```
