// Offline Resource Hub: first aid, evacuation, and contacts info served from a local SQLite database.

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, FlatList, ActivityIndicator } from 'react-native';
import { initResourceDb, getResourcesByCategory } from '../utils/resourceDb';
import { COLORS, CARD } from '../constants/theme';

const CATEGORIES = [
  { key: 'first_aid', label: 'First Aid' },
  { key: 'evacuation', label: 'Evacuation' },
  { key: 'contacts', label: 'Contacts' },
];

export default function ResourceHubScreen() {
  const [ready, setReady] = useState(false);
  const [activeCategory, setActiveCategory] = useState('first_aid');
  const [items, setItems] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    (async () => {
      await initResourceDb();
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    (async () => {
      const rows = await getResourcesByCategory(activeCategory);
      setItems(rows);
    })();
  }, [ready, activeCategory]);

  if (!ready) {
    return (
      <SafeAreaView style={[styles.safe, styles.centered]}>
        <ActivityIndicator color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Resource Hub</Text>
        <Text style={styles.headerSubtitle}>Available offline, even in airplane mode</Text>
      </View>

      <View style={styles.tabs}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[styles.tab, activeCategory === cat.key && styles.tabActive]}
            onPress={() => {
              setActiveCategory(cat.key);
              setExpandedId(null);
            }}
          >
            <Text style={[styles.tabText, activeCategory === cat.key && styles.tabTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const expanded = expandedId === item.id;
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => setExpandedId(expanded ? null : item.id)}
            >
              <Text style={styles.cardTitle}>{item.title}</Text>
              {expanded && <Text style={styles.cardBody}>{item.body}</Text>}
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, paddingBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary },
  headerSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8, gap: 8 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.card,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  tabTextActive: { color: '#FFFFFF' },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  card: { ...CARD, padding: 14, marginBottom: 10 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  cardBody: { marginTop: 8, fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 },
});
