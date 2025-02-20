import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CongressScreen } from '../../screens/Congress/CongressScreen';
import { AgendaScreen } from '../../screens/Congress/screens/AgendaScreen';
import { SpeakersScreen } from '../../screens/Congress/screens/SpeakersScreen';
import { MapScreen } from '../../screens/Congress/screens/MapScreen';
import { QRScreen } from '../../screens/Congress/screens/QRScreen';
import { QuizScreen } from '../../screens/Congress/screens/QuizScreen';
import { CertificatesScreen } from '../../screens/Congress/screens/CertificatesScreen';
import { CongressStackParamList } from '../../types/navigation';
import { COLORS } from '../../constants/theme';

const Stack = createNativeStackNavigator<CongressStackParamList>();

export const CongressNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: COLORS.white,
        },
        headerTintColor: COLORS.primary,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen 
        name="CongressHome" 
        component={CongressScreen}
        options={{ title: 'Congreso 2025' }}
      />
      <Stack.Screen 
        name="CongressAgenda" 
        component={AgendaScreen}
        options={{ title: 'Agenda del Congreso' }}
      />
      <Stack.Screen 
        name="CongressSpeakers" 
        component={SpeakersScreen}
        options={{ title: 'Ponentes' }}
      />
      <Stack.Screen 
        name="CongressMap" 
        component={MapScreen}
        options={{ title: 'Mapa del Sitio' }}
      />
      <Stack.Screen 
        name="CongressQR" 
        component={QRScreen}
        options={{ title: 'Código QR' }}
      />
      <Stack.Screen 
        name="CongressQuiz" 
        component={QuizScreen}
        options={{ title: 'QUIZ' }}
      />
      <Stack.Screen 
        name="CongressCertificates" 
        component={CertificatesScreen}
        options={{ title: 'Certificados' }}
      />
    </Stack.Navigator>
  );
};