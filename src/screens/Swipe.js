import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../styles/theme';
import SwipeCard from '../components/SwipeCard';
import MatchModal from '../components/MatchModal';
import Text from '../components/common/Text';
import api from '../api/api';
import useAuthStore from '../store/authStore';

const Container = styled.View`
  flex: 1;
  background-color: ${theme.colors.background};
`;

const Header = styled.View`
  width: 100%;
  padding: ${theme.spacing.md}px;
  background-color: ${theme.colors.accent.pink}10; /* Light pink background */
  align-items: center;
  justify-content: center;
  border-bottom-width: 1px;
  border-bottom-color: ${theme.colors.text.secondary}20;
`;

const Content = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const ErrorWrapper = styled.View`
  height: 40px; /* Reserve space for error message */
  margin-bottom: ${theme.spacing.lg}px;
`;

const ErrorText = styled(Text)`
  color: ${theme.colors.accent.red};
  text-align: center;
`;

const NoUsersWrapper = styled.View`
  height: 40px; /* Reserve space for "No more users" message */
  margin-bottom: ${theme.spacing.lg}px;
`;

const ActionButtons = styled.View`
  flex-direction: row;
  justify-content: space-around;
  width: 100%;
  padding: ${theme.spacing.lg}px;
  position: absolute;
  bottom: 20px;
`;

const ActionButton = styled.TouchableOpacity`
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background-color: ${theme.colors.text.primary};
  justify-content: center;
  align-items: center;
`;

const SwipeScreen = () => {
  const user = useAuthStore(state => state.user);
  const [users, setUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchModalVisible, setMatchModalVisible] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPotentialMatches = async () => {
      try {
        setLoading(true);
        const response = await api.get('/potential-matches');
        if (response.data.success) {
          console.log('Potential matches:', response.data.data);
          setUsers(response.data.data);
        } else {
          setError('Failed to load potential matches.');
        }
      } catch (error) {
        console.error('Error fetching potential matches:', error);
        setError(
          error.response?.data?.message || 'Error fetching potential matches.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchPotentialMatches();
  }, []);

  const handleSwipe = async (direction, swipedUser) => {
    console.log('Swiping user:', swipedUser);
    if (!swipedUser || !swipedUser._id) {
      setError('Invalid user data. Cannot swipe.');
      setCurrentIndex(currentIndex + 1);
      return;
    }

    // Map frontend directions to backend directions
    const backendDirection =
      direction === 'right'
        ? 'like'
        : direction === 'left'
          ? 'pass'
          : 'swipe_up';

    try {
      const response = await api.post('/swipes', {
        targetId: swipedUser._id,
        direction: backendDirection,
      });
      if (response.data.success && response.data.data.isMatch) {
        setCurrentMatch({
          user1Photo: user.photos[0],
          user2Photo: swipedUser.photos[0],
          user2Name: swipedUser.name,
        });
        setMatchModalVisible(true);
      }
    } catch (error) {
      console.error('Error recording swipe:', error);
      setError(error.response?.data?.message || 'Error recording swipe.');
    }

    setCurrentIndex(currentIndex + 1);
  };

  return (
    <Container>
      <Header>
        <Text variant="h1" style={{ color: theme.colors.text.primary }}>
          LIF
        </Text>
      </Header>
      <Content>
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.accent.pink} />
        ) : currentIndex >= users.length ? (
          <>
            <NoUsersWrapper>
              <Text variant="h1">No more users to swipe!</Text>
            </NoUsersWrapper>
            <ErrorWrapper />
          </>
        ) : (
          <>
            {users.slice(currentIndex).map((user, index) => (
              <SwipeCard
                key={user._id}
                user={user}
                onSwipe={handleSwipe}
                index={index}
              />
            ))}
            <ErrorWrapper>
              {error && <ErrorText>{error}</ErrorText>}
            </ErrorWrapper>
          </>
        )}
      </Content>
      <ActionButtons>
        <ActionButton onPress={() => handleSwipe('left', users[currentIndex])}>
          <Ionicons name="close" size={30} color={theme.colors.accent.red} />
        </ActionButton>
        <ActionButton onPress={() => handleSwipe('right', users[currentIndex])}>
          <Ionicons name="heart" size={30} color={theme.colors.accent.green} />
        </ActionButton>
        <ActionButton onPress={() => handleSwipe('super', users[currentIndex])}>
          <Ionicons name="star" size={30} color={theme.colors.accent.yellow} />
        </ActionButton>
      </ActionButtons>
      <MatchModal
        visible={matchModalVisible}
        onClose={() => setMatchModalVisible(false)}
        match={currentMatch}
      />
    </Container>
  );
};

export default SwipeScreen;