/**
 * File: components/ui/__tests__/Typography.test.tsx
 * Purpose: Unit tests for Typography component with React Native mock
 * Dependencies: jest, react, components/ui/Typography
 */

import React from 'react';

import { Typography } from '../Typography';

// Mock react-native
jest.mock('react-native', () => {
  return {
    Text: 'Text',
    StyleSheet: {
      create: (styles: any) => styles,
    },
  };
});

describe('Typography Component', () => {
  it('should render typography with default variant', () => {
    const element = Typography({ children: 'Test Text' });
    expect(element).toBeDefined();
    expect(element.props.children).toBe('Test Text');
  });

  it('should apply style structure matching variant scale', () => {
    const captionEl = Typography({ variant: 'caption', children: 'Caption text' });
    const headingEl = Typography({ variant: 'h1', children: 'Heading text' });

    expect(captionEl.props.style).toBeDefined();
    expect(headingEl.props.style).toBeDefined();
  });

  it('should override default color when color prop is passed', () => {
    const element = Typography({ color: '#FF0000', children: 'Red text' });
    const styleObj = element.props.style.find((s: any) => s && s.color === '#FF0000');
    expect(styleObj).toBeDefined();
    expect(styleObj.color).toBe('#FF0000');
  });

  it('should apply correct accessibility role for headers', () => {
    const h1El = Typography({ variant: 'h1', children: 'H1 Header' });
    const h2El = Typography({ variant: 'h2', children: 'H2 Header' });
    const h3El = Typography({ variant: 'h3', children: 'H3 Header' });
    const bodyEl = Typography({ variant: 'bodyM', children: 'Body' });

    expect(h1El.props.accessibilityRole).toBe('header');
    expect(h2El.props.accessibilityRole).toBe('header');
    expect(h3El.props.accessibilityRole).toBe('header');
    expect(bodyEl.props.accessibilityRole).toBeUndefined();
  });
});
