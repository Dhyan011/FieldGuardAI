import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Canvas,
  Circle,
  LinearGradient,
  Rect,
  vec,
  useClock,
} from '@shopify/react-native-skia';
import { useDerivedValue, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';

// A simple Skia-based starry background with a dark navy gradient and slow-moving particles.
const StarryBackground = ({ children, style }: { children?: React.ReactNode, style?: any }) => {
  const clock = useClock();

  // Create some static stars
  const stars = Array.from({ length: 40 }).map((_, i) => ({
    x: Math.random() * 400,
    y: Math.random() * 900,
    r: Math.random() * 2 + 0.5,
    opacityOffset: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.002 + 0.001
  }));

  // Create subtle swirling particles for Van Gogh effect
  const particles = Array.from({ length: 15 }).map((_, i) => ({
    cx: Math.random() * 400,
    cy: Math.random() * 900,
    r: Math.random() * 80 + 40,
    offset: Math.random() * Math.PI * 2,
  }));

  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  return (
    <View style={[styles.container, style]}>
      <Canvas style={StyleSheet.absoluteFill}>
        {/* Deep Navy/Blue gradient background */}
        <Rect x={0} y={0} width={1000} height={1000}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, 1000)}
            colors={['#0a0b1e', '#11183b', '#0a192f']}
          />
        </Rect>

        {/* Swirling glow elements (Van Gogh vibe) */}
        {particles.map((p, i) => (
          <Circle
            key={`glow-${i}`}
            cx={p.cx}
            cy={p.cy}
            r={p.r}
            color="rgba(100, 150, 255, 0.03)"
            // Add a slight blur effect to make it look like a paint stroke
          />
        ))}

        {/* Stars */}
        {stars.map((star, i) => (
          <Circle
            key={`star-${i}`}
            cx={star.x}
            cy={star.y}
            r={star.r}
            color="rgba(255, 223, 0, 0.6)" // Golden light accents
          />
        ))}
      </Canvas>
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
