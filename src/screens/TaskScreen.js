// Task/quiz completion modal: description+Complete for tasks, multiple-choice for quizzes, awards XP with a spring animation.

import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useGamification } from '../context/GamificationContext';
import { COLORS, CARD } from '../constants/theme';

export default function TaskScreen({ item, onClose }) {
  const { completeTask } = useGamification();
  const [selected, setSelected] = useState(null);
  const [showXP, setShowXP] = useState(false);
  const xpScale = useRef(new Animated.Value(0)).current;

  const visible = item != null;
  const isQuiz = item?.type === 'quiz';

  // Reset transient state when a new item is opened.
  useEffect(() => {
    if (visible) {
      setSelected(null);
      setShowXP(false);
      xpScale.setValue(0);
    }
  }, [item]);

  const finish = () => {
    completeTask(item.id, item.type);
    setShowXP(true);
    Animated.spring(xpScale, {
      toValue: 1,
      friction: 4,
      tension: 80,
      useNativeDriver: true,
    }).start();
    setTimeout(() => {
      onClose();
    }, 1100);
  };

  const handleQuizSelect = (optionKey) => {
    if (selected != null) {
      return;
    }
    setSelected(optionKey);
    if (optionKey === item.correct) {
      setTimeout(finish, 600);
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Feather name="x" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <Text style={styles.title}>
            {isQuiz ? 'Quiz' : 'Task'}
          </Text>
          <Text style={styles.heading}>{item.title}</Text>

          {!isQuiz && (
            <>
              <Text style={styles.description}>{item.description}</Text>
              <TouchableOpacity style={styles.primaryButton} onPress={finish}>
                <Text style={styles.primaryButtonText}>
                  Mark Complete  (+{item.xp} XP)
                </Text>
              </TouchableOpacity>
            </>
          )}

          {isQuiz && (
            <View style={styles.options}>
              {item.options.map((opt) => {
                const isPicked = selected === opt.key;
                const isCorrect = opt.key === item.correct;
                const showResult = selected != null;
                let optionStyle = styles.option;
                if (showResult && isCorrect) {
                  optionStyle = [styles.option, styles.optionCorrect];
                } else if (showResult && isPicked && !isCorrect) {
                  optionStyle = [styles.option, styles.optionWrong];
                }
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={optionStyle}
                    disabled={selected != null}
                    onPress={() => handleQuizSelect(opt.key)}
                  >
                    <Text style={styles.optionText}>
                      {opt.key}. {opt.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              {selected != null && selected !== item.correct && (
                <Text style={styles.tryAgain}>
                  Not quite. The correct answer is highlighted in green.
                </Text>
              )}
            </View>
          )}

          {showXP && (
            <Animated.View style={[styles.xpBadge, { transform: [{ scale: xpScale }] }]}>
              <Text style={styles.xpBadgeText}>+{item.xp} XP</Text>
            </Animated.View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 36,
    minHeight: 280,
  },
  closeButton: { alignSelf: 'flex-end', padding: 6 },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 6,
    marginBottom: 16,
  },
  description: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 24 },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  options: { marginTop: 4 },
  option: {
    ...CARD,
    padding: 14,
    marginBottom: 10,
  },
  optionCorrect: { borderWidth: 2, borderColor: COLORS.completed, backgroundColor: '#EAF7EF' },
  optionWrong: { borderWidth: 2, borderColor: '#E76F51', backgroundColor: '#FBEAE5' },
  optionText: { fontSize: 15, color: COLORS.textPrimary, fontWeight: '500' },
  tryAgain: { marginTop: 4, fontSize: 13, color: COLORS.textSecondary },
  xpBadge: {
    position: 'absolute',
    alignSelf: 'center',
    top: '40%',
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  xpBadgeText: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
});
