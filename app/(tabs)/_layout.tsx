import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../../src/lib/theme';
import { Platform } from 'react-native';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface TabConfig {
  name: string;
  title: string;
  icon: IoniconsName;
  iconActive: IoniconsName;
}

const TABS: TabConfig[] = [
  {
    name: 'index',
    title: 'Dashboard',
    icon: 'analytics-outline',
    iconActive: 'analytics',
  },
  {
    name: 'chain',
    title: 'Chain',
    icon: 'layers-outline',
    iconActive: 'layers',
  },
  {
    name: 'expirations',
    title: 'Expirations',
    icon: 'calendar-outline',
    iconActive: 'calendar',
  },
  {
    name: 'scanner',
    title: 'Scanner',
    icon: 'pulse-outline',
    iconActive: 'pulse',
  },
  {
    name: 'settings',
    title: 'Settings',
    icon: 'settings-outline',
    iconActive: 'settings',
  },
];

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 26 : 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: fonts.size.xs,
          fontWeight: fonts.weight.medium,
        },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? tab.iconActive : tab.icon}
                size={size ?? 24}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
