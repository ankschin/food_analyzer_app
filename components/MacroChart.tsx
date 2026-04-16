import { View, Text } from "react-native";
import { Macros } from "../store/sessionStore";

interface Props {
  macros: Macros;
}

// Approx kcal per gram
const KCAL = { protein: 4, carbs: 4, fats: 9 };

export function MacroChart({ macros }: Props) {
  const totalGrams = macros.protein + macros.carbs + macros.fats || 1;
  const totalKcal =
    macros.protein * KCAL.protein +
    macros.carbs * KCAL.carbs +
    macros.fats * KCAL.fats || 1;

  const bars = [
    {
      label: "Protein", value: macros.protein,
      pct: Math.round((macros.protein / totalGrams) * 100),
      kcal: macros.protein * KCAL.protein,
      kcalPct: Math.round((macros.protein * KCAL.protein / totalKcal) * 100),
      color: "#60a5fa", trackBg: "#1e3a5f", dotBg: "bg-blue-400", text: "text-blue-400",
    },
    {
      label: "Carbs", value: macros.carbs,
      pct: Math.round((macros.carbs / totalGrams) * 100),
      kcal: macros.carbs * KCAL.carbs,
      kcalPct: Math.round((macros.carbs * KCAL.carbs / totalKcal) * 100),
      color: "#facc15", trackBg: "#3b2f04", dotBg: "bg-yellow-400", text: "text-yellow-400",
    },
    {
      label: "Fats", value: macros.fats,
      pct: 100 - Math.round((macros.protein / totalGrams) * 100) - Math.round((macros.carbs / totalGrams) * 100),
      kcal: macros.fats * KCAL.fats,
      kcalPct: 100 - Math.round((macros.protein * KCAL.protein / totalKcal) * 100) - Math.round((macros.carbs * KCAL.carbs / totalKcal) * 100),
      color: "#fb923c", trackBg: "#431407", dotBg: "bg-orange-400", text: "text-orange-400",
    },
  ];

  return (
    <View className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
      <Text className="text-stone-500 text-xs font-semibold tracking-widest uppercase mb-4">Macronutrients</Text>

      {/* Stacked proportion bar */}
      <View className="flex-row h-2.5 rounded-full overflow-hidden mb-5">
        {bars.map((b, i) => (
          <View key={b.label} style={{ flex: b.pct, backgroundColor: b.color, marginLeft: i > 0 ? 2 : 0, borderRadius: 99 }} />
        ))}
      </View>

      {/* Rows */}
      <View className="gap-4">
        {bars.map((b) => (
          <View key={b.label} className="gap-1.5">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: b.color }} />
                <Text className="text-stone-300 text-sm font-medium">{b.label}</Text>
              </View>
              <View className="flex-row items-center gap-3">
                <Text className="text-stone-500 text-xs">{b.kcal} kcal ({b.kcalPct}%)</Text>
                <Text style={{ color: b.color, fontWeight: "700", fontSize: 15, minWidth: 40, textAlign: "right" }}>
                  {b.value}g
                </Text>
              </View>
            </View>
            {/* Individual progress bar */}
            <View style={{ height: 4, backgroundColor: b.trackBg, borderRadius: 99 }}>
              <View style={{ height: 4, width: `${b.pct}%`, backgroundColor: b.color, borderRadius: 99 }} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
