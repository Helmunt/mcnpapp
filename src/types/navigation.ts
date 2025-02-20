import { CompositeNavigationProp, NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

// Stack principal
export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  Profile: undefined; 
};

// Stack dentro de Main
export type MainStackParamList = {
  MainTabs: undefined;
  Profile: undefined;
};

// Stack del Congreso
export type CongressStackParamList = {
  CongressHome: undefined;
  CongressAgenda: undefined;
  CongressSpeakers: undefined;
  CongressMap: undefined;
  CongressQR: undefined;
  CongressQuiz: undefined;
  CongressCertificates: undefined;
};

// Tabs principales
export type MainTabParamList = {
  Home: undefined;
  Social: undefined;
  Certificates: undefined;
  Congress: NavigatorScreenParams<CongressStackParamList>;
};

// Tipos de navegación compuestos
export type MainNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList>,
  NativeStackNavigationProp<MainStackParamList>
>;

export type CongressNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<CongressStackParamList>,
  MainNavigationProp
>;