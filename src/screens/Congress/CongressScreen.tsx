import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Calendar, Users, Award, Map, QrCode, BookOpen } from 'lucide-react-native';
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
          icon={Calendar}
          title="Agenda del Congreso"
          onPress={() => navigation.navigate('CongressAgenda')}
        />
        <MenuItem
          icon={Users}
          title="Ponentes"
          onPress={() => navigation.navigate('CongressSpeakers')}
        />
        <MenuItem
          icon={Award}
          title="Certificados"
          onPress={() => navigation.navigate('CongressCertificates')}
/>
        <MenuItem
          icon={Map}
          title="Mapa del Sitio"
          onPress={() => navigation.navigate('CongressMap')}
        />
        <MenuItem
          icon={QrCode}
          title="Código QR"
          onPress={() => navigation.navigate('CongressQR')}
        />
        <MenuItem
          icon={BookOpen}
          title="QUIZ"
          onPress={() => navigation.navigate('CongressQuiz')}
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