/**
 * File: components/ui/__tests__/Button.test.tsx
 * Purpose: Unit tests for Button component with React Native mock
 * Dependencies: jest, react, components/ui/Button
 */

import React from 'react';

import { Button } from '../Button';

// Mock react-native
jest.mock('react-native', () => {
  return {
    Text: 'Text',
    View: 'View',
    Pressable: 'Pressable',
    ActivityIndicator: 'ActivityIndicator',
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
    createAnimatedComponent: (component: any) => component,
  };
});

// Mock Haptics
jest.mock('expo-haptics', () => {
  return {
    impactAsync: jest.fn(),
    ImpactFeedbackStyle: {
      Medium: 'medium',
    },
  };
});

describe('Button Component', () => {
  it('should render button with children', () => {
    const element = Button({ children: 'Submit' });
    expect(element).toBeDefined();
  });

  it('should apply correct accessibility role and states', () => {
    const element = Button({ children: 'Submit', disabled: true });
    expect(element.props.accessibilityRole).toBe('button');
    expect(element.props.accessibilityState.disabled).toBe(true);
  });

  it('should render loading indicator when loading is true', () => {
    const element = Button({ children: 'Submit', loading: true });
    // In loading state, it renders ActivityIndicator as sole child
    expect(element.props.children.type).toBe('ActivityIndicator');
  });

  it('should apply styles corresponding to variants', () => {
    const primaryEl = Button({ variant: 'primary', children: 'Primary' });
    const dangerEl = Button({ variant: 'danger', children: 'Danger' });

    expect(primaryEl.props.style).toBeDefined();
    expect(dangerEl.props.style).toBeDefined();
  });
});
