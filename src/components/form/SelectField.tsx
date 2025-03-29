import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  FlatList,
  SafeAreaView
} from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import FormField from './FormField';
import { COLORS } from '../../constants/theme';
import { SelectOption } from '../../types/userFormTypes';

interface SelectFieldProps {
  label: string;
  value: string;
  options: SelectOption[];
  onValueChange: (value: string) => void;
  required?: boolean;
  error?: string;
  placeholder?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  options,
  onValueChange,
  required = false,
  error,
  placeholder = 'Seleccionar...'
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  
  // Encontrar la etiqueta actual basada en el valor
  const selectedLabel = options.find(option => option.value === value)?.label || placeholder;
  
  return (
    <FormField label={label} required={required} error={error}>
      <TouchableOpacity 
        style={[styles.selectContainer, error && styles.selectError]} 
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.selectText, 
          !value && styles.placeholderText
        ]}>
          {selectedLabel}
        </Text>
        <Feather name="chevron-down" size={20} color={COLORS.text} />
      </TouchableOpacity>
      
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Feather name="x" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    item.value === value && styles.selectedOption
                  ]}
                  onPress={() => {
                    onValueChange(item.value);
                    setModalVisible(false);
                  }}
                >
                  <Text style={[
                    styles.optionText,
                    item.value === value && styles.selectedOptionText
                  ]}>
                    {item.label}
                  </Text>
                  {item.value === value && (
                    <Feather name="check" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </FormField>
  );
};

const styles = StyleSheet.create({
  selectContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 12,
    fontSize: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectError: {
    borderColor: 'red',
  },
  selectText: {
    fontSize: 14,
    color: COLORS.text,
  },
  placeholderText: {
    color: '#999',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButton: {
    padding: 5,
  },
  optionItem: {
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: `${COLORS.primary}10`, // 10% opacity
  },
  optionText: {
    fontSize: 16,
    color: COLORS.text,
  },
  selectedOptionText: {
    color: COLORS.primary,
    fontWeight: '500',
  },
});

export default SelectField;