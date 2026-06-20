/**
 * HeuristicAI — Unit Tests: SetCard Component
 * Source of truth: TASK.md § 17
 */

import React from 'react';

import { SetCard } from '../SetCard';

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
    Dimensions: {
      get: () => ({ width: 375, height: 812 }),
    },
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
    withTiming: (val: any) => val,
    useAnimatedGestureHandler: (callbacks: any) => callbacks,
  };
});

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  return {
    PanGestureHandler: 'PanGestureHandler',
  };
});

// Mock expo-haptics
jest.mock('expo-haptics', () => {
  return {
    impactAsync: jest.fn(),
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

// Mock lucide-react-native to prevent react-native-svg mock errors in node test runner
jest.mock('lucide-react-native', () => {
  return {
    ChevronRight: 'Icon',
    Plus: 'Icon',
    Minus: 'Icon',
  };
});

describe('SetCard Component', () => {
  const mockRepsChange = jest.fn();
  const mockWeightChange = jest.fn();
  const mockComplete = jest.fn();
  const mockLongPressWeight = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders exercise details and set numbers', () => {
    const element = SetCard({
      exerciseName: 'Barbell Squat',
      muscleGroup: 'Legs',
      setNumber: 2,
      totalSets: 4,
      targetWeightKg: 80,
      targetReps: 6,
      completedReps: 5,
      onRepsChange: mockRepsChange,
      onWeightChange: mockWeightChange,
      onComplete: mockComplete,
      onLongPressWeight: mockLongPressWeight,
    });

    expect(element).toBeDefined();

    // Verify header details
    const header = element.props.children[0];
    const nameNode = header.props.children[0].props.children[0];
    expect(nameNode.props.children).toBe('BARBELL SQUAT');

    const setNumNode = header.props.children[1];
    expect(setNumNode.props.children.join('')).toContain('SET 2 OF 4');
  });

  test('adjusts weight on stepper button tap', () => {
    const element = SetCard({
      exerciseName: 'Barbell Squat',
      muscleGroup: 'Legs',
      setNumber: 2,
      totalSets: 4,
      targetWeightKg: 80,
      targetReps: 6,
      completedReps: 5,
      onRepsChange: mockRepsChange,
      onWeightChange: mockWeightChange,
      onComplete: mockComplete,
      onLongPressWeight: mockLongPressWeight,
    });

    const weightSection = element.props.children[1];
    
    // Add 2.5 kg button (steppersColumn left is index 0)
    const add25Btn = weightSection.props.children[0].props.children[0];
    add25Btn.props.onPress();
    expect(mockWeightChange).toHaveBeenCalledWith(82.5);
  });

  test('triggers long press callback on weight display click', () => {
    const element = SetCard({
      exerciseName: 'Barbell Squat',
      muscleGroup: 'Legs',
      setNumber: 2,
      totalSets: 4,
      targetWeightKg: 80,
      targetReps: 6,
      completedReps: 5,
      onRepsChange: mockRepsChange,
      onWeightChange: mockWeightChange,
      onComplete: mockComplete,
      onLongPressWeight: mockLongPressWeight,
    });

    const weightSection = element.props.children[1];
    
    // Weight Display Wrapper is index 1
    const weightDisplayWrapper = weightSection.props.children[1];
    weightDisplayWrapper.props.onLongPress();
    expect(mockLongPressWeight).toHaveBeenCalled();
  });
});
