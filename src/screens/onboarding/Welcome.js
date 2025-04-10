import React from 'react';
import { Animated, Easing, Platform, Dimensions } from 'react-native';
import styled from 'styled-components/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import theme from '../../styles/theme';
import Text from '../../components/common/Text';
import Button from '../../components/common/Button';

const { width, height } = Dimensions.get('window');

const Container = styled.View`
  flex: 1;
  background-color: ${theme.colors.background};
  justify-content: center;
  align-items: center;
  padding: ${hp('5%')}px;
`;

const StyledButton = styled(Button)`
  width: ${wp('80%')}px;
  padding: ${hp('2%')}px;
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
      <Animated.View style={{ opacity: titleOpacity }}>
        <Text
          variant="h1"
          style={{
            fontSize: wp('4%'), // Responsive font size
            color: theme.colors.text.primary,
          }}
        >
          Love Is Free
        </Text>
      </Animated.View>
      <Animated.View
        style={{
          opacity: taglineOpacity,
          marginTop: hp('2%'), // Responsive margin
        }}
      >
        <Text
          variant="body"
          style={{
            fontSize: wp('2%'), // Responsive font size
            color: theme.colors.text.secondary,
          }}
        >
          Find Your Match Today
        </Text>
      </Animated.View>
      <Animated.View
        style={{
          transform: [{ scale: buttonScale }],
          marginTop: hp('5%'), // Responsive margin
        }}
      >
        <StyledButton
          title="Get Started"
          onPress={() => navigation.navigate('SignUp')}
          textStyle={{
            fontSize: wp('4.5%'), // Responsive font size
          }}
        />
      </Animated.View>
      <Animated.View
        style={{
          transform: [{ scale: loginButtonScale }],
          marginTop: hp('2%'), // Responsive margin
        }}
      >
        <StyledButton
          title="Login"
          onPress={() => navigation.navigate('Login')}
          gradient={false}
          textStyle={{
            fontSize: wp('4.5%'), // Responsive font size
          }}
        />
      </Animated.View>
    </Container>
  );
};

export default Welcome;