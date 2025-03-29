import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';
import { FormSection } from '../../types/userFormTypes';

interface StepIndicatorProps {
  currentStep: FormSection;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const steps = [
    { key: FormSection.PERSONAL, label: 'Personal' },
    { key: FormSection.PROFESSIONAL, label: 'Profesional' },
    { key: FormSection.ADDITIONAL, label: 'Adicional' },
  ];
  
  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.key === currentStep);
  };
  
  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isActive = step.key === currentStep;
        const isCompleted = index < getCurrentStepIndex();
        
        return (
          <View key={step.key} style={styles.stepWrapper}>
            <View style={styles.stepRow}>
              {index > 0 && (
                <View style={[
                  styles.connector,
                  isCompleted ? styles.activeConnector : {}
                ]} />
              )}
              
              <View style={[
                styles.stepCircle,
                isActive ? styles.activeStep : {},
                isCompleted ? styles.completedStep : {}
              ]}>
                {isCompleted ? (
                  <Text style={styles.completedText}>✓</Text>
                ) : (
                  <Text style={isActive ? styles.activeStepText : styles.stepText}>
                    {index + 1}
                  </Text>
                )}
              </View>
              
              {index < steps.length - 1 && (
                <View style={[
                  styles.connector,
                  isActive ? styles.activeConnector : {}
                ]} />
              )}
            </View>
            
            <Text style={[
              styles.stepLabel,
              isActive ? styles.activeStepLabel : {}
            ]}>
              {step.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  stepWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    zIndex: 1,
  },
  activeStep: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  completedStep: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  stepText: {
    color: '#999',
    fontSize: 14,
    fontWeight: 'bold',
  },
  activeStepText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  completedText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepLabel: {
    marginTop: 8,
    fontSize: 12,
    color: '#999',
  },
  activeStepLabel: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  connector: {
    height: 2,
    backgroundColor: '#ddd',
    flex: 1,
  },
  activeConnector: {
    backgroundColor: COLORS.primary,
  },
});

export default StepIndicator;