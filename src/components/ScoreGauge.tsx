import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { colors, fonts } from '../lib/theme';

interface ScoreGaugeProps {
  score: number; // 0-100
  size?: number;
}

function scoreToColor(score: number): string {
  if (score >= 80) return colors.red;
  if (score >= 60) return colors.amber;
  if (score >= 40) return colors.primary;
  return colors.green;
}

export function ScoreGauge({ score, size = 64 }: ScoreGaugeProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (clampedScore / 100) * circumference;
  const gap = circumference - dash;
  const accentColor = scoreToColor(clampedScore);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {/* Background track */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colors.border}
            strokeWidth={5}
          />
          {/* Score arc */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={accentColor}
            strokeWidth={5}
            strokeDasharray={`${dash} ${gap}`}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      <View style={styles.labelContainer}>
        <Text style={[styles.scoreText, { color: accentColor, fontSize: size * 0.22 }]}>
          {Math.round(clampedScore)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontWeight: fonts.weight.bold,
    fontFamily: fonts.mono,
  },
});
