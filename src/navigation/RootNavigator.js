// Root navigation: Onboarding until the user has a Firestore household profile, then the main tab navigator.

import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/theme';
import OnboardingScreen from '../screens/OnboardingScreen';
import DashboardScreen from '../screens/DashboardScreen';
import PreparednessHubScreen from '../screens/PreparednessHubScreen';
import AlertsScreen from '../screens/AlertsScreen';
import ResourceHubScreen from '../screens/ResourceHubScreen';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Dashboard: 'home',
  'Prep Hub': 'clipboard',
  Alerts: 'alert-triangle',
  Resources: 'book-open',
};

function TabIcon({ label, focused }) {
  return (
    <Feather
      name={TAB_ICONS[label]}
      size={20}
      color={focused ? COLORS.primary : COLORS.textSecondary}
    />
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Prep Hub" component={PreparednessHubScreen} />
      <Tab.Screen name="Alerts" component={AlertsScreen} />
      <Tab.Screen name="Resources" component={ResourceHubScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { initializing, user, profile } = useAuth();

  if (initializing) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  // Onboarded status is per-account not a local device flag
  return (
    <NavigationContainer>
      {user && profile ? <MainTabs /> : <OnboardingScreen />}
    </NavigationContainer>
  );
}
