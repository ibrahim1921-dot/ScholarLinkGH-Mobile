import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';

import { colors } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth';

export default function TabsLayout() {
  const { user, isBootstrapping } = useAuth();

  if (!isBootstrapping && !user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { borderTopColor: colors.border, height: 64, paddingBottom: 8, paddingTop: 8 },
        tabBarIcon: ({ color, size }) => {
          const icon = {
            index: 'sparkles-outline',
            scholarships: 'school-outline',
            applications: 'list-outline',
            assistant: 'chatbubbles-outline',
            career: 'briefcase-outline',
          }[route.name] as keyof typeof Ionicons.glyphMap;
          return <Ionicons name={icon} color={color} size={size} />;
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="scholarships" options={{ title: 'Scholarships' }} />
      <Tabs.Screen name="applications" options={{ title: 'Applications' }} />
      <Tabs.Screen name="assistant" options={{ title: 'Assistant' }} />
      <Tabs.Screen name="career" options={{ title: 'Career' }} />
    </Tabs>
  );
}
