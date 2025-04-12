import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Alert } from 'react-native';
import styled from 'styled-components/native';
import theme from '../styles/theme';
import Text from '../components/common/Text';
import api from '../api/api';
import { Ionicons } from '@expo/vector-icons';

const Container = styled.View`
  flex: 1;
  background-color: ${theme.colors.background};
  padding: ${theme.spacing.lg}px;
`;

const Heading = styled.View`
  margin-bottom: ${theme.spacing.lg}px;
  flex-direction: row;
  align-items: center;
`;

const Input = styled(TextInput)`
  background-color: ${theme.colors.text.secondary}20;
  border-radius: ${theme.borderRadius.medium}px;
  padding: ${theme.spacing.sm}px;
  color: ${theme.colors.text.primary};
  font-family: Poppins-Regular;
  font-size: 16px;
  margin-bottom: ${theme.spacing.md}px;
`;

const Button = styled(TouchableOpacity)`
  background-color: ${theme.colors.accent.pink};
  padding: ${theme.spacing.md}px;
  border-radius: ${theme.borderRadius.medium}px;
  align-items: center;
  margin-bottom: ${theme.spacing.md}px;
`;

const ErrorMessage = styled(Text)`
  color: ${theme.colors.accent.red};
  margin-bottom: ${theme.spacing.md}px;
  text-align: center;
`;

const ChangePasswordScreen = ({ navigation }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      setErrorMessage('Please enter both old and new passwords.');
      return;
    }

    try {
      const response = await api.put('/users/me/password', {
        oldPassword,
        newPassword,
      });
      if (response.data.success) {
        setOldPassword('');
        setNewPassword('');
        setErrorMessage(null);
        Alert.alert('Success', 'Password changed successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setErrorMessage(
        'Failed to change password: ' + (error.message || 'Network error')
      );
    }
  };

  return (
    <Container>
      <Heading>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.colors.text.primary}
          />
        </TouchableOpacity>
        <Text
          variant="h1"
          style={{
            color: theme.colors.text.primary,
            marginLeft: theme.spacing.md,
          }}
        >
          Change Password
        </Text>
      </Heading>

      <Input
        value={oldPassword}
        onChangeText={setOldPassword}
        placeholder="Old Password"
        placeholderTextColor={theme.colors.text.secondary}
        secureTextEntry
      />
      <Input
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="New Password"
        placeholderTextColor={theme.colors.text.secondary}
        secureTextEntry
      />
      <Button onPress={handleChangePassword}>
        <Text style={{ color: theme.colors.text.primary, fontSize: 16 }}>
          Change Password
        </Text>
      </Button>

      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
    </Container>
  );
};

export default ChangePasswordScreen;
