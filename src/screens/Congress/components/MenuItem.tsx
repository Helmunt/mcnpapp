import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { COLORS, FONTS, FONT_SIZES } from '../../../constants/theme';

export type FeatherIconName = keyof typeof Feather.glyphMap;

interface MenuItemProps {
  iconName: FeatherIconName;
  title: string;
  onPress: () => void;
}

export const MenuItem = ({ iconName, title, onPress }: MenuItemProps) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.iconContainer}>
      <Feather name={iconName} size={32} color={COLORS.primary} strokeWidth={1.5} />
    </View>
    <Text style={styles.menuText}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  menuItem: {
    width: '46%',
    aspectRatio: 1.2,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  iconContainer: {
    marginBottom: 16,
  },
  menuText: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 4,
  },
});