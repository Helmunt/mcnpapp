import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  // Eliminamos Details ya que no lo usaremos
};

export type MainTabParamList = {
  Home: undefined;
  Social: undefined;
  Certificates: undefined;
  Profile: undefined;
};


export type MainNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, keyof MainTabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;