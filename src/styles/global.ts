import { StyleSheet } from 'react-native';
import { COLORS, FONTS, FONT_SIZES } from '../constants/theme';

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  heading: {
    fontFamily: FONTS.heading,
    fontSize: FONT_SIZES['2xl'],
    color: COLORS.text,
  },
  text: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: COLORS.white,
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.md,
  },
});