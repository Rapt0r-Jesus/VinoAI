import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, StatusBar } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAllWines } from '../database';

export default function HomeScreen({ navigation }) {
  const [recentWines, setRecentWines] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadRecentWines();
    }, [])
  );

  const loadRecentWines = async () => {
    try {
      const wines = await getAllWines();
      setRecentWines(wines.slice(0, 5));
    } catch (err) {
      console.error('Erreur chargement récents:', err);
    }
  };

  const renderRecentItem = ({ item }) => (
    <TouchableOpacity
      style={styles.recentItem}
      onPress={() => navigation.navigate('Notes', { wine: item })}
    >
      <View style={styles.recentIcon}>
        <Text style={styles.recentIconText}>🍷</Text>
      </View>
      <View style={styles.recentInfo}>
        <Text style={styles.recentName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.recentDetail}>
          {item.region || ''}{item.region && item.grape ? ' · ' : ''}{item.grape || ''}
        </Text>
      </View>
      {item.rating > 0 && (
        <Text style={styles.recentRating}>{'★'.repeat(item.rating)}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6B2D3E" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>🍷</Text>
        <Text style={styles.title}>VINOAI</Text>
        <Text style={styles.subtitle}>Scan a bottle, discover a wine</Text>
      </View>

      {/* Scan button */}
      <View style={styles.scanContainer}>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => navigation.navigate('Camera')}
        >
          <Text style={styles.scanIcon}>📷</Text>
          <Text style={styles.scanText}>Scan a bottle</Text>
        </TouchableOpacity>
      </View>

      {/* Recent scans */}
      <View style={styles.recentContainer}>
        {recentWines.length > 0 ? (
          <>
            <Text style={styles.recentTitle}>Recent scans</Text>
            <FlatList
              data={recentWines}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderRecentItem}
              scrollEnabled={false}
            />
          </>
        ) : (
          <View style={styles.emptyRecent}>
            <Text style={styles.emptyText}>Scannez votre première bouteille !</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#F9F4EE' },

  // Header
  header:          { backgroundColor: '#6B2D3E', alignItems: 'center', paddingTop: 60, paddingBottom: 30 },
  logo:            { fontSize: 50, marginBottom: 8 },
  title:           { fontSize: 32, fontWeight: '800', color: '#F9F4EE', letterSpacing: 4 },
  subtitle:        { fontSize: 14, color: '#C9A96E', marginTop: 6, fontStyle: 'italic' },

  // Scan button
  scanContainer:   { alignItems: 'center', marginTop: -22 },
  scanButton:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#C9A96E', borderRadius: 30, paddingVertical: 16, paddingHorizontal: 36, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  scanIcon:        { fontSize: 20, marginRight: 10 },
  scanText:        { fontSize: 18, fontWeight: '700', color: '#2C1810' },

  // Recent scans
  recentContainer: { flex: 1, padding: 20, marginTop: 10 },
  recentTitle:     { fontSize: 13, fontWeight: '700', color: '#888', letterSpacing: 1, marginBottom: 12, textTransform: 'uppercase' },
  recentItem:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  recentIcon:      { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F5EFE6', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  recentIconText:  { fontSize: 20 },
  recentInfo:      { flex: 1 },
  recentName:      { fontSize: 14, fontWeight: '600', color: '#2C1810' },
  recentDetail:    { fontSize: 12, color: '#888', marginTop: 2 },
  recentRating:    { fontSize: 12, color: '#C9A96E' },

  // Empty state
  emptyRecent:     { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 },
  emptyText:       { fontSize: 14, color: '#AAA', fontStyle: 'italic' },
});
