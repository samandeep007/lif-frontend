import React from 'react';
import { View } from 'react-native';
import styled from 'styled-components/native';
import theme from '../styles/theme';
import Text from './common/Text';

const Container = styled(View)`
  max-width: 70%;
  margin: ${theme.spacing.sm}px;
  padding: ${theme.spacing.sm}px;
  border-radius: ${theme.borderRadius.medium}px;
  background-color: ${props => (props.isSent ? theme.colors.accent.pink : theme.colors.text.secondary)};
  align-self: ${props => (props.isSent ? 'flex-end' : 'flex-start')};
`;

const MessageBubble = ({ message, isSent }) => {
  return (
    <Container isSent={isSent}>
      <Text variant="body" style={{ color: isSent ? theme.colors.text.primary : theme.colors.text.primary }}>
        {message.content}
      </Text>
      <Text variant="body" style={{ color: isSent ? theme.colors.text.secondary : theme.colors.text.secondary, fontSize: 12, marginTop: theme.spacing.xs }}>
        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </Container>
  );
};

export default MessageBubble;