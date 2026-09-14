export const Colors = {
  background: '#021035', // Match Stitch background
  card: 'rgba(255, 255, 255, 0.05)', // glass background
  primary: '#1B2FC0', // Match Stitch primary
  secondary: '#1E6BCE', // For the gradient
  accent: '#3B82F6', 
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  border: 'rgba(255, 255, 255, 0.1)',
  expense: '#F43F5E', // rose-400
  income: '#34D399', // emerald-400
  white: '#FFFFFF',
  black: '#000000',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const Typography = {
  h1: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 28,
    color: Colors.text,
  },
  h2: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 24,
    color: Colors.text,
  },
  h3: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 18,
    color: Colors.text,
  },
  body: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 16,
    color: Colors.text,
  },
  caption: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
};
