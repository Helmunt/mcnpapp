// src/screens/Social/SocialScreen.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BuddyPressWebView from '../../components/shared/BuddyPressWebView';
import { COLORS } from '../../constants/theme';

export const SocialScreen = () => {
  const navigation = useNavigation();

  const handleNavigationChange = (event: any) => {
    // Opcional: puedes manejar cambios de navegación aquí si es necesario
    console.log('WebView navigation change:', event.url);
  };

  return (
    <View style={styles.container}>
      <BuddyPressWebView 
        defaultSection="activity"
        onNavigationStateChange={handleNavigationChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
});

export default SocialScreen;