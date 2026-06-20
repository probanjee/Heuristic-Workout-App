/**
 * HeuristicAI — Unit Tests: RPESlider Component
 * Source of truth: TASK.md § 17
 */

import React from 'react';

import { RPESlider } from '../RPESlider';

// Mock react to support functional calls of components with hooks in node-tests
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
    Modal: 'Modal',
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
    SlideInDown: {
      springify: () => ({
        damping: () => ({}),
      }),
    },
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

describe('RPESlider Component', () => {
  const mockSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('does not render when closed', () => {
    const element = RPESlider({
      isOpen: false,
      exerciseName: 'Barbell Squat',
      setNumber: 1,
      weightKg: 80,
      reps: 6,
      onSubmit: mockSubmit,
    });

    expect(element).toBeNull();
  });

  test('renders modal when open', () => {
    const element = RPESlider({
      isOpen: true,
      exerciseName: 'Barbell Squat',
      setNumber: 1,
      weightKg: 80,
      reps: 6,
      onSubmit: mockSubmit,
    });

    expect(element).toBeDefined();
    expect(element?.type).toBe('Modal');
  });

  test('calls onSubmit when RPE button clicked', () => {
    const element = RPESlider({
      isOpen: true,
      exerciseName: 'Barbell Squat',
      setNumber: 1,
      weightKg: 80,
      reps: 6,
      onSubmit: mockSubmit,
    });

    const overlay = element?.props.children;
    const sheet = overlay.props.children;
    
    // Grid of buttons is index 1
    const grid = sheet.props.children[1];
    
    // Tap button for RPE 8 (index 7)
    const buttonRpe8 = grid.props.children[7];
    buttonRpe8.props.onPress();
    
    expect(mockSubmit).toHaveBeenCalledWith(8, false);
  });

  test('calls onSubmit with RPE 6 when skip clicked', () => {
    const element = RPESlider({
      isOpen: true,
      exerciseName: 'Barbell Squat',
      setNumber: 1,
      weightKg: 80,
      reps: 6,
      onSubmit: mockSubmit,
    });

    const overlay = element?.props.children;
    const sheet = overlay.props.children;
    
    // actionRow is index 3
    const actionRow = sheet.props.children[3];
    const skipBtn = actionRow.props.children[0];
    skipBtn.props.onPress();
    
    expect(mockSubmit).toHaveBeenCalledWith(6, true);
  });

  test('accurately counts down 15 seconds', () => {
    const useEffectSpy = jest.spyOn(require('react'), 'useEffect').mockImplementation((cb: any) => cb());
    
    let stateVal = 15000;
    const setTimeLeftMock = jest.fn().mockImplementation((valueOrFn) => {
      if (typeof valueOrFn === 'function') {
        stateVal = valueOrFn(stateVal);
      } else {
        stateVal = valueOrFn;
      }
    });
    const useStateSpy = jest.spyOn(require('react'), 'useState').mockReturnValue([stateVal, setTimeLeftMock]);
    
    let intervalCallback: any = null;
    const setIntervalSpy = jest.spyOn(globalThis as any, 'setInterval').mockImplementation(((cb: any) => {
      intervalCallback = cb;
      return 123 as any;
    }) as any);

    RPESlider({
      isOpen: true,
      exerciseName: 'Barbell Squat',
      setNumber: 1,
      weightKg: 80,
      reps: 6,
      onSubmit: mockSubmit,
    });

    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000);
    expect(intervalCallback).toBeDefined();
    
    // Trigger interval callback to simulate 1 second tick
    intervalCallback();

    const updater = setTimeLeftMock.mock.calls.find(call => typeof call[0] === 'function')?.[0];
    expect(updater).toBeDefined();
    expect(updater(15000)).toBe(14000); // 15s -> 14s

    // Test countdown auto-submit logic
    expect(updater(1000)).toBe(0); // at 1s remaining, it should transition to 0 and trigger onSubmit
    expect(mockSubmit).toHaveBeenCalledWith(6, true);

    // Restore mocks
    useEffectSpy.mockRestore();
    useStateSpy.mockRestore();
    setIntervalSpy.mockRestore();
  });
});
