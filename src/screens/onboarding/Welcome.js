import React from 'react';
import { Animated, Easing, Platform, Dimensions } from 'react-native';
import styled from 'styled-components/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import theme from '../../styles/theme';
import Text from '../../components/common/Text';
import Button from '../../components/common/Button';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const Container = styled.View`
  flex: 1;
  background-color: ${theme.colors.background};
  justify-content: center;
  align-items: center;
  padding: ${hp('5%')}px;
`;

const LogoContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: ${theme.spacing.sm}px;
`;

const LogoText = styled(Text)`
  font-size: 72px; /* Increased from 48px to 64px */
  font-family: Poppins-Bold;
  color: ${theme.colors.text.primary};
`;

const StyledButton = styled(Button)`
  width: ${wp('80%')}px;
  padding: ${hp('2%')}px;
`;

const ButtonContainer = styled(Animated.View)`
  margin-top: ${theme.spacing.lg}px;
  align-self: center;
`;

const SignUpButton = styled(StyledButton)`
  margin-top: ${theme.spacing.md}px;
`;

const Welcome = ({ navigation }) => {
  const titleOpacity = new Animated.Value(0);
  const taglineOpacity = new Animated.Value(0);
  const buttonScale = new Animated.Value(0.9);
  const loginButtonScale = new Animated.Value(0.9);

  Animated.parallel([
    Animated.timing(titleOpacity, {
      toValue: 1,
      duration: 500,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: Platform.OS !== 'web',
    }),
    Animated.timing(taglineOpacity, {
      toValue: 1,
      duration: 500,
      delay: 200,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: Platform.OS !== 'web',
    }),
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: Platform.OS !== 'web',
    }),
    Animated.spring(loginButtonScale, {
      toValue: 1,
      friction: 5,
      tension: 40,
      delay: 200,
      useNativeDriver: Platform.OS !== 'web',
    }),
  ]).start();

  return (
    <Container>
      <LogoContainer>
        <LogoText>LIF</LogoText>
        <Ionicons name="heart" size={72} color={theme.colors.accent.pink} style={{ marginLeft: theme.spacing.sm }} />
      </LogoContainer>
      <Animated.View style={{ opacity: titleOpacity }}>
        <Text
          variant="h1"
          style={{
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.lg,
          }}
        >
          Welcome to LIF
        </Text>
      </Animated.View>
      <Animated.View
        style={{
          opacity: taglineOpacity,
        }}
      >
        <Text
          variant="body"
          style={{
            color: theme.colors.text.secondary,
            fontSize: 20
          }}
        >
          Find Your Match Today
        </Text>
      </Animated.View>
      <ButtonContainer
        style={{
          transform: [{ scale: buttonScale }],
        }}
      >
        <StyledButton
          title="Get Started"
          onPress={() => navigation.navigate('SignUp')}
          textStyle={{
            fontSize: wp('4.5%'),
          }}
        />
      </ButtonContainer>
      <ButtonContainer
        style={{
          transform: [{ scale: loginButtonScale }],
        }}
      >
        <SignUpButton
          title="Login"
          onPress={() => navigation.navigate('Login')}
          gradient={false}
          textStyle={{
            fontSize: wp('4.5%'),
          }}
        />
      </ButtonContainer>
    </Container>
  );
};

export default Welcome;