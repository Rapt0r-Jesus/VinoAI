import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { saveWine } from '../database';

export default function ResultScreen({ route, navigation }) {
  const wine = route.params?.wine || {};
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (isSaved || isSaving) return;
    setIsSaving(true);
    try {
      await saveWine(wine);
      setIsSaved(true);
      Alert.alert('Saved!', `${wine.name} a été ajouté à ta cave.`);
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      Alert.alert('Erreur', "Impossible de sauvegarder ce vin.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.wineName}>{wine.name || 'Unknown Wine'}</Text>
        <Text style={styles.vintage}>
          {wine.vintage ? `${wine.vintage}` : ''}{wine.region ? ` · ${wine.region}` : ''}
        </Text>
      </View>

      <View style={styles.body}>
        {/* Tags */}
        <View style={styles.tagRow}>
          {wine.region     && <View style={styles.tag}><Text style={styles.tagText}>{wine.region}</Text></View>}
          {wine.grape      && <View style={styles.tag}><Text style={styles.tagText}>{wine.grape}</Text></View>}
          {wine.appellation && <View style={styles.tag}><Text style={styles.tagText}>{wine.appellation}</Text></View>}
        </View>

        {/* Producer */}
        {wine.producer ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PRODUCER</Text>
            <Text style={styles.sectionText}>{wine.producer}</Text>
          </View>
        ) : null}

        {/* Tasting notes */}
        {wine.tasting_notes ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>TASTING NOTES</Text>
            <Text style={styles.sectionText}>{wine.tasting_notes}</Text>
          </View>
        ) : null}

        {/* Food pairings */}
        {wine.food_pairings?.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>FOOD PAIRINGS</Text>
            <View style={styles.pairingRow}>
              {wine.food_pairings.map((p, i) => (
                <View key={i} style={styles.pairing}>
                  <Text style={styles.pairingText}>{p}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Save button */}
        <TouchableOpacity
          style={[styles.saveButton, isSaved && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaved || isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaved ? '✓ Saved to cellar' : isSaving ? 'Saving...' : '💾 Save to my cellar'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#fff' },
  header:         { backgroundColor: '#6B2D3E', padding: 20, paddingTop: 50 },
  back:           { color: 'rgba(249,244,238,0.7)', fontSize: 14, marginBottom: 8 },
  wineName:       { color: '#F9F4EE', fontSize: 22, fontWeight: '700' },
  vintage:        { color: '#C9A96E', fontSize: 14, marginTop: 4 },
  body:           { padding: 16 },
  tagRow:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tag:            { backgroundColor: '#F5EFE6', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  tagText:        { color: '#6B2D3E', fontSize: 12, fontWeight: '600' },
  section:        { marginBottom: 20 },
  sectionTitle:   { fontSize: 11, fontWeight: '700', color: '#888', letterSpacing: 1, marginBottom: 6 },
  sectionText:    { fontSize: 15, color: '#2C1810', lineHeight: 22 },
  pairingRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pairing:        { backgroundColor: '#F9F4EE', borderWidth: 1, borderColor: '#DDD0C0', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  pairingText:    { color: '#5C3D2E', fontSize: 13 },
  saveButton:     { backgroundColor: '#6B2D3E', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20, marginBottom: 40 },
  saveButtonDisabled: { backgroundColor: '#A89080' },
  saveButtonText: { color: '#F9F4EE', fontSize: 16, fontWeight: '700' },
});
