import { useState, useRef } from "react";
import {
  View, Text, TouchableOpacity, Image,
  ActivityIndicator, ScrollView, Dimensions, Platform,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { router } from "expo-router";
import { useAnalyze } from "../hooks/useAnalyze";
import { useSessionStore } from "../store/sessionStore";
import { WebCamera, WebCameraHandle } from "../components/WebCamera.web";

const { width } = Dimensions.get("window");

const MAX_DIM = 1024;

async function compressImage(base64: string, uri?: string): Promise<string> {
  if (Platform.OS === "web") {
    return new Promise((resolve) => {
      const img = new (window as any).Image();
      img.onload = () => {
        const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82).split(",")[1]);
      };
      img.src = "data:image/jpeg;base64," + base64;
    });
  }
  // Native: resize via expo-image-manipulator using the file URI
  if (!uri) return base64;
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: MAX_DIM } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true }
  );
  return result.base64 ?? base64;
}

function parseCalories(cal: string | number): number {
  if (typeof cal === "number") return cal;
  const range = cal.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (range) return Math.round((parseInt(range[1]) + parseInt(range[2])) / 2);
  return parseInt(String(cal).replace(/\D/g, ""), 10) || 0;
}

export default function CaptureScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const webCamRef = useRef<WebCameraHandle>(null);

  const { mutate: analyze, isPending } = useAnalyze();
  const addAnalysis = useSessionStore((s) => s.addAnalysis);
  const analyses = useSessionStore((s) => s.analyses);
  const sessionCount = analyses.length;
  const sessionCalories = analyses.reduce((s, a) => s + parseCalories(a.calories), 0);

  const handleCapture = async () => {
    if (capturing) return;
    setCapturing(true);

    if (Platform.OS === "web") {
      const base64 = await webCamRef.current?.capture() ?? null;
      setShowCamera(false);
      setCapturing(false);
      if (base64) {
        const uri = "data:image/jpeg;base64," + base64;
        setPreviewUri(uri);
        submitImage(base64, uri);
      } else {
        setErrorMsg("Could not capture image from camera.");
      }
    } else {
      if (!cameraRef.current) { setCapturing(false); return; }
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.8 });
      setShowCamera(false);
      setCapturing(false);
      if (photo) {
        setPreviewUri(photo.uri);
        const compressed = await compressImage(photo.base64!, photo.uri);
        submitImage(compressed, photo.uri);
      }
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setPreviewUri(asset.uri);
      setErrorMsg(null);
      if (!asset.base64) {
        setErrorMsg("Could not read image data. Try a different image.");
        return;
      }
      const compressed = await compressImage(asset.base64, asset.uri);
      submitImage(compressed, asset.uri);
    }
  };

  const submitImage = (base64: string, uri?: string) => {
    setErrorMsg(null);
    analyze({ image: base64 }, {
      onSuccess: (data) => { addAnalysis({ ...data, imageUri: uri }); router.push("/result"); },
      onError: (err: any) => {
        setErrorMsg(err?.message ?? "Analysis failed. Is the backend running?");
      },
    });
  };

  if (showCamera) {
    if (Platform.OS !== "web" && !permission?.granted) {
      return (
        <View className="flex-1 items-center justify-center bg-stone-950 px-6">
          <Text style={{ fontSize: 48, marginBottom: 16 }}>📷</Text>
          <Text className="text-white text-lg font-bold text-center mb-2">Camera access needed</Text>
          <Text className="text-stone-500 text-sm text-center mb-6">Allow camera access to take a photo of your meal.</Text>
          <TouchableOpacity onPress={requestPermission} className="bg-orange-500 px-8 py-3 rounded-2xl">
            <Text className="text-white font-bold">Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowCamera(false)} className="mt-4 py-3 px-6">
            <Text className="text-stone-500 text-sm">Cancel</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View className="flex-1 bg-black">
        {Platform.OS === "web" ? (
          <WebCamera
            ref={webCamRef}
            onError={(msg) => { setShowCamera(false); setErrorMsg(msg); }}
          />
        ) : (
          <CameraView
            ref={cameraRef}
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
            facing="back"
          />
        )}

        {/* Shutter flash overlay — covers camera instantly on press */}
        {capturing && (
          <View className="absolute inset-0 bg-white opacity-80" />
        )}

        {/* Controls */}
        <View className="absolute bottom-0 left-0 right-0 pb-12 pt-6 bg-black/50 items-center gap-6">
          <Text className="text-stone-400 text-xs tracking-widest uppercase">Point at your meal</Text>
          <View className="flex-row items-center justify-between w-full px-10">
            {/* Cancel */}
            <TouchableOpacity
              onPress={() => setShowCamera(false)}
              className="w-14 h-14 rounded-full bg-stone-800/80 items-center justify-center">
              <Text className="text-white text-xl">✕</Text>
            </TouchableOpacity>

            {/* Shutter */}
            <TouchableOpacity
              onPress={handleCapture}
              disabled={capturing}
              className="items-center justify-center"
              style={{ width: 80, height: 80 }}>
              <View className="w-20 h-20 rounded-full border-4 border-white items-center justify-center">
                <View
                  className="rounded-full bg-white"
                  style={{ width: capturing ? 48 : 60, height: capturing ? 48 : 60 }}
                />
              </View>
            </TouchableOpacity>

            {/* Placeholder to balance layout */}
            <View className="w-14 h-14" />
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-stone-950" contentContainerClassName="pb-12">

      {/* Hero */}
      <View className="px-5 pt-8 pb-6">
        <Text className="text-stone-500 text-xs font-semibold tracking-widest uppercase mb-3">AI Nutrition Scanner</Text>
        <Text className="text-white font-bold leading-tight mb-2" style={{ fontSize: 32 }}>
          Snap. Analyze.{"\n"}
          <Text className="text-orange-400">Know what you eat.</Text>
        </Text>
        <Text className="text-stone-500 text-sm">Upload a food photo for instant calorie & nutrition breakdown.</Text>
      </View>

      {/* Upload zone */}
      <View className="mx-5 mb-5">
        {previewUri ? (
          <View className="rounded-3xl overflow-hidden" style={{ height: 240 }}>
            <Image source={{ uri: previewUri }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
            {isPending && (
              <View className="absolute inset-0 bg-stone-950/75 items-center justify-center gap-3">
                <ActivityIndicator size="large" color="#f97316" />
                <Text className="text-orange-400 font-semibold text-sm">Analyzing your meal…</Text>
                <Text className="text-stone-500 text-xs">This may take a few seconds</Text>
              </View>
            )}
          </View>
        ) : (
          <TouchableOpacity
            onPress={handlePickImage}
            activeOpacity={0.7}
            className="rounded-3xl border-2 border-dashed border-stone-700 items-center justify-center"
            style={{ height: 220 }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🍽️</Text>
            <Text className="text-white font-semibold text-base mb-1">Drop your meal here</Text>
            <Text className="text-stone-500 text-sm">Tap to browse photos</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Error */}
      {errorMsg && (
        <View className="mx-5 mb-4 bg-red-950/50 border border-red-500/30 rounded-2xl p-4 flex-row gap-3 items-start">
          <Text className="text-red-400 text-base">⚠</Text>
          <Text className="text-red-300 text-sm flex-1 leading-5">{errorMsg}</Text>
        </View>
      )}

      {/* Action buttons */}
      {!isPending && (
        <View className="px-5 gap-3">
          <TouchableOpacity
            onPress={() => setShowCamera(true)}
            className="bg-orange-500 py-4 rounded-2xl items-center"
            style={{ shadowColor: "#f97316", shadowOpacity: 0.4, shadowRadius: 16, shadowOffset: { width: 0, height: 6 } }}>
            <Text className="text-white text-base font-bold">📷  Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handlePickImage}
            className="bg-stone-800 border border-stone-700 py-4 rounded-2xl items-center">
            <Text className="text-white text-base font-semibold">🖼  Upload from Gallery</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Session strip */}
      {sessionCount > 0 && !isPending && (
        <TouchableOpacity
          onPress={() => router.push("/history")}
          className="mx-5 mt-6 bg-stone-900 border border-stone-800 rounded-2xl p-4 flex-row items-center justify-between">
          <View>
            <Text className="text-stone-400 text-xs mb-0.5">Today's Session</Text>
            <Text className="text-white font-bold text-base">
              {sessionCalories} kcal
              <Text className="text-stone-500 font-normal text-sm"> · {sessionCount} meal{sessionCount > 1 ? "s" : ""}</Text>
            </Text>
          </View>
          <Text className="text-orange-400 text-sm font-semibold">View →</Text>
        </TouchableOpacity>
      )}

      {/* How it works */}
      {!previewUri && (
        <View className="mx-5 mt-6 bg-stone-900 border border-stone-800 rounded-2xl p-5">
          <Text className="text-stone-400 text-xs font-semibold tracking-widest uppercase mb-4">How it works</Text>
          {[
            { icon: "📸", step: "Capture", desc: "Take or upload a photo of your meal" },
            { icon: "🧠", step: "AI Analyzes", desc: "Detects food items & estimates portions" },
            { icon: "📊", step: "Get Insights", desc: "Calories, macros, micros & health tips" },
          ].map(({ icon, step, desc }) => (
            <View key={step} className="flex-row items-center gap-4 mb-3">
              <View className="w-10 h-10 rounded-xl bg-stone-800 items-center justify-center">
                <Text style={{ fontSize: 20 }}>{icon}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold text-sm">{step}</Text>
                <Text className="text-stone-500 text-xs leading-4">{desc}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
