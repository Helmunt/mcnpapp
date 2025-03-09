import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BuddyPressWebView, { BuddyPressWebViewRef } from '../../components/shared/BuddyPressWebView';
import { COLORS } from '../../constants/theme';
import { RootStackParamList } from '../../types/navigation';
import { setActiveBuddyPressWebViewRef } from '../../components/shared/Header';

// Definimos el tipo de navegación
type RootStackNavProp = NativeStackNavigationProp<RootStackParamList>;

export const SocialScreen = () => {
  const webViewRef = useRef<BuddyPressWebViewRef>(null);
  const navigation = useNavigation<RootStackNavProp>();
  
  // Registramos el WebView con el Header al montar el componente
  useEffect(() => {
    if (webViewRef.current) {
      setActiveBuddyPressWebViewRef(webViewRef.current);
    }
    
    // Limpieza al desmontar
    return () => {
      setActiveBuddyPressWebViewRef(null);
    };
  }, []);
  
  const handleNavigationChange = (event: any) => {
    console.log('WebView navigation change:', event.url);
  };

  return (
    <View style={styles.container}>
      <BuddyPressWebView 
        ref={webViewRef}
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
  }
});

export default SocialScreen;