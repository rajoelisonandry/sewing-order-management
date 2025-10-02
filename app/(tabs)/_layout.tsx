import { Tabs } from 'expo-router';
import { Package, BarChart2, User } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#7F3785',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
        },
        tabBarActiveTintColor: '#7F3785',
        tabBarInactiveTintColor: '#9ca3af',
      }}
    >
      {/* Commandes */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mes Commandes',
          tabBarIcon: ({ size, color }) => (
            <Package size={size} color={color} />
          ),
        }}
      />

      {/* Statistiques */}
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Statistiques',
          tabBarIcon: ({ size, color }) => (
            <BarChart2 size={size} color={color} />
          ),
        }}
      />

      {/* Profil */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ size, color }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
