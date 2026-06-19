// ============================================================
// Theme type definitions
// ============================================================

/** Theme mode */
export type ThemeMode = 'light' | 'dark' | 'system';

/** Resolved theme mode (always concrete) */
export type ResolvedThemeMode = 'light' | 'dark';

/** Theme state */
export interface ThemeState {
  mode: ThemeMode;
  resolvedMode: ResolvedThemeMode;
}

/** Semantic color tokens */
export interface ColorTokens {
  // Text
  text: string;
  textSecondary: string;
  textTertiary: string;
  textDisabled: string;
  textLink: string;

  // Background
  background: string;
  backgroundElement: string;
  backgroundSelected: string;
  backgroundDisabled: string;

  // Brand
  brand: string;
  brandLight: string;
  brandPressed: string;

  // Functional
  success: string;
  warning: string;
  error: string;
  info: string;

  // Border
  border: string;
  borderLight: string;

  // Others
  white: string;
  black: string;
}

/** Spacing tokens */
export interface SpacingTokens {
  xxs: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

/** Font size tokens */
export interface FontSizeTokens {
  caption: number;
  body: number;
  subtitle: number;
  title: number;
  h3: number;
  h2: number;
  h1: number;
}

/** Border radius tokens */
export interface BorderRadiusTokens {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
}

/** Z-index tokens */
export interface ZIndexTokens {
  base: number;
  dropdown: number;
  sticky: number;
  overlay: number;
  modal: number;
  toast: number;
  tooltip: number;
}

/** Complete theme tokens */
export interface ThemeTokens {
  colors: Record<ResolvedThemeMode, ColorTokens>;
  spacing: SpacingTokens;
  fontSize: FontSizeTokens;
  borderRadius: BorderRadiusTokens;
  zIndex: ZIndexTokens;
}

/** Theme service interface */
export interface ThemeService {
  getMode(): ThemeMode;
  setMode(mode: ThemeMode): void;
  getResolved(): ResolvedThemeMode;
  getTokens(): Record<'colors', ColorTokens> & Omit<ThemeTokens, 'colors'>;
  subscribe(listener: (mode: ThemeMode, resolved: ResolvedThemeMode) => void): () => void;
}
