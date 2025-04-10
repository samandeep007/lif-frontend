import React from 'react';
import styled from 'styled-components/native';
import theme from '../../styles/theme';

const InputContainer = styled.View`
  width: 250px; /* Fixed width */
  height: 50px;
  border-radius: ${theme.borderRadius.small}px;
  border-width: 1px;
  border-color: ${theme.colors.text.secondary};
  padding-horizontal: ${theme.spacing.md}px;
  margin-bottom: ${theme.spacing.sm}px;
  align-self: center; /* Ensure centering */
`;

const InputField = styled.TextInput`
  flex: 1;
  font-family: Poppins-Regular;
  font-size: 16px;
  color: ${theme.colors.text.primary};
  text-align: center; /* Center the text inside the input */
`;

const ErrorWrapper = styled.View`
  height: 10px; /* Reserve space for error message */
  margin-top: ${theme.spacing.xs}px;
`;

const ErrorText = styled.Text`
  font-family: Poppins-Regular;
  font-size: 14px;
  color: ${theme.colors.accent.red};
  text-align: center; /* Center the error text */
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
      <ErrorWrapper>
        {error && <ErrorText>{error}</ErrorText>}
      </ErrorWrapper>
    </>
  );
};

export default Input;