/**
 * HeuristicAI — Unit Tests: HeuristicBanner Component
 * Source of truth: TASK.md § 17
 */

import React from 'react';

import { HeuristicBanner } from '../HeuristicBanner';
import type { HeuristicDecision } from '@/heuristic-engine/types';

// Mock react to support hooks safely
jest.mock('react', () => {
  const actualReact = jest.requireActual('react');
  return {
    ...actualReact,
    useState: (initialVal: any) => [initialVal, jest.fn()],
    useEffect: jest.fn(),
    useRef: (initialVal: any) => ({ current: initialVal }),
  };
});

// Mock react-native
jest.mock('react-native', () => {
  return {
    Text: 'Text',
    View: 'View',
    TouchableOpacity: 'TouchableOpacity',
    StyleSheet: {
      create: (styles: any) => styles,
    },
  };
});

// Mock Reanimated
jest.mock('react-native-reanimated', () => {
  return {
    useSharedValue: (val: any) => ({ value: val }),
    useAnimatedStyle: (callback: any) => callback(),
    withSpring: (val: any) => val,
    withDelay: (val: any) => val,
    FadeIn: {
      delay: () => ({}),
    },
    SlideInDown: {
      springify: () => ({
        damping: () => ({}),
      }),
    },
    default: {
      View: 'AnimatedView',
    },
  };
});

// Mock lucide-react-native to prevent react-native-svg mock errors in node test runner
jest.mock('lucide-react-native', () => {
  return {
    AlertTriangle: 'Icon',
    TrendingDown: 'Icon',
    TrendingUp: 'Icon',
    Zap: 'Icon',
    Check: 'Icon',
    X: 'Icon',
  };
});

// Mock expo-haptics
jest.mock('expo-haptics', () => {
  return {
    impactAsync: jest.fn(),
    notificationAsync: jest.fn(),
    ImpactFeedbackStyle: {
      Medium: 'medium',
    },
    NotificationFeedbackType: {
      Warning: 'warning',
    },
  };
});

const mockDecision: HeuristicDecision = {
  nextSetWeightKg: 70,
  nextSetTargetReps: 6,
  additionalRestSeconds: 30,
  addDropSet: false,
  substituteExercise: null,
  terminateSessionWarning: false,
  recoveryFlagToCreate: null,
  coachNote: 'Decreasing weight by 10% due to failure.',
  confidenceScore: 0.85,
  ruleMatched: 'ruleRPERepFailure',
  actionType: 'reduce_weight',
};

describe('HeuristicBanner Component', () => {
  const mockAccept = jest.fn();
  const mockOverride = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with matched rule suggestions and notes', () => {
    const element = HeuristicBanner({
      decision: mockDecision,
      previousWeightKg: 80,
      onAccept: mockAccept,
      onOverride: mockOverride,
    });

    expect(element).toBeDefined();

    // Verify coach note displays
    const coachNoteNode = element.props.children[1];
    expect(coachNoteNode.props.children).toBe(mockDecision.coachNote);
  });

  test('calls onAccept when accept button clicked', () => {
    const element = HeuristicBanner({
      decision: mockDecision,
      previousWeightKg: 80,
      onAccept: mockAccept,
      onOverride: mockOverride,
    });

    const actions = element.props.children[3];
    const acceptBtn = actions.props.children[0];
    acceptBtn.props.onPress();

    expect(mockAccept).toHaveBeenCalled();
  });

  test('calls onOverride when override button clicked', () => {
    const element = HeuristicBanner({
      decision: mockDecision,
      previousWeightKg: 80,
      onAccept: mockAccept,
      onOverride: mockOverride,
    });

    const actions = element.props.children[3];
    const overrideBtn = actions.props.children[1];
    overrideBtn.props.onPress();

    expect(mockOverride).toHaveBeenCalled();
  });
});
