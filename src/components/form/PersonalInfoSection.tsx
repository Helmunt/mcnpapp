import React from 'react';
import { View, StyleSheet } from 'react-native';
import TextInputField from './TextInputField';
import SelectField from './SelectField';
import { PartialUserFormData } from '../../types/userFormTypes';

interface PersonalInfoSectionProps {
  formData: PartialUserFormData;
  setFormData: React.Dispatch<React.SetStateAction<PartialUserFormData>>;
  errors?: Record<string, string>;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({ 
  formData, 
  setFormData,
  errors = {}
}) => {
  // Función helper para actualizar el formData
  const updateField = (field: keyof PartialUserFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Función para formatear y validar la fecha
  const handleDateChange = (text: string) => {
    // Implementar formato DD/MM/AAAA
    let formattedText = text;
    // Eliminar caracteres no numéricos
    formattedText = formattedText.replace(/[^\d]/g, '');
    
    // Añadir barras automáticamente
    if (formattedText.length > 2) {
      formattedText = formattedText.substring(0, 2) + '/' + formattedText.substring(2);
    }
    if (formattedText.length > 5) {
      formattedText = formattedText.substring(0, 5) + '/' + formattedText.substring(5);
    }
    
    // Limitar a 10 caracteres (DD/MM/AAAA)
    if (formattedText.length > 10) {
      formattedText = formattedText.substring(0, 10);
    }
    
    // Actualizar el campo directamente con el formato DD/MM/AAAA
    updateField('nacimiento', formattedText);
  };

  return (
    <View style={styles.container}>
      <TextInputField
        label="Fecha de nacimiento"
        value={formData.nacimiento || ''}
        onChangeText={handleDateChange}
        placeholder="DD/MM/AAAA"
        keyboardType="numeric"
        maxLength={10}
        required={true}
        error={errors.nacimiento}
      />
      
      <TextInputField
        label="Ciudad"
        value={formData.ciudad || ''}
        onChangeText={(text) => updateField('ciudad', text)}
        placeholder="Ciudad donde resides"
        required={true}
        error={errors.ciudad}
      />
      
      <TextInputField
        label="Estado"
        value={formData.estado || ''}
        onChangeText={(text) => updateField('estado', text)}
        placeholder="Estado donde resides"
        required={true}
        error={errors.estado}
      />
      
      <TextInputField
        label="Código Postal"
        value={formData.cp || ''}
        onChangeText={(text) => updateField('cp', text)}
        placeholder="Código postal"
        keyboardType="numeric"
        required={true}
        error={errors.cp}
      />
      
      <TextInputField
        label="Cédula profesional"
        value={formData.cd_profesional || ''}
        onChangeText={(text) => updateField('cd_profesional', text)}
        placeholder="Ingresa tu cédula profesional"
        keyboardType="numeric"
        required={true}
        error={errors.cd_profesional}
      />
      
      <TextInputField
        label="Teléfono móvil"
        value={formData.telefono || ''}
        onChangeText={(text) => updateField('telefono', text)}
        placeholder="Ej: 55 1234 5678"
        keyboardType="phone-pad"
        required={true}
        error={errors.telefono}
      />
      
      <TextInputField
        label="Nueva contraseña (opcional)"
        value={formData.nueva_contrasena || ''}
        onChangeText={(text) => updateField('nueva_contrasena', text)}
        placeholder="Ingresa tu nueva contraseña"
        secureTextEntry={true}
        error={errors.nueva_contrasena}
      />
      
      <TextInputField
        label="Confirmar contraseña"
        value={formData.confirmar_contrasena || ''}
        onChangeText={(text) => updateField('confirmar_contrasena', text)}
        placeholder="Confirma tu nueva contraseña"
        secureTextEntry={true}
        error={errors.confirmar_contrasena}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
});

export default PersonalInfoSection;