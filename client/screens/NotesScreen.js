import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { getNoteByWineId, saveNote } from '../database';

export default function NotesScreen({ route, navigation }) {
  const wine = route.params?.wine || {};
  const [rating, setRating] = useState(0);
  const [noteText, setNoteText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Charge la note existante au montage
  useEffect(() => {
    if (wine.id) {
      loadExistingNote();
    }
  }, []);

  const loadExistingNote = async () => {
    try {
      const existing = await getNoteByWineId(wine.id);
      if (existing) {
        setRating(existing.rating || 0);
        setNoteText(existing.note_text || '');
      }
    } catch (err) {
      console.error('Erreur chargement note:', err);
    }
  };

  const handleSave = async () => {
    if (!wine.id) {
      Alert.alert('Erreur', 'Ce vin doit être sauvegardé avant d\'ajouter une note.');
      return;
    }
    setIsSaving(true);
    try {
      await saveNote(wine.id, rating, noteText);
      setIsDirty(false);
      Alert.alert('✅ Sauvegardé', 'Votre note a été enregistrée.');
    } catch (err) {
      console.error('Erreur sauvegarde note:', err);
      Alert.alert('Erreur', 'Impossible de sauvegarder la note.');
    } finally {
      setIsSaving(false);
    }
  };

  const StarRating = () => (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => { setRating(star); setIsDirty(true); }}
        >
          <Text style={[styles.star, star <= rating && styles.starFilled]}>
            {star <= rating ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Ma cave</Text>
        </TouchableOpacity>
        <Text style={styles.wineName}>{wine.name || 'Vin inconnu'}</Text>
        <Text style={styles.wineDetail}>
          {wine.vintage ? `${wine.vintage} · ` : ''}{wine.region || ''}
        </Text>
      </View>

      <View style={styles.body}>
        {/* Infos vin */}
        <View style={styles.wineCard}>
          {wine.grape && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Cépages</Text>
              <Text style={styles.infoValue}>{wine.grape}</Text>
            </View>
          )}
          {wine.appellation && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Appellation</Text>
              <Text style={styles.infoValue}>{wine.appellation}</Text>
            </View>
          )}
          {wine.vintage && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Millésime</Text>
              <Text style={styles.infoValue}>{wine.vintage}</Text>
            </View>
          )}
        </View>

        {/* Rating */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MA NOTE</Text>
          <StarRating />
          <Text style={styles.ratingLabel}>
            {rating === 0 ? 'Pas encore noté' :
             rating === 1 ? 'Décevant' :
             rating === 2 ? 'Correct' :
             rating === 3 ? 'Bon' :
             rating === 4 ? 'Très bon' : 'Exceptionnel'}
          </Text>
        </View>

        {/* Note texte */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MA NOTE DE DÉGUSTATION</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Décrivez vos impressions sur ce vin..."
            placeholderTextColor="#AAA"
            multiline
            maxLength={500}
            value={noteText}
            onChangeText={(text) => { setNoteText(text); setIsDirty(true); }}
          />
          <Text style={styles.charCount}>{noteText.length}/500</Text>
        </View>

        {/* Bouton sauvegarder */}
        <TouchableOpacity
          style={[styles.saveButton, (!isDirty || isSaving) && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!isDirty || isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Sauvegarde...' : '💾 Sauvegarder ma note'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#F9F4EE' },
  header:           { backgroundColor: '#6B2D3E', padding: 20, paddingTop: 50 },
  back:             { color: 'rgba(249,244,238,0.7)', fontSize: 14, marginBottom: 8 },
  wineName:         { color: '#F9F4EE', fontSize: 22, fontWeight: '700' },
  wineDetail:       { color: '#C9A96E', fontSize: 14, marginTop: 4 },
  body:             { padding: 16 },
  wineCard:         { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#DDD0C0' },
  infoRow:          { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F0E8DC' },
  infoLabel:        { fontSize: 12, color: '#888', fontWeight: '600' },
  infoValue:        { fontSize: 12, color: '#2C1810', flex: 1, textAlign: 'right' },
  section:          { marginBottom: 24 },
  sectionTitle:     { fontSize: 11, fontWeight: '700', color: '#888', letterSpacing: 1, marginBottom: 12 },
  starsRow:         { flexDirection: 'row', gap: 8 },
  star:             { fontSize: 36, color: '#DDD0C0' },
  starFilled:       { color: '#C9A96E' },
  ratingLabel:      { fontSize: 13, color: '#888', marginTop: 8, fontStyle: 'italic' },
  textInput:        { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#DDD0C0', padding: 14, fontSize: 14, color: '#2C1810', minHeight: 120, textAlignVertical: 'top' },
  charCount:        { fontSize: 11, color: '#BBB', textAlign: 'right', marginTop: 4 },
  saveButton:       { backgroundColor: '#6B2D3E', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8, marginBottom: 40 },
  saveButtonDisabled: { backgroundColor: '#A89080' },
  saveButtonText:   { color: '#F9F4EE', fontSize: 16, fontWeight: '700' },
});
