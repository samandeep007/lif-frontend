import React, { useState, useEffect } from 'react';
import { Animated, Easing, Platform } from 'react-native';
import styled from 'styled-components/native';
import theme from '../../styles/theme';
import Text from '../../components/common/Text';
import Button from '../../components/common/Button';
import api from '../../api/api';
import useAuthStore from '../../store/authStore';
import { setItemAsync } from '../../utils/secureStore';

const Container = styled.View`
  flex: 1;
  background-color: ${theme.colors.background};
  justify-content: center;
  align-items: center;
  padding: ${theme.spacing.lg}px;
`;

const EmailVerification = ({ navigation, formData }) => {
  const setUser = useAuthStore(state => state.setUser);
  const setToken = useAuthStore(state => state.setToken);
  const [isVerified, setIsVerified] = useState(false);

  const messageOpacity = new Animated.Value(0);
  const loginButtonScale = new Animated.Value(0.9);

  Animated.parallel([
    Animated.timing(messageOpacity, {
      toValue: 1,
      duration: 500,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: Platform.OS !== 'web',
    }),
    Animated.spring(loginButtonScale, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: Platform.OS !== 'web',
    }),
  ]).start();

  const checkVerification = async () => {
    try {
      const response = await api.get('/users/me');
      console.log('Verification check response:', response.data);
      if (response.data.success && response.data.data.isVerified) {
        setIsVerified(true);
        setUser(response.data.data);
        setToken(response.data.data.token);
        await setItemAsync('authToken', response.data.data.token);
        return true;
      }
      return false;
    } catch (error) {
      console.log(
        'Verification check failed:',
        error.response?.data?.message || error.message
      );
      return false;
    }
  };

  // Automatic polling
  useEffect(() => {
    if (!isVerified) {
      const interval = setInterval(checkVerification, 3000); // Poll every 3 seconds
      return () => clearInterval(interval);
    }
  }, [isVerified, setUser, setToken]);

  // Navigate when verified
  useEffect(() => {
    if (isVerified) {
      console.log('Email verified, navigating to Login');
      navigation.replace('Login'); // Redirect to Login screen
    }
  }, [isVerified, navigation]);

  return (
    <Container>
      <Animated.View style={{ opacity: messageOpacity }}>
        <Text variant="h1">Check Your Email</Text>
        <Text
          variant="body"
          style={{ marginTop: theme.spacing.md, textAlign: 'center' }}
        >
          We’ve sent a verification link to your email.
        </Text>
        {isVerified && (
          <Text
            variant="body"
            style={{
              marginTop: theme.spacing.md,
              textAlign: 'center',
              color: theme.colors.accent.green,
            }}
          >
            Email verified! Redirecting to login...
          </Text>
        )}
        <Text
          variant="body"
          style={{ marginTop: theme.spacing.md, textAlign: 'center' }}
        >
          Already verified?
        </Text>
      </Animated.View>
      <Animated.View
        style={{
          transform: [{ scale: loginButtonScale }],
          marginTop: theme.spacing.lg,
        }}
      >
        <Button title="Login" onPress={() => navigation.replace('Login')} />
      </Animated.View>
    </Container>
  );
};

export default EmailVerification;
