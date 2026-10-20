import React from 'react';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Home, CheckSquare, Calendar, Folder, Settings } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeContext';

export default function TabLayout() {
  const { colors, isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isDark ? '#818CF8' : colors.primary,
        tabBarInactiveTintColor: isDark ? '#64748B' : colors.textMuted,
        tabBarStyle: {
          backgroundColor: isDark ? '#0F121E' : colors.surface,
          borderTopColor: isDark ? '#1F2637' : colors.border,
          borderTopWidth: 1,
          elevation: 0,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Home size={size || 22} color={color} strokeWidth={2.2} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, size }) => (
            <CheckSquare size={size || 22} color={color} strokeWidth={2.2} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color, size }) => (
            <Calendar size={size || 22} color={color} strokeWidth={2.2} />
          ),
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          tabBarIcon: ({ color, size }) => (
            <Folder size={size || 22} color={color} strokeWidth={2.2} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Settings size={size || 22} color={color} strokeWidth={2.2} />
          ),
        }}
      />
    </Tabs>
  );
}
