import React, { useState, useEffect } from 'react';
import { 
  View, 
  Modal, 
  StyleSheet, 
  ActivityIndicator, 
  Text, 
  Platform,
  BackHandler,
  TouchableOpacity,
  ScrollView,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback
} from 'react-native';
import { COLORS } from '../../constants/theme';
import { 
  markFormAsCompleted, 
  savePartialFormData, 
  getSavedFormData,
  getSavedFormProgress,
  saveFormProgress,
  syncFormDataWithServer,
  validateRequiredFields
} from '../../services/userFormService';
import { FormSection, PartialUserFormData, REQUIRED_FIELDS } from '../../types/userFormTypes';
import StepIndicator from '../../components/form/StepIndicator';
import PersonalInfoSection from '../../components/form/PersonalInfoSection';
import ProfessionalInfoSection from '../../components/form/ProfessionalInfoSection';
import AdditionalInfoSection from '../../components/form/AdditionalInfoSection';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RequiredFormModalProps {
  visible: boolean;
  userId: number;
  onFormCompleted: () => void;
}

const RequiredFormModal: React.FC<RequiredFormModalProps> = ({ 
  visible, 
  userId, 
  onFormCompleted 
}) => {
  const [currentStep, setCurrentStep] = useState<FormSection>(FormSection.PERSONAL);
  const [formData, setFormData] = useState<PartialUserFormData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Cargar datos guardados al iniciar
  useEffect(() => {
    const loadSavedData = async () => {
      if (userId) {
        setIsLoading(true);
        try {
          // Cargar datos del formulario
          const savedData = await getSavedFormData(userId);
          if (savedData) {
            setFormData(savedData);
          }
          
          // Cargar progreso (sección actual)
          const progress = await getSavedFormProgress(userId);
          if (progress) {
            setCurrentStep(progress.currentSection);
          }
        } catch (error) {
          console.error('[RequiredFormModal] Error al cargar datos guardados:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    if (visible) {
      loadSavedData();
    }
  }, [userId, visible]);
  
  // Detectar cuando el teclado aparece/desaparece
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    // Cleanup
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  
  // Log para depuración
  useEffect(() => {
    console.log(`[RequiredFormModal] Visible: ${visible}, UserId: ${userId}, CurrentStep: ${currentStep}`);
    
    return () => {
      console.log('[RequiredFormModal] Componente desmontado');
    };
  }, [visible, userId, currentStep]);

  // Impedir que el usuario cierre la app con el botón de atrás en Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (visible) {
        // Si el modal está visible, prevenir la acción de retroceso
        if (currentStep !== FormSection.PERSONAL) {
          // Si no estamos en el primer paso, volver al paso anterior
          handlePrevStep();
          return true;
        }
        return true;
      }
      // De lo contrario, dejar que el sistema maneje el botón de atrás
      return false;
    });

    return () => backHandler.remove();
  }, [visible, currentStep]);

  // Validar campos del paso actual
  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    // Determinar qué campos validar según el paso actual
    let fieldsToValidate: string[] = [];
    
    if (currentStep === FormSection.PERSONAL) {
      fieldsToValidate = ['telefono', 'cd_profesional', 'nacimiento', 'ciudad', 'estado', 'cp'];
      
      // Validación especial para contraseñas
      if (formData.nueva_contrasena || formData.confirmar_contrasena) {
        if (formData.nueva_contrasena !== formData.confirmar_contrasena) {
          newErrors['confirmar_contrasena'] = 'Las contraseñas no coinciden';
          isValid = false;
        }
        
        if (formData.nueva_contrasena && formData.nueva_contrasena.length < 6) {
          newErrors['nueva_contrasena'] = 'La contraseña debe tener al menos 6 caracteres';
          isValid = false;
        }
      }
    } else if (currentStep === FormSection.PROFESSIONAL) {
      fieldsToValidate = ['tiempo_residente', 'tiempo_psiquatria', 'especialidades', 'tiempo_especialidad'];
    } else if (currentStep === FormSection.ADDITIONAL) {
      fieldsToValidate = [
        'conocer_mcnp', 'alimento', 'reto_sedentarismo', 'actividad_tanque_tapas',
        'seguro_salud', 'tipo_sangre', 'contacto_nombre', 'contacto_telefono',
        'check_personal', 'check_publicacion'
      ];
    }
    
    // Validar campos requeridos para el paso actual
    for (const field of fieldsToValidate) {
      const value = formData[field as keyof PartialUserFormData];
      
      // Verificación para campos de checkbox que ahora son '1'
      if (field === 'check_personal' || field === 'check_publicacion') {
        if (value !== '1') {
          newErrors[field] = 'Debes aceptar este campo';
          isValid = false;
        }
        continue;
      }
      
      // Verificación especial para arrays (ya que [].length === 0 es falsy)
      if (Array.isArray(value)) {
        if (value.length === 0) {
          newErrors[field] = 'Este campo es requerido';
          isValid = false;
        }
      } 
      // Verificación normal para strings y otros tipos
      else if (!value) {
        newErrors[field] = 'Este campo es requerido';
        isValid = false;
      }
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Guardar el progreso y los datos
  const saveProgress = async () => {
    setIsSaving(true);
    try {
      // Guardar datos parciales
      await savePartialFormData(userId, formData);
      
      // Guardar progreso (sección actual)
      await saveFormProgress(userId, currentStep);
    } catch (error) {
      console.error('[RequiredFormModal] Error al guardar progreso:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Manejar paso anterior
  const handlePrevStep = () => {
    if (currentStep === FormSection.PROFESSIONAL) {
      setCurrentStep(FormSection.PERSONAL);
    } else if (currentStep === FormSection.ADDITIONAL) {
      setCurrentStep(FormSection.PROFESSIONAL);
    }
  };
  
  // Manejar siguiente paso
  const handleNextStep = async () => {
    // Ocultar teclado antes de validar
    Keyboard.dismiss();
    
    // Validar paso actual
    if (!validateCurrentStep()) {
      return;
    }
    
    // Guardar progreso
    await saveProgress();
    
    // Avanzar al siguiente paso
    if (currentStep === FormSection.PERSONAL) {
      setCurrentStep(FormSection.PROFESSIONAL);
    } else if (currentStep === FormSection.PROFESSIONAL) {
      setCurrentStep(FormSection.ADDITIONAL);
    }
  };
  
  // Verificar si es el último paso
  const isLastStep = () => {
    return currentStep === FormSection.ADDITIONAL;
  };
  
// Manejar envío del formulario
const handleSubmit = async () => {
  // Ocultar teclado antes de validar
  Keyboard.dismiss();
  
  // Validación final
  if (!validateCurrentStep()) {
    return;
  }
  
  // Verificar todos los campos requeridos
  const allRequiredFieldsValid = validateRequiredFields(formData);
  if (!allRequiredFieldsValid) {
    Alert.alert(
      "Información incompleta", 
      "Por favor completa todos los campos obligatorios en todas las secciones."
    );
    return;
  }
  
  // Verificar aceptación de términos
  if (formData.check_personal !== '1' || formData.check_publicacion !== '1') {
    Alert.alert(
      "Términos y Condiciones", 
      "Debes aceptar ambos términos y condiciones para continuar"
    );
    return;
  }
  
  try {
    setIsLoading(true);
    
    // Sincronizar con servidor
    const success = await syncFormDataWithServer(userId, formData);
    
    if (success) {
      console.log('[RequiredFormModal] Datos sincronizados exitosamente, marcando como completado');
      
      // Marcar como completado
      await markFormAsCompleted(userId);
      
      // Notificar finalización
      onFormCompleted();
      
      // AÑADIR: Registrar en AsyncStorage que el formulario está completo
      await AsyncStorage.setItem(`user_form_completed_${userId}`, 'true');
      
      console.log('[RequiredFormModal] Formulario marcado como completado para usuario:', userId);
    } else {
      Alert.alert(
        "Error",
        "Hubo un problema al enviar la información. Por favor intenta nuevamente."
      );
      setIsLoading(false);
    }
  } catch (error) {
    console.error('[RequiredFormModal] Error al enviar datos:', error);
    Alert.alert(
      "Error",
      "Hubo un problema al enviar la información. Por favor intenta nuevamente."
    );
    setIsLoading(false);
  }
};
  
  // Renderizar sección actual
  const renderCurrentSection = () => {
    switch (currentStep) {
      case FormSection.PERSONAL:
        return (
          <PersonalInfoSection 
            formData={formData}
            setFormData={setFormData}
            errors={errors}
          />
        );
      case FormSection.PROFESSIONAL:
        return (
          <ProfessionalInfoSection
            formData={formData}
            setFormData={setFormData}
            errors={errors}
          />
        );
      case FormSection.ADDITIONAL:
        return (
          <AdditionalInfoSection
            formData={formData}
            setFormData={setFormData}
            errors={errors}
          />
        );
      default:
        return null;
    }
  };

  // Función para cerrar el teclado al tocar fuera de un campo de entrada
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      statusBarTranslucent
      onRequestClose={() => {
        if (currentStep !== FormSection.PERSONAL) {
          handlePrevStep();
        }
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={styles.container}>
            <View style={styles.headerContainer}>
              <Text style={styles.headerText}>Información requerida</Text>
              <Text style={styles.subHeaderText}>Por favor completa toda la información solicitada</Text>
            </View>
            
            <StepIndicator currentStep={currentStep} />
            
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Cargando...</Text>
              </View>
            ) : (
              <>
                <ScrollView 
                  style={styles.contentContainer}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={styles.scrollContentContainer}
                >
                  <Text style={styles.formTitle}>
                    {currentStep === FormSection.PERSONAL && "Información personal"}
                    {currentStep === FormSection.PROFESSIONAL && "Información profesional"}
                    {currentStep === FormSection.ADDITIONAL && "Información adicional"}
                  </Text>
                  
                  {renderCurrentSection()}
                  
                  <View style={[
                    styles.buttonContainer,
                    Platform.OS === 'ios' && keyboardVisible && styles.buttonContainerWithKeyboard
                  ]}>
                    {currentStep !== FormSection.PERSONAL && (
                      <TouchableOpacity 
                        style={styles.backButton}
                        onPress={handlePrevStep}
                        disabled={isSaving}
                      >
                        <Text style={styles.backButtonText}>Anterior</Text>
                      </TouchableOpacity>
                    )}
                    
                    {!isLastStep() ? (
                      <TouchableOpacity 
                        style={[
                          styles.nextButton,
                          currentStep === FormSection.PERSONAL ? { marginLeft: 0 } : { marginLeft: 8 },
                          isSaving && styles.disabledButton
                        ]}
                        onPress={handleNextStep}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <ActivityIndicator size="small" color={COLORS.white} />
                        ) : (
                          <Text style={styles.nextButtonText}>Siguiente</Text>
                        )}
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity 
                        style={[
                          styles.submitButton,
                          isLoading && styles.disabledButton
                        ]}
                        onPress={handleSubmit}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <ActivityIndicator size="small" color={COLORS.white} />
                        ) : (
                          <Text style={styles.submitButtonText}>Listo</Text>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                </ScrollView>
              </>
            )}
            
            {!keyboardVisible && (
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  MCNP México - Todos los derechos reservados
                </Text>
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  headerContainer: {
    backgroundColor: COLORS.primary,
    paddingVertical: 20,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  headerText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subHeaderText: {
    color: COLORS.white,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  scrollContentContainer: {
    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.text,
    fontSize: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: COLORS.primary,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: Platform.OS === 'ios' ? 40 : 30,
  },
  buttonContainerWithKeyboard: {
    marginBottom: 80, // Mayor espacio cuando el teclado está visible
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 4,
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    // Añadir estilos para hacerlo más visible
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: COLORS.primary + '80', // 50% opacity
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18, // Aumentar tamaño
    fontWeight: 'bold',
  },
  footer: {
    padding: 15,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
  },
});

export default RequiredFormModal;