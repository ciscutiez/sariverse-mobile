/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import React from "react"
import { View } from "react-native"
import Svg, { Defs, LinearGradient, Stop, Rect, Circle,  G, Ellipse } from "react-native-svg"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated"

const AnimatedSvg = Animated.createAnimatedComponent(Svg)


interface SariverseLogoProps {
  size?: number
}

export default function SariverseLogo({ size = 120 }: SariverseLogoProps) {
  const floatAnimation = useSharedValue(0)
  const storeRotation = useSharedValue(0)
  const sparkleScale = useSharedValue(1)

  React.useEffect(() => {
    // Floating animation
    floatAnimation.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    )

    // Subtle store rotation
    storeRotation.value = withRepeat(
      withSequence(
        withTiming(2, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
        withTiming(-2, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    )

    // Sparkle animation
    sparkleScale.value = withRepeat(
      withSequence(
        withTiming(1.5, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    )
  }, [])

  const floatingStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatAnimation.value }],
  }))


  const sparkleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sparkleScale.value }],
  }))

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <AnimatedSvg width={size} height={size} viewBox="0 0 120 120" style={floatingStyle}>
        <Defs>
          {/* Store gradients */}
          <LinearGradient id="storeWall" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#8B5CF6" />
            <Stop offset="100%" stopColor="#A855F7" />
          </LinearGradient>

          <LinearGradient id="storeFront" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#C084FC" />
            <Stop offset="100%" stopColor="#DDD6FE" />
          </LinearGradient>

          <LinearGradient id="roof" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#EF4444" />
            <Stop offset="100%" stopColor="#DC2626" />
          </LinearGradient>

          <LinearGradient id="door" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#92400E" />
            <Stop offset="100%" stopColor="#78350F" />
          </LinearGradient>

          <LinearGradient id="window" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#60A5FA" />
            <Stop offset="50%" stopColor="#3B82F6" />
            <Stop offset="100%" stopColor="#1D4ED8" />
          </LinearGradient>
        </Defs>

        {/* Background circle */}
        <Circle cx="60" cy="60" r="55" fill="url(#storeFront)" opacity="0.1" />

      <Animated.View style={sparkleStyle}>
          <Svg width={size} height={size} style={{ position: "absolute", left: 0, top: 0 }}>
            <G>
              {/* Sparkles/stars */}
              <Circle cx="15" cy="25" r="2" fill="#FCD34D" opacity="0.8" />
              <Circle cx="95" cy="30" r="1.5" fill="#F59E0B" opacity="0.9" />
              <Circle cx="20" cy="70" r="1" fill="#EAB308" opacity="0.7" />
              <Circle cx="90" cy="75" r="2" fill="#FCD34D" opacity="0.8" />

              {/* Small floating boxes (products) */}
              <Rect x="10" y="50" width="4" height="4" fill="#10B981" rx="1" opacity="0.6" />
              <Rect x="100" y="55" width="3" height="3" fill="#EF4444" rx="0.5" opacity="0.7" />
              <Rect x="15" y="90" width="3" height="3" fill="#3B82F6" rx="0.5" opacity="0.6" />
              <Rect x="95" y="95" width="4" height="4" fill="#8B5CF6" rx="1" opacity="0.7" />
            </G>
          </Svg>
        </Animated.View>

        {/* Floating elements around the store */}
        <Animated.View style={sparkleStyle}>
          <Svg width={size} height={size} style={{ position: "absolute", left: 0, top: 0 }}>
            <G>
              {/* Sparkles/stars */}
              <Circle cx="15" cy="25" r="2" fill="#FCD34D" opacity="0.8" />
              <Circle cx="95" cy="30" r="1.5" fill="#F59E0B" opacity="0.9" />
              <Circle cx="20" cy="70" r="1" fill="#EAB308" opacity="0.7" />
              <Circle cx="90" cy="75" r="2" fill="#FCD34D" opacity="0.8" />

              {/* Small floating boxes (products) */}
              <Rect x="10" y="50" width="4" height="4" fill="#10B981" rx="1" opacity="0.6" />
              <Rect x="100" y="55" width="3" height="3" fill="#EF4444" rx="0.5" opacity="0.7" />
              <Rect x="15" y="90" width="3" height="3" fill="#3B82F6" rx="0.5" opacity="0.6" />
              <Rect x="95" y="95" width="4" height="4" fill="#8B5CF6" rx="1" opacity="0.7" />
            </G>
          </Svg>
        </Animated.View>

        {/* Ground/base */}
        <Ellipse cx="60" cy="95" rx="35" ry="8" fill="#6B7280" opacity="0.3" />
      </AnimatedSvg>
    </View>
  )
}
