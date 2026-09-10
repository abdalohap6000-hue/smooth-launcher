import React, { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRevenueCat } from '@/lib/revenuecat';

export default function PremiumScreen() {
  const { offering, isPremium, loading, error, purchase, restore, refresh } = useRevenueCat();
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [notice, setNotice] = useState('');
  const packages = offering?.availablePackages || [];

  const confirmPurchase = async () => {
    if (!selectedPackage) return;
    setNotice('');
    const success = await purchase(selectedPackage);
    setSelectedPackage(null);
    setNotice(success ? 'تم تفعيل قلمي Pro على حسابك.' : 'لم يتم تفعيل الاشتراك بعد.');
  };

  const restorePurchases = async () => {
    const success = await restore();
    setNotice(success ? 'تمت استعادة اشتراكك بنجاح.' : 'لم نعثر على اشتراك نشط لهذا الحساب.');
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}><Text style={styles.crown}>👑</Text><Text style={styles.title}>قلمي Pro</Text><Text style={styles.subtitle}>افتح كل النماذج واحصل على رصيد شهري متجدد.</Text></View>
      {isPremium && <View style={styles.active}><Text style={styles.activeText}>اشتراك Pro مفعّل ✓</Text></View>}
      <View style={styles.info}><Text style={styles.infoText}>كل مستخدم جديد يحصل على نقاط مجانية. اشترك لفتح النماذج المتقدمة ومكتبة منشوراتك.</Text></View>
      <View style={styles.features}>{['٥٠٠ نقطة شهرياً تتجدد تلقائياً', 'فتح جميع نماذج Gemini', 'نقطة واحدة لكل منصة في كل توليد', 'مكتبة لحفظ أفضل منشوراتك', 'جميع المنصات والأساليب واللغات'].map((feature) => <View key={feature} style={styles.feature}><Text style={styles.check}>✓</Text><Text style={styles.featureText}>{feature}</Text></View>)}</View>
      {loading && !offering ? <ActivityIndicator color="#FFD700" style={{ marginVertical: 20 }} /> : packages.length > 0 ? packages.map((pkg: any) => (
        <Pressable key={pkg.identifier} onPress={() => setSelectedPackage(pkg)} style={styles.package}>
          <View><Text style={styles.packageTitle}>{pkg.product?.title || pkg.identifier}</Text><Text style={styles.packageDescription}>{pkg.product?.description || 'اشتراك قلمي Pro'}</Text></View>
          <Text style={styles.price}>{pkg.product?.priceString || ''}</Text>
        </Pressable>
      )) : <View style={styles.empty}><Text style={styles.emptyTitle}>خيارات الاشتراك غير متاحة حالياً</Text><Text style={styles.emptyText}>أضف مفتاح RevenueCat العام لإظهار offering الحالي من Test Store.</Text><Pressable onPress={refresh} style={styles.retry}><Text style={styles.retryText}>إعادة المحاولة</Text></Pressable></View>}
      {!!error && <Text style={styles.error}>{error}</Text>}
      {!!notice && <Text style={styles.notice}>{notice}</Text>}
      <Pressable onPress={restorePurchases} disabled={loading} style={styles.restore}><Text style={styles.restoreText}>استعادة المشتريات</Text></Pressable>
      <Text style={styles.legal}>تُدار الأسعار والمنتجات من RevenueCat ولا تُحفظ داخل التطبيق.</Text>
      <Modal visible={Boolean(selectedPackage)} transparent animationType="fade" onRequestClose={() => setSelectedPackage(null)}>
        <View style={styles.modalBackdrop}><View style={styles.modal}><Text style={styles.modalTitle}>تأكيد الاشتراك</Text><Text style={styles.modalText}>{selectedPackage?.product?.title || selectedPackage?.identifier}</Text><Text style={styles.modalPrice}>{selectedPackage?.product?.priceString || ''}</Text><Text style={styles.modalHint}>سيتم تنفيذ الشراء عبر RevenueCat Test Store في بيئة المعاينة.</Text><Pressable onPress={confirmPurchase} style={styles.confirm}>{loading ? <ActivityIndicator color="#020203" /> : <Text style={styles.confirmText}>تأكيد الشراء</Text>}</Pressable><Pressable onPress={() => setSelectedPackage(null)} style={styles.cancel}><Text style={styles.cancelText}>إلغاء</Text></Pressable></View></View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#020203' },
  content: { padding: 20, paddingTop: 58, paddingBottom: 120 },
  hero: { alignItems: 'center', marginBottom: 22 },
  crown: { fontSize: 45, marginBottom: 5 },
  title: { color: '#FFD700', fontFamily: 'Cairo_800ExtraBold', fontSize: 34 },
  subtitle: { color: '#9994a6', fontFamily: 'Cairo_400Regular', fontSize: 12, textAlign: 'center', marginTop: 4 },
  active: { backgroundColor: 'rgba(34,197,94,0.14)', borderColor: 'rgba(34,197,94,0.35)', borderWidth: 1, borderRadius: 15, padding: 13, marginBottom: 12 },
  activeText: { color: '#6ee7a0', fontFamily: 'Cairo_700Bold', fontSize: 13, textAlign: 'center' },
  info: { backgroundColor: 'rgba(124,77,255,0.08)', borderColor: 'rgba(124,77,255,0.24)', borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 16 },
  infoText: { color: '#bcb5cc', fontFamily: 'Cairo_400Regular', fontSize: 12, lineHeight: 22, textAlign: 'right' },
  features: { marginBottom: 17 },
  feature: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: 12, marginBottom: 7 },
  check: { color: '#22C55E', fontSize: 16, fontWeight: 'bold' },
  featureText: { color: '#eeeaf4', fontFamily: 'Cairo_600SemiBold', fontSize: 12 },
  package: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,215,0,0.06)', borderColor: 'rgba(255,215,0,0.28)', borderWidth: 1, borderRadius: 17, padding: 16, marginBottom: 9 },
  packageTitle: { color: '#fff', fontFamily: 'Cairo_700Bold', fontSize: 14, textAlign: 'right' },
  packageDescription: { color: '#9994a6', fontFamily: 'Cairo_400Regular', fontSize: 10, textAlign: 'right', marginTop: 3 },
  price: { color: '#FFD700', fontFamily: 'Cairo_800ExtraBold', fontSize: 20 },
  empty: { alignItems: 'center', padding: 18, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16 },
  emptyTitle: { color: '#fff', fontFamily: 'Cairo_700Bold', fontSize: 13, textAlign: 'center' },
  emptyText: { color: '#9994a6', fontFamily: 'Cairo_400Regular', fontSize: 11, textAlign: 'center', lineHeight: 19, marginTop: 6 },
  retry: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 12, backgroundColor: '#7C4DFF', marginTop: 12 },
  retryText: { color: '#fff', fontFamily: 'Cairo_600SemiBold', fontSize: 11 },
  error: { color: '#ff9c9c', fontFamily: 'Cairo_400Regular', fontSize: 11, textAlign: 'center', marginTop: 10 },
  notice: { color: '#6ee7a0', fontFamily: 'Cairo_600SemiBold', fontSize: 12, textAlign: 'center', marginTop: 12 },
  restore: { alignItems: 'center', padding: 15, marginTop: 8 },
  restoreText: { color: '#b38cff', fontFamily: 'Cairo_600SemiBold', fontSize: 13 },
  legal: { color: '#625d6d', fontFamily: 'Cairo_400Regular', fontSize: 10, textAlign: 'center', lineHeight: 17, marginTop: 3 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', alignItems: 'center', justifyContent: 'center', padding: 22 },
  modal: { width: '100%', backgroundColor: '#111016', borderColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderRadius: 24, padding: 22, alignItems: 'center' },
  modalTitle: { color: '#fff', fontFamily: 'Cairo_800ExtraBold', fontSize: 21 },
  modalText: { color: '#c9c2d4', fontFamily: 'Cairo_600SemiBold', fontSize: 13, marginTop: 12 },
  modalPrice: { color: '#FFD700', fontFamily: 'Cairo_800ExtraBold', fontSize: 28, marginTop: 4 },
  modalHint: { color: '#9994a6', fontFamily: 'Cairo_400Regular', fontSize: 11, lineHeight: 19, textAlign: 'center', marginTop: 8 },
  confirm: { width: '100%', backgroundColor: '#FFD700', borderRadius: 15, alignItems: 'center', padding: 14, marginTop: 18 },
  confirmText: { color: '#020203', fontFamily: 'Cairo_800ExtraBold', fontSize: 14 },
  cancel: { padding: 12, marginTop: 4 },
  cancelText: { color: '#9994a6', fontFamily: 'Cairo_600SemiBold', fontSize: 12 },
});