import React from 'react';
import { Modal, View, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import theme from '../styles/theme';
import Text from './common/Text';

const ModalContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent background */
`;

const ModalContent = styled.View`
  background-color: ${theme.colors.background};
  border-radius: ${theme.borderRadius.large}px;
  padding: ${theme.spacing.lg}px;
  width: 80%;
  align-items: center;
`;

const ModalTitle = styled(Text)`
  font-size: 18px;
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.lg}px;
  text-align: center;
`;

const ButtonContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  margin-top: ${theme.spacing.lg}px;
`;

const CancelButton = styled(TouchableOpacity)`
  flex: 1;
  padding: ${theme.spacing.sm}px;
  background-color: ${theme.colors.text.secondary}20;
  border-radius: ${theme.borderRadius.medium}px;
  align-items: center;
  margin-right: ${theme.spacing.sm}px;
`;

const DeleteButton = styled(TouchableOpacity)`
  flex: 1;
  padding: ${theme.spacing.sm}px;
  background-color: ${theme.colors.accent.red};
  border-radius: ${theme.borderRadius.medium}px;
  align-items: center;
`;

const ButtonText = styled(Text)`
  font-size: 16px;
  color: ${theme.colors.text.primary};
`;

const DeleteConfirmationModal = ({ visible, onClose, onConfirm, userName }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <ModalContainer>
        <ModalContent>
          <ModalTitle>
            Are you sure you want to delete your chat with {userName}?
          </ModalTitle>
          <ButtonContainer>
            <CancelButton onPress={onClose}>
              <ButtonText>Cancel</ButtonText>
            </CancelButton>
            <DeleteButton onPress={onConfirm}>
              <ButtonText>Delete</ButtonText>
            </DeleteButton>
          </ButtonContainer>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};

export default DeleteConfirmationModal;