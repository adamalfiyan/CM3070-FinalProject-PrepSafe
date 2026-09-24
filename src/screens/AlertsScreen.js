// Alerts screen: watches GPS against Firestore alert zones, notifies and logs on entry, includes a demo "Simulate" button.

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Alert as RNAlert,
} from 'react-native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Feather } from '@expo/vector-icons';
import {
  collection,
  onSnapshot,
  addDoc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { isInsideZone } from '../utils/geo';
import { COLORS, CARD } from '../constants/theme';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function AlertsScreen() {
  const { user } = useAuth();
  const [zones, setZones] = useState([]);
  const [activeAlert, setActiveAlert] = useState(null);
  const [history, setHistory] = useState([]);
  const [locationReady, setLocationReady] = useState(false);
  const notifiedZoneIds = useRef(new Set());

  // Subscribe to active alert zones in real time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'alertZones'), (snap) => {
      setZones(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsubscribe;
  }, []);

  // Subscribe to user's alert history.
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'users', user.uid, 'alertHistory'),
      orderBy('deliveredAt', 'desc'),
      limit(20)
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      setHistory(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsubscribe;
  }, [user]);

  // Request notification permission once on mount.
  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);

  // Watch GPS position and check against zones.
  useEffect(() => {
    let subscription;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationReady(false);
        return;
      }
      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 20, timeInterval: 5000 },
        (position) => {
          setLocationReady(true);
          checkZones(position.coords);
        }
      );
    })();
    return () => subscription && subscription.remove();
  }, [zones, user]);

  const checkZones = async (coords) => {
    const insideZone = zones.find((zone) => zone.active !== false && isInsideZone(coords, zone));

    if (!insideZone) {
      setActiveAlert(null);
      return;
    }

    setActiveAlert(insideZone);

    if (!notifiedZoneIds.current.has(insideZone.id)) {
      notifiedZoneIds.current.add(insideZone.id);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${insideZone.disasterType || 'Emergency'} alert nearby`,
          body: insideZone.guidance || 'An emergency zone has been declared near your location.',
        },
        trigger: null,
      });
      if (user) {
        await addDoc(collection(db, 'users', user.uid, 'alertHistory'), {
          zoneId: insideZone.id,
          disasterType: insideZone.disasterType || 'Emergency',
          guidance: insideZone.guidance || '',
          deliveredAt: new Date().toISOString(),
        });
      }
    }
  };

  const simulateAlert = async () => {
    try {
      const position = await Location.getCurrentPositionAsync({});
      await addDoc(collection(db, 'alertZones'), {
        disasterType: 'Flood (simulated)',
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        radiusMeters: 1000,
        guidance: 'Move to higher ground immediately. Avoid walking or driving through flood water.',
        active: true,
      });
      RNAlert.alert('Simulated alert', 'A flood zone was detected near your current location');
    } catch (error) {
      RNAlert.alert('Could not simulate alert', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alerts</Text>
        <Text style={styles.headerSubtitle}>
          {locationReady ? 'Monitoring your location for nearby emergencies' : 'Waiting for location permission...'}
        </Text>
      </View>

      {activeAlert ? (
        <View style={styles.activeCard}>
          <View style={styles.activeTitleRow}>
            <Feather name="alert-triangle" size={18} color={COLORS.danger} />
            <Text style={styles.activeTitle}>{activeAlert.disasterType}</Text>
          </View>
          <Text style={styles.activeGuidance}>{activeAlert.guidance}</Text>
        </View>
      ) : (
        <View style={styles.noAlertCard}>
          <Text style={styles.noAlertText}>No active alerts near you right now.</Text>
        </View>
      )}

      <TouchableOpacity style={styles.simulateButton} onPress={simulateAlert}>
        <Text style={styles.simulateButtonText}>Simulate Nearby Alert (Demo)</Text>
      </TouchableOpacity>

      <Text style={styles.historyTitle}>Alert History</Text>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.historyList}
        ListEmptyComponent={<Text style={styles.emptyText}>No past alerts yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.historyRow}>
            <Text style={styles.historyType}>{item.disasterType}</Text>
            <Text style={styles.historyDate}>
              {new Date(item.deliveredAt).toLocaleString()}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 20, paddingBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary },
  headerSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  activeCard: {
    ...CARD,
    marginHorizontal: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E76F51',
    backgroundColor: '#FBEAE5',
  },
  activeTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  activeTitle: { fontSize: 16, fontWeight: '700', color: '#B3401F' },
  activeGuidance: { marginTop: 6, fontSize: 14, color: COLORS.textPrimary, lineHeight: 20 },
  noAlertCard: { ...CARD, marginHorizontal: 16, padding: 16 },
  noAlertText: { fontSize: 14, color: COLORS.textSecondary },
  simulateButton: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  simulateButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  historyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 20,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  historyList: { paddingHorizontal: 16, paddingBottom: 30 },
  historyRow: {
    ...CARD,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    marginBottom: 8,
  },
  historyType: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  historyDate: { fontSize: 12, color: COLORS.textSecondary },
  emptyText: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', marginTop: 20 },
});
