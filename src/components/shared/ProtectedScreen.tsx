import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { AppSection, hasAccessToSection, getAccessDeniedMessage } from '../../services/permissionService';
import AccessRestrictedModal from './AccessRestrictedModal';

interface ProtectedScreenProps {
  children: React.ReactNode;
  section: AppSection;
}

const ProtectedScreen: React.FC<ProtectedScreenProps> = ({ children, section }) => {
  const { state } = useAuth();
  const [showModal, setShowModal] = useState(false);
  
  useEffect(() => {
    const hasAccess = hasAccessToSection(state.user?.role, section);
    if (!hasAccess) {
      setShowModal(true);
    }
  }, [state.user, section]);
  
  return (
    <View style={styles.container}>
      {children}
      
      <AccessRestrictedModal
        isVisible={showModal}
        message={getAccessDeniedMessage(section)}
        onClose={() => setShowModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ProtectedScreen;