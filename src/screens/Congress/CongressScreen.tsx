import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { COLORS } from '../../constants/theme';
import { MenuItem } from './components/MenuItem';
import type { CongressNavigationProp } from '../../types/navigation';

interface Props {
  navigation: CongressNavigationProp;
}

export const CongressScreen = ({ navigation }: Props) => {
  return (
    <View style={styles.container}>
      <View style={styles.menuGrid}>
        <MenuItem
          iconName="calendar"
          title="Agenda del Congreso"
          onPress={() => navigation.navigate('CongressAgenda')}
        />
        <MenuItem
          iconName="users"
          title="Ponentes"
          onPress={() => navigation.navigate('CongressSpeakers')}
        />
        <MenuItem
          iconName="award"
          title="Certificados"
          onPress={() => navigation.navigate('CongressCertificates')}
        />
        <MenuItem
          iconName="map"
          title="Mapa del Sitio"
          onPress={() => navigation.navigate('CongressMap')}
        />
        <MenuItem
          iconName="grid"
          title="Código QR"
          onPress={() => navigation.navigate('CongressQR')}
        />
        <MenuItem
          iconName="book-open"
          title="QUIZ"
          onPress={() => {
            // Modificado: Navegar a la lista de cuestionarios dentro del CongressNavigator
            navigation.navigate('QuizzesList');
          }}
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
    alignItems: 'flex-start',
  },
});
