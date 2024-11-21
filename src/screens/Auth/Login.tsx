import React, { useState, useEffect } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { Formik, FormikProps } from 'formik';
import * as Yup from 'yup';
import { Eye, EyeOff } from 'lucide-react-native';
import { COLORS, FONTS, FONT_SIZES } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useUser } from '../../context/UserContext';

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
  const { state, login } = useAuth();
  const { setUserName } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Efecto para manejar la navegación cuando el usuario está autenticado
  useEffect(() => {
    if (state.isAuthenticated && state.user) {
      setUserName(state.user.firstName);
      navigation.navigate('Main' as never);
    }
  }, [state.isAuthenticated, state.user]);

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      setLoginError(null);
      await login(values.email, values.password);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Error de autenticación');
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
            <Image source={require('../../assets/images/Logo.png')} style={styles.logo} />      

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
                editable={!state.isLoading}
              />
              {touched.email && errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

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
                  editable={!state.isLoading}
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

            {/* Mostrar error del estado o error local */}
            {(state.error || loginError) && (
              <Text style={styles.errorMessage}>{state.error || loginError}</Text>
            )}

            <TouchableOpacity
              style={[styles.loginButton, state.isLoading && styles.loginButtonDisabled]}
              onPress={() => handleSubmit()}
              disabled={state.isLoading}
            >
              {state.isLoading ? (
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
  // ... mantener todos los estilos existentes sin cambios
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: Platform.OS === 'ios' ? 40 : 20,
  },
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
  input: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 25,
    padding: 20,
    paddingHorizontal: 24,
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    borderWidth: 0,
  },
  passwordInput: {
    flex: 1,
    paddingRight: 50,
  },
  inputError: {
    borderWidth: 1,
    borderColor: COLORS.error,
  },
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
  eyeIcon: {
    position: 'absolute',
    right: 16,
    padding: 8,
    backgroundColor: 'transparent',
    borderRadius: 20,
  },
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
  errorMessage: {
    color: COLORS.error,
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    marginVertical: 10,
    fontFamily: FONTS.body,
    padding: 15,
    backgroundColor: 'rgba(255, 0, 0, 0.08)',
    borderRadius: 8,
    // Eliminar las etiquetas HTML del mensaje
    transform: [{ translateY: -10 }] // Ajusta la posición vertical
  },
});