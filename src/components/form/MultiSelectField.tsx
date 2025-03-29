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

interface MultiSelectFieldProps {
  label: string;
  values: string[];
  options: SelectOption[];
  onValuesChange: (values: string[]) => void;
  required?: boolean;
  error?: string;
  placeholder?: string;
}

const MultiSelectField: React.FC<MultiSelectFieldProps> = ({
  label,
  values,
  options,
  onValuesChange,
  required = false,
  error,
  placeholder = 'Seleccionar opciones...'
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  
  // Obtener las etiquetas seleccionadas
  const selectedLabels = options
    .filter(option => values.includes(option.value))
    .map(option => option.label);
  
  const displayText = selectedLabels.length > 0 
    ? selectedLabels.join(', ')
    : placeholder;
  
  // Alternar selección
  const toggleSelection = (value: string) => {
    if (values.includes(value)) {
      onValuesChange(values.filter(v => v !== value));
    } else {
      onValuesChange([...values, value]);
    }
  };
  
  return (
    <FormField label={label} required={required} error={error}>
      <TouchableOpacity 
        style={[styles.selectContainer, error && styles.selectError]} 
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text 
          style={[
            styles.selectText, 
            selectedLabels.length === 0 && styles.placeholderText
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {displayText}
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
                <Text style={styles.doneText}>Listo</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const isSelected = values.includes(item.value);
                return (
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      isSelected && styles.selectedOption
                    ]}
                    onPress={() => toggleSelection(item.value)}
                  >
                    <Text style={[
                      styles.optionText,
                      isSelected && styles.selectedOptionText
                    ]}>
                      {item.label}
                    </Text>
                    <View style={[
                      styles.checkbox,
                      isSelected && styles.checkboxSelected
                    ]}>
                      {isSelected && (
                        <Feather name="check" size={16} color="white" />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }}
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
    flex: 1,
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
    flex: 1,
    marginRight: 10,
  },
  closeButton: {
    padding: 8,
  },
  doneText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
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
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
});

export default MultiSelectField;