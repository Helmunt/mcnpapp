import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
      <Icon size={32} color={COLORS.primary} />
    </View>
    <Text style={styles.menuText}>{title}</Text>
  </TouchableOpacity>
);



export const HomeScreen = ({ navigation }: { navigation: MainNavigationProp }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MCNP</Text>
        {/* TODO: Agregar iconos de notificaciones */}
      </View>

      <View style={styles.menuGrid}>
        <MenuItem
          icon={Calendar}
          title="Agenda del Congreso"
          onPress={() => console.log('Agenda')}
        />
        <MenuItem
          icon={Users}
          title="Ponentes"
          onPress={() => console.log('Ponentes')}
        />
        <MenuItem
          icon={Award}
          title="Certificados"
          onPress={() => navigation.navigate('Certificates')}
        />
        <MenuItem
          icon={BookOpen}
          title="Mapa del Sitio"
          onPress={() => console.log('Mapa')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomColor: COLORS.lightGray,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontFamily: FONTS.heading,
    fontSize: FONT_SIZES['2xl'],
    color: COLORS.text,
  },
  menuGrid: {
    flex: 1,
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'flex-start',
  },
  menuItem: {
    width: '45%',
    aspectRatio: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    marginBottom: 12,
  },
  menuText: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    textAlign: 'center',
  },
});