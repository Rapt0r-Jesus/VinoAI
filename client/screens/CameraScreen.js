import { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function CameraScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const cameraRef = useRef(null);

  // Pas encore de permission
  if (!permission) {
    return <View />;
  }

  // Permission refusée
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

  // Prendre la photo
  const takePicture = async () => {
    if (!cameraRef.current || isAnalyzing) return;
    try {
      setIsAnalyzing(true);
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.7 });
      console.log('Photo taken, base64 length:', photo.base64.length);
      // On enverra au back-end dans T-17
      Alert.alert('Success', 'Photo captured! Ready to send to API.');
    } catch (error) {
      Alert.alert('Error', 'Failed to take picture.');
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef}>
        {/* Frame overlay */}
        <View style={styles.overlay}>
          <View style={styles.frame} />
          <Text style={styles.hint}>Align the label in the frame</Text>
        </View>
      </CameraView>

      {/* Analyzing indicator */}
      {isAnalyzing && (
        <View style={styles.analyzingBar}>
          <Text style={styles.analyzingText}>Analyzing label with AI...</Text>
        </View>
      )}

      {/* Shutter button */}
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
