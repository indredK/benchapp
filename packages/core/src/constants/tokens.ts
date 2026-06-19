// ============================================================
// Design Tokens — colors, spacing, font sizes, etc.
// ============================================================

import type {
  ColorTokens,
  SpacingTokens,
  FontSizeTokens,
  BorderRadiusTokens,
  ZIndexTokens,
  ResolvedThemeMode,
} from '@repo/types/theme';

// --- Colors ---
export const lightColors: ColorTokens = {
  text: '#1A1A2E',
  textSecondary: '#60646C',
  textTertiary: '#9A9FAA',
  textDisabled: '#C4C8CF',
  textLink: '#2563EB',

  background: '#FFFFFF',
  backgroundElement: '#F0F0F3',
  backgroundSelected: '#E0E1E6',
  backgroundDisabled: '#F8F8FA',

  brand: '#4F46E5',
  brandLight: '#EEF2FF',
  brandPressed: '#4338CA',

  success: '#16A34A',
  warning: '#F59E0B',
  error: '#DC2626',
  info: '#2563EB',

  border: '#E0E1E6',
  borderLight: '#F0F0F3',

  white: '#FFFFFF',
  black: '#000000',
};

export const darkColors: ColorTokens = {
  text: '#F0F0F3',
  textSecondary: '#B0B4BA',
  textTertiary: '#80858D',
  textDisabled: '#4A4D54',
  textLink: '#60A5FA',

  background: '#0A0A0F',
  backgroundElement: '#1C1C24',
  backgroundSelected: '#2E313A',
  backgroundDisabled: '#141419',

  brand: '#6366F1',
  brandLight: '#1E1B4B',
  brandPressed: '#818CF8',

  success: '#22C55E',
  warning: '#FBBF24',
  error: '#EF4444',
  info: '#60A5FA',

  border: '#2E313A',
  borderLight: '#1C1C24',

  white: '#FFFFFF',
  black: '#000000',
};

export const colors: Record<ResolvedThemeMode, ColorTokens> = {
  light: lightColors,
  dark: darkColors,
};

// --- Spacing ---
export const spacing: SpacingTokens = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 64,
};

// --- Font Sizes ---
export const fontSize: FontSizeTokens = {
  caption: 12,
  body: 14,
  subtitle: 16,
  title: 18,
  h3: 20,
  h2: 24,
  h1: 32,
};

// --- Border Radius ---
export const borderRadius: BorderRadiusTokens = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

// --- Z-Index ---
export const zIndex: ZIndexTokens = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  overlay: 300,
  modal: 400,
  toast: 500,
  tooltip: 600,
};
