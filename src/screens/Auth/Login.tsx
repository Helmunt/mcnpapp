import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { authService } from '../../services/auth';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Formik, FormikProps } from 'formik';
import * as Yup from 'yup';
import { COLORS, FONTS, FONT_SIZES } from '../../constants/theme';
import { Eye, EyeOff } from 'lucide-react-native';

interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email inválido')
    .required('El email es requerido'),
  password: Yup.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('La contraseña es requerida')
});

export const LoginScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const handleSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await authService.login(values.email, values.password);
      // Guardar el token
      await AsyncStorage.setItem('userToken', response.token);
      // Navegar a la pantalla principal
      navigation.navigate('Home' as never);  // Tipo 'never' para evitar problemas de tipado
    } catch (error) {
      // Mostrar error al usuario
      Alert.alert('Error', 'Credenciales inválidas');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    style={styles.container}
  >
    <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Formik<LoginFormValues>
          initialValues={{ email: '', password: '', rememberMe: false }}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
        {({ 
          handleChange, 
          handleBlur, 
          handleSubmit, 
          setFieldValue,
          values, 
          errors, 
          touched 
        }: FormikProps<LoginFormValues>) => (
          <View style={styles.formContainer}>
            {/* Logo al inicio del formulario */}
            <Image source={require('../../assets/images/Logo.png')} style={styles.logo} />      

            {/* Campo Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[
                  styles.input,
                  touched.email && errors.email ? styles.inputError : undefined
                ]}
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                placeholder="Ingresa tu email"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
              {touched.email && errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            {/* Campo Contraseña */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.input,
                    styles.passwordInput,
                    touched.password && errors.password ? styles.inputError : undefined
                  ]}
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  placeholder="Ingresa tu contraseña"
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                />
                <TouchableOpacity 
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={24} color={COLORS.gray} />
                  ) : (
                    <Eye size={24} color={COLORS.gray} />
                  )}
                </TouchableOpacity>
              </View>
              {touched.password && errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            {/* Remember Me y Forgot Password */}
            <View style={styles.optionsContainer}>
              <TouchableOpacity 
                style={styles.checkboxContainer}
                onPress={() => setFieldValue('rememberMe', !values.rememberMe)}
              >
                <View style={[
                  styles.checkbox,
                  values.rememberMe && styles.checkboxChecked
                ]} />
                <Text style={styles.checkboxLabel}>Recuérdame</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => console.log('Forgot password')}>
                <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>
            </View>

            {/* Botón de Login */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={() => handleSubmit()}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: Platform.OS === 'ios' ? 40 : 20,
  },
    // Contenedores principales
    formContainer: {
      padding: 24,
      paddingTop: Platform.OS === 'ios' ? 40 : 20,
    },
    logo: {
      width: 350,
      height: 180,
      resizeMode: 'contain',
      marginBottom: 40,
      marginTop: Platform.OS === 'ios' ? 60 : 40,
      alignSelf: 'center',
    },
    inputContainer: {
      marginBottom: 24,
    },
    passwordContainer: {
      position: 'relative',
      flexDirection: 'row',
      alignItems: 'center',
    },
  
    // Estilos de inputs
    input: {
      backgroundColor: COLORS.lightGray,
      borderRadius: 25,
      padding: 20, // Más padding interno
      paddingHorizontal: 24, // Más espacio horizontal
      fontFamily: FONTS.body,
      fontSize: FONT_SIZES.md,
      color: COLORS.text,
      borderWidth: 0,
      //borderColor: COLORS.lightGray,
    },
    passwordInput: {
      flex: 1,
      paddingRight: 50,
    },
    inputError: {
      borderWidth: 1,
      borderColor: COLORS.error,
    },
  
    // Textos y labels
    label: {
      fontFamily: FONTS.body,
      fontSize: FONT_SIZES.sm,
      color: COLORS.text,
      marginBottom: 8,
    },
    errorText: {
      color: COLORS.error,
      fontSize: FONT_SIZES.sm,
      marginTop: 4,
      fontFamily: FONTS.body,
    },
  
    // Iconos y elementos interactivos
    eyeIcon: {
      position: 'absolute',
      right: 16,
      padding: 8,
      backgroundColor: 'transparent', // Fondo transparente
      borderRadius: 20, // Forma circular
    },
  
    // Opciones (Remember me y Forgot password)
    optionsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: 16,
    },
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: COLORS.primary,
      marginRight: 12,
    },
    checkboxChecked: {
      backgroundColor: COLORS.primary,
    },
    checkboxLabel: {
      fontFamily: FONTS.body,
      fontSize: FONT_SIZES.md,
      color: COLORS.text,
    },
    forgotPassword: {
      fontFamily: FONTS.body,
      fontSize: FONT_SIZES.md,
      color: COLORS.primary,
    },
  
    // Botón de login
    loginButton: {
      backgroundColor: COLORS.primary,
      borderRadius: 12,
      padding: 18,
      alignItems: 'center',
      marginTop: 32,
      shadowColor: COLORS.primary,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    loginButtonDisabled: {
      opacity: 0.7,
    },
    loginButtonText: {
      color: COLORS.white,
      fontSize: FONT_SIZES.lg,
      fontFamily: FONTS.heading,
      fontWeight: '600',
    },
});