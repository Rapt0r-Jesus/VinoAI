import * as SQLite from 'expo-sqlite';

let db;

export async function initDatabase() {
  db = await SQLite.openDatabaseAsync('vinoai.db');

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS wines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      vintage INTEGER,
      producer TEXT,
      region TEXT,
      grape TEXT,
      appellation TEXT,
      tasting_notes TEXT,
      food_pairings TEXT,
      grapeminds_id TEXT,
      scanned_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      wine_id INTEGER NOT NULL,
      rating INTEGER,
      note_text TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (wine_id) REFERENCES wines (id) ON DELETE CASCADE
    );
  `);

  console.log('Database initialized');
  return db;
}

export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

// Sauvegarder un vin scanné
export async function saveWine(wine) {
  const database = getDatabase();

  const result = await database.runAsync(
    `INSERT INTO wines (name, vintage, producer, region, grape, appellation, tasting_notes, food_pairings, grapeminds_id, scanned_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      wine.name || null,
      wine.vintage || null,
      wine.producer || null,
      wine.region || null,
      wine.grape || null,
      wine.appellation || null,
      wine.tasting_notes || null,
      JSON.stringify(wine.food_pairings || []),
      wine.grapeminds_id || null,
      new Date().toISOString(),
    ]
  );

  return result.lastInsertRowId;
}

// Récupérer tous les vins sauvegardés (pour l'écran History)
export async function getAllWines() {
  const database = getDatabase();
  const wines = await database.getAllAsync('SELECT * FROM wines ORDER BY scanned_at DESC');

  return wines.map(w => ({
    ...w,
    food_pairings: JSON.parse(w.food_pairings || '[]'),
  }));
}
