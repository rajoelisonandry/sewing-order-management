import { View, Text } from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>👤 Mon Profil</Text>
      <Text style={{ marginTop: 10 }}>Infos utilisateur, paramètres, etc.</Text>
    </View>
  );
}
