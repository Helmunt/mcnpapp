import React from 'react';
import { View, StyleSheet } from 'react-native';
import TextInputField from './TextInputField';
import SelectField from './SelectField';
import MultiSelectField from './MultiSelectField';
import CheckboxField from './CheckboxField';
import { PartialUserFormData, FIELD_OPTIONS } from '../../types/userFormTypes';

interface AdditionalInfoSectionProps {
  formData: PartialUserFormData;
  setFormData: React.Dispatch<React.SetStateAction<PartialUserFormData>>;
  errors?: Record<string, string>;
}

const AdditionalInfoSection: React.FC<AdditionalInfoSectionProps> = ({ 
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
      <MultiSelectField
        label="¿Cómo te enteraste de MCNP por primera vez?"
        values={formData.conocer_mcnp || []}
        onValuesChange={(values) => updateField('conocer_mcnp', values)}
        options={FIELD_OPTIONS.conocer_mcnp}
        required={true}
        error={errors.conocer_mcnp}
      />
      
      <SelectField
        label="Selecciona una opción de menú para los alimentos incluidos en el evento"
        value={formData.alimento || ''}
        onValueChange={(value) => updateField('alimento', value)}
        options={FIELD_OPTIONS.alimento}
        required={true}
        error={errors.alimento}
      />
      
      <SelectField
        label="Inscríbete en el reto de sedentarismo, para garantizar tu kid de participación"
        value={formData.reto_sedentarismo || ''}
        onValueChange={(value) => updateField('reto_sedentarismo', value)}
        options={FIELD_OPTIONS.reto_sedentarismo}
        required={true}
        error={errors.reto_sedentarismo}
      />
      
      <SelectField
        label="Actividad Tanque Tapas"
        value={formData.actividad_tanque_tapas || ''}
        onValueChange={(value) => updateField('actividad_tanque_tapas', value)}
        options={FIELD_OPTIONS.actividad_tanque_tapas}
        required={true}
        error={errors.actividad_tanque_tapas}
      />
      
      <TextInputField
        label="¿Tienes alguna alergia que ponga en peligro tu vida?"
        value={formData.alergia || ''}
        onChangeText={(text) => updateField('alergia', text)}
        placeholder="Especifica tus alergias"
        error={errors.alergia}
      />
      
      <SelectField
        label="¿Qué tipo de servicio médico tienes?"
        value={formData.seguro_salud || ''}
        onValueChange={(value) => updateField('seguro_salud', value)}
        options={FIELD_OPTIONS.seguro_salud}
        required={true}
        error={errors.seguro_salud}
      />
      
      <SelectField
        label="¿Cuál es tu tipo de Sangre?"
        value={formData.tipo_sangre || ''}
        onValueChange={(value) => updateField('tipo_sangre', value)}
        options={FIELD_OPTIONS.tipo_sangre}
        required={true}
        error={errors.tipo_sangre}
      />
      
      <TextInputField
        label="Nombre de contacto en caso de emergencia"
        value={formData.contacto_nombre || ''}
        onChangeText={(text) => updateField('contacto_nombre', text)}
        placeholder="Nombre completo"
        required={true}
        error={errors.contacto_nombre}
      />
      
      <TextInputField
        label="Teléfono de contacto en caso de emergencia"
        value={formData.contacto_telefono || ''}
        onChangeText={(text) => updateField('contacto_telefono', text)}
        placeholder="Ej: 55 1234 5678"
        keyboardType="phone-pad"
        required={true}
        error={errors.contacto_telefono}
      />
      
      <CheckboxField
        label="Acepto el tratamiento de mis datos personales"
        value={formData.check_personal === '1'}
        onValueChange={(value) => updateField('check_personal', value ? '1' : '')}
        required={true}
        error={errors.check_personal}
      />
      
      <CheckboxField
        label="Acepto la publicación de mis fotos en la red social MCNP"
        value={formData.check_publicacion === '1'}
        onValueChange={(value) => updateField('check_publicacion', value ? '1' : '')}
        required={true}
        error={errors.check_publicacion}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
});

export default AdditionalInfoSection;