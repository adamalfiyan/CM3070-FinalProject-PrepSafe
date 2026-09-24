// Dashboard: XP, streak, earned/locked badges, task list, and quiz section.

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useGamification } from '../context/GamificationContext';
import { useAuth } from '../context/AuthContext';
import { BADGES } from '../constants/badges';
import { ACTIVE_TASKS, QUIZZES } from '../constants/tasks';
import { COLORS, CARD } from '../constants/theme';
import TaskScreen from './TaskScreen';
import { clearState } from '../utils/storage';

function BadgeCard({ badge, earned }) {
  return (
    <View style={[styles.badgeCard, earned ? styles.badgeEarned : styles.badgeLocked]}>
      <Feather
        name={earned ? badge.icon : 'lock'}
        size={26}
        color={earned ? COLORS.accent : COLORS.textSecondary}
      />
      <Text style={[styles.badgeName, !earned && styles.badgeNameLocked]} numberOfLines={1}>
        {badge.name}
      </Text>
    </View>
  );
}

function TaskRow({ item, completed, onPress }) {
  return (
    <View style={[styles.taskRow, completed && styles.taskRowCompleted]}>
      <View style={styles.taskInfo}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        <Text style={styles.taskXP}>+{item.xp} XP</Text>
      </View>
      {completed ? (
        <View style={styles.checkmarkWrap}>
          <Feather name="check" size={18} color="#FFFFFF" />
        </View>
      ) : (
        <TouchableOpacity style={styles.completeButton} onPress={onPress}>
          <Text style={styles.completeButtonText}>Complete</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function DashboardScreen() {
  const { xp, streak, completedTaskIds, earnedBadgeIds } = useGamification();
  const { user, signOut } = useAuth();
  const [activeItem, setActiveItem] = useState(null);

  const isCompleted = (id) => completedTaskIds.includes(id);

  const handleReset = () => {
    Alert.alert(
      'Reset Demo Data',
      'This will clear all XP, streaks, badges, and completed tasks. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await clearState(user?.uid);
            Alert.alert('Reset Complete', 'Please reload the app (shake → Reload or press r in terminal)');
          },
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={[COLORS.primary, '#3AA8A4']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.appNameRow} onLongPress={handleReset} delayLongPress={1500}>
            <Feather name="shield" size={20} color="#FFFFFF" style={styles.appNameIcon} />
            <Text style={styles.appName}>PrepSafe</Text>
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <View style={styles.streakRow}>
              <Feather name="zap" size={14} color="#FFFFFF" />
              <Text style={styles.streak}>{streak}-day streak</Text>
            </View>
            <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.xp}>XP: {xp}</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>Badges</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.badgeRow}
        >
          {BADGES.map((badge) => (
            <BadgeCard
              key={badge.id}
              badge={badge}
              earned={earnedBadgeIds.includes(badge.id)}
            />
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Preparedness Tasks</Text>
        <FlatList
          data={ACTIVE_TASKS}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TaskRow
              item={item}
              completed={isCompleted(item.id)}
              onPress={() => setActiveItem(item)}
            />
          )}
        />

        <Text style={styles.sectionTitle}>Quizzes</Text>
        <View style={styles.quizSection}>
          {QUIZZES.map((item) => {
            const completed = isCompleted(item.id);
            return (
              <View
                key={item.id}
                style={[styles.taskRow, styles.quizRow, completed && styles.taskRowCompleted]}
              >
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>Quiz: {item.title}</Text>
                  <Text style={styles.taskXP}>+{item.xp} XP</Text>
                </View>
                {completed ? (
                  <View style={styles.checkmarkWrap}>
                    <Feather name="check" size={18} color="#FFFFFF" />
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.completeButton}
                    onPress={() => setActiveItem(item)}
                  >
                    <Text style={styles.completeButtonText}>Start</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      <TaskScreen item={activeItem} onClose={() => setActiveItem(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRight: { alignItems: 'flex-end', gap: 6 },
  appNameRow: { flexDirection: 'row', alignItems: 'center' },
  appNameIcon: { marginRight: 8 },
  appName: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  streak: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  signOutButton: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  signOutText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
  xp: { marginTop: 10, fontSize: 18, fontWeight: '700', color: COLORS.accent },
  scroll: { padding: 16, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 18,
    marginBottom: 10,
  },
  badgeRow: { paddingVertical: 4, gap: 12 },
  badgeCard: {
    ...CARD,
    width: 96,
    padding: 12,
    alignItems: 'center',
    marginRight: 12,
  },
  badgeEarned: { borderWidth: 2, borderColor: COLORS.accent },
  badgeLocked: { opacity: 0.55 },
  badgeName: { marginTop: 6, fontSize: 12, fontWeight: '600', color: COLORS.textPrimary },
  badgeNameLocked: { color: COLORS.textSecondary },
  taskRow: {
    ...CARD,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    marginBottom: 10,
  },
  taskRowCompleted: { borderLeftWidth: 4, borderLeftColor: COLORS.completed },
  quizSection: {
    backgroundColor: COLORS.quizBackground,
    borderRadius: 12,
    padding: 10,
  },
  quizRow: { backgroundColor: COLORS.card },
  taskInfo: { flex: 1, paddingRight: 12 },
  taskTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  taskXP: { marginTop: 4, fontSize: 13, fontWeight: '700', color: COLORS.accent },
  completeButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  completeButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  checkmarkWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.completed,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
