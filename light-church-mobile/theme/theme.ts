/**
 * Theme configuration with Restyle
 * Google Maps inspired design system
 */

import { createTheme } from '@shopify/restyle';

const palette = {
  // Google Maps colors
  googleBlue: '#4285F4',
  googleGreen: '#34A853',
  googleYellow: '#FBBC04',
  googleRed: '#EA4335',

  // Grays
  gray50: '#F8F9FA',
  gray100: '#F1F3F4',
  gray200: '#E8EAED',
  gray300: '#DADCE0',
  gray400: '#BDC1C6',
  gray500: '#9AA0A6',
  gray600: '#80868B',
  gray700: '#5F6368',
  gray800: '#3C4043',
  gray900: '#202124',

  white: '#FFFFFF',
  black: '#000000',
};

const theme = createTheme({
  colors: {
    // Primary colors
    primary: palette.googleBlue,
    success: palette.googleGreen,
    warning: palette.googleYellow,
    error: palette.googleRed,

    // Background colors
    background: palette.white,
    surface: palette.white,
    card: palette.gray50,
    border: palette.gray300,

    // Text colors
    text: palette.gray900,
    textSecondary: palette.gray700,
    textTertiary: palette.gray500,
    textInverse: palette.white,

    // Special
    overlay: 'rgba(0, 0, 0, 0.5)',
    disabled: palette.gray400,
    transparent: 'transparent',
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadii: {
    s: 4,
    m: 8,
    l: 12,
    xl: 16,
    xxl: 24,
    round: 9999,
  },
  textVariants: {
    defaults: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
      color: 'text',
    },
    header: {
      fontSize: 28,
      fontWeight: '700',
      lineHeight: 34,
      color: 'text',
    },
    title: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 26,
      color: 'text',
    },
    subtitle: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 22,
      color: 'text',
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
      color: 'text',
    },
    caption: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
      color: 'textSecondary',
    },
    small: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
      color: 'textSecondary',
    },
    button: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 24,
      color: 'text',
    },
  },
  breakpoints: {
    phone: 0,
    tablet: 768,
  },
});

export type Theme = typeof theme;
export default theme;
