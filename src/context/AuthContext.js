// Global auth state (Firebase email/password) and the Firestore household profile keyed by uid.

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        setProfileLoading(true);
        const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
        setProfile(snap.exists() ? snap.data() : null);
        setProfileLoading(false);
      } else {
        setProfile(null);
        setProfileLoading(false);
      }
      setInitializing(false);
    });

    return unsubscribe;
  }, []);

  // Creates the auth account only, kept separate so signup errors surface on the account step.
  const signUp = async (email, password) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    return credential.user;
  };

  const saveHouseholdProfile = async (householdProfile) => {
    if (!auth.currentUser) {
      throw new Error('No signed-in user to save a profile for.');
    }
    const uid = auth.currentUser.uid;
    const profileData = {
      email: auth.currentUser.email,
      familySize: householdProfile.familySize,
      postcode: householdProfile.postcode,
      country: householdProfile.country,
      medicalNeeds: householdProfile.medicalNeeds || '',
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', uid), profileData);
    setProfile(profileData);
    return profileData;
  };

  const signIn = (email, password) => signInWithEmailAndPassword(auth, email, password);

  const signOut = () => firebaseSignOut(auth);

  const value = {
    user,
    profile,
    initializing,
    profileLoading,
    signUp,
    saveHouseholdProfile,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
