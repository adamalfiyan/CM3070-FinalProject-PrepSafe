// Onboarding: permission -> log in/create account choice -> household profile (new accounts only).

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS, CARD } from '../constants/theme';

const STEPS = {
  PERMISSION: 'permission',
  CHOICE: 'choice',
  LOGIN: 'login',
  ACCOUNT: 'account',
  PROFILE: 'profile',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Maps Firebase auth error codes to plain-language messages.
function friendlyAuthError(error) {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'That email is already registered. Try signing in instead, or use a different email.';
    case 'auth/invalid-email':
      return 'That email address looks invalid.';
    case 'auth/weak-password':
      return 'That password is too weak. Use at least 6 characters.';
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
      return 'No account found with that email and password.';
    case 'auth/wrong-password':
      return 'That password is incorrect.';
    case 'auth/network-request-failed':
      return 'Could not reach the server. Check your internet connection and try again.';
    default:
      return error.message;
  }
}

function Logo() {
  return (
    <View style={styles.logoRow}>
      <View style={styles.logoMark}>
        <Feather name="shield" size={20} color="#FFFFFF" />
      </View>
      <Text style={styles.appName}>PrepSafe</Text>
    </View>
  );
}

function BackButton({ onPress }) {
  return (
    <TouchableOpacity style={styles.backButton} onPress={onPress}>
      <Feather name="arrow-left" size={16} color={COLORS.primary} />
      <Text style={styles.backButtonText}>Back</Text>
    </TouchableOpacity>
  );
}

