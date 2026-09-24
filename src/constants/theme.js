// Shared styling tokens per the prototype styling guidelines (section 4.3.9).

export const COLORS = {
  primary: '#2B7A78', // teal
  accent: '#F4A261', // amber (XP and badges)
  background: '#F0F4F8', // light grey
  card: '#FFFFFF',
  completed: '#52B788', // green left-border for completed rows
  quizBackground: '#E3F0FA', // light blue quiz section
  textPrimary: '#1A1A1A',
  textSecondary: '#5A6B7B',
  locked: '#C7D0D9',
  danger: '#B91C1C',
};

export const CARD = {
  borderRadius: 12,
  backgroundColor: COLORS.card,
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowRadius: 4,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
};
