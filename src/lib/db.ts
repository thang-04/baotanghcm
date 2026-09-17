import fs from 'fs';
import path from 'path';

export interface Translation {
  vi: string;
  en: string;
}

export interface Gallery {
  id: string;
  name: string;
  description: string;
  scene_asset_url: string;
  is_active: boolean;
  
  // Cấu hình không gian 3D
  room_width?: number;
  room_length?: number;
  room_height?: number;
  floor_color?: string;
  wall_color?: string;
  wainscoting_color?: string;
  floor_type?: 'wood' | 'marble' | 'carpet';
  // Config riêng từng dây đỏ (JSON array 6 phần tử)
  rope_barriers_config?: string;
}

export interface Exhibit {
  id: string;
  gallery_id: string;
  title: Translation;
  author: Translation;
  description: Translation;
  model_3d_url: string;
  thumbnail_url: string;
  /** Optional ordered set of images shown in the exhibit detail slideshow. */
  image_urls?: string[];
  coordinate_x: number;
  coordinate_y: number;
  coordinate_z: number;
  rotation_x: number;
  rotation_y: number;
  rotation_z: number;
  scale_x: number;
  scale_y: number;
  scale_z: number;
}

interface DatabaseSchema {
  galleries: Gallery[];
  exhibits: Exhibit[];
}

const DB_DIR = path.join(process.cwd(), 'src', 'lib', 'db');
const DB_PATH_LEGACY = path.join(process.cwd(), 'src', 'lib', 'db.json');

// Đọc dữ liệu từ file JSON
function readDb(): DatabaseSchema {
  try {
    const galleries: Gallery[] = [];
    const exhibits: Exhibit[] = [];

    // Nếu thư mục db tồn tại, đọc từ tất cả các file .json trong thư mục đó
    if (fs.existsSync(DB_DIR)) {
      const files = fs.readdirSync(DB_DIR).filter(f => f.endsWith('.json'));
      if (files.length > 0) {
        for (const file of files) {
          const filePath = path.join(DB_DIR, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          const data = JSON.parse(content) as DatabaseSchema;
          if (process.env.DEBUG_DB_LOAD === 'true') {
            console.log(`[DB-LOAD] Đọc file ${file}: ${data.galleries?.length || 0} phòng, ${data.exhibits?.length || 0} hiện vật.`);
          }
          if (data.galleries) galleries.push(...data.galleries);
          if (data.exhibits) exhibits.push(...data.exhibits);
        }
        return { galleries, exhibits };
      }
    }

    // Fallback sang file legacy db.json nếu chưa cấu hình thư mục db
    if (fs.existsSync(DB_PATH_LEGACY)) {
      const data = fs.readFileSync(DB_PATH_LEGACY, 'utf-8');
      return JSON.parse(data) as DatabaseSchema;
    }

    return { galleries: [], exhibits: [] };
  } catch (error) {
    console.error('Lỗi đọc cơ sở dữ liệu:', error);
    return { galleries: [], exhibits: [] };
  }
}

// Ghi dữ liệu vào các file JSON tương ứng trong thư mục db
function writeDb(data: DatabaseSchema): boolean {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    // Gom nhóm dữ liệu theo gallery_id
    const groupedData: Record<string, DatabaseSchema> = {};

    // Khởi tạo nhóm từ danh sách galleries
    for (const gallery of data.galleries) {
      groupedData[gallery.id] = {
        galleries: [gallery],
        exhibits: []
      };
    }

    // Chia các exhibits vào nhóm tương ứng
    for (const exhibit of data.exhibits) {
      const gId = exhibit.gallery_id;
      if (!groupedData[gId]) {
        groupedData[gId] = {
          galleries: [],
          exhibits: []
        };
      }
      groupedData[gId].exhibits.push(exhibit);
    }

    // Ghi từng nhóm ra file JSON riêng
    for (const [gId, content] of Object.entries(groupedData)) {
      const filePath = path.join(DB_DIR, `${gId}.json`);
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf-8');
    }

    return true;
  } catch (error) {
    console.error('Lỗi ghi cơ sở dữ liệu:', error);
    return false;
  }
}

// Memory Cache cho các API đọc (Mô phỏng Redis)
let dbCache: DatabaseSchema | null = null;
let cacheTimestamp = 0;
// Đặt CACHE_TTL = 0 để vô hiệu hóa cache bộ nhớ. 
// Lý do: Next.js App Router chạy các API routes trên nhiều worker (thread) khác nhau. 
// Khi PATCH ở worker 1 xóa cache, GET ở worker 2 vẫn giữ cache cũ gây ra hiện tượng không đồng bộ.
const CACHE_TTL = 0; 

function getCachedDb(): DatabaseSchema {
  const now = Date.now();
  if (dbCache && (now - cacheTimestamp < CACHE_TTL)) {
    // Cache Hit!
    return dbCache;
  }
  // Cache Miss, đọc từ file và lưu vào cache
  const db = readDb();
  dbCache = db;
  cacheTimestamp = now;
  return db;
}

function invalidateCache() {
  dbCache = null;
  cacheTimestamp = 0;
}

// --- PUBLIC HELPER METHODS ---

export function getGalleries(): Gallery[] {
  const db = getCachedDb();
  return db.galleries.filter(g => g.is_active);
}

export function getGalleryById(id: string): Gallery | undefined {
  const db = getCachedDb();
  return db.galleries.find(g => g.id === id);
}

export function getExhibits(galleryId?: string): Exhibit[] {
  const db = getCachedDb();
  if (galleryId) {
    return db.exhibits.filter(e => e.gallery_id === galleryId);
  }
  return db.exhibits;
}

export function getExhibitById(id: string): Exhibit | undefined {
  const db = getCachedDb();
  return db.exhibits.find(e => e.id === id);
}

export function updateExhibitCoordinates(
  id: string,
  coords: {
    coordinate_x: number;
    coordinate_y: number;
    coordinate_z: number;
    rotation_x: number;
    rotation_y: number;
    rotation_z: number;
    scale_x: number;
    scale_y: number;
    scale_z: number;
  }
): boolean {
  const db = readDb(); // Đọc trực tiếp từ file để tránh xung đột ghi đè
  const index = db.exhibits.findIndex(e => e.id === id);
  if (index === -1) return false;

  db.exhibits[index] = {
    ...db.exhibits[index],
    ...coords
  };

  const success = writeDb(db);
  if (success) {
    invalidateCache(); // Xóa cache để lượt đọc tiếp theo lấy dữ liệu mới nhất
  }
  return success;
}

export function updateGallery(
  id: string,
  data: Partial<Gallery>
): boolean {
  const db = readDb();
  const index = db.galleries.findIndex(g => g.id === id);
  if (index === -1) return false;

  db.galleries[index] = {
    ...db.galleries[index],
    ...data
  };

  const success = writeDb(db);
  if (success) {
    invalidateCache();
  }
  return success;
}


export function saveExhibit(exhibit: Exhibit): boolean {
  const db = readDb();
  const index = db.exhibits.findIndex(e => e.id === exhibit.id);
  
  if (index !== -1) {
    db.exhibits[index] = exhibit;
  } else {
    db.exhibits.push(exhibit);
  }

  const success = writeDb(db);
  if (success) {
    invalidateCache();
  }
  return success;
}

export function deleteExhibit(id: string): boolean {
  const db = readDb();
  const initialLength = db.exhibits.length;
  db.exhibits = db.exhibits.filter(e => e.id !== id);
  
  if (db.exhibits.length === initialLength) return false;

  const success = writeDb(db);
  if (success) {
    invalidateCache();
  }
  return success;
}
