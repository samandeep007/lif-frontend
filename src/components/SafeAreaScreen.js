import React from 'react';
import { SafeAreaView, Platform } from 'react-native';
import styled from 'styled-components/native';
import theme from '../styles/theme';

const StyledSafeAreaView = styled(SafeAreaView)`
  flex: 1;
  background-color: ${theme.colors.background};
  ${Platform.OS === 'web'
    ? 'padding-bottom: env(safe-area-inset-bottom, 0);'
    : ''};
`;

const SafeAreaScreen = ({ children }) => {
  return <StyledSafeAreaView>{children}</StyledSafeAreaView>;
};

export default SafeAreaScreen;
