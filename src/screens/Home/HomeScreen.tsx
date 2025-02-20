import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Text } from 'react-native';
import { Calendar, Users, BookOpen, Award } from 'lucide-react-native';
import { COLORS, FONTS, FONT_SIZES } from '../../constants/theme';
import { MainNavigationProp } from '../../types/navigation';

interface MenuItemProps {
  icon: any;
  title: string;
  onPress: () => void;
}

const MenuItem = ({ icon: Icon, title, onPress }: MenuItemProps) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.iconContainer}>
      <Icon size={32} color={COLORS.primary} strokeWidth={1.5} />
    </View>
    <Text style={styles.menuText}>{title}</Text>
  </TouchableOpacity>
);

export const HomeScreen = ({ navigation }: { navigation: MainNavigationProp }) => {
  return (
    <View style={styles.container}>
      <View style={styles.menuGrid}>
        <MenuItem
          icon={Calendar}
          title="Congreso 2025"
          onPress={() => navigation.navigate('Congress', { screen: 'CongressHome' })}
        />
        <MenuItem
          icon={Users}
          title="Ponentes"
          onPress={() => navigation.navigate('Congress', { screen: 'CongressSpeakers' })}
        />
        <MenuItem
          icon={Award}
          title="Certificados"
          onPress={() => navigation.navigate('Certificates')}
        />
        <MenuItem
          icon={BookOpen}
          title="Mapa del Sitio"
          onPress={() => navigation.navigate('Congress', { screen: 'CongressMap' })}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  menuGrid: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 40 : 60,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
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