import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const icon = require('../../assets/images/icon.png');
const purple = '#7C4DFF';
const muted = '#9994a6';
const card = 'rgba(255,255,255,0.045)';

const platforms = [
  ['instagram', 'إنستغرام', 'instagram'],
  ['tiktok', 'تيك توك', 'music'],
  ['twitter', 'X', 'twitter'],
  ['youtube', 'يوتيوب', 'youtube'],
  ['snapchat', 'سناب', 'camera'],
] as const;
const tones = [
  ['exciting', '🔥 مثير'], ['funny', '😂 فكاهي'], ['professional', '💼 احترافي'],
  ['educational', '📚 تعليمي'], ['promotional', '📣 إعلاني'], ['emotional', '💜 عاطفي'],
] as const;
const postTypes = [
  ['product_ad', 'إعلان منتج'], ['golden_tip', 'نصيحة ذهبية'], ['bold_opinion', 'رأي جريء'],
  ['special_offer', 'عرض خاص'], ['personal_story', 'قصة شخصية'], ['interactive_q', 'سؤال تفاعلي'],
] as const;

type Result = { platform: string; text: string };

function Header() {
  return (
    <View style={styles.header}>
      <View style={styles.brand}>
        <Image source={icon} style={styles.logo} />
        <View>
          <Text style={styles.brandName}>قلمي</Text>
          <Text style={styles.brandSub}>مولّد محتوى عربي بالذكاء الاصطناعي</Text>
        </View>
      </View>
      <Pressable style={styles.iconButton}>
        <Feather name="bell" size={19} color="#fff" />
      </Pressable>
    </View>
  );
}

