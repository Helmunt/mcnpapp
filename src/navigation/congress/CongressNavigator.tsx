import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft } from 'lucide-react-native';
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

// Interface para las props del CustomHeader
interface CustomHeaderProps {
  title: string;
  navigation: NativeStackNavigationProp<CongressStackParamList>;
}

// Componente personalizado para el header
const CustomHeader = ({ 
  title, 
  navigation 
}: { 
  title: string; 
  navigation: any; // Usamos any temporalmente para resolver el error
}) => {
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity 
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <ArrowLeft size={20} color={COLORS.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
};
export const CongressNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true, // Se asegura que sea booleano explícito
        headerStyle: {
          backgroundColor: COLORS.white,
        },
        headerTintColor: COLORS.primary,
        headerShadowVisible: false,
        headerBackVisible: false,
      }}
    >
      <Stack.Screen 
        name="CongressHome" 
        component={CongressScreen}
        options={({ navigation }) => ({
          header: () => (
            <CustomHeader 
              title="Congreso 2025" 
              navigation={navigation}
            />
          )
        })}
      />
      <Stack.Screen 
        name="CongressAgenda" 
        component={AgendaScreen}
        options={({ navigation }) => ({
          header: () => (
            <CustomHeader 
              title="Agenda del Congreso" 
              navigation={navigation}
            />
          )
        })}
      />
      <Stack.Screen 
        name="CongressSpeakers" 
        component={SpeakersScreen}
        options={({ navigation }) => ({
          header: () => (
            <CustomHeader 
              title="Ponentes" 
              navigation={navigation}
            />
          )
        })}
      />
      <Stack.Screen 
        name="CongressMap" 
        component={MapScreen}
        options={({ navigation }) => ({
          header: () => (
            <CustomHeader 
              title="Mapa del Sitio" 
              navigation={navigation}
            />
          )
        })}
      />
      <Stack.Screen 
        name="CongressQR" 
        component={QRScreen}
        options={({ navigation }) => ({
          header: () => (
            <CustomHeader 
              title="Código QR" 
              navigation={navigation}
            />
          )
        })}
      />
      <Stack.Screen 
        name="CongressQuiz" 
        component={QuizScreen}
        options={({ navigation }) => ({
          header: () => (
            <CustomHeader 
              title="QUIZ" 
              navigation={navigation}
            />
          )
        })}
      />
      <Stack.Screen 
        name="CongressCertificates" 
        component={CertificatesScreen}
        options={({ navigation }) => ({
          header: () => (
            <CustomHeader 
              title="Certificados" 
              navigation={navigation}
            />
          )
        })}
      />
    </Stack.Navigator>
  );
};
const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    height: 60,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
    marginRight: 28, // Compensa el espacio del botón de retroceso para un centrado real
  }
});