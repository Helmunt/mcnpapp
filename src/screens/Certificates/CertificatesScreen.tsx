import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, FONT_SIZES } from '../../constants/theme';

export const CertificatesScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Certificados</Text>
      {/* TODO: Lista de certificados */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  title: {
    fontFamily: FONTS.heading,
    fontSize: FONT_SIZES.xl,
    color: COLORS.text,
    marginBottom: 16,
  },
});