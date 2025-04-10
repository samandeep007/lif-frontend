import React from 'react';
import { TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import styled from 'styled-components/native';
import theme from '../../styles/theme';
import { triggerHaptic } from '../../utils/haptics';

const ButtonContainer = styled(TouchableOpacity)`
  width: 300px;
  height: 50px;
  border-radius: ${theme.borderRadius.large}px;
  justify-content: center;
  align-items: center;
`;

const ButtonText = styled.Text`
  font-family: Poppins-Bold;
  font-size: 18px;
  color: ${theme.colors.text.primary};
`;

const Button = ({ title, onPress, gradient = true }) => {
  const handlePress = () => {
    triggerHaptic('light');
    onPress();
  };

  return (
    <ButtonContainer onPress={handlePress}>
      {gradient ? (
        <LinearGradient
          colors={theme.colors.gradient.pinkToBlue}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: theme.borderRadius.large,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ButtonText>{title}</ButtonText>
        </LinearGradient>
      ) : (
        <ButtonText>{title}</ButtonText>
      )}
    </ButtonContainer>
  );
};

export default Button;
