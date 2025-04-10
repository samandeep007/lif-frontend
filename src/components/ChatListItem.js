import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import theme from '../styles/theme';
import Text from './common/Text';

const Container = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  padding: ${theme.spacing.md}px;
  border-bottom-width: 1px;
  border-bottom-color: ${theme.colors.text.secondary};
`;

const Avatar = styled(Image)`
  width: 50px;
  height: 50px;
  border-radius: 25px;
  margin-right: ${theme.spacing.md}px;
`;

const InfoContainer = styled.View`
  flex: 1;
`;

const UnreadBadge = styled.View`
  background-color: ${theme.colors.accent.red};
  border-radius: 12px;
  padding: 2px 8px;
  min-width: 24px;
  align-items: center;
  justify-content: center;
`;

const ChatListItem = ({ chat, onPress }) => {
  const { otherUser, lastMessage, unreadCount } = chat;

  return (
    <Container onPress={onPress}>
      <Avatar source={{ uri: otherUser.photo || 'https://via.placeholder.com/50' }} />
      <InfoContainer>
        <Text variant="h2">{otherUser.name}</Text>
        {lastMessage && (
          <Text variant="body" style={{ color: theme.colors.text.secondary }}>
            {lastMessage.content.length > 30 ? lastMessage.content.substring(0, 30) + '...' : lastMessage.content}
          </Text>
        )}
      </InfoContainer>
      {unreadCount > 0 && (
        <UnreadBadge>
          <Text variant="body" style={{ color: theme.colors.text.primary }}>
            {unreadCount}
          </Text>
        </UnreadBadge>
      )}
    </Container>
  );
};

export default ChatListItem;