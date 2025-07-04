import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';

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
    // If no data exists, create initial data
    await database.run(`
      INSERT INTO dogs (name, type, images) VALUES
      ('Queenie', 'dam', '["/dogs/dam/image1.jpg", "/dogs/dam/image2.jpg", "/dogs/dam/image3.jpg", "/dogs/dam/image4.jpg", "/dogs/dam/image5.jpg", "/dogs/dam/image6.jpg"]'),
      ('King', 'sire', '["/dogs/sire/image1.jpg", "/dogs/sire/image2.jpg", "/dogs/sire/image3.jpg", "/dogs/sire/image4.jpg"]')
    `);

    await database.run(`
      INSERT INTO puppies (name, images, isSold) VALUES
      ('Gray', '["/dogs/gray/image1.jpg"]', 0),
      ('Red', '["/dogs/red/image1.jpg"]', 0),
      ('Blue', '["/dogs/blue/image1.jpg"]', 0),
      ('Sky', '["/dogs/sky/image1.jpg"]', 0),
      ('Fuchsia', '["/dogs/fuchsia/image1.jpg"]', 0),
      ('Yellow', '["/dogs/yellow/image1.jpg"]', 0),
      ('Green', '["/dogs/green/image1.jpg"]', 1),
      ('Pink', '["/dogs/pink/image1.jpg"]', 0),
      ('Violet', '["/dogs/violet/image1.jpg"]', 0)
    `);
  }
}

export async function getAllPuppies(): Promise<Puppy[]> {
  const database = await getDatabase();
  const puppies = await database.all('SELECT * FROM puppies ORDER BY createdAt DESC');

  return (puppies as Puppy[]).map((puppy: Puppy) => ({
    ...puppy,
    images: JSON.parse(puppy.images as unknown as string)
  }));
}

