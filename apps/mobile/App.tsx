import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { WebView } from "react-native-webview";
import Constants from "expo-constants";

const DEFAULT_URL =
  (Constants.expoConfig?.extra?.mentraAppUrl as string | undefined) ||
  "http://localhost:3000";

export default function App() {
  const [appUrl, setAppUrl] = useState(DEFAULT_URL);
  const [joinCode, setJoinCode] = useState("CALC32");
  const [path, setPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const target = useMemo(() => {
    if (!path) return null;
    const base = appUrl.replace(/\/$/, "");
    return `${base}${path}`;
  }, [appUrl, path]);

  if (target) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="light" />
        <View style={styles.topBar}>
          <Pressable onPress={() => setPath(null)} style={styles.backBtn}>
            <Text style={styles.backText}>← Mentra home</Text>
          </Pressable>
        </View>
        {loading ? (
          <ActivityIndicator style={styles.loader} color="#5142D8" />
        ) : null}
        <WebView
          source={{ uri: target }}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          style={styles.webview}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <Text style={styles.brand}>Mentra</Text>
        <Text style={styles.sub}>
          Android companion — join a live tutoring session or open your
          dashboard.
        </Text>

        <Text style={styles.label}>Web app URL</Text>
        <TextInput
          value={appUrl}
          onChangeText={setAppUrl}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
          placeholder="http://YOUR_LAN_IP:3000"
        />

        <Text style={styles.label}>Guest join code</Text>
        <TextInput
          value={joinCode}
          onChangeText={setJoinCode}
          autoCapitalize="characters"
          style={styles.input}
          placeholder="CALC32"
        />

        <Pressable
          style={styles.primary}
          onPress={() =>
            setPath(`/join/${encodeURIComponent(joinCode.trim().toUpperCase())}`)
          }
        >
          <Text style={styles.primaryText}>Join session</Text>
        </Pressable>

        <Pressable style={styles.secondary} onPress={() => setPath("/login")}>
          <Text style={styles.secondaryText}>Open login</Text>
        </Pressable>

        <Pressable
          style={styles.secondary}
          onPress={() => setPath("/dashboard")}
        >
          <Text style={styles.secondaryText}>Tutor dashboard</Text>
        </Pressable>

        <Text style={styles.hint}>
          Tip: on a physical Android device use your computer&apos;s LAN IP
          instead of localhost (e.g. http://192.168.1.10:3000).
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F7F7FB" },
  container: { flex: 1, padding: 20, gap: 10 },
  brand: {
    fontSize: 32,
    fontWeight: "700",
    color: "#5142D8",
    marginTop: 12,
  },
  sub: { color: "#6B6B7B", marginBottom: 12, lineHeight: 20 },
  label: { fontSize: 12, fontWeight: "600", color: "#20202A" },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E6E6EF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  primary: {
    marginTop: 8,
    backgroundColor: "#5142D8",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryText: { color: "#fff", fontWeight: "700" },
  secondary: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E6E6EF",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryText: { color: "#20202A", fontWeight: "600" },
  hint: { marginTop: 16, color: "#6B6B7B", fontSize: 12, lineHeight: 18 },
  topBar: {
    backgroundColor: "#5142D8",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  backBtn: { alignSelf: "flex-start" },
  backText: { color: "#fff", fontWeight: "600" },
  webview: { flex: 1 },
  loader: { position: "absolute", top: 64, alignSelf: "center", zIndex: 2 },
});
