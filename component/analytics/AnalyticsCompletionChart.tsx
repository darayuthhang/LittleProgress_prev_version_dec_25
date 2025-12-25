import { ANALYTICS_THEME } from "@/constant/analyticsTheme";
import React, { useEffect } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Animated, {
    useAnimatedProps,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import Svg, { Circle, G } from "react-native-svg";

const { width } = Dimensions.get("window");
const CHART_SIZE = width * 0.65;
const RADIUS = CHART_SIZE / 2;
const STROKE_WIDTH = 25;
const CIRCLE_LENGTH = 2 * Math.PI * (RADIUS - STROKE_WIDTH / 2);

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  rate: number;
}

export const AnalyticsCompletionChart = ({ rate }: Props) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(rate, { duration: 1000 });
  }, [rate]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCLE_LENGTH * (1 - progress.value),
  }));

  return (
    <View style={styles.chartCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Completion Rate</Text>
        <Text style={styles.cardSubtitle}>
          You finish {Math.round(rate * 100)}% of what you start.
        </Text>
      </View>
      <View style={styles.chartContent}>
        <View style={styles.chartWrapper}>
          <Svg width={CHART_SIZE} height={CHART_SIZE}>
            <G rotation="-90" origin={`${RADIUS}, ${RADIUS}`}>
              <Circle
                cx={RADIUS}
                cy={RADIUS}
                r={RADIUS - STROKE_WIDTH / 2}
                stroke="#F0F0F0"
                strokeWidth={STROKE_WIDTH}
                fill="transparent"
              />
              <AnimatedCircle
                cx={RADIUS}
                cy={RADIUS}
                r={RADIUS - STROKE_WIDTH / 2}
                stroke={ANALYTICS_THEME.ACCENT_GOLD}
                strokeWidth={STROKE_WIDTH}
                fill="transparent"
                strokeDasharray={CIRCLE_LENGTH}
                animatedProps={animatedProps}
                strokeLinecap="round"
              />
            </G>
          </Svg>
          <View style={styles.chartTextContainer}>
            <Text style={styles.chartPercentage}>
              {Math.round(rate * 100)}%
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chartCard: {
    backgroundColor: ANALYTICS_THEME.CARD_BG,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    width: "100%",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    color: ANALYTICS_THEME.TEXT_COLOR,
  },
  cardSubtitle: {
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
    color: ANALYTICS_THEME.SUBTEXT_COLOR,
    marginTop: 2,
  },
  chartContent: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  chartWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  chartTextContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  chartPercentage: {
    fontSize: 32,
    fontFamily: "Poppins_700Bold",
    color: ANALYTICS_THEME.TEXT_COLOR,
  },
});
