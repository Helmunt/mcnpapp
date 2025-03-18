import React, { useState, useRef } from 'react';
import { 
  View, 
  ActivityIndicator, 
  StyleSheet, 
  Platform, 
  TouchableOpacity,
  Text,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import WebView from 'react-native-webview';
import Feather from '@expo/vector-icons/Feather';

import { COLORS } from '../../constants/theme';
import { globalStyles } from '../../styles/global';

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const webViewRef = useRef<WebView>(null);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const cssRules = `
    header,
    footer#colophon,
    .site-footer,
    .elementor-113,
    [data-elementor-type="footer"],
    .elementor-social-icons-wrapper,
    .elementor-element-167c473,
    .elementor-element-7b21b5a,
    .elementor-element-b920cf3,
    .elementor-element-ff53689,
    div[data-id="9dd49e9"],
    .woocommerce-breadcrumb,
    .social-icons-container,
    div[data-elementor-type="header"],
    div[data-elementor-type="footer"] {
      display: none !important;
      height: 0 !important;
      min-height: 0 !important;
      padding: 0 !important;
      margin: 0 !important;
    }

    body {
      padding-top: 20px !important;
    }
  `;

  const injectedScript = `
    (function() {
      const style = document.createElement('style');
      style.type = 'text/css';
      style.appendChild(document.createTextNode(\`${cssRules}\`));
      document.head.appendChild(style);
    })();
    true;
  `;

  const iosPreloadScript = `
    document.addEventListener('DOMContentLoaded', function() {
      var style = document.createElement('style');
      style.textContent = \`${cssRules}\`;
      document.head.appendChild(style);
    });
    true;
  `;

  const handleNavigationStateChange = (navState: any) => {
    if (navState.url.includes('/my-account/') && !navState.url.includes('/lost-password/')) {
      navigation.goBack();
    }
  };

  const handleError = (error: any) => {
    setHasError(true);
    setErrorMessage('No se pudo cargar la página. Por favor, verifica tu conexión a internet.');
  };

  const handleReload = () => {
    setHasError(false);
    setErrorMessage('');
    webViewRef.current?.reload();
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../assets/images/Logo.png')} 
        style={styles.logo}
      />
      <Text style={styles.screenTitle}>Restablecer Contraseña</Text>

      {!hasError ? (
        <>
          <WebView
            ref={webViewRef}
            source={{ 
              uri: 'https://mcnpmexico.org/my-account/lost-password/',
              headers: {
                'Cache-Control': 'no-cache'
              }
            }}
            style={[styles.webview, isLoading && styles.hiddenWebview]}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            onError={handleError}
            onNavigationStateChange={handleNavigationStateChange}
            startInLoadingState={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            cacheEnabled={false}
            injectedJavaScript={Platform.OS === 'android' ? injectedScript : undefined}
            injectedJavaScriptBeforeContentLoaded={Platform.OS === 'ios' ? iosPreloadScript : undefined}
            userAgent={Platform.OS === 'ios' ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1' : undefined}
            mediaPlaybackRequiresUserAction={true}
            androidLayerType={Platform.OS === 'android' ? 'hardware' : undefined}
          />

          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          )}
        </>
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity style={styles.reloadButton} onPress={handleReload}>
            <Text style={styles.reloadButtonText}>Intentar nuevamente</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity 
        style={globalStyles.floatingBackButton} 
        onPress={handleGoBack}
      >
        <Feather name="arrow-left" size={24} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  logo: {
    width: 350,
    height: 180,
    resizeMode: 'contain',
    marginBottom: 10,
    marginTop: Platform.OS === 'ios' ? 60 : 40,
    alignSelf: 'center',
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  webview: {
    flex: 1,
    opacity: 1,
  },
  hiddenWebview: {
    opacity: 0,
  },
  loadingContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: COLORS.text,
  },
  reloadButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  reloadButtonText: {
    color: COLORS.white,
    fontSize: 16,
  },
});

export default ForgotPassword;
