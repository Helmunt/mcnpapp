import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { COLORS } from '../../constants/theme';

interface CheckboxFieldProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  required?: boolean;
  error?: string;
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({
  label,
  value,
  onValueChange,
  required = false,
  error,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.row} 
        onPress={() => onValueChange(!value)}
        activeOpacity={0.7}
      >
        <View style={[
          styles.checkbox,
          value && styles.checkboxSelected,
          error && styles.checkboxError
        ]}>
          {value && <Feather name="check" size={16} color="white" />}
        </View>
        
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
      </TouchableOpacity>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxError: {
    borderColor: 'red',
  },
  label: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },
  required: {
    color: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 34, // Alineado con el texto después del checkbox
  }
});

export default CheckboxField;