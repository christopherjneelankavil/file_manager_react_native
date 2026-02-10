export const palette = {
  primary: '#2196F3', // Blue
  primaryDark: '#1976D2',
  secondary: '#007AFF', // iOS Blue
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FFC107',
  
  // Neutrals - Light
  white: '#FFFFFF',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray800: '#424242',
  gray900: '#212121',
  black: '#000000',

  // Neutrals - Dark
  dark100: '#1E1E1E',
  dark200: '#2C2C2C',
  dark300: '#333333',
  dark400: '#424242',
};

export const lightTheme = {
  mode: 'light',
  colors: {
    primary: palette.primary,
    background: palette.gray100,
    surface: palette.white,
    surfaceHighlight: palette.gray200,
    border: palette.gray300,
    borderLight: palette.gray300,
    text: {
      primary: palette.gray900,
      secondary: palette.gray500,
      tertiary: palette.gray400,
      link: palette.secondary,
      white: palette.white,
      disabled: palette.gray400,
    },
    success: palette.success,
    error: palette.error,
    selection: {
      background: '#E3F2FD',
      border: palette.primary,
    },
    shadow: '#000000',
  }
};

export const darkTheme = {
  mode: 'dark',
  colors: {
    primary: palette.primary,
    background: '#121212',
    surface: palette.dark100,
    surfaceHighlight: palette.dark200,
    border: palette.dark300,
    borderLight: palette.dark200,
    text: {
      primary: palette.gray200, // Softer white for dark mode
      secondary: palette.gray400,
      tertiary: palette.gray500,
      link: '#64B5F6', // Lighter blue for dark mode
      white: palette.white,
      disabled: palette.gray500,
    },
    success: '#81C784',
    error: '#E57373',
    selection: {
      background: 'rgba(33, 150, 243, 0.2)',
      border: palette.primary,
    },
    shadow: '#000000',
  }
};

export type Theme = typeof lightTheme;
export type Colors = typeof lightTheme.colors;
