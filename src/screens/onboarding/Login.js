import React, { useState } from 'react';
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
  padding: ${theme.spacing.lg}px;
`;

const Login = ({ navigation }) => {
  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);
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
          } else if (!user.photos || user.photos.length === 0 || !user.bio) {
            navigation.navigate('ProfileSetup');
          } else {
            navigation.replace('MainTabs');
          }
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({
        general:
          error.response?.data?.message ||
          error.message ||
          'Login failed. Please try again.',
      });
    }
  };

  return (
    <Container>
      <Text variant="h1">Welcome Back</Text>
      {['email', 'password'].map((field, index) => (
        <Animated.View
          key={field}
          style={{
            transform: [{ translateY: inputTranslates[index] }],
            width: '100%',
            marginTop: theme.spacing.sm,
          }}
        >
          <Input
            value={form[field]}
            onChangeText={(text) => setForm({ ...form, [field]: text })}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            error={errors[field]}
            secureTextEntry={field === 'password'}
          />
        </Animated.View>
      ))}
      {errors.general && (
        <Text style={{ color: theme.colors.accent.red, marginTop: theme.spacing.sm }}>
          {errors.general}
        </Text>
      )}
      <Animated.View style={{ transform: [{ scale: loginButtonScale }], marginTop: theme.spacing.lg }}>
        <Button title="Login" onPress={handleLogin} />
      </Animated.View>
      <Button
        title="Sign Up Instead"
        onPress={() => navigation.navigate('SignUp')}
        gradient={false}
        style={{ marginTop: theme.spacing.md }}
      />
    </Container>
  );
};

export default Login;