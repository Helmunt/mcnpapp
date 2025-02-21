import React from 'react';
import { Platform, View, TouchableOpacity, GestureResponderEvent } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, Users, Award, Calendar } from 'lucide-react-native';
import { COLORS, FONTS, FONT_SIZES } from '../constants/theme';
import { Header } from '../components/shared/Header';

import { HomeScreen } from '../screens/Home/HomeScreen';
import { SocialScreen } from '../screens/Social/SocialScreen';
import { CertificatesScreen } from '../screens/Congress/screens/CertificatesScreen';
import { CongressNavigator } from './congress/CongressNavigator';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabBarButton = ({ children, onPress }: { children: React.ReactNode; onPress?: (event: GestureResponderEvent) => void }) => (
  <TouchableOpacity
    activeOpacity={0.7}
    onPress={onPress}
    style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
  >
    {children}
  </TouchableOpacity>
);

// ✅ Tab Navigator con Header en todas las pantallas
const TabsNavigator = () => {
  return (
    <View style={{ flex: 1 }}>
      <Header /> 
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            backgroundColor: COLORS.white,
            borderTopColor: COLORS.lightGray,
            height: Platform.OS === 'ios' ? 90 : 60,
            paddingBottom: Platform.OS === 'ios' ? 30 : 10,
            paddingTop: 10,
            ...Platform.select({
              android: { elevation: 8 },
              ios: {
                shadowColor: COLORS.black,
                shadowOffset: { width: 0, height: -2 },
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
          headerShown: false, // ❌ Ocultamos el header del navegador para usar el personalizado
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color }) => <Home size={24} color={color} strokeWidth={1.5} />,
            tabBarButton: (props) => <TabBarButton {...props} />,
          }}
        />
        <Tab.Screen
          name="Social"
          component={SocialScreen}
          options={{
            tabBarIcon: ({ color }) => <Users size={24} color={color} strokeWidth={1.5} />,
            tabBarButton: (props) => <TabBarButton {...props} />,
          }}
        />
        <Tab.Screen
          name="Certificates"
          component={CertificatesScreen}
          options={{
            tabBarIcon: ({ color }) => <Award size={24} color={color} strokeWidth={1.5} />,
            tabBarButton: (props) => <TabBarButton {...props} />,
          }}
        />
        <Tab.Screen
          name="Congress"
          component={CongressNavigator}
          options={{
            tabBarIcon: ({ color }) => <Calendar size={24} color={color} strokeWidth={1.5} />,
            tabBarButton: (props) => <TabBarButton {...props} />,
          }}
        />
      </Tab.Navigator>
    </View>
  );
};

// ✅ Main Navigator con Header y Profile dentro del mismo flujo
const MainNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabsNavigator} />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ 
          headerShown: false,
          animation: 'slide_from_right', 
          presentation: 'card'
        }}
      />
    </Stack.Navigator>
  );
};

export { MainNavigator };