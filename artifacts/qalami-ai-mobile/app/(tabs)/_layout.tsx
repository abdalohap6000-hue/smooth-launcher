import React from 'react';
import { Platform } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  const colors = useColors();
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.mutedForeground,
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#08070b',
        borderTopColor: colors.border,
        height: Platform.OS === 'web' ? 70 : 84,
        paddingTop: 8,
      },
      tabBarLabelStyle: { fontFamily: 'Cairo_600SemiBold', fontSize: 11 },
    }}>
      <Tabs.Screen name="index" options={{ title: 'إنشاء', tabBarIcon: ({ color }) => <Feather name="edit-3" size={21} color={color} /> }} />
      <Tabs.Screen name="history" options={{ title: 'مكتبتي', tabBarIcon: ({ color }) => <Feather name="book-open" size={21} color={color} /> }} />
      <Tabs.Screen name="premium" options={{ title: 'Pro', tabBarIcon: ({ color }) => <Feather name="star" size={21} color={color} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'إعدادات', tabBarIcon: ({ color }) => <Feather name="settings" size={21} color={color} /> }} />
    </Tabs>
  );
}
