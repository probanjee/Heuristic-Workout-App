# HeuristicAI Workout App Roadmap

This roadmap outlines the long-term vision and planned progression for the HeuristicAI Workout App, from its current prototype phase to a production-ready application.

### v0.1 Prototype Baseline (Current)
- [x] Initial React Native / Expo setup
- [x] TypeScript, ESLint, Prettier configuration
- [x] WatermelonDB local offline-first schema design
- [x] Zustand state management scaffolding
- [x] Navigation and basic UI layouts
- [x] Core Heuristic Engine logic (pure TS rules)

### v0.2 Auth Completion
- [ ] Complete Firebase Auth integration
- [ ] Connect Supabase backend for user profile storage
- [ ] Secure session persistence and offline fallback
- [ ] Handle registration and onboarding flows

### v0.3 Workout Tracking Polish
- [ ] Functional Active Workout UI
- [ ] Input handling for reps, weight, and RPE
- [ ] Local saving of completed sessions
- [ ] Background sync queue with WatermelonDB & Supabase
- [ ] Exercise library search and filtering

### v0.4 Analytics/Dashboard Improvement
- [ ] Aggregation queries for volume and frequency
- [ ] Implementation of `react-native-gifted-charts` for data visualization
- [ ] PR (Personal Record) tracking and celebration UI
- [ ] User profile statistics overview

### v0.5 AI-Assisted Recommendations
- [ ] MediaPipe pose tracking integration for real-time form scoring
- [ ] Connection between pose degradation and Heuristic Engine
- [ ] Audio coaching cues (TTS) based on live workout state
- [ ] Dynamic set adjustments mid-workout

### v1.0 Production-Ready Mobile App
- [ ] Comprehensive end-to-end testing
- [ ] Cloud-sync conflict resolution edge-case handling
- [ ] UI/UX polish, animations (Reanimated/Moti), and haptics
- [ ] Submission to App Store and Google Play Store
