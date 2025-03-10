import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Text } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import type { IconProps } from '@expo/vector-icons/build/createIconSet';
import { COLORS, FONTS, FONT_SIZES } from '../../constants/theme';
import { MainNavigationProp } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import { AppSection, hasAccessToSection, getAccessDeniedMessage } from '../../services/permissionService';
import AccessRestrictedModal from '../../components/shared/AccessRestrictedModal';

const iconMap = {
  Calendar: 'calendar',
  Users: 'users',
  BookOpen: 'book-open',
  Newspaper: 'file-text',
} as const;

type IconNameType = keyof typeof iconMap;

interface MenuItemProps {
  iconName: IconNameType;
  title: string;
  onPress: () => void;
  section?: AppSection;
}

const MenuItem = ({ iconName, title, onPress, section }: MenuItemProps) => {
  const { state } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);

  const handlePress = () => {
    if (!section || hasAccessToSection(state.user?.role, section)) {
      onPress();
    } else {
      setModalVisible(true);
    }
  };

  return (
    <>
      <TouchableOpacity style={styles.menuItem} onPress={handlePress}>
        <View style={styles.iconContainer}>
          <Feather name={iconMap[iconName]} size={32} color={COLORS.primary} />
        </View>
        <Text style={styles.menuText}>{title}</Text>
      </TouchableOpacity>

      {section && (
        <AccessRestrictedModal
          isVisible={modalVisible}
          message={getAccessDeniedMessage(section)}
          onClose={() => setModalVisible(false)}
        />
      )}
    </>
  );
};

export const HomeScreen = ({ navigation }: { navigation: MainNavigationProp }) => {
  return (
    <View style={styles.container}>
      <View style={styles.menuGrid}>
        <MenuItem
          iconName="Calendar"
          title="Congreso 2025"
          onPress={() => navigation.navigate('Congress', { screen: 'CongressHome' })}
          section={AppSection.CONGRESS}
        />
        <MenuItem
          iconName="Users"
          title="Ponentes"
          onPress={() => navigation.navigate('Congress', { screen: 'CongressSpeakers' })}
          section={AppSection.CONGRESS}
        />
        <MenuItem
          iconName="Newspaper"
          title="Newsletter"
          onPress={() => navigation.navigate('Newsletter', { screen: 'NewsletterMain' })}
        />
        <MenuItem
          iconName="BookOpen"
          title="Mapa del Sitio"
          onPress={() => navigation.navigate('Congress', { screen: 'CongressMap' })}
          section={AppSection.CONGRESS}
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
