import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import Purchases from 'react-native-purchases';

type RevenueCatContextValue = {
  offering: any | null;
  customerInfo: any | null;
  isPremium: boolean;
  loading: boolean;
  error: string | null;
  purchase: (pkg: any) => Promise<boolean>;
  restore: () => Promise<boolean>;
  refresh: () => Promise<void>;
};

const RevenueCatContext = createContext<RevenueCatContextValue | null>(null);
const entitlementId = process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT || 'premium';
const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;

function hasEntitlement(info: any) {
  return Boolean(info?.entitlements?.active?.[entitlementId]);
}

export function RevenueCatProvider({ children }: { children: React.ReactNode }) {
  const [offering, setOffering] = useState<any | null>(null);
  const [customerInfo, setCustomerInfo] = useState<any | null>(null);
  const [loading, setLoading] = useState(Boolean(apiKey));
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    if (!apiKey) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const [offerings, info] = await Promise.all([
        Purchases.getOfferings(),
        Purchases.getCustomerInfo(),
      ]);
      setOffering(offerings.current || null);
      setCustomerInfo(info);
    } catch (e: any) {
      setError(e?.message || 'تعذّر تحميل خيارات الاشتراك');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!apiKey) {
      setLoading(false);
      return;
    }
    try {
      Purchases.configure({ apiKey });
      void refresh();
    } catch (e: any) {
      setError(e?.message || 'تعذّر تهيئة الاشتراكات');
      setLoading(false);
    }
  }, []);

  const purchase = async (pkg: any) => {
    try {
      setLoading(true);
      setError(null);
      const result = await Purchases.purchasePackage(pkg);
      setCustomerInfo(result.customerInfo);
      return hasEntitlement(result.customerInfo);
    } catch (e: any) {
      if (!e?.userCancelled) setError(e?.message || 'تعذّر إتمام الشراء');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const restore = async () => {
    try {
      setLoading(true);
      setError(null);
      const info = await Purchases.restorePurchases();
      setCustomerInfo(info);
      return hasEntitlement(info);
    } catch (e: any) {
      setError(e?.message || 'تعذّرت استعادة المشتريات');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo(() => ({
    offering,
    customerInfo,
    isPremium: hasEntitlement(customerInfo),
    loading,
    error,
    purchase,
    restore,
    refresh,
  }), [offering, customerInfo, loading, error]);

  return <RevenueCatContext.Provider value={value}>{children}</RevenueCatContext.Provider>;
}

export function useRevenueCat() {
  const value = useContext(RevenueCatContext);
  if (!value) throw new Error('useRevenueCat must be used inside RevenueCatProvider');
  return value;
}