import { Stack } from 'expo-router';

export default function OrderLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#7F3785',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="[id]"
        options={({ route }) => ({
          title:
            route.params?.id === 'new'
              ? 'Nouvelle Commande'
              : 'Modifier Commande',
        })}
      />
    </Stack>
  );
}