function AuthPanel({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const submit = async () => {
    if (!email || !password) {
      setMessage('أدخل البريد وكلمة المرور أولاً');
      return;
    }
    if (!isSupabaseConfigured) {
      setMessage('أضف إعدادات Supabase العامة لتفعيل تسجيل الدخول');
      return;
    }
    setBusy(true);
    setMessage('');
    const result = mode === 'signup'
      ? await supabase.auth.signUp({ email, password, options: { data: { full_name: name || null } } })
      : await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (result.error) setMessage(result.error.message);
    else if (mode === 'signup') {
      setMode('signin');
      setMessage('تم إنشاء الحساب. تحقق من بريدك ثم سجّل الدخول.');
    } else onAuthenticated();
  };

  return (
    <View style={styles.authCard}>
      <Image source={icon} style={styles.authLogo} />
      <Text style={styles.authTitle}>أهلاً بك في قلمي</Text>
      <Text style={styles.authSub}>{mode === 'signin' ? 'سجّل الدخول للوصول إلى مكتبتك' : 'أنشئ حساباً وابدأ الكتابة'}</Text>
      <View style={styles.segment}>
        <Pressable onPress={() => setMode('signin')} style={[styles.segmentItem, mode === 'signin' && styles.segmentActive]}>
          <Text style={styles.segmentText}>دخول</Text>
        </Pressable>
        <Pressable onPress={() => setMode('signup')} style={[styles.segmentItem, mode === 'signup' && styles.segmentActive]}>
          <Text style={styles.segmentText}>حساب جديد</Text>
        </Pressable>
      </View>
      {mode === 'signup' && <TextInput value={name} onChangeText={setName} placeholder="الاسم (اختياري)" placeholderTextColor="#625d6d" style={styles.input} />}
      <TextInput value={email} onChangeText={setEmail} placeholder="البريد الإلكتروني" placeholderTextColor="#625d6d" autoCapitalize="none" keyboardType="email-address" style={styles.input} textAlign="left" />
      <TextInput value={password} onChangeText={setPassword} placeholder="كلمة المرور" placeholderTextColor="#625d6d" secureTextEntry style={styles.input} textAlign="left" />
      {!!message && <Text style={styles.error}>{message}</Text>}
      <Pressable onPress={submit} disabled={busy} style={styles.primaryButton}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>{mode === 'signin' ? 'دخول' : 'إنشاء حساب'}</Text>}
      </Pressable>
      <Text style={styles.authHint}>تسجيل الدخول يحفظ منشوراتك ويزامن رصيدك بين أجهزتك.</Text>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [tone, setTone] = useState('');
  const [postType, setPostType] = useState('');
  const [length, setLength] = useState('medium');
  const [language, setLanguage] = useState('ar');
  const [idea, setIdea] = useState('');
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setAuthLoading(false);
    }).catch(() => setAuthLoading(false));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user || null));
    return () => data.subscription.unsubscribe();
  }, []);

  const canGenerate = useMemo(() => selectedPlatforms.length > 0 && tone && postType && idea.trim(), [selectedPlatforms, tone, postType, idea]);
  const toggle = (id: string) => setSelectedPlatforms((current) => current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);

  const generate = async () => {
    if (!canGenerate || !isSupabaseConfigured) {
      setError(!isSupabaseConfigured ? 'أضف إعدادات Supabase العامة لتفعيل التوليد.' : 'أكمل اختيار المنصة والأسلوب ونوع المنشور والفكرة.');
      return;
    }
    setGenerating(true);
    setError('');
    const { data } = await supabase.auth.getSession();
    const accessToken = data.session?.access_token;
    const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!accessToken || !url || !key) {
      setGenerating(false);
      setError('يجب تسجيل الدخول قبل التوليد.');
      return;
    }
    const generated = await Promise.all(selectedPlatforms.map(async (platform) => {
      const response = await fetch(`${url}/functions/v1/generate-content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: key, Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ platforms: [platform], tone, postType, userInput: idea, length, language }),
      });
      const payload = await response.json().catch(() => ({}));
      return { platform, text: payload.text || payload.results?.[platform] || payload.error || 'تعذّر توليد هذا المنشور.' };
    }));
    setResults(generated);
    const previous = JSON.parse((await AsyncStorage.getItem('qalami_history')) || '[]');
    await AsyncStorage.setItem('qalami_history', JSON.stringify([
      ...generated.map((item) => ({ ...item, createdAt: new Date().toISOString() })),
      ...previous,
    ].slice(0, 40)));
    setGenerating(false);
  };

  if (authLoading) return <View style={styles.center}><ActivityIndicator color={purple} size="large" /></View>;
  if (!user) return <ScrollView contentContainerStyle={styles.authScroll}><AuthPanel onAuthenticated={() => supabase.auth.getUser().then(({ data }) => setUser(data.user))} /></ScrollView>;

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Header />
        <View style={styles.hero}>
          <Text style={styles.kicker}>مساحتك الإبداعية</Text>
          <Text style={styles.title}>حوّل فكرتك إلى{'\n'}محتوى يلفت الانتباه <Text style={styles.gradientText}>✨</Text></Text>
          <Text style={styles.description}>اختر إعداداتك، اكتب الفكرة، ودع قلمي يصيغ منشورات جاهزة للنشر.</Text>
        </View>
        <Section title="المنصة">
          <View style={styles.chipGrid}>{platforms.map(([id, label, iconName]) => <Pressable key={id} onPress={() => toggle(id)} style={[styles.chip, selectedPlatforms.includes(id) && styles.chipSelected]}><Feather name={iconName as any} size={15} color={selectedPlatforms.includes(id) ? '#fff' : muted} /><Text style={[styles.chipText, selectedPlatforms.includes(id) && styles.chipTextSelected]}>{label}</Text></Pressable>)}</View>
        </Section>
        <Section title="الأسلوب"><View style={styles.chipGrid}>{tones.map(([id, label]) => <Pressable key={id} onPress={() => setTone(id)} style={[styles.chip, tone === id && styles.chipSelected]}><Text style={[styles.chipText, tone === id && styles.chipTextSelected]}>{label}</Text></Pressable>)}</View></Section>
        <Section title="نوع المنشور"><View style={styles.chipGrid}>{postTypes.map(([id, label]) => <Pressable key={id} onPress={() => setPostType(id)} style={[styles.chip, postType === id && styles.chipSelected]}><Text style={[styles.chipText, postType === id && styles.chipTextSelected]}>{label}</Text></Pressable>)}</View></Section>
        <Section title="طول النص"><View style={styles.segment}>{[['short', 'قصير'], ['medium', 'متوسط'], ['long', 'طويل']].map(([id, label]) => <Pressable key={id} onPress={() => setLength(id)} style={[styles.segmentItem, length === id && styles.segmentActive]}><Text style={styles.segmentText}>{label}</Text></Pressable>)}</View></Section>
        <Section title="فكرتك"><TextInput value={idea} onChangeText={setIdea} placeholder="اكتب فكرتك هنا… مثال: أريد الترويج لكورسي الجديد في التصميم" placeholderTextColor="#625d6d" multiline textAlignVertical="top" style={[styles.input, styles.idea]} /></Section>
        {!!error && <Text style={styles.error}>{error}</Text>}
        <Pressable onPress={generate} disabled={generating} style={styles.generateButton}>
          <LinearGradient colors={['#7C4DFF', '#A855F7', '#6366F1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradientButton}>
            {generating ? <ActivityIndicator color="#fff" /> : <><Feather name="zap" size={19} color="#fff" /><Text style={styles.primaryText}>ولّد المحتوى الآن</Text></>}
          </LinearGradient>
        </Pressable>
        {results.length > 0 && <View style={styles.results}><Text style={styles.sectionTitle}>إبداعاتك جاهزة ✨</Text>{results.map((result) => <View key={result.platform} style={styles.resultCard}><Text style={styles.resultPlatform}>{platforms.find(([id]) => id === result.platform)?.[1] || result.platform}</Text><Text style={styles.resultText}>{result.text}</Text></View>)}</View>}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>{children}</View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#020203' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#020203' },
  content: { padding: 20, paddingTop: 58, paddingBottom: 120 },
  authScroll: { flexGrow: 1, justifyContent: 'center', padding: 20, backgroundColor: '#020203' },
  header: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  brand: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10 },
  logo: { width: 42, height: 42, borderRadius: 13 },
  brandName: { color: '#fff', fontFamily: 'Cairo_800ExtraBold', fontSize: 20, textAlign: 'right' },
  brandSub: { color: muted, fontFamily: 'Cairo_400Regular', fontSize: 9, textAlign: 'right' },
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: card, alignItems: 'center', justifyContent: 'center' },
  hero: { marginBottom: 28 },
  kicker: { color: '#b38cff', fontFamily: 'Cairo_600SemiBold', fontSize: 13, textAlign: 'right', marginBottom: 6 },
  title: { color: '#fff', fontFamily: 'Cairo_800ExtraBold', fontSize: 28, lineHeight: 42, textAlign: 'right' },
  gradientText: { color: '#FFD700' },
  description: { color: muted, fontFamily: 'Cairo_400Regular', fontSize: 13, lineHeight: 24, textAlign: 'right', marginTop: 8 },
  section: { marginBottom: 22 },
  sectionTitle: { color: '#fff', fontFamily: 'Cairo_700Bold', fontSize: 15, textAlign: 'right', marginBottom: 10 },
  chipGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, backgroundColor: card, borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderRadius: 15, paddingHorizontal: 12, paddingVertical: 9 },
  chipSelected: { backgroundColor: 'rgba(124,77,255,0.28)', borderColor: purple },
  chipText: { color: muted, fontFamily: 'Cairo_600SemiBold', fontSize: 12 },
  chipTextSelected: { color: '#fff' },
  segment: { flexDirection: 'row-reverse', padding: 4, borderRadius: 16, backgroundColor: card, gap: 4 },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12 },
  segmentActive: { backgroundColor: 'rgba(124,77,255,0.3)' },
  segmentText: { color: '#fff', fontFamily: 'Cairo_600SemiBold', fontSize: 12 },
  input: { backgroundColor: card, borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderRadius: 15, color: '#fff', fontFamily: 'Cairo_400Regular', fontSize: 13, paddingHorizontal: 14, paddingVertical: 12, minHeight: 48 },
  primaryButton: { backgroundColor: purple, minHeight: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  idea: { minHeight: 112, textAlign: 'right' },
  generateButton: { borderRadius: 18, overflow: 'hidden', marginTop: 2 },
  gradientButton: { minHeight: 58, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 9 },
  primaryText: { color: '#fff', fontFamily: 'Cairo_700Bold', fontSize: 15 },
  error: { color: '#ff8b8b', fontFamily: 'Cairo_400Regular', fontSize: 12, textAlign: 'right', marginBottom: 10 },
  results: { marginTop: 28 },
  resultCard: { backgroundColor: card, borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderRadius: 18, padding: 16, marginBottom: 10 },
  resultPlatform: { color: '#b38cff', fontFamily: 'Cairo_700Bold', fontSize: 12, textAlign: 'right', marginBottom: 8 },
  resultText: { color: '#f5f3f8', fontFamily: 'Cairo_400Regular', fontSize: 14, lineHeight: 27, textAlign: 'right' },
  authCard: { backgroundColor: 'rgba(255,255,255,0.035)', borderColor: 'rgba(255,255,255,0.09)', borderWidth: 1, borderRadius: 26, padding: 22 },
  authLogo: { width: 70, height: 70, borderRadius: 20, alignSelf: 'center', marginBottom: 12 },
  authTitle: { color: '#fff', fontFamily: 'Cairo_800ExtraBold', fontSize: 23, textAlign: 'center' },
  authSub: { color: muted, fontFamily: 'Cairo_400Regular', fontSize: 12, textAlign: 'center', marginBottom: 20 },
  authHint: { color: '#625d6d', fontFamily: 'Cairo_400Regular', fontSize: 10, lineHeight: 18, textAlign: 'center', marginTop: 12 },
});