import React from 'react';
import { View, StyleSheet } from 'react-native';
import WebView from 'react-native-webview';
import { COLORS } from '../../../constants/theme';

export const AgendaScreen = () => {
  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: 'https://mcnpmexico.org/agenda-congreso/' }}
        style={styles.webview}
        startInLoadingState={true}
        scalesPageToFit={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
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
  },
});