import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
import { Calendar, Users, BookOpen, Award, Bell, User } from 'lucide-react-native';
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

const NotificationBadge = ({ count }: { count: number }) => (
  <View style={styles.badgeContainer}>
    <View style={styles.notificationBadge}>
      <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
    </View>
    <View style={styles.badgePulse} />
  </View>
);

const Header = () => {
  const notificationCount = 5; // Esto después vendrá de tu sistema de notificaciones

  return (
    <View style={styles.header}>
      <Image 
        source={require('../../assets/images/LogoSimplificado.png')} 
        style={styles.logo}
        resizeMode="contain"
      />
      <View style={styles.headerRight}>
        <TouchableOpacity 
          style={styles.headerIcon}
          onPress={() => console.log('Notifications')}
        >
          <Bell size={24} color={COLORS.primary} strokeWidth={1.5} />
          <NotificationBadge count={notificationCount} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.userInfo}
          onPress={() => console.log('Profile')}
        >
          <User size={24} color={COLORS.primary} strokeWidth={1.5} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const HomeScreen = ({ navigation }: { navigation: MainNavigationProp }) => {
  return (
    <View style={styles.container}>
      <Header />
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
    backgroundColor: COLORS.white,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderBottomColor: COLORS.lightGray,
    borderBottomWidth: 1,
    marginTop: Platform.OS === 'ios' ? 0 : 20,
  },
  logo: {
    height: 30,
    width: 100,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    position: 'relative',
    padding: 8, 
    marginRight: 8,
  },
  badgeContainer: {
    position: 'absolute',
    top: 2,
    right: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },  
  notificationBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.error,
    borderWidth: 1.5,
    borderColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    zIndex: 1,
    elevation: 4, // Para Android
    shadowColor: COLORS.error,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: FONTS.body,
  },
  badgePulse: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.error,
    opacity: 0.3,
    zIndex: 0,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
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