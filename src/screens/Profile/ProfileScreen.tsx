import React, { useRef, useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Keyboard, KeyboardEvent, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft } from 'lucide-react-native';
import { globalStyles } from '../../styles/global';
import { COLORS } from '../../constants/theme';
import { RootStackParamList } from '../../types/navigation';
import { Header } from '../../components/shared/Header';
import BuddyPressWebView, { BuddyPressWebViewRef } from '../../components/shared/BuddyPressWebView';
import { setActiveBuddyPressWebViewRef } from '../../components/shared/Header';

// Definimos el tipo de navegación
type RootStackNavProp = NativeStackNavigationProp<RootStackParamList>;

export const ProfileScreen = () => {
  const navigation = useNavigation<RootStackNavProp>();
  const webViewRef = useRef<BuddyPressWebViewRef>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Escuchar eventos de teclado (especialmente importante para iOS)
  useEffect(() => {
    // Solo necesitamos esto en iOS
    if (Platform.OS !== 'ios') return;

    // Funciones para manejar eventos de teclado
    const keyboardWillShow = (e: KeyboardEvent) => {
      setKeyboardVisible(true);
      setKeyboardHeight(e.endCoordinates.height);
    };

    const keyboardWillHide = () => {
      setKeyboardVisible(false);
      setKeyboardHeight(0);
    };

    // Suscribirse a eventos de teclado
    const keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', keyboardWillShow);
    const keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', keyboardWillHide);

    // Limpiar suscripciones
    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  // Registramos el WebView con el Header al montar el componente
  useEffect(() => {
    // Pequeño timeout para asegurar que la ref está correctamente establecida
    const timer = setTimeout(() => {
      if (webViewRef.current) {
        console.log('[ProfileScreen] Registrando WebView con Header');
        setActiveBuddyPressWebViewRef(webViewRef.current);
      }
    }, 300);
    
    // Limpieza al desmontar
    return () => {
      clearTimeout(timer);
      console.log('[ProfileScreen] Limpiando registro de WebView');
      setActiveBuddyPressWebViewRef(null);
    };
  }, []);

  // Método seguro para navegar al Home
  const handleGoToHome = () => {
    // Si tenemos la referencia, usamos navegación segura
    if (webViewRef.current) {
      console.log('[ProfileScreen] Navegando de forma segura a Home');
      webViewRef.current.navigateSafely('Main', {
        screen: 'MainTabs',
        params: {
          screen: 'Home',
        },
      });
    } else {
      // Fallback a navegación normal
      console.log('[ProfileScreen] Navegando normalmente a Home (WebView ref no disponible)');
      navigation.navigate('Main', {
        screen: 'MainTabs',
        params: {
          screen: 'Home',
        },
      });
    }
  };

  const handleNavigationChange = (event: any) => {
    // Opcional: puedes manejar cambios de navegación aquí si es necesario
    console.log('Profile WebView navigation change:', event.url);
  };

  // Calcular la posición del botón de retroceso basada en el estado del teclado
  const backButtonStyle = Platform.OS === 'ios' && keyboardVisible 
    ? {
        ...styles.floatingBackButtonWithKeyboard,
        bottom: keyboardHeight + 20, // Ajustamos para que esté encima del teclado
      }
    : globalStyles.floatingBackButton;

  return (
    <View style={styles.container}>
      <Header />
      
      <View style={styles.webViewContainer}>
        <BuddyPressWebView 
          ref={webViewRef}
          defaultSection="profile"
          onNavigationStateChange={handleNavigationChange}
        />

        <TouchableOpacity 
          style={backButtonStyle}
          onPress={handleGoToHome}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white
  },
  webViewContainer: {
    flex: 1,
    position: 'relative'
  },
  // Estilo específico para cuando el teclado está visible, conservando la posición izquierda
  floatingBackButtonWithKeyboard: {
    position: 'absolute',
    left: 20, // Mantiene el botón a la izquierda
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  }
});

export default ProfileScreen;