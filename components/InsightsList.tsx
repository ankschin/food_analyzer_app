import { View, Text } from "react-native";
import { Insights } from "../store/sessionStore";

interface Props {
  insights: Insights;
}

export function InsightsList({ insights }: Props) {
  return (
    <View className="gap-3">
      <Text className="text-stone-500 text-xs font-semibold tracking-widest uppercase">Health Insights</Text>

      {/* Pros */}
      {insights.pros.length > 0 && (
        <View className="bg-green-950/30 border border-green-500/20 rounded-2xl p-4">
          <View className="flex-row items-center gap-2 mb-3">
            <Text style={{ fontSize: 16 }}>✅</Text>
            <Text className="text-green-400 font-semibold text-sm">Benefits</Text>
          </View>
          {insights.pros.map((pro, i) => (
            <View key={i} className="flex-row gap-2.5 mb-2">
              <Text className="text-green-600 text-sm font-bold mt-0.5">+</Text>
              <Text className="text-stone-300 text-sm flex-1 leading-5">{pro}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Cons */}
      {insights.cons.length > 0 && (
        <View className="bg-red-950/30 border border-red-500/20 rounded-2xl p-4">
          <View className="flex-row items-center gap-2 mb-3">
            <Text style={{ fontSize: 16 }}>⚠️</Text>
            <Text className="text-red-400 font-semibold text-sm">Watch Out</Text>
          </View>
          {insights.cons.map((con, i) => (
            <View key={i} className="flex-row gap-2.5 mb-2">
              <Text className="text-red-600 text-sm font-bold mt-0.5">−</Text>
              <Text className="text-stone-300 text-sm flex-1 leading-5">{con}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Best time + Avoid */}
      <View className="flex-row gap-3">
        {insights.best_time_to_eat ? (
          <View className="flex-1 bg-stone-900 border border-stone-800 rounded-2xl p-4">
            <Text style={{ fontSize: 20, marginBottom: 6 }}>🕐</Text>
            <Text className="text-stone-500 text-xs mb-1">Best time to eat</Text>
            <Text className="text-white font-semibold text-sm leading-5">{insights.best_time_to_eat}</Text>
          </View>
        ) : null}

        {insights.who_should_avoid.length > 0 ? (
          <View className="flex-1 bg-amber-950/20 border border-amber-500/20 rounded-2xl p-4">
            <Text style={{ fontSize: 20, marginBottom: 6 }}>🚫</Text>
            <Text className="text-stone-500 text-xs mb-1">Avoid if</Text>
            {insights.who_should_avoid.map((who, i) => (
              <Text key={i} className="text-amber-400 text-xs leading-5">• {who}</Text>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}
