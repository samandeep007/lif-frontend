import React from 'react';
import { Text as RNText } from 'react-native';
import theme from '../../styles/theme';

const Text = ({ variant, style, ...props }) => {
  const getStyle = () => {
    const baseStyle = {
      color: theme.colors.text.primary,
      fontFamily:
        variant === 'h1' || variant === 'h2'
          ? 'Poppins-Bold'
          : 'Poppins-Regular',
      fontSize:
        variant === 'h1'
          ? 32
          : variant === 'h2'
            ? 24
            : variant === 'body'
              ? 16
              : 16,
    };
    return [baseStyle, style];
  };

  return <RNText style={getStyle()} {...props} />;
};

export default Text;
