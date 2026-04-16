import { ScrollView, View, Text, TouchableOpacity, Image } from "react-native";
import { router } from "expo-router";
import { useSessionStore } from "../store/sessionStore";

const DAILY_GOAL = 2000;

function parseCalories(cal: string | number): number {
  if (typeof cal === "number") return cal;
  const range = cal.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (range) return Math.round((parseInt(range[1]) + parseInt(range[2])) / 2);
  return parseInt(String(cal).replace(/\D/g, ""), 10) || 0;
}

export default function HistoryScreen() {
  const analyses = useSessionStore((s) => s.analyses);
  const clearSession = useSessionStore((s) => s.clearSession);

  if (analyses.length === 0) {
    return (
      <View className="flex-1 bg-stone-950 items-center justify-center px-6">
        <Text style={{ fontSize: 48, marginBottom: 16 }}>📋</Text>
        <Text className="text-white text-lg font-bold text-center mb-2">No meals yet</Text>
        <Text className="text-stone-500 text-sm text-center mb-6">Analyze a meal to see your session history.</Text>
        <TouchableOpacity onPress={() => router.replace("/")} className="bg-orange-500 px-8 py-3 rounded-2xl">
          <Text className="text-white font-bold">Analyze a Meal</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const totalCal = analyses.reduce((s, a) => s + parseCalories(a.calories), 0);
  const totalProtein = analyses.reduce((s, a) => s + a.macros.protein, 0);
  const totalCarbs   = analyses.reduce((s, a) => s + a.macros.carbs, 0);
  const totalFats    = analyses.reduce((s, a) => s + a.macros.fats, 0);
  const goalPct = Math.min((totalCal / DAILY_GOAL) * 100, 100);
  const remaining = Math.max(DAILY_GOAL - totalCal, 0);

  const goalColor = goalPct < 60 ? "#4ade80" : goalPct < 85 ? "#fb923c" : "#ef4444";

  return (
    <ScrollView className="flex-1 bg-stone-950" contentContainerClassName="pb-12">

      {/* Daily goal card */}
      <View className="mx-5 mt-6 bg-stone-900 border border-stone-800 rounded-3xl p-5 mb-4">
        <View className="flex-row items-start justify-between mb-4">
          <View>
            <Text className="text-stone-500 text-xs font-semibold tracking-widest uppercase mb-1">Daily Progress</Text>
            <Text className="text-white font-bold" style={{ fontSize: 40 }}>{totalCal}</Text>
            <Text className="text-stone-500 text-sm">of {DAILY_GOAL} kcal goal</Text>
          </View>
          <View className="items-end">
            <View className="bg-stone-800 rounded-2xl px-3 py-2 items-center">
              <Text className="text-white font-bold text-lg">{remaining}</Text>
              <Text className="text-stone-500 text-xs">kcal left</Text>
            </View>
          </View>
        </View>

        {/* Progress bar */}
        <View className="h-3 bg-stone-800 rounded-full overflow-hidden mb-4">
          <View
            className="h-3 rounded-full"
            style={{ width: `${goalPct}%`, backgroundColor: goalColor, transition: "width 0.5s" }}
          />
        </View>

        {/* Macro row */}
        <View className="flex-row gap-2">
          {[
            { label: "Protein", value: totalProtein, color: "#60a5fa" },
            { label: "Carbs",   value: totalCarbs,   color: "#facc15" },
            { label: "Fats",    value: totalFats,    color: "#fb923c" },
          ].map(({ label, value, color }) => (
            <View key={label} className="flex-1 bg-stone-800 rounded-2xl p-3 items-center">
              <Text style={{ color, fontSize: 18, fontWeight: "800" }}>{value}g</Text>
              <Text className="text-stone-500 text-xs mt-0.5">{label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Meals header */}
      <View className="px-5 mb-3 flex-row items-center justify-between">
        <Text className="text-stone-500 text-xs font-semibold tracking-widest uppercase">
          {analyses.length} Meal{analyses.length > 1 ? "s" : ""}
        </Text>
        <Text className="text-stone-600 text-xs">Newest first</Text>
      </View>

      {/* Meal cards */}
      <View className="px-5 gap-3">
        {[...analyses].reverse().map((item) => {
          const cal = parseCalories(item.calories);
          const pct = totalCal > 0 ? (cal / totalCal) * 100 : 0;
          const badgeColor = item.confidence === "high" ? "#4ade80"
            : item.confidence === "medium" ? "#fbbf24" : "#f87171";

          return (
            <View key={item.id} className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
              {/* Calorie fill bar at top */}
              <View className="h-1 bg-stone-800">
                <View className="h-1 bg-orange-500/60" style={{ width: `${pct}%` }} />
              </View>

              <View className="p-4 flex-row gap-3">
                {item.imageUri && (
                  <Image
                    source={{ uri: item.imageUri }}
                    style={{ width: 56, height: 56, borderRadius: 12 }}
                    resizeMode="cover"
                  />
                )}
                <View className="flex-1">
                <View className="flex-row items-start justify-between mb-2">
                  <Text className="text-white font-semibold text-sm flex-1 mr-3 leading-5" numberOfLines={2}>
                    {item.food_items.join(", ")}
                  </Text>
                  <View className="items-end">
                    <Text className="text-orange-400 font-bold text-base">{item.calories}</Text>
                    <Text className="text-stone-600 text-xs">kcal</Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-1">
                  <Text className="text-stone-600 text-xs">P {item.macros.protein}g</Text>
                  <Text className="text-stone-700 text-xs"> · </Text>
                  <Text className="text-stone-600 text-xs">C {item.macros.carbs}g</Text>
                  <Text className="text-stone-700 text-xs"> · </Text>
                  <Text className="text-stone-600 text-xs">F {item.macros.fats}g</Text>
                  <View className="ml-auto flex-row items-center gap-1.5">
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: badgeColor }} />
                    <Text className="text-stone-500 text-xs capitalize">{item.confidence}</Text>
                    <Text className="text-stone-700 text-xs"> · </Text>
                    <Text className="text-stone-500 text-xs">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </Text>
                  </View>
                </View>
                </View>{/* flex-1 */}
              </View>
            </View>
          );
        })}
      </View>

      {/* Clear session */}
      <TouchableOpacity
        onPress={() => { clearSession(); router.replace("/"); }}
        className="mx-5 mt-6 border border-red-500/20 py-4 rounded-2xl items-center">
        <Text className="text-red-500/70 font-semibold text-sm">Clear Session</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