export async function getDogs(): Promise<{ dam: Dog; sire: Dog }> {
  const database = await getDatabase();
  const dogs = await database.all('SELECT * FROM dogs ORDER BY type');

  const dam = (dogs as Dog[]).find((dog: Dog) => dog.type === 'dam')!;
  const sire = (dogs as Dog[]).find((dog: Dog) => dog.type === 'sire')!;

  return {
    dam: { ...dam, images: JSON.parse(dam.images as unknown as string) },
    sire: { ...sire, images: JSON.parse(sire.images as unknown as string) }
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

export async function removePuppyImage(puppyId: number, imagePath: string) {
  const database = await getDatabase();
  const puppy = await database.get('SELECT * FROM puppies WHERE id = ?', [puppyId]);
  if (!puppy) return;
  const images = JSON.parse(puppy.images as string) as string[];
  const newImages = images.filter((img) => img !== imagePath);
  await database.run('UPDATE puppies SET images = ? WHERE id = ?', [JSON.stringify(newImages), puppyId]);
}

export async function updateDamImages() {
  const database = await getDatabase();
  const damImages = [
    "/dogs/dam/image1.jpg",
    "/dogs/dam/image2.jpg",
    "/dogs/dam/image3.jpg",
    "/dogs/dam/image4.jpg",
    "/dogs/dam/image5.jpg",
    "/dogs/dam/image6.jpg"
  ];
  await database.run('UPDATE dogs SET images = ? WHERE type = ?', [JSON.stringify(damImages), 'dam']);
}

export async function updateSireImages() {
  const database = await getDatabase();
  const sireImages = [
    "/dogs/sire/image1.jpg",
    "/dogs/sire/image2.jpg",
    "/dogs/sire/image3.jpg",
    "/dogs/sire/image4.jpg"
  ];
  await database.run('UPDATE dogs SET images = ? WHERE type = ?', [JSON.stringify(sireImages), 'sire']);
}

export async function syncAllData() {
  const database = await getDatabase();
  const dogsPath = path.join(process.cwd(), 'public', 'dogs');

  try {
    // Read all folders in the dogs directory
    const folders = fs.readdirSync(dogsPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    console.log('Found folders:', folders);

    // Handle dam and sire (parent dogs)
    const parentDogs = ['dam', 'sire'];
    for (const folder of parentDogs) {
      if (folders.includes(folder)) {
        const folderPath = path.join(dogsPath, folder);
        const files = fs.readdirSync(folderPath);

        // Filter and sort image files
        const imageFiles = files
          .filter((file: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
          .sort((a: string, b: string) => {
            const aMatch = a.match(/image(\d+)\./);
            const bMatch = b.match(/image(\d+)\./);
            if (aMatch && bMatch) {
              return parseInt(aMatch[1]) - parseInt(bMatch[1]);
            }
            return a.localeCompare(b);
          });

        const imagePaths = imageFiles.map((file: string) => `/dogs/${folder}/${file}`);
        const dogName = folder === 'dam' ? 'Queenie' : 'King';

        // Check if dog exists in database
        const existingDog = await database.get('SELECT * FROM dogs WHERE type = ?', [folder]);

        if (existingDog) {
          // Get existing images and merge with new ones (avoid duplicates)
          const existingImages = JSON.parse(existingDog.images as string) as string[];
          const newImages = imagePaths.filter(img => !existingImages.includes(img));
          const allImages = [...existingImages, ...newImages];

          if (newImages.length > 0) {
            await database.run('UPDATE dogs SET images = ? WHERE type = ?', [JSON.stringify(allImages), folder]);
            console.log(`Updated ${dogName} (${folder}): Added ${newImages.length} new images, total ${allImages.length}`);
          } else {
            console.log(`No new images for ${dogName} (${folder}): ${existingImages.length} images`);
          }
        } else {
          // Create new dog
          await database.run('INSERT INTO dogs (name, type, images) VALUES (?, ?, ?)', [dogName, folder, JSON.stringify(imagePaths)]);
          console.log(`Created ${dogName} (${folder}): ${imagePaths.length} images`);
        }
      }
    }

    // Handle puppies (all other folders)
    const puppyFolders = folders.filter(folder => !parentDogs.includes(folder));

    for (const folder of puppyFolders) {
      const folderPath = path.join(dogsPath, folder);
      const files = fs.readdirSync(folderPath);

      // Filter and sort image files
      const imageFiles = files
        .filter((file: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
        .sort((a: string, b: string) => {
          const aMatch = a.match(/image(\d+)\./);
          const bMatch = b.match(/image(\d+)\./);
          if (aMatch && bMatch) {
            return parseInt(aMatch[1]) - parseInt(bMatch[1]);
          }
          return a.localeCompare(b);
        });

      const imagePaths = imageFiles.map((file: string) => `/dogs/${folder}/${file}`);
      const puppyName = folder.charAt(0).toUpperCase() + folder.slice(1); // Capitalize first letter

      // Check if puppy exists in database
      const existingPuppy = await database.get('SELECT * FROM puppies WHERE name = ?', [puppyName]);

      if (existingPuppy) {
        // Get existing images and merge with new ones (avoid duplicates)
        const existingImages = JSON.parse(existingPuppy.images as string) as string[];
        const newImages = imagePaths.filter(img => !existingImages.includes(img));
        const allImages = [...existingImages, ...newImages];

        if (newImages.length > 0) {
          await database.run('UPDATE puppies SET images = ? WHERE name = ?', [JSON.stringify(allImages), puppyName]);
          console.log(`Updated ${puppyName}: Added ${newImages.length} new images, total ${allImages.length}`);
        } else {
          console.log(`No new images for ${puppyName}: ${existingImages.length} images`);
        }
      } else {
        // Create new puppy (default to available)
        await database.run('INSERT INTO puppies (name, images, isSold) VALUES (?, ?, ?)', [puppyName, JSON.stringify(imagePaths), false]);
        console.log(`Created ${puppyName}: ${imagePaths.length} images`);
      }
    }

    console.log('Database sync completed successfully!');

  } catch (error) {
    console.error('Error syncing data:', error);
    throw error;
  }
}

export async function resetToOriginalImages() {
  const database = await getDatabase();

  try {
    // Clear existing data
    await database.run('DELETE FROM puppies');
    await database.run('DELETE FROM dogs');

    // Reset to original images
    await database.run(`
      INSERT INTO dogs (name, type, images) VALUES
      ('Queenie', 'dam', '["/dogs/dam/image1.jpg", "/dogs/dam/image2.jpg", "/dogs/dam/image3.jpg", "/dogs/dam/image4.jpg", "/dogs/dam/image5.jpg", "/dogs/dam/image6.jpg"]'),
      ('King', 'sire', '["/dogs/sire/image1.jpg", "/dogs/sire/image2.jpg", "/dogs/sire/image3.jpg", "/dogs/sire/image4.jpg"]')
    `);

    await database.run(`
      INSERT INTO puppies (name, images, isSold) VALUES
      ('Gray', '["/dogs/gray/image1.jpg"]', 0),
      ('Red', '["/dogs/red/image1.jpg"]', 0),
      ('Blue', '["/dogs/blue/image1.jpg"]', 0),
      ('Sky', '["/dogs/sky/image1.jpg"]', 0),
      ('Fuchsia', '["/dogs/fuchsia/image1.jpg"]', 0),
      ('Yellow', '["/dogs/yellow/image1.jpg"]', 0),
      ('Green', '["/dogs/green/image1.jpg"]', 1),
      ('Pink', '["/dogs/pink/image1.jpg"]', 1),
      ('Violet', '["/dogs/violet/image1.jpg"]', 0)
    `);

    console.log('Database reset to original images successfully!');

  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  }
}

export async function addNewImagesIncrementally() {
  const database = await getDatabase();
  const dogsPath = path.join(process.cwd(), 'public', 'dogs');

  try {
    // Read all folders in the dogs directory
    const folders = fs.readdirSync(dogsPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    console.log('Found folders:', folders);

    // Handle dam and sire (parent dogs)
    const parentDogs = ['dam', 'sire'];
    for (const folder of parentDogs) {
      if (folders.includes(folder)) {
        const folderPath = path.join(dogsPath, folder);
        const files = fs.readdirSync(folderPath);

        // Filter and sort image files
        const imageFiles = files
          .filter((file: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
          .sort((a: string, b: string) => {
            const aMatch = a.match(/image(\d+)\./);
            const bMatch = b.match(/image(\d+)\./);
            if (aMatch && bMatch) {
              return parseInt(aMatch[1]) - parseInt(bMatch[1]);
            }
            return a.localeCompare(b);
          });

        const imagePaths = imageFiles.map((file: string) => `/dogs/${folder}/${file}`);
        const dogName = folder === 'dam' ? 'Queenie' : 'King';

        // Check if dog exists in database
        const existingDog = await database.get('SELECT * FROM dogs WHERE type = ?', [folder]);

        if (existingDog) {
          // Get existing images and add only new ones
          const existingImages = JSON.parse(existingDog.images as string) as string[];
          const newImages = imagePaths.filter(img => !existingImages.includes(img));

          if (newImages.length > 0) {
            const allImages = [...existingImages, ...newImages];
            await database.run('UPDATE dogs SET images = ? WHERE type = ?', [JSON.stringify(allImages), folder]);
            console.log(`Added ${newImages.length} new images to ${dogName} (${folder}): ${newImages.join(', ')}`);
          } else {
            console.log(`No new images for ${dogName} (${folder})`);
          }
        }
      }
    }

    // Handle puppies (all other folders)
    const puppyFolders = folders.filter(folder => !parentDogs.includes(folder));

    for (const folder of puppyFolders) {
      const folderPath = path.join(dogsPath, folder);
      const files = fs.readdirSync(folderPath);

      // Filter and sort image files
      const imageFiles = files
        .filter((file: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
        .sort((a: string, b: string) => {
          const aMatch = a.match(/image(\d+)\./);
          const bMatch = b.match(/image(\d+)\./);
          if (aMatch && bMatch) {
            return parseInt(aMatch[1]) - parseInt(bMatch[1]);
          }
          return a.localeCompare(b);
        });

      const imagePaths = imageFiles.map((file: string) => `/dogs/${folder}/${file}`);
      const puppyName = folder.charAt(0).toUpperCase() + folder.slice(1); // Capitalize first letter

      // Check if puppy exists in database
      const existingPuppy = await database.get('SELECT * FROM puppies WHERE name = ?', [puppyName]);

      if (existingPuppy) {
        // Get existing images and add only new ones
        const existingImages = JSON.parse(existingPuppy.images as string) as string[];
        const newImages = imagePaths.filter(img => !existingImages.includes(img));

        if (newImages.length > 0) {
          const allImages = [...existingImages, ...newImages];
          await database.run('UPDATE puppies SET images = ? WHERE name = ?', [JSON.stringify(allImages), puppyName]);
          console.log(`Added ${newImages.length} new images to ${puppyName}: ${newImages.join(', ')}`);
        } else {
          console.log(`No new images for ${puppyName}`);
        }
      }
    }

    console.log('Incremental image addition completed successfully!');

  } catch (error) {
    console.error('Error adding images incrementally:', error);
    throw error;
  }
}