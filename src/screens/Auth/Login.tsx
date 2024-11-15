import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Formik, FormikProps } from 'formik';
import * as Yup from 'yup';
import { Image } from 'react-native';
import { COLORS, FONTS, FONT_SIZES } from '../../constants/theme';
import { Eye, EyeOff } from 'lucide-react-native'; // Para los iconos de mostrar/ocultar contraseña

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
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const handleSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      // Aquí irá la lógica de autenticación
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulación de llamada API
      console.log('Login success:', values);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
  );
};

const styles = StyleSheet.create({
    // Contenedores principales
    formContainer: {
      padding: 20,
    },
    logo: {
      width: 280, // Ajusta el tamaño a 180 para hacerlo más grande
      height: 280,
      resizeMode: 'contain',
      marginBottom: 20,
      marginTop: 30, // Espacio entre el logo y el formulario
      alignSelf: 'center', // Asegura que el logo esté centrado
    },
    inputContainer: {
      marginBottom: 16,
    },
    passwordContainer: {
      position: 'relative',
      flexDirection: 'row',
      alignItems: 'center',
    },
  
    // Estilos de inputs
    input: {
      backgroundColor: COLORS.lightGray,
      borderRadius: 8,
      padding: 12,
      fontFamily: FONTS.body,
      fontSize: FONT_SIZES.md,
      color: COLORS.text,
      borderWidth: 1,
      borderColor: COLORS.lightGray,
    },
    passwordInput: {
      flex: 1,
      paddingRight: 50,
    },
    inputError: {
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
      right: 12,
      padding: 4,
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
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: COLORS.primary,
      marginRight: 8,
    },
    checkboxChecked: {
      backgroundColor: COLORS.primary,
    },
    checkboxLabel: {
      fontFamily: FONTS.body,
      fontSize: FONT_SIZES.sm,
      color: COLORS.text,
    },
    forgotPassword: {
      fontFamily: FONTS.body,
      fontSize: FONT_SIZES.sm,
      color: COLORS.primary,
    },
  
    // Botón de login
    loginButton: {
      backgroundColor: COLORS.primary,
      borderRadius: 8,
      padding: 16,
      alignItems: 'center',
      marginTop: 24,
    },
    loginButtonDisabled: {
      opacity: 0.7,
    },
    loginButtonText: {
      color: COLORS.white,
      fontSize: FONT_SIZES.md,
      fontFamily: FONTS.heading,
      fontWeight: '600',
    },
  });