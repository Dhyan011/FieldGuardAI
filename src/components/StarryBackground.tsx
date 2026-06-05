import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  withDelay,
  interpolate,
} from 'react-native-reanimated';

// Pure React Native + Reanimated starry background (no Skia dependency)
const Star = ({ x, y, size, delay }: { x: number; y: number; size: number; delay: number }) => {
  const opacity = useSharedValue(0.2);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: 2000 + Math.random() * 2000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    left: x,
    top: y,
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: '#FFD700',
    opacity: opacity.value,
  }));

  return <Animated.View style={style} />;
};

const GlowOrb = ({ x, y, size, color, delay }: { x: number; y: number; size: number; color: string; delay: number }) => {
  const scale = useSharedValue(0.8);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withTiming(1.2, { duration: 4000 + Math.random() * 3000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    left: x - size / 2,
    top: y - size / 2,
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: color,
    opacity: 0.06,
    transform: [{ scale: scale.value }],
  }));

  return <Animated.View style={style} />;
};

// Pre-generate star and orb data
const starData = Array.from({ length: 35 }).map((_, i) => ({
  x: Math.floor(Math.random() * 400),
  y: Math.floor(Math.random() * 900),
  size: Math.floor(Math.random() * 3) + 1,
  delay: Math.floor(Math.random() * 3000),
}));

const orbData = [
  { x: 80, y: 200, size: 160, color: 'rgba(100, 150, 255, 1)', delay: 0 },
  { x: 300, y: 400, size: 120, color: 'rgba(138, 100, 255, 1)', delay: 1000 },
  { x: 200, y: 700, size: 180, color: 'rgba(100, 150, 255, 1)', delay: 2000 },
  { x: 50, y: 500, size: 100, color: 'rgba(100, 200, 255, 1)', delay: 500 },
  { x: 350, y: 150, size: 140, color: 'rgba(150, 100, 255, 1)', delay: 1500 },
];

const StarryBackground = ({ children, style }: { children?: React.ReactNode; style?: any }) => {
  return (
    <View style={[styles.container, style]}>
      {/* Glow orbs for Van Gogh swirl effect */}
      {orbData.map((orb, i) => (
        <GlowOrb key={`orb-${i}`} {...orb} />
      ))}

      {/* Twinkling stars */}
      {starData.map((star, i) => (
        <Star key={`star-${i}`} {...star} />
      ))}

      {/* Content overlay */}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0b1e',
  },
});

export default StarryBackground;
