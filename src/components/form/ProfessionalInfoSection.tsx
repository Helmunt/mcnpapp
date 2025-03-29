import React from 'react';
import { View, StyleSheet } from 'react-native';
import TextInputField from './TextInputField';
import SelectField from './SelectField';
import MultiSelectField from './MultiSelectField';
import { PartialUserFormData, FIELD_OPTIONS } from '../../types/userFormTypes';

interface ProfessionalInfoSectionProps {
  formData: PartialUserFormData;
  setFormData: React.Dispatch<React.SetStateAction<PartialUserFormData>>;
  errors?: Record<string, string>;
}

const ProfessionalInfoSection: React.FC<ProfessionalInfoSectionProps> = ({ 
  formData, 
  setFormData,
  errors = {}
}) => {
  // Función helper para actualizar el formData
  const updateField = (field: keyof PartialUserFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <View style={styles.container}>
      <SelectField
        label="Si eres residente, ¿En qué año vas?"
        value={formData.tiempo_residente || ''}
        onValueChange={(value) => updateField('tiempo_residente', value)}
        options={FIELD_OPTIONS.tiempo_residente}
        required={true}
        error={errors.tiempo_residente}
      />
      
      <SelectField
        label="¿Cuántos años llevas ejerciendo psiquiatría general?"
        value={formData.tiempo_psiquatria || ''}
        onValueChange={(value) => updateField('tiempo_psiquatria', value)}
        options={FIELD_OPTIONS.tiempo_psiquatria}
        required={true}
        error={errors.tiempo_psiquatria}
      />
      
      <TextInputField
        label="Si no eres psiquiatra, ¿cuál es tu especialidad?"
        value={formData.no_psiquiatra || ''}
        onChangeText={(text) => updateField('no_psiquiatra', text)}
        placeholder="Escribe tu especialidad"
        error={errors.no_psiquiatra}
      />
      
      <MultiSelectField
        label="En caso de tener una especialidad, por favor señala todas las que apliquen:"
        values={formData.especialidades || []}
        onValuesChange={(values) => updateField('especialidades', values)}
        options={FIELD_OPTIONS.especialidades}
        required={true}
        error={errors.especialidades}
      />
      
      <SelectField
        label="¿Cuántos años llevas ejerciendo tu especialidad?"
        value={formData.tiempo_especialidad || ''}
        onValueChange={(value) => updateField('tiempo_especialidad', value)}
        options={FIELD_OPTIONS.tiempo_especialidad}
        required={true}
        error={errors.tiempo_especialidad}
      />
      
      <TextInputField
        label="Agrega otro estudio que no hayas mencionado anteriormente"
        value={formData.otro_estudio || ''}
        onChangeText={(text) => updateField('otro_estudio', text)}
        placeholder="Otros estudios"
        error={errors.otro_estudio}
        multiline={true}
        numberOfLines={3}
        textAlignVertical="top"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
});

export default ProfessionalInfoSection;