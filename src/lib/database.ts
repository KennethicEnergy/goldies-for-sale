import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database | null = null;

export interface Puppy {
  id: number;
  name: string;
  images: string[];
  isSold: boolean;
  createdAt: string;
}

export interface Dog {
  id: number;
  name: string;
  type: 'dam' | 'sire';
  images: string[];
  createdAt: string;
}

async function getDatabase(): Promise<Database> {
  if (db) return db;

  db = await open({
    filename: path.join(process.cwd(), 'puppies.db'),
    driver: sqlite3.Database
  });

  // Create tables if they don't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS puppies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      images TEXT NOT NULL,
      isSold BOOLEAN DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS dogs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('dam', 'sire')),
      images TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  return db;
}

export async function initializeDatabase() {
  const database = await getDatabase();

  // Check if data already exists
  const puppyCount = await database.get('SELECT COUNT(*) as count FROM puppies');
  const dogCount = await database.get('SELECT COUNT(*) as count FROM dogs');

  if (puppyCount.count === 0 && dogCount.count === 0) {
    // Insert initial data
    await database.run(`
      INSERT INTO dogs (name, type, images) VALUES
      ('Queenie', 'dam', '["/dogs/dam/image1.jpg", "/dogs/dam/image2.jpg"]'),
      ('King', 'sire', '["/dogs/sire/image1.jpg"]')
    `);

    await database.run(`
      INSERT INTO puppies (name, images, isSold) VALUES
      ('Gray', '["/dogs/gray/image1.jpg", "/dogs/gray/image2.jpg"]', 0),
      ('Red', '["/dogs/red/image1.jpg"]', 0),
      ('Blue', '["/dogs/blue/image1.jpg"]', 0),
      ('Sky', '["/dogs/sky/image1.jpg"]', 0),
      ('Fuchsia', '["/dogs/fuchsia/image1.jpg"]', 0),
      ('Yellow', '["/dogs/yellow/image1.jpg"]', 0),
      ('Green', '["/dogs/green/image1.jpg"]', 1),
      ('Pink', '["/dogs/pink/image1.jpg"]', 1),
      ('Violet', '["/dogs/violet/image1.jpg"]', 0)
    `);
  }
}

export async function getAllPuppies(): Promise<Puppy[]> {
  const database = await getDatabase();
  const puppies = await database.all('SELECT * FROM puppies ORDER BY createdAt DESC');

  return puppies.map((puppy: any) => ({
    ...puppy,
    images: JSON.parse(puppy.images)
  }));
}

export async function getDogs(): Promise<{ dam: Dog; sire: Dog }> {
  const database = await getDatabase();
  const dogs = await database.all('SELECT * FROM dogs ORDER BY type');

  const dam = dogs.find((dog: any) => dog.type === 'dam');
  const sire = dogs.find((dog: any) => dog.type === 'sire');

  return {
    dam: { ...dam, images: JSON.parse(dam.images) },
    sire: { ...sire, images: JSON.parse(sire.images) }
  };
}

export async function addPuppy(name: string, images: string[], isSold: boolean = false) {
  const database = await getDatabase();
  const result = await database.run(
    'INSERT INTO puppies (name, images, isSold) VALUES (?, ?, ?)',
    [name, JSON.stringify(images), isSold]
  );
  return result.lastID;
}

export async function updatePuppyStatus(id: number, isSold: boolean) {
  const database = await getDatabase();
  await database.run('UPDATE puppies SET isSold = ? WHERE id = ?', [isSold, id]);
}

export async function deletePuppy(id: number) {
  const database = await getDatabase();
  await database.run('DELETE FROM puppies WHERE id = ?', [id]);
}