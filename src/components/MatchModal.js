import React from 'react';
import { Modal, View, Image, Platform } from 'react-native';
import styled from 'styled-components/native';
import ConfettiCannon from 'react-native-confetti-cannon';
import theme from '../styles/theme';
import Text from './common/Text';
import Button from './common/Button';
import { triggerHaptic } from '../utils/haptics';

const ModalContainer = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.8);
  justify-content: center;
  align-items: center;
  padding: ${theme.spacing.lg}px;
`;

const MatchImage = styled(Image)`
  width: 150px;
  height: 150px;
  border-radius: 75px;
  margin: ${theme.spacing.md}px;
  border-width: 3px;
  border-color: ${theme.colors.accent.pink};
`;

const MatchModal = ({ visible, onClose, match }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <ModalContainer>
        <ConfettiCannon count={200} origin={{ x: -10, y: 0 }} />
        <Text
          variant="h1"
          style={{
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.lg,
          }}
        >
          It’s a Match!
        </Text>
        <View style={{ flexDirection: 'row', marginBottom: theme.spacing.lg }}>
          <MatchImage
            source={{
              uri: match?.user1Photo || 'https://via.placeholder.com/150',
            }}
          />
          <MatchImage
            source={{
              uri: match?.user2Photo || 'https://via.placeholder.com/150',
            }}
          />
        </View>
        <Text
          variant="body"
          style={{
            color: theme.colors.text.primary,
            textAlign: 'center',
            marginBottom: theme.spacing.lg,
          }}
        >
          You and {match?.user2Name || 'Someone'} have liked each other!
        </Text>
        <Button
          title="Start Chatting"
          onPress={() => {
            triggerHaptic('success');
            onClose();
          }}
        />
      </ModalContainer>
    </Modal>
  );
};

export default MatchModal;
