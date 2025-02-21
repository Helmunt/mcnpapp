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
    // Header y navegación 
    headerContainer: {
      backgroundColor: COLORS.primary,
      paddingTop: Platform.OS === 'ios' ? 48 : 16,
      paddingBottom: 16,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    headerTitle: {
      color: COLORS.white,
      fontFamily: FONTS.heading,
      fontSize: FONT_SIZES.lg,
      fontWeight: '600',
    },
    backButton: {
      padding: 8,
      marginRight: 16,
    },
    // Titulos del cada una de las páginas y botón flotante
    titleContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: COLORS.white,
    },
    pageTitle: {
      fontSize: FONT_SIZES.xl,
      fontFamily: FONTS.heading,
      color: COLORS.primary,
      textAlign: 'center',
    },
    floatingBackButton: {
      position: 'absolute',
      bottom: 24,
      left: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: COLORS.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 6,
      zIndex: 999,
    }
});