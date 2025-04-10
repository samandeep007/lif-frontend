import React, { useState, useEffect } from 'react';
import { Animated, Easing, Platform } from 'react-native';
import styled from 'styled-components/native';
import theme from '../../styles/theme';
import Text from '../../components/common/Text';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import api from '../../api/api';
import useAuthStore from '../../store/authStore';
import { setItemAsync } from '../../utils/secureStore';

const Container = styled.View`
  flex: 1;
  background-color: ${theme.colors.background};
  justify-content: center;
  align-items: center;
  padding: ${theme.spacing.md}px;
`;

const InputContainer = styled(Animated.View)`
  margin-bottom: ${theme.spacing.md}px;
  align-self: center; /* Ensure centering */
`;

const ErrorWrapper = styled.View`
  height: 10px; /* Reserve space for general error message */
  margin-top: ${theme.spacing.sm}px;
  margin-bottom: ${theme.spacing.md}px;
`;

const ErrorText = styled(Text)`
  color: ${theme.colors.accent.red};
  text-align: center;
`;

const ButtonContainer = styled(Animated.View)`
  margin-top: ${theme.spacing.lg}px;
  align-self: center; /* Ensure centering */
`;

const SignUpButton = styled(Button)`
  margin-top: ${theme.spacing.md}px;
`;

const Login = ({ navigation }) => {
  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);
  const setIsAuthenticated = useAuthStore((state) => state.setIsAuthenticated);
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  const inputTranslates = [
    new Animated.Value(50),
    new Animated.Value(50),
  ];
  const loginButtonScale = new Animated.Value(0.9);

  useEffect(() => {
    Animated.parallel([
      ...inputTranslates.map((translate, index) =>
        Animated.timing(translate, {
          toValue: 0,
          duration: 300,
          delay: index * 100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        })
      ),
      Animated.spring(loginButtonScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, []); // Empty dependency array ensures this runs only once on mount

  const validateForm = () => {
    const newErrors = {};
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!form.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      const response = await api.post('/auth/login', {
        email: form.email,
        password: form.password,
      });
      if (response.data.success) {
        const { token } = response.data.data;
        await setItemAsync('authToken', token);
        setToken(token);

        // Fetch user profile to check status
        const userResponse = await api.get('/users/me');
        if (userResponse.data.success) {
          const user = userResponse.data.data;
          setUser(user);

          if (!user.isVerified) {
            navigation.navigate('EmailVerification');
          } else if (!user.selfie) {
            // If the user doesn't have a selfie, navigate to ProfileSetup
            navigation.navigate('ProfileSetup');
          } else {
            // If the user has a selfie, proceed to MainTabs
            setIsAuthenticated(true);
          }
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response && error.response.status === 403) {
        setErrors({
          general: 'Verify your account, and try again.',
        });
      } else {
        setErrors({
          general:
            error.response?.data?.message ||
            error.message ||
            'Login failed. Please try again.',
        });
      }
    }
  };

  return (
    <Container>
      <Text variant="h1" style={{ marginBottom: theme.spacing.lg }}>
        Welcome Back
      </Text>
      {['email', 'password'].map((field, index) => (
        <InputContainer
          key={field}
          style={{
            transform: [{ translateY: inputTranslates[index] }],
          }}
        >
          <Input
            value={form[field]}
            onChangeText={(text) => setForm({ ...form, [field]: text })}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            error={errors[field]}
            secureTextEntry={field === 'password'}
          />
        </InputContainer>
      ))}
      <ErrorWrapper>
        {errors.general && (
          <ErrorText>{errors.general}</ErrorText>
        )}
      </ErrorWrapper>
      <ButtonContainer style={{ transform: [{ scale: loginButtonScale }] }}>
        <Button title="Login" onPress={handleLogin} />
      </ButtonContainer>
      <SignUpButton
        title="Sign Up Instead"
        onPress={() => navigation.navigate('SignUp')}
        gradient={false}
      />
    </Container>
  );
};

export default Login;