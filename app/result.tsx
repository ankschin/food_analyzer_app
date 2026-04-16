import { ScrollView, View, Text, TouchableOpacity, Image } from "react-native";
import { router } from "expo-router";
import { useSessionStore } from "../store/sessionStore";
import { NutritionCard } from "../components/NutritionCard";
import { MacroChart } from "../components/MacroChart";
import { InsightsList } from "../components/InsightsList";
import { CalorieRing } from "../components/CalorieRing";

export default function ResultScreen() {
  const analyses = useSessionStore((s) => s.analyses);
  const latest = analyses[analyses.length - 1];

  if (!latest) {
    return (
      <View className="flex-1 bg-stone-950 items-center justify-center px-6">
        <Text style={{ fontSize: 48, marginBottom: 16 }}>🍽️</Text>
        <Text className="text-white text-lg font-bold text-center mb-2">No analysis yet</Text>
        <Text className="text-stone-500 text-sm text-center mb-6">Go back and upload a food photo to get started.</Text>
        <TouchableOpacity onPress={() => router.replace("/")} className="bg-orange-500 px-8 py-3 rounded-2xl">
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { confidence } = latest;
  const badge = confidence === "high"
    ? { bg: "bg-green-500/15", border: "border-green-500/30", text: "text-green-400", dot: "bg-green-400", label: "High confidence" }
    : confidence === "medium"
    ? { bg: "bg-amber-500/15", border: "border-amber-500/30", text: "text-amber-400", dot: "bg-amber-400", label: "Medium confidence" }
    : { bg: "bg-red-500/15", border: "border-red-500/30", text: "text-red-400", dot: "bg-red-400", label: "Low confidence" };

  return (
    <ScrollView className="flex-1 bg-stone-950" contentContainerClassName="pb-12">

      {/* Food image */}
      {latest.imageUri && (
        <View style={{ height: 260 }} className="bg-stone-900">
          <Image
            source={{ uri: latest.imageUri }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
          {/* Gradient overlay at bottom so text reads cleanly */}
          <View
            style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 120,
              background: "linear-gradient(to top, #0c0a09, transparent)" as any }}
          />
          {/* Food name overlaid on image */}
          <View className="absolute bottom-0 left-0 right-0 px-5 pb-4">
            <Text className="text-white font-bold leading-snug mb-2" style={{ fontSize: 22,
              textShadowColor: "rgba(0,0,0,0.8)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 }}>
              {latest.food_items.join(", ")}
            </Text>
            <View className={`self-start flex-row items-center gap-2 px-3 py-1.5 rounded-full border ${badge.bg} ${badge.border}`}>
              <View className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
              <Text className={`text-xs font-semibold ${badge.text}`}>{badge.label}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Food name header (no image fallback) */}
      {!latest.imageUri && (
        <View className="px-5 pt-7 pb-5">
          <Text className="text-stone-500 text-xs font-semibold tracking-widest uppercase mb-2">Detected</Text>
          <Text className="text-white font-bold leading-snug mb-3" style={{ fontSize: 26 }}>
            {latest.food_items.join(", ")}
          </Text>
          <View className={`self-start flex-row items-center gap-2 px-3 py-1.5 rounded-full border ${badge.bg} ${badge.border}`}>
            <View className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
            <Text className={`text-xs font-semibold ${badge.text}`}>{badge.label}</Text>
          </View>
        </View>
      )}

      {/* Calorie ring + macros row */}
      <View className="mx-5 bg-stone-900 border border-stone-800 rounded-3xl p-5 mb-4">
        <View className="items-center mb-5">
          <CalorieRing calories={latest.calories} size={180} />
        </View>

        {/* Macro quick stats */}
        <View className="flex-row gap-2">
          {[
            { label: "Protein", value: latest.macros.protein, unit: "g", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
            { label: "Carbs",   value: latest.macros.carbs,   unit: "g", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
            { label: "Fats",    value: latest.macros.fats,    unit: "g", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
          ].map(({ label, value, unit, color, bg, border }) => (
            <View key={label} className={`flex-1 ${bg} border ${border} rounded-2xl p-3 items-center`}>
              <Text className={`font-bold text-xl ${color}`}>{value}</Text>
              <Text className="text-stone-500 text-xs mt-0.5">{unit} {label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Macro chart */}
      <View className="mx-5 mb-4">
        <MacroChart macros={latest.macros} />
      </View>

      {/* Micronutrients */}
      <View className="mx-5 mb-4">
        <NutritionCard title="Micronutrients" data={latest.micros} />
      </View>

      {/* Assumptions */}
      {latest.assumptions.length > 0 && (
        <View className="mx-5 mb-4 bg-stone-900 border border-stone-800 rounded-2xl p-4">
          <Text className="text-stone-500 text-xs font-semibold tracking-widest uppercase mb-3">AI Assumptions</Text>
          {latest.assumptions.map((a, i) => (
            <View key={i} className="flex-row gap-2 mb-1.5">
              <Text className="text-stone-600 text-sm mt-0.5">·</Text>
              <Text className="text-stone-400 text-sm flex-1 leading-5">{a}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Health insights */}
      <View className="mx-5 mb-6">
        <InsightsList insights={latest.insights} />
      </View>

      {/* Actions */}
      <View className="mx-5 gap-3">
        <TouchableOpacity
          onPress={() => router.replace("/")}
          className="bg-orange-500 py-4 rounded-2xl items-center"
          style={{ shadowColor: "#f97316", shadowOpacity: 0.4, shadowRadius: 16, shadowOffset: { width: 0, height: 6 } }}>
          <Text className="text-white text-base font-bold">Analyze Another Meal</Text>
        </TouchableOpacity>
        {analyses.length > 1 && (
          <TouchableOpacity
            onPress={() => router.push("/history")}
            className="bg-stone-800 border border-stone-700 py-4 rounded-2xl items-center">
            <Text className="text-stone-300 text-base font-semibold">
              Session · {analyses.length} meals
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}