export default function OnboardingScreen() {
  const { user, profile, profileLoading, signUp, signIn, saveHouseholdProfile } = useAuth();
  const [step, setStep] = useState(STEPS.PERMISSION);
  const [history, setHistory] = useState([]);
  const [locationGranted, setLocationGranted] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);

  const goTo = (nextStep) => {
    setHistory((h) => [...h, step]);
    setStep(nextStep);
  };

  const goBack = () => {
    setHistory((h) => {
      if (h.length === 0) return h;
      setStep(h[h.length - 1]);
      return h.slice(0, -1);
    });
  };

  // Once Firestore confirms an authenticated user has no profile yet, go to household step.
  useEffect(() => {
    if (user && !profileLoading && !profile) {
      setAccountCreated(true);
      setHistory([]);
      setStep(STEPS.PROFILE);
    }
  }, [user, profile, profileLoading]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [creatingAccount, setCreatingAccount] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

  const [familySize, setFamilySize] = useState('');
  const [country, setCountry] = useState('');
  const [postcode, setPostcode] = useState('');
  const [medicalNeeds, setMedicalNeeds] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const requestLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      setLocationGranted(true);
      goTo(STEPS.CHOICE);
    } else {
      Alert.alert(
        'Location needed',
        'PrepSafe uses your location to warn you about nearby emergencies. You can enable it later in Settings.',
        [{ text: 'Continue anyway', onPress: () => goTo(STEPS.CHOICE) }]
      );
    }
  };

  const handleLogin = async () => {
    if (!EMAIL_REGEX.test(loginEmail.trim())) {
      Alert.alert('Check your email', 'Enter a valid email address, e.g. name@example.com.');
      return;
    }
    if (!loginPassword) {
      Alert.alert('Enter your password', 'Password is required.');
      return;
    }

    setLoggingIn(true);
    try {
      await signIn(loginEmail.trim(), loginPassword);
      // Navigation is handled by the effect above and by RootNavigator
    } catch (error) {
      Alert.alert('Could not sign in', friendlyAuthError(error));
    } finally {
      setLoggingIn(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!EMAIL_REGEX.test(email.trim())) {
      Alert.alert('Check your email', 'Enter a valid email address, e.g. name@example.com.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Check your password', 'Password must be at least 6 characters.');
      return;
    }

    // Don't recreate the account if it was already created earlier
    if (accountCreated) {
      goTo(STEPS.PROFILE);
      return;
    }

    setCreatingAccount(true);
    try {
      await signUp(email.trim(), password);
      setAccountCreated(true);
      goTo(STEPS.PROFILE);
    } catch (error) {
      Alert.alert('Could not create account', friendlyAuthError(error));
    } finally {
      setCreatingAccount(false);
    }
  };

  const handleFinish = async () => {
    const familySizeNumber = Number(familySize);
    if (!familySize || !Number.isInteger(familySizeNumber) || familySizeNumber < 1) {
      Alert.alert('Check family size', 'Family size must be a whole number of at least 1.');
      return;
    }
    if (!country.trim()) {
      Alert.alert('Almost done', 'Country is required, since postcode formats differ between countries.');
      return;
    }
    if (!postcode.trim()) {
      Alert.alert('Almost done', 'This field is required so alerts can be localised to you.');
      return;
    }

    setSubmitting(true);
    try {
      // Writing the profile updates AuthContext's profile state, which RootNavigator use to switch views.
      await saveHouseholdProfile({
        familySize: familySizeNumber,
        country: country.trim(),
        postcode: postcode.trim(),
        medicalNeeds,
      });
    } catch (error) {
      Alert.alert('Could not save your profile', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <Logo />

          {step === STEPS.PERMISSION && (
            <View style={styles.card}>
              <Text style={styles.title}>Stay warned nearby</Text>
              <Text style={styles.description}>
                PrepSafe checks your location against active emergency zones so you get
                warned as soon as one is declared near you. This never runs without your permission.
              </Text>
              <TouchableOpacity style={styles.primaryButton} onPress={requestLocation}>
                <Text style={styles.primaryButtonText}>Enable Location</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => goTo(STEPS.CHOICE)}>
                <Text style={styles.skipText}>Skip for now</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === STEPS.CHOICE && (
            <View style={styles.card}>
              <BackButton onPress={goBack} />
              <Text style={styles.title}>Welcome to PrepSafe</Text>
              <Text style={styles.description}>
                Already have an account? Log in to pick up where you left off. Otherwise,
                create a new account to get started.
              </Text>
              <TouchableOpacity style={styles.primaryButton} onPress={() => goTo(STEPS.LOGIN)}>
                <Feather name="log-in" size={18} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.primaryButtonText}>Log In</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryButton, styles.secondaryButton]}
                onPress={() => goTo(STEPS.ACCOUNT)}
              >
                <Feather name="user-plus" size={18} color={COLORS.primary} style={styles.buttonIcon} />
                <Text style={styles.secondaryButtonText}>Create Account</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === STEPS.LOGIN && (
            <View style={styles.card}>
              <BackButton onPress={goBack} />
              <Text style={styles.title}>Log in</Text>
              <Text style={styles.description}>
                Sign in with the email and password you used to create your account.
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                value={loginEmail}
                onChangeText={setLoginEmail}
              />
              <View style={styles.passwordRow}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Password"
                  secureTextEntry={!showLoginPassword}
                  value={loginPassword}
                  onChangeText={setLoginPassword}
                />
                <TouchableOpacity
                  style={styles.showPasswordButton}
                  onPress={() => setShowLoginPassword((prev) => !prev)}
                >
                  <Feather
                    name={showLoginPassword ? 'eye-off' : 'eye'}
                    size={18}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[styles.primaryButton, loggingIn && styles.primaryButtonDisabled]}
                onPress={handleLogin}
                disabled={loggingIn}
              >
                <Text style={styles.primaryButtonText}>
                  {loggingIn ? 'Signing in...' : 'Log In'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {step === STEPS.ACCOUNT && (
            <View style={styles.card}>
              <BackButton onPress={goBack} />
              <Text style={styles.title}>Create your account</Text>
              <Text style={styles.description}>
                {locationGranted
                  ? 'Location enabled. Now set up your account.'
                  : "You'll need an account to save your progress and receive alerts."}
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              <View style={styles.passwordRow}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Password (min. 6 characters)"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  style={styles.showPasswordButton}
                  onPress={() => setShowPassword((prev) => !prev)}
                >
                  <Feather
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={18}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[styles.primaryButton, creatingAccount && styles.primaryButtonDisabled]}
                onPress={handleCreateAccount}
                disabled={creatingAccount}
              >
                <Text style={styles.primaryButtonText}>
                  {creatingAccount ? 'Creating account...' : 'Continue'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {step === STEPS.PROFILE && (
            <View style={styles.card}>
              <BackButton onPress={goBack} />
              <Text style={styles.title}>Your household</Text>
              <Text style={styles.description}>
                This helps PrepSafe personalise alerts and guidance to your situation.
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Family size (number of people)"
                keyboardType="number-pad"
                value={familySize}
                onChangeText={setFamilySize}
              />
              <TextInput
                style={styles.input}
                placeholder="Country"
                value={country}
                onChangeText={setCountry}
              />
              <TextInput
                style={styles.input}
                placeholder="Postcode (format depends on your country)"
                value={postcode}
                onChangeText={setPostcode}
              />
              <TextInput
                style={styles.input}
                placeholder="Medical needs (optional)"
                value={medicalNeeds}
                onChangeText={setMedicalNeeds}
              />
              <TouchableOpacity
                style={[styles.primaryButton, submitting && styles.primaryButtonDisabled]}
                onPress={handleFinish}
                disabled={submitting}
              >
                <Text style={styles.primaryButtonText}>
                  {submitting ? 'Setting up...' : 'Finish Setup'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  appName: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.primary,
  },
  card: { ...CARD, padding: 20 },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 12,
    gap: 6,
  },
  backButtonText: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
  description: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20, marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.locked,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    marginBottom: 12,
    color: COLORS.textPrimary,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.locked,
    borderRadius: 8,
    marginBottom: 12,
    paddingRight: 8,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  showPasswordButton: { paddingHorizontal: 8, paddingVertical: 6 },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  primaryButtonDisabled: { opacity: 0.6 },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    marginTop: 12,
  },
  secondaryButtonText: { color: COLORS.primary, fontWeight: '700', fontSize: 15 },
  buttonIcon: { marginRight: 8 },
  skipText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginTop: 14,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});
