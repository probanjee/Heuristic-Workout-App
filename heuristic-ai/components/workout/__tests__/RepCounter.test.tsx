/**
 * HeuristicAI — Unit Tests: RepCounter Component
 * Source of truth: TASK.md § 17
 */

import React from 'react';

import { RepCounter } from '../RepCounter';

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
    withSequence: (...args: any[]) => args[0],
    withTiming: (val: any) => val,
  };
});

// Mock expo-haptics
jest.mock('expo-haptics', () => {
  return {
    impactAsync: jest.fn(),
    ImpactFeedbackStyle: {
      Light: 'light',
      Medium: 'medium',
    },
  };
});

// Mock lucide-react-native to prevent react-native-svg mock errors in node test runner
jest.mock('lucide-react-native', () => {
  return {
    Plus: 'Icon',
    Minus: 'Icon',
  };
});

describe('RepCounter Component', () => {
  const mockIncrement = jest.fn();
  const mockDecrement = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with target and completed reps', () => {
    const element = RepCounter({
      completedReps: 5,
      targetReps: 6,
      onIncrement: mockIncrement,
      onDecrement: mockDecrement,
    });

    expect(element).toBeDefined();
    // Verify target reps label shows 6
    const labelProps = element.props.children[0].props;
    expect(labelProps.accessibilityLabel).toContain('6');
  });

  test('calls onIncrement when incrementing', () => {
    const element = RepCounter({
      completedReps: 5,
      targetReps: 6,
      onIncrement: mockIncrement,
      onDecrement: mockDecrement,
    });

    // Touch area is the second child in the container (index 1)
    const tapArea = element.props.children[1];
    tapArea.props.onPress();
    expect(mockIncrement).toHaveBeenCalled();
  });

  test('calls onDecrement when decrementing', () => {
    const element = RepCounter({
      completedReps: 5,
      targetReps: 6,
      onIncrement: mockIncrement,
      onDecrement: mockDecrement,
    });

    // Stepper controls is the third child in the container (index 2)
    const controls = element.props.children[2];
    const minusBtn = controls.props.children[0];
    minusBtn.props.onPress();
    expect(mockDecrement).toHaveBeenCalled();
  });
});
