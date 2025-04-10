import React from 'react';
import styled from 'styled-components/native';
import theme from '../../styles/theme';

const StyledText = styled.Text`
  font-family: ${props => props.variant.fontFamily};
  font-size: ${props => props.variant.fontSize}px;
  color: ${props => props.color || props.variant.color};
`;

const Text = ({ variant = 'body', children, color }) => {
  return (
    <StyledText variant={theme.typography[variant]} color={color}>
      {children}
    </StyledText>
  );
};

export default Text;
