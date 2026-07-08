import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAllWines } from '../database';

export default function HistoryScreen({ navigation }) {
  const [wines, setWines] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Recharge la liste à chaque fois que l'écran est affiché
  useFocusEffect(
    useCallback(() => {
      loadWines();
    }, [])
  );

  const loadWines = async () => {
    try {
      setIsLoading(true);
      const data = await getAllWines();
      setWines(data);
      setFiltered(data);
    } catch (err) {
      console.error('Erreur chargement historique:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setFiltered(wines);
      return;
    }
    const query = text.toLowerCase();
    setFiltered(wines.filter(w =>
      w.name?.toLowerCase().includes(query) ||
      w.producer?.toLowerCase().includes(query) ||
      w.region?.toLowerCase().includes(query)
    ));
  };

  const renderWineItem = ({ item }) => (
    <TouchableOpacity
      style={styles.wineItem}
      onPress={() => navigation.navigate('Result', { wine: item })}
    >
      <View style={styles.wineIcon}>
        <Text style={styles.wineIconText}>🍷</Text>
      </View>
      <View style={styles.wineInfo}>
        <Text style={styles.wineName} numberOfLines={1}>{item.name || 'Vin inconnu'}</Text>
        <Text style={styles.wineDetail}>
          {item.region || ''}{item.region && item.grape ? ' · ' : ''}{item.grape || ''}
        </Text>
        <Text style={styles.wineDate}>
          {item.vintage ? `${item.vintage} · ` : ''}
          {new Date(item.scanned_at).toLocaleDateString('fr-FR')}
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>🍾</Text>
      <Text style={styles.emptyTitle}>Votre cave est vide</Text>
      <Text style={styles.emptySubtitle}>Scannez une bouteille pour commencer votre collection</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ma cave</Text>
        <Text style={styles.headerSubtitle}>{wines.length} vin{wines.length !== 1 ? 's' : ''} sauvegardé{wines.length !== 1 ? 's' : ''}</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un vin..."
          placeholderTextColor="#AAA"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* Liste */}
      {isLoading ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptySubtitle}>Chargement...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderWineItem}
          ListEmptyComponent={searchQuery ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Aucun résultat</Text>
              <Text style={styles.emptySubtitle}>Aucun vin ne correspond à "{searchQuery}"</Text>
            </View>
          ) : <EmptyState />}
          contentContainerStyle={filtered.length === 0 ? styles.emptyContainer : null}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#F9F4EE' },
  header:          { backgroundColor: '#6B2D3E', padding: 20, paddingTop: 50 },
  headerTitle:     { color: '#F9F4EE', fontSize: 24, fontWeight: '700' },
  headerSubtitle:  { color: '#C9A96E', fontSize: 13, marginTop: 4 },
  searchContainer: { backgroundColor: '#fff', padding: 12, borderBottomWidth: 1, borderBottomColor: '#DDD0C0' },
  searchInput:     { backgroundColor: '#F5EFE6', borderRadius: 10, padding: 10, fontSize: 14, color: '#2C1810' },
  wineItem:        { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 14, borderBottomWidth: 1, borderBottomColor: '#F0E8DC' },
  wineIcon:        { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F5EFE6', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  wineIconText:    { fontSize: 22 },
  wineInfo:        { flex: 1 },
  wineName:        { fontSize: 15, fontWeight: '600', color: '#2C1810' },
  wineDetail:      { fontSize: 12, color: '#888', marginTop: 2 },
  wineDate:        { fontSize: 11, color: '#BBB', marginTop: 2 },
  chevron:         { fontSize: 22, color: '#C9A96E', fontWeight: '300' },
  emptyContainer:  { flex: 1 },
  emptyState:      { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, marginTop: 60 },
  emptyEmoji:      { fontSize: 60, marginBottom: 16 },
  emptyTitle:      { fontSize: 18, fontWeight: '700', color: '#6B2D3E', marginBottom: 8 },
  emptySubtitle:   { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 20 },
});
