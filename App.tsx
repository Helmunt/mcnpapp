import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { LoginScreen } from './src/screens/Auth/Login';
import { MainNavigator } from './src/navigation/MainNavigator';
import { useFonts } from './src/hooks/useFonts';
import { COLORS } from './src/constants/theme';
import { RootStackParamList } from './src/types/navigation';
import { UserProvider } from './src/context/UserContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const fontsLoaded = useFonts();

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
            headerStyle: {
              backgroundColor: COLORS.primary,
            },
            headerTintColor: COLORS.white,
            headerTitleStyle: {
              fontFamily: 'Questrial',
            },
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Main" component={MainNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}