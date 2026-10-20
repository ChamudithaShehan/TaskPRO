export interface ColorPalette {
  background: string;
  surface: string;
  surfaceElevated: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderSubtle: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  urgent: string;
  urgentLight: string;
  high: string;
  highLight: string;
  medium: string;
  mediumLight: string;
  low: string;
  lowLight: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  card: string;
}

export const lightColors: ColorPalette = {
  background: '#F8F9FC',
  surface: '#FFFFFF',
  surfaceElevated: '#F1F4F9',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  borderSubtle: '#F1F5F9',
  primary: '#4338CA',
  primaryLight: '#EEF2FF',
  primaryDark: '#3730A3',
  urgent: '#EF4444',
  urgentLight: '#FEE2E2',
  high: '#F59E0B',
  highLight: '#FEF3C7',
  medium: '#3B82F6',
  mediumLight: '#EFF6FF',
  low: '#6B7280',
  lowLight: '#F3F4F6',
  success: '#10B981',
  successLight: '#ECFDF5',
  warning: '#F59E0B',
  warningLight: '#FFFBEB',
  card: '#FFFFFF',
};

export const darkColors: ColorPalette = {
  background: '#0F121E',
  surface: '#151926',
  surfaceElevated: '#1A2234',
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  border: '#232B3E',
  borderSubtle: '#1C2233',
  primary: '#5D5FEF',
  primaryLight: '#26224A',
  primaryDark: '#4338CA',
  urgent: '#EF4444',
  urgentLight: '#34151B',
  high: '#F59E0B',
  highLight: '#35230D',
  medium: '#3B82F6',
  mediumLight: '#152542',
  low: '#94A3B8',
  lowLight: '#1F2937',
  success: '#10B981',
  successLight: '#112D27',
  warning: '#F59E0B',
  warningLight: '#35230D',
  card: '#151926',
};
