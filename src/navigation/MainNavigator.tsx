import React, { useState } from 'react';
import { 
  Platform, 
  View, 
  TouchableOpacity, 
  GestureResponderEvent, 
  Text, 
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import Feather from '@expo/vector-icons/Feather';
import { COLORS, FONTS, FONT_SIZES } from '../constants/theme';
import Header from '../components/shared/Header';
import { useAuth } from '../context/AuthContext';
import { AppSection, hasAccessToSection, getAccessDeniedMessage } from '../services/permissionService';
import AccessRestrictedModal from '../components/shared/AccessRestrictedModal';
import useNotifications from '../hooks/useNotifications';

import { HomeScreen } from '../screens/Home/HomeScreen';
import { SocialScreen } from '../screens/Social/SocialScreen';
import { NewsletterScreen } from '../screens/Newsletter/NewsletterScreen';
import { CongressNavigator } from './congress/CongressNavigator';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';
import NotificationsScreen from '../screens/Notifications/NotificationsScreen';
import {
  MainStackParamList,
  MainTabParamList,
  SocialStackParamList,
  NewsletterStackParamList,
  ProfileStackParamList
} from '../types/navigation';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<MainStackParamList>();
const SocialStack = createNativeStackNavigator<SocialStackParamList>();
const NewsletterStack = createNativeStackNavigator<NewsletterStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

const ProtectedTabScreen = ({ children, section }: { children: React.ReactNode, section: AppSection }) => {
  const { state } = useAuth();
  const [showModal, setShowModal] = useState(!hasAccessToSection(state.user?.role, section));

  if (showModal) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.white }}>
        <AccessRestrictedModal
          isVisible={showModal}
          message={getAccessDeniedMessage(section)}
          onClose={() => setShowModal(false)}
        />
      </View>
    );
  }

  return <>{children}</>;
};

const ProtectedTabButton = ({
  children,
  onPress,
  section,
}: {
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  section?: AppSection;
}) => {
  const { state } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);

  const handlePress = (event: GestureResponderEvent) => {
    if (!section || hasAccessToSection(state.user?.role, section)) {
      if (onPress) onPress(event);
    } else {
      setModalVisible(true);
    }
  };

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handlePress}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      >
        {children}
      </TouchableOpacity>

      {section && (
        <AccessRestrictedModal
          isVisible={modalVisible}
          message={getAccessDeniedMessage(section)}
          onClose={() => setModalVisible(false)}
        />
      )}
    </>
  );
};

const TabBarButton = ({
  children,
  onPress,
}: {
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
}) => (
  <TouchableOpacity
    activeOpacity={0.7}
    onPress={onPress}
    style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
  >
    {children}
  </TouchableOpacity>
);

// Este nombre de componente puede causar conflictos si ya existe en otros archivos
const NavigatorCustomHeader = ({
  title,
  navigation,
}: {
  title: string;
  navigation: any;
}) => {
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Feather name="arrow-left" size={20} color={COLORS.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
};

const SocialNavigator = () => {
  return (
    <SocialStack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: COLORS.white,
        },
        headerShadowVisible: false,
        headerBackVisible: false,
      }}
    >
      <SocialStack.Screen
        name="SocialMain"
        component={SocialScreen}
        options={({ navigation }) => ({
          header: () => <NavigatorCustomHeader title="Social" navigation={navigation} />,
        })}
      />
    </SocialStack.Navigator>
  );
};

const NewsletterNavigator = () => {
  return (
    <NewsletterStack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: COLORS.white,
        },
        headerShadowVisible: false,
        headerBackVisible: false,
      }}
    >
      <NewsletterStack.Screen
        name="NewsletterMain"
        component={NewsletterScreen}
        options={({ navigation }) => ({
          header: () => <NavigatorCustomHeader title="Newsletter" navigation={navigation} />,
        })}
      />
    </NewsletterStack.Navigator>
  );
};

const ProfileNavigator = () => {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: COLORS.white,
        },
        headerShadowVisible: false,
        headerBackVisible: false,
      }}
    >
      <ProfileStack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={({ navigation }) => ({
          header: () => <NavigatorCustomHeader title="Mi Perfil" navigation={navigation} />,
        })}
      />
    </ProfileStack.Navigator>
  );
};

const ProtectedCongressNavigator = () => {
  return (
    <ProtectedTabScreen section={AppSection.CONGRESS}>
      <CongressNavigator />
    </ProtectedTabScreen>
  );
};

const TabsNavigator = () => {
  // Usar el hook de notificaciones para obtener el conteo
  const { unreadCount } = useNotifications();

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
          tabBarItemStyle: {
            flex: 1,
          },
          headerShown: true,
          headerStyle: {
            backgroundColor: COLORS.white,
            shadowColor: 'transparent',
            elevation: 0,
          },
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '600',
            color: COLORS.primary,
            fontFamily: FONTS.heading,
          },
          headerTitleAlign: 'center',
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Inicio',
            tabBarIcon: ({ color }) => <Feather name="home" size={24} color={color} strokeWidth={1.5} />,
            tabBarButton: (props) => <TabBarButton {...props} />,
          }}
        />
        <Tab.Screen
          name="Social"
          component={SocialNavigator}
          options={{
            headerShown: false,
            tabBarIcon: ({ color }) => <Feather name="users" size={24} color={color} strokeWidth={1.5} />,
            tabBarButton: (props) => <TabBarButton {...props} />,
          }}
        />
        <Tab.Screen
          name="Newsletter"
          component={NewsletterNavigator}
          options={{
            headerShown: false,
            tabBarIcon: ({ color }) => <Feather name="file-text" size={24} color={color} strokeWidth={1.5} />,
            tabBarButton: (props) => <TabBarButton {...props} />,
          }}
        />
        <Tab.Screen
          name="Congress"
          component={ProtectedCongressNavigator}
          options={{
            headerShown: false,
            tabBarIcon: ({ color }) => <Feather name="calendar" size={24} color={color} strokeWidth={1.5} />,
            tabBarButton: (props) => (
              <ProtectedTabButton {...props} section={AppSection.CONGRESS} />
            ),
          }}
        />
      </Tab.Navigator>
    </View>
  );
};

const MainNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MainTabs" component={TabsNavigator} />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          headerShown: false,
        }}
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
    marginRight: 28,
  },
});

export { MainNavigator };