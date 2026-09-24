// Preparedness Hub: full checklist/quiz library grouped by category, with per-category progress.

import React, { useState } from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity, SafeAreaView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useGamification } from '../context/GamificationContext';
import { TASKS } from '../constants/tasks';
import { COLORS, CARD } from '../constants/theme';
import TaskScreen from './TaskScreen';

const CATEGORY_LABELS = {
  home_safety: 'Home Safety',
  evacuation: 'Evacuation',
  contacts: 'Emergency Contacts',
  supplies: 'Supplies',
  planning: 'Household Planning',
};

function groupByCategory(items) {
  const groups = {};
  items.forEach((item) => {
    const key = item.category || 'other';
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });
  return Object.keys(groups).map((key) => ({
    title: CATEGORY_LABELS[key] || key,
    data: groups[key],
  }));
}

export default function PreparednessHubScreen() {
  const { completedTaskIds } = useGamification();
  const [activeItem, setActiveItem] = useState(null);
  const sections = groupByCategory(TASKS);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Preparedness Hub</Text>
        <Text style={styles.headerSubtitle}>All checklists and quizzes, by category</Text>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderSectionHeader={({ section }) => {
          const done = section.data.filter((i) => completedTaskIds.includes(i.id)).length;
          return (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionProgress}>{done}/{section.data.length}</Text>
            </View>
          );
        }}
        renderItem={({ item }) => {
          const completed = completedTaskIds.includes(item.id);
          return (
            <View style={[styles.row, completed && styles.rowCompleted]}>
              <View style={styles.rowInfo}>
                <Text style={styles.rowLabel}>{item.type === 'quiz' ? 'Quiz: ' : ''}{item.title}</Text>
                <Text style={styles.rowXP}>+{item.xp} XP</Text>
              </View>
              {completed ? (
                <View style={styles.checkmarkWrap}>
                  <Feather name="check" size={18} color="#FFFFFF" />
                </View>
              ) : (
                <TouchableOpacity style={styles.actionButton} onPress={() => setActiveItem(item)}>
                  <Text style={styles.actionButtonText}>{item.type === 'quiz' ? 'Start' : 'Complete'}</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />

      <TaskScreen item={activeItem} onClose={() => setActiveItem(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 20, paddingBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary },
  headerSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  sectionProgress: { fontSize: 13, fontWeight: '600', color: COLORS.accent },
  row: {
    ...CARD,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    marginBottom: 8,
  },
  rowCompleted: { borderLeftWidth: 4, borderLeftColor: COLORS.completed },
  rowInfo: { flex: 1, paddingRight: 12 },
  rowLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  rowXP: { marginTop: 4, fontSize: 12, fontWeight: '700', color: COLORS.accent },
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  actionButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
  checkmarkWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.completed,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
