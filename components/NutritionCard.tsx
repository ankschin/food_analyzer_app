import { View, Text } from "react-native";

interface Props {
  title: string;
  data: Record<string, string>;
}

const MICRO_META: Record<string, { color: string; icon: string }> = {
  vitamin_c:   { color: "#fb923c", icon: "🍊" },
  vitamin_d:   { color: "#facc15", icon: "☀️" },
  vitamin_a:   { color: "#f59e0b", icon: "🥕" },
  vitamin_b12: { color: "#c084fc", icon: "💊" },
  vitamin_k:   { color: "#4ade80", icon: "🥦" },
  vitamin_e:   { color: "#fb923c", icon: "🌻" },
  iron:        { color: "#f87171", icon: "🩸" },
  calcium:     { color: "#93c5fd", icon: "🦴" },
  fiber:       { color: "#34d399", icon: "🌾" },
  potassium:   { color: "#a78bfa", icon: "🍌" },
  magnesium:   { color: "#2dd4bf", icon: "🥜" },
  zinc:        { color: "#22d3ee", icon: "🦪" },
  sodium:      { color: "#fb7185", icon: "🧂" },
  folate:      { color: "#86efac", icon: "🥬" },
};

const DEFAULT = { color: "#a8a29e", icon: "💧" };

export function NutritionCard({ title, data }: Props) {
  const entries = Object.entries(data);
  if (entries.length === 0) return null;

  return (
    <View className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
      <Text className="text-stone-500 text-xs font-semibold tracking-widest uppercase mb-4">{title}</Text>
      <View className="flex-row flex-wrap gap-2">
        {entries.map(([key, value]) => {
          const meta = MICRO_META[key.toLowerCase()] ?? DEFAULT;
          return (
            <View
              key={key}
              className="bg-stone-800 border border-stone-700 rounded-2xl p-3"
              style={{ minWidth: 100 }}>
              <View className="flex-row items-center gap-1.5 mb-1.5">
                <Text style={{ fontSize: 14 }}>{meta.icon}</Text>
                <Text className="text-stone-500 text-xs capitalize leading-4">
                  {key.replace(/_/g, " ")}
                </Text>
              </View>
              <Text style={{ color: meta.color, fontWeight: "700", fontSize: 14 }}>{value}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
