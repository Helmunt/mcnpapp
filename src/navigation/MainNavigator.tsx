import React from 'react';
import { Platform, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Users, Award, Calendar } from 'lucide-react-native';
import { COLORS, FONTS, FONT_SIZES } from '../constants/theme';
import { Header } from '../components/shared/Header';
import { useUser } from '../context/UserContext';

import { HomeScreen } from '../screens/Home/HomeScreen';
import { SocialScreen } from '../screens/Social/SocialScreen';
import { CertificatesScreen } from '../screens/Congress/screens/CertificatesScreen';
import { CongressNavigator } from './congress/CongressNavigator';

const Tab = createBottomTabNavigator();

interface MainNavigatorProps {
  hideHeader?: boolean;
}

export const MainNavigator = ({ hideHeader = false }: MainNavigatorProps) => {
  const { userName } = useUser();
  
  return (
    <View style={{ flex: 1 }}>
      {!hideHeader && <Header />}
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            backgroundColor: COLORS.white,
            borderTopColor: COLORS.lightGray,
            height: Platform.OS === 'ios' ? 90 : 60,
            paddingBottom: Platform.OS === 'ios' ? 30 : 10,
            paddingTop: 10,
            ...Platform.select({
              android: {
                elevation: 8,
              },
              ios: {
                shadowColor: COLORS.black,
                shadowOffset: {
                  width: 0,
                  height: -2,
                },
                shadowOpacity: 0.15,
                shadowRadius: 4,
              },
            }),
          },
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.gray,
          tabBarLabelStyle: {
            fontFamily: FONTS.body,
            fontSize: FONT_SIZES.xs,
            marginTop: 5,
          },
          headerStyle: {
            backgroundColor: COLORS.white,
          },
          headerTintColor: COLORS.text,
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color }) => <Home size={24} color={color} strokeWidth={1.5} />,
            title: 'Inicio',
          }}
        />
        <Tab.Screen
          name="Social"
          component={SocialScreen}
          options={{
            tabBarIcon: ({ color }) => <Users size={24} color={color} strokeWidth={1.5} />,
            title: 'Muro MCNP',
          }}
        />
        <Tab.Screen
          name="Certificates"
          component={CertificatesScreen}
          options={{
            tabBarIcon: ({ color }) => <Award size={24} color={color} strokeWidth={1.5} />,
            title: 'Certificados',
          }}
        />
        <Tab.Screen
          name="Congress"
          component={CongressNavigator}
          options={{
            tabBarIcon: ({ color }) => <Calendar size={24} color={color} strokeWidth={1.5} />,
            title: 'Congreso',
          }}
        />
      </Tab.Navigator>
    </View>
  );
};