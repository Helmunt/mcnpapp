import React, { useState, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import WebView from 'react-native-webview';
import { COLORS } from '../../../constants/theme';

export const SpeakersScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const webViewRef = useRef(null);

  // CSS para ocultar elementos no deseados del sitio web
  const cssRules = `
    div.site-header-wrapper,
    header#masthead,
    div.elementor-location-header,
    .site-header {
      display: none !important;
      height: 0 !important;
      min-height: 0 !important;
      padding: 0 !important;
      margin: 0 !important;
    }
    body {
      padding-top: 0 !important;
      margin-top: 0 !important;
    }
  `;

  // Script para Android
  const injectedScript = `
    (function() {
      const style = document.createElement('style');
      style.type = 'text/css';
      style.appendChild(document.createTextNode(\`${cssRules}\`));
      document.head.appendChild(style);
    })();
    true;
  `;

  // Script para iOS
  const userScript = {
    source: `
      var style = document.createElement('style');
      style.type = 'text/css';
      style.innerHTML = \`${cssRules}\`;
      document.documentElement.appendChild(style);
    `,
    injectionTime: 'beforeContentLoaded',
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ 
          uri: 'https://mcnpmexico.org/ponentes/',
          headers: {
            'Cache-Control': 'no-cache'
          }
        }}
        style={[styles.webview, isLoading && styles.hiddenWebview]}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        startInLoadingState={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scalesPageToFit={true}
        cacheEnabled={false}
        injectedJavaScript={Platform.OS === 'android' ? injectedScript : undefined}
        userAgent={Platform.OS === 'ios' ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1' : undefined}
        injectedJavaScriptBeforeContentLoaded={Platform.OS === 'ios' ? userScript.source : undefined}
      />
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
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
  }
});