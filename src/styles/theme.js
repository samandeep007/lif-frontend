const theme = {
    colors: {
      background: '#000000', // Black background
      text: {
        primary: '#FFFFFF', // White for primary text
        secondary: '#D3D3D3', // Light gray for secondary text
      },
      accent: {
        pink: '#FF69B4', // Pink for likes, buttons
        red: '#FF4500', // Red for dislikes
        blue: '#1E90FF', // Blue for swipe up, info
      },
      gradient: {
        pinkToBlue: ['#FF69B4', '#1E90FF'], // Gradient for buttons
      },
      overlay: {
        like: '#00FF00', // Green for "LIKE"
        nope: '#FF0000', // Red for "NOPE"
        super: '#1E90FF', // Blue for "SUPER"
      },
    },
    typography: {
      h1: {
        fontFamily: 'Poppins-Bold',
        fontSize: 28,
        color: '#FFFFFF',
      },
      h2: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 20,
        color: '#FFFFFF',
      },
      body: {
        fontFamily: 'Poppins-Regular',
        fontSize: 16,
        color: '#FFFFFF',
      },
      caption: {
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
        color: '#D3D3D3',
      },
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    borderRadius: {
      small: 8,
      medium: 10,
      large: 20,
    },
  };
  
  export default theme;