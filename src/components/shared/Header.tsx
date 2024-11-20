import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
import { Bell, User } from 'lucide-react-native';
import { COLORS, FONTS, FONT_SIZES } from '../../constants/theme';
import { useUser } from '../../context/UserContext';

const NotificationBadge = ({ count }: { count: number }) => (
  <View style={styles.badgeContainer}>
    <View style={styles.notificationBadge}>
      <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
    </View>
    <View style={styles.badgePulse} />
  </View>
);

export const Header = () => {
  const { userName } = useUser();
  const notificationCount = 5;

  return (
    <View style={styles.headerContainer}>
      <View style={styles.header}>
        <Image 
          source={require('../../assets/images/Logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.greeting}>Hola {userName}</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: COLORS.white,
    ...Platform.select({
      android: {
        elevation: 8,
      },
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
    }),
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
    height: 40,
    width: 100,
  },
  greeting: {
    fontFamily: FONTS.heading,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    position: 'relative',
    padding: 8,
  },
  badgeContainer: {
    position: 'absolute',
    top: 2,
    right: 2,
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
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
  },
});