import { StyleSheet, Platform } from 'react-native';
import { COLORS, FONTS, FONT_SIZES } from '../constants/theme';

export const globalStyles = StyleSheet.create({
  // Contenedores base
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },

  // Textos
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
  title: {
    fontFamily: FONTS.heading,
    fontSize: FONT_SIZES.xl,
    color: COLORS.text,
    marginBottom: 16,
  },
  label: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray,
    marginBottom: 4,
  },
  value: {
    fontFamily: FONTS.heading,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },

  // Botones
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

  // Tarjetas y contenedores
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoItem: {
    marginBottom: 16,
  },
});