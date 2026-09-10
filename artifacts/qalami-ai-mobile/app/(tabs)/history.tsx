import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';

type HistoryItem = { platform: string; text: string; createdAt: string };

const platformLabels: Record<string, string> = {
  instagram: 'إنستغرام', tiktok: 'تيك توك', twitter: 'X', youtube: 'يوتيوب', snapchat: 'سناب',
};

export default function HistoryScreen() {
  const router = useRouter();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setItems(JSON.parse((await AsyncStorage.getItem('qalami_history')) || '[]'));
    setLoading(false);
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor="#7C4DFF" />}>
      <View style={styles.header}>
        <Text style={styles.title}>مكتبتي 📚</Text>
        <Text style={styles.subtitle}>منشوراتك المحفوظة جاهزة للنسخ والنشر</Text>
      </View>
      {loading ? <ActivityIndicator color="#7C4DFF" /> : items.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="book-open" size={36} color="#7C4DFF" />
          <Text style={styles.emptyTitle}>مكتبتك فارغة بعد</Text>
          <Text style={styles.emptyText}>ولّد أول منشور وسيظهر هنا تلقائياً.</Text>
          <Pressable onPress={() => router.navigate('/')} style={styles.button}><Text style={styles.buttonText}>ابدأ الكتابة</Text></Pressable>
        </View>
      ) : items.map((item, index) => (
        <View key={`${item.createdAt}-${index}`} style={styles.card}>
          <View style={styles.cardHeader}><Text style={styles.platform}>{platformLabels[item.platform] || item.platform}</Text><Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString('ar')}</Text></View>
          <Text style={styles.body}>{item.text}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#020203' },
  content: { padding: 20, paddingTop: 64, paddingBottom: 120 },
  header: { marginBottom: 24 },
  title: { color: '#fff', fontFamily: 'Cairo_800ExtraBold', fontSize: 28, textAlign: 'right' },
  subtitle: { color: '#9994a6', fontFamily: 'Cairo_400Regular', fontSize: 12, textAlign: 'right', marginTop: 5 },
  empty: { alignItems: 'center', paddingTop: 110, paddingHorizontal: 25 },
  emptyTitle: { color: '#fff', fontFamily: 'Cairo_700Bold', fontSize: 17, marginTop: 15 },
  emptyText: { color: '#9994a6', fontFamily: 'Cairo_400Regular', fontSize: 12, textAlign: 'center', marginTop: 6 },
  button: { backgroundColor: '#7C4DFF', borderRadius: 15, paddingHorizontal: 24, paddingVertical: 12, marginTop: 22 },
  buttonText: { color: '#fff', fontFamily: 'Cairo_700Bold', fontSize: 13 },
  card: { backgroundColor: 'rgba(255,255,255,0.045)', borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderRadius: 18, padding: 16, marginBottom: 10 },
  cardHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  platform: { color: '#b38cff', fontFamily: 'Cairo_700Bold', fontSize: 12 },
  date: { color: '#625d6d', fontFamily: 'Cairo_400Regular', fontSize: 10 },
  body: { color: '#f5f3f8', fontFamily: 'Cairo_400Regular', fontSize: 14, lineHeight: 27, textAlign: 'right' },
});