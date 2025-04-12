import React from 'react';
import { Modal, View, Image, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../styles/theme';

const ModalContainer = styled(View)`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.9);
  justify-content: center;
  align-items: center;
`;

const ModalImage = styled(Image)`
  width: 90%;
  height: 90%;
  resize-mode: contain;
`;

const CloseButton = styled(TouchableOpacity)`
  position: absolute;
  top: ${theme.spacing.lg}px;
  right: ${theme.spacing.lg}px;
`;

const ImageModal = ({ visible, imageUrl, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <ModalContainer>
        <CloseButton onPress={onClose}>
          <Ionicons name="close" size={30} color={theme.colors.text.primary} />
        </CloseButton>
        <ModalImage source={{ uri: imageUrl }} />
      </ModalContainer>
    </Modal>
  );
};

export default ImageModal;
