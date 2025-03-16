import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { COLORS, FONTS, FONT_SIZES } from '../../../constants/theme';

const EmptyNotifications: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Feather name="bell-off" size={64} color={COLORS.lightGray} />
      </View>
      <Text style={styles.title}>No hay notificaciones</Text>
      <Text style={styles.subtitle}>
        Aquí aparecerán alertas sobre el congreso, actualizaciones de la app y mensajes importantes.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconContainer: {
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.lightGray,
  },
  title: {
    fontFamily: FONTS.heading,
    fontSize: FONT_SIZES.xl,
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.md,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default EmptyNotifications;