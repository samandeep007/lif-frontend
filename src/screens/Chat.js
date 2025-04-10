import React from 'react';
import { View } from 'react-native';
import styled from 'styled-components/native';
import theme from '../styles/theme';

const Container = styled.View`
  flex: 1;
  background-color: ${theme.colors.background};
`;

const ChatScreen = () => {
  return <Container />;
};

export default ChatScreen;
