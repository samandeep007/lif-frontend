import React from 'react';
import styled from 'styled-components/native';
import theme from '../../styles/theme';

const InputContainer = styled.View`
  width: 300px;
  height: 50px;
  border-radius: ${theme.borderRadius.small}px;
  border-width: 1px;
  border-color: ${theme.colors.text.secondary};
  padding-horizontal: ${theme.spacing.md}px;
  margin-bottom: ${theme.spacing.sm}px;
`;

const InputField = styled.TextInput`
  flex: 1;
  font-family: Poppins-Regular;
  font-size: 16px;
  color: ${theme.colors.text.primary};
`;

const ErrorText = styled.Text`
  font-family: Poppins-Regular;
  font-size: 14px;
  color: ${theme.colors.accent.red};
  margin-top: ${theme.spacing.xs}px;
`;

const Input = ({
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry,
}) => {
  return (
    <>
      <InputContainer>
        <InputField
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.text.secondary}
          secureTextEntry={secureTextEntry}
        />
      </InputContainer>
      {error && <ErrorText>{error}</ErrorText>}
    </>
  );
};

export default Input;
