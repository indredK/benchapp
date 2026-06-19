import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Dimensions, StyleSheet, View } from 'react-native';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

const INITIAL_SCALE_FACTOR = Dimensions.get('screen').height / 90;
const DURATION = 600;

function useReduceMotion() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setEnabled);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setEnabled);
    return () => sub?.remove();
  }, []);
  return enabled;
}

export function AnimatedSplashOverlay() {
  const [visible, setVisible] = useState(true);
  const reduceMotion = useReduceMotion();

  if (!visible) return null;

  // Respect reduce motion: skip animation, show static overlay briefly
  if (reduceMotion) {
    setTimeout(() => setVisible(false), 300);
    return <View style={styles.backgroundSolidColor} />;
  }

  const splashKeyframe = new Keyframe({
    0: {
      transform: [{ scale: INITIAL_SCALE_FACTOR }],
      opacity: 1,
    },
    20: {
      opacity: 1,
    },
    70: {
      opacity: 0,
      easing: Easing.elastic(0.7),
    },
    100: {
      opacity: 0,
      transform: [{ scale: 1 }],
      easing: Easing.elastic(0.7),
    },
  });

  return (
    <Animated.View
      entering={splashKeyframe.duration(DURATION).withCallback((finished) => {
        'worklet';
        if (finished) {
          scheduleOnRN(setVisible, false);
        }
      })}
      style={styles.backgroundSolidColor}
    />
  );
}

const keyframe = new Keyframe({
  0: {
    transform: [{ scale: INITIAL_SCALE_FACTOR }],
  },
  100: {
    transform: [{ scale: 1 }],
    easing: Easing.elastic(0.7),
  },
});

const logoKeyframe = new Keyframe({
  0: {
    transform: [{ scale: 1.3 }],
    opacity: 0,
  },
  40: {
    transform: [{ scale: 1.3 }],
    opacity: 0,
    easing: Easing.elastic(0.7),
  },
  100: {
    opacity: 1,
    transform: [{ scale: 1 }],
    easing: Easing.elastic(0.7),
  },
});

const glowKeyframe = new Keyframe({
  0: {
    transform: [{ rotateZ: '0deg' }],
  },
  100: {
    transform: [{ rotateZ: '7200deg' }],
  },
});

export function AnimatedIcon() {
  const reduceMotion = useReduceMotion();

  // Respect reduce motion: render static, no glow rotation
  if (reduceMotion) {
    return (
      <View style={styles.iconContainer}>
        <View style={styles.background} />
        <View style={styles.imageContainer}>
          <Image style={styles.image} source={require('@/assets/images/expo-logo.png')} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.iconContainer}>
      <Animated.View entering={glowKeyframe.duration(60 * 1000 * 4)} style={styles.glow}>
        <Image style={styles.glow} source={require('@/assets/images/logo-glow.png')} />
      </Animated.View>

      <Animated.View entering={keyframe.duration(DURATION)} style={styles.background} />
      <Animated.View style={styles.imageContainer} entering={logoKeyframe.duration(DURATION)}>
        <Image style={styles.image} source={require('@/assets/images/expo-logo.png')} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    width: 201,
    height: 201,
    position: 'absolute',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 128,
    height: 128,
    zIndex: 100,
  },
  image: {
    position: 'absolute',
    width: 76,
    height: 71,
  },
  background: {
    borderRadius: 40,
    experimental_backgroundImage: `linear-gradient(180deg, #3C9FFE, #0274DF)`,
    width: 128,
    height: 128,
    position: 'absolute',
  },
  backgroundSolidColor: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#208AEF',
    zIndex: 1000,
  },
});
