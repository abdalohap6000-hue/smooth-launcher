import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

export default function SettingsScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setUser(data.user)); }, []);

  const signOut = async () => {
    setBusy(true);
    await supabase.auth.signOut();
    setBusy(false);
    router.replace('/');
  };

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.title}>الإعدادات ⚙️</Text>
        <Text style={styles.subtitle}>تحكم في حسابك وتجربة قلمي</Text>
        <View style={styles.account}><View style={styles.avatar}><Feather name="user" size={20} color="#fff" /></View><View style={{ flex: 1 }}><Text style={styles.label}>مسجّل الدخول باسم</Text><Text style={styles.email}>{user?.email || 'غير مسجّل الدخول'}</Text></View></View>
        <View style={styles.item}><Feather name="globe" size={19} color="#b38cff" /><Text style={styles.itemText}>لغة التطبيق</Text><Text style={styles.value}>العربية</Text></View>
        <View style={styles.item}><Feather name="type" size={19} color="#b38cff" /><Text style={styles.itemText}>لغة المحتوى الافتراضية</Text><Text style={styles.value}>العربية</Text></View>
        <View style={styles.item}><Feather name="shield" size={19} color="#b38cff" /><Text style={styles.itemText}>حسابك محمي عبر Supabase</Text></View>
        <Pressable onPress={signOut} disabled={busy} style={styles.signOut}>{busy ? <ActivityIndicator color="#ff8b8b" /> : <><Feather name="log-out" size={18} color="#ff8b8b" /><Text style={styles.signOutText}>خروج</Text></>}</Pressable>
        <Text style={styles.version}>الإصدار 1.0.0 — قلمي AI ✒️</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#020203' },
  content: { padding: 20, paddingTop: 64 },
  title: { color: '#fff', fontFamily: 'Cairo_800ExtraBold', fontSize: 28, textAlign: 'right' },
  subtitle: { color: '#9994a6', fontFamily: 'Cairo_400Regular', fontSize: 12, textAlign: 'right', marginTop: 5, marginBottom: 28 },
  account: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.045)', borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderRadius: 18, padding: 15, marginBottom: 18 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#7C4DFF', alignItems: 'center', justifyContent: 'center' },
  label: { color: '#9994a6', fontFamily: 'Cairo_400Regular', fontSize: 10, textAlign: 'right' },
  email: { color: '#fff', fontFamily: 'Cairo_600SemiBold', fontSize: 13, textAlign: 'right', marginTop: 3 },
  item: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 15, padding: 15, marginBottom: 8 },
  itemText: { color: '#eeeaf4', fontFamily: 'Cairo_600SemiBold', fontSize: 12, flex: 1, textAlign: 'right' },
  value: { color: '#9994a6', fontFamily: 'Cairo_400Regular', fontSize: 11 },
  signOut: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 8, borderColor: 'rgba(255,139,139,0.25)', borderWidth: 1, borderRadius: 15, padding: 14, marginTop: 20 },
  signOutText: { color: '#ff8b8b', fontFamily: 'Cairo_700Bold', fontSize: 13 },
  version: { color: '#625d6d', fontFamily: 'Cairo_400Regular', fontSize: 10, textAlign: 'center', marginTop: 26 },
});