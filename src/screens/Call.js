import React from 'react';
import { View, Text } from 'react-native';
import styled from 'styled-components/native';
import theme from '../styles/theme';

const Container = styled.View`
  flex: 1;
  background-color: ${theme.colors.background};
  justify-content: center;
  align-items: center;
  padding: ${theme.spacing.lg}px;
`;

const CallScreen = () => {
  return (
    <Container>
      <Text style={{ fontSize: 24, color: theme.colors.text.primary }}>
        Call Screen (Not Implemented)
      </Text>
    </Container>
  );
};

export default CallScreen;