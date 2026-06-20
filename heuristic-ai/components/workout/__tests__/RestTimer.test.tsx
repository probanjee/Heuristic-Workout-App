/**
 * HeuristicAI — Unit Tests: RestTimer Component
 * Source of truth: TASK.md § 17
 */

import React from 'react';

import { RestTimer } from '../RestTimer';

let capturedSharedValues: any[] = [];

// Mock react to support hooks safely
jest.mock('react', () => {
  const actualReact = jest.requireActual('react');
  return {
    ...actualReact,
    useState: (initialVal: any) => {
      const val = typeof initialVal === 'function' ? initialVal() : initialVal;
      return [val, jest.fn()];
    },
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

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  return {
    __esModule: true,
    default: 'Svg',
    Svg: 'Svg',
    Circle: 'Circle',
  };
});

// Mock Reanimated
jest.mock('react-native-reanimated', () => {
  return {
    useSharedValue: (val: any) => {
      const sv = { value: val };
      capturedSharedValues.push(sv);
      return sv;
    },
    useAnimatedProps: (callback: any) => callback(),
    useAnimatedStyle: (callback: any) => callback(),
    withTiming: (val: any, config: any) => val,
    Easing: {
      linear: 'linear',
    },
    interpolateColor: (val: any) => 'color',
    createAnimatedComponent: (component: any) => component,
  };
});

// Mock expo-haptics
jest.mock('expo-haptics', () => {
  return {
    impactAsync: jest.fn(),
    selectionAsync: jest.fn(),
    notificationAsync: jest.fn(),
    ImpactFeedbackStyle: {
      Light: 'light',
      Medium: 'medium',
    },
    NotificationFeedbackType: {
      Success: 'success',
    },
  };
});

// Mock workout store
const mockSkipRest = jest.fn();
jest.mock('@/store/workout.store', () => ({
  useWorkoutStore: () => ({
    skipRest: mockSkipRest,
  }),
}));

// Mock lucide-react-native to prevent react-native-svg mock errors in node test runner
jest.mock('lucide-react-native', () => {
  return {
    Play: 'Icon',
    Plus: 'Icon',
  };
});

describe('RestTimer Component', () => {
  const mockComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    capturedSharedValues = [];
  });

  test('renders remaining time and metadata preview', () => {
    const element = RestTimer({
      totalSeconds: 90,
      onComplete: mockComplete,
      nextWeightKg: 80,
      nextReps: 6,
    });

    expect(element).toBeDefined();

    // Verify next set preview shows 80kg x 6 reps
    const previewContainer = element.props.children[2];
    const previewValue = previewContainer.props.children[1];
    expect(previewValue.props.children.join('')).toContain('80.0 KG × 6 REPS');
  });

  test('calls skipRest store action on skip click', () => {
    const element = RestTimer({
      totalSeconds: 90,
      onComplete: mockComplete,
      nextWeightKg: 80,
      nextReps: 6,
    });

    const actions = element.props.children[3];
    const skipBtn = actions.props.children[0];
    skipBtn.props.onPress();
    expect(mockSkipRest).toHaveBeenCalled();
  });

  test('updates remaining state on +30s click', () => {
    const element = RestTimer({
      totalSeconds: 90,
      onComplete: mockComplete,
      nextWeightKg: 80,
      nextReps: 6,
    });

    const actions = element.props.children[3];
    const addBtn = actions.props.children[1];
    addBtn.props.onPress();
    // Verify selection haptic is played
    const haptics = require('expo-haptics');
    expect(haptics.selectionAsync).toHaveBeenCalled();
  });

  test('calculates and applies proportional progress update on +30s click', () => {
    // We mock useState specifically for this test:
    // First call (remaining) returns 60
    // Second call (currentTotal) returns 90
    let callCount = 0;
    const useStateSpy = jest.spyOn(React, 'useState').mockImplementation(((initVal: any) => {
      callCount++;
      if (callCount === 1) {
        return [60, jest.fn()];
      }
      return [90, jest.fn()];
    }) as any);

    const element = RestTimer({
      totalSeconds: 90,
      onComplete: mockComplete,
      nextWeightKg: 80,
      nextReps: 6,
    });

    const actions = element.props.children[3];
    const addBtn = actions.props.children[1];
    addBtn.props.onPress();

    // newRemaining = 60 + 30 = 90
    // newTotal = 90 + 30 = 120
    // progress.value should be newRemaining / newTotal = 90 / 120 = 0.75
    expect(capturedSharedValues[0].value).toBe(0.75);

    useStateSpy.mockRestore();
  });
});
