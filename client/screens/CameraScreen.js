import { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

const API_URL = 'https://vinoai-production.up.railway.app/api/v1/scan';

export default function CameraScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const cameraRef = useRef(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Camera access is required to scan wine labels.</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current || isAnalyzing) return;
    try {
      setIsAnalyzing(true);
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.7 });
      console.log('Photo taken, base64 length:', photo.base64.length);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: photo.base64, format: 'jpeg' }),
      });

      const data = await response.json().catch(() => null);

      // Résultat non trouvé (422 = Claude n'a pas pu lire l'étiquette)
      if (response.status === 422) {
        Alert.alert(
          '🔍 Résultat non trouvé',
          'Impossible de reconnaître cette étiquette. Essayez de mieux éclairer la bouteille ou de la cadrer différemment.',
          [{ text: 'Réessayer', style: 'default' }]
        );
        return;
      }

      // Vin non trouvé dans la base de données
      if (response.status === 404 || data?.error?.code === 'NOT_FOUND') {
        Alert.alert(
          '🍾 Résultat non trouvé',
          'Ce vin n\'a pas été trouvé dans notre base de données.',
          [{ text: 'Réessayer', style: 'default' }]
        );
        return;
      }

      // Autre erreur serveur
      if (!response.ok) {
        throw new Error(data?.error?.message || `Server error: ${response.status}`);
      }

      const wine = data;
      console.log('Wine data received:', wine);
      navigation.navigate('Result', { wine });

    } catch (error) {
      // Erreur réseau
      if (error.message?.includes('Network request failed') || error.message?.includes('timed out')) {
        Alert.alert(
          '📡 Connexion impossible',
          'Impossible de joindre le serveur. Vérifiez que vous êtes sur le bon réseau Wi-Fi.',
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        Alert.alert(
          '🔍 Résultat non trouvé',
          'Une erreur est survenue lors de l\'analyse. Réessayez.',
          [{ text: 'Réessayer', style: 'default' }]
        );
      }
      console.error('Scan error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef}>
        <View style={styles.overlay}>
          <View style={styles.frame} />
          <Text style={styles.hint}>Align the label in the frame</Text>
        </View>
      </CameraView>

      {isAnalyzing && (
        <View style={styles.analyzingBar}>
          <Text style={styles.analyzingText}>Analyzing label with AI...</Text>
        </View>
      )}

      <View style={styles.shutterContainer}>
        <TouchableOpacity
          style={[styles.shutterButton, isAnalyzing && styles.shutterDisabled]}
          onPress={takePicture}
          disabled={isAnalyzing}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#000' },
  camera:           { flex: 1 },
  overlay:          { flex: 1, justifyContent: 'center', alignItems: 'center' },
  frame:            { width: 260, height: 160, borderWidth: 2, borderColor: '#C9A96E', borderRadius: 8 },
  hint:             { color: '#fff', marginTop: 12, fontSize: 13, opacity: 0.8 },
  analyzingBar:     { backgroundColor: '#1a1a1a', padding: 12, alignItems: 'center' },
  analyzingText:    { color: '#C9A96E', fontSize: 14 },
  shutterContainer: { alignItems: 'center', paddingVertical: 24, backgroundColor: '#000' },
  shutterButton:    { width: 70, height: 70, borderRadius: 35, backgroundColor: '#C9A96E' },
  shutterDisabled:  { opacity: 0.4 },
  text:             { color: '#fff', textAlign: 'center', margin: 20, fontSize: 16 },
  button:           { backgroundColor: '#C9A96E', padding: 14, borderRadius: 10, margin: 20 },
  buttonText:       { color: '#2C1810', fontWeight: 'bold', textAlign: 'center' },
});
