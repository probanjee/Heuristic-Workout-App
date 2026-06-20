/**
 * File: components/ui/__tests__/ProgressBar.test.tsx
 * Purpose: Unit tests for ProgressBar component with React Native mock
 * Dependencies: jest, react, components/ui/ProgressBar
 */

import React from 'react';

import { ProgressBar } from '../ProgressBar';

// Mock react-native
jest.mock('react-native', () => {
  return {
    Text: 'Text',
    View: 'View',
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
    withTiming: (val: any) => val,
  };
});

describe('ProgressBar Component', () => {
  beforeEach(() => {
    // Mock useEffect to execute synchronously in functional tests
    jest.spyOn(React, 'useEffect').mockImplementation((f) => f());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render progress bar container and track', () => {
    const element = ProgressBar({ value: 50 });
    expect(element).toBeDefined();
    expect(element.props.style).toBeDefined();
  });

  it('should render label and percentage when requested', () => {
    const element = ProgressBar({ value: 75, label: 'Workouts', showPercentage: true });
    
    // Check if children include label row
    const labelRow = element.props.children[0];
    expect(labelRow).toBeDefined();
    
    const labelText = labelRow.props.children[0];
    const percentText = labelRow.props.children[1];
    
    expect(labelText.props.children).toBe('Workouts');
    expect(percentText.props.children[0]).toBe(75);
    expect(percentText.props.children[1]).toBe('%');
  });

  it('should bound progress value between 0 and 100', () => {
    const elementNegative = ProgressBar({ value: -10, showPercentage: true });
    const labelRowNeg = elementNegative.props.children[0];
    expect(labelRowNeg.props.children[1].props.children[0]).toBe(0);

    const elementOver = ProgressBar({ value: 150, showPercentage: true });
    const labelRowOver = elementOver.props.children[0];
    expect(labelRowOver.props.children[1].props.children[0]).toBe(100);
  });
});
