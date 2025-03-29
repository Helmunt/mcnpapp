import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';
import FormField from './FormField';

interface TextInputFieldProps extends TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  required?: boolean;
  error?: string;
}

const TextInputField: React.FC<TextInputFieldProps> = ({
  label,
  value,
  onChangeText,
  required = false,
  error,
  ...rest
}) => {
  return (
    <FormField label={label} required={required} error={error}>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        {...rest}
      />
    </FormField>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  inputError: {
    borderColor: 'red',
  }
});

export default TextInputField;