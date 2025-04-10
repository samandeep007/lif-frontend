import React, { useState } from 'react';
import Welcome from './onboarding/Welcome';
import SignUp from './onboarding/SignUp';
import Login from './onboarding/Login'; // Ensure this import is correct
import EmailVerification from './onboarding/EmailVerification';
import ProfileSetup from './onboarding/ProfileSetup';
import FinalWelcome from './onboarding/FinalWelcome';

const OnboardingScreen = ({ route, navigation }) => {
  const { name } = route;
  const [formData, setFormData] = useState(null);

  if (name === 'Welcome') {
    return <Welcome navigation={navigation} />;
  }

  if (name === 'SignUp') {
    return <SignUp navigation={navigation} setFormData={setFormData} />;
  }

  if (name === 'Login') {
    return <Login navigation={navigation} />;
  }

  if (name === 'EmailVerification') {
    return <EmailVerification navigation={navigation} formData={formData} />;
  }

  if (name === 'ProfileSetup') {
    return <ProfileSetup navigation={navigation} />;
  }

  if (name === 'FinalWelcome') {
    return <FinalWelcome navigation={navigation} />;
  }

  return null;
};

export default OnboardingScreen;