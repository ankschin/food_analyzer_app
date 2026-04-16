import { View, Text } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

interface Props {
  calories: string | number;
  size?: number;
}

function parseCalories(cal: string | number): number {
  if (typeof cal === "number") return cal;
  const range = cal.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (range) return Math.round((parseInt(range[1]) + parseInt(range[2])) / 2);
  return parseInt(String(cal).replace(/\D/g, ""), 10) || 0;
}

export function CalorieRing({ calories, size = 200 }: Props) {
  const value = parseCalories(calories);
  const maxMeal = 900;
  const strokeWidth = 14;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / maxMeal, 1);
  const offset = circumference * (1 - pct);
  const cx = size / 2;
  const cy = size / 2;

  const ringColor =
    value < 300 ? "#4ade80" :
    value < 500 ? "#fb923c" :
    value < 700 ? "#f97316" :
    "#ef4444";

  const label =
    value < 300 ? "Light" :
    value < 500 ? "Moderate" :
    value < 700 ? "Hearty" :
    "Heavy";

  return (
    <View style={{ alignItems: "center", justifyContent: "center", width: size, height: size }}>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Defs>
          <LinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={ringColor} stopOpacity="1" />
            <Stop offset="100%" stopColor={ringColor} stopOpacity="0.6" />
          </LinearGradient>
        </Defs>
        {/* Track */}
        <Circle cx={cx} cy={cy} r={radius} stroke="#27272a" strokeWidth={strokeWidth} fill="none" />
        {/* Progress */}
        <Circle
          cx={cx} cy={cy} r={radius}
          stroke="url(#ringGrad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${cx}, ${cy}`}
        />
      </Svg>
      <View style={{ alignItems: "center" }}>
        <Text style={{ color: ringColor, fontSize: 44, fontWeight: "800", lineHeight: 50 }}>{value}</Text>
        <Text style={{ color: "#a8a29e", fontSize: 11, fontWeight: "700", letterSpacing: 3, marginTop: 2 }}>KCAL</Text>
        <Text style={{ color: ringColor, fontSize: 11, fontWeight: "600", marginTop: 4 }}>{label}</Text>
      </View>
    </View>
  );
}
