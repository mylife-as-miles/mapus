// IndexedDB wrapper for Mapus (Next.js compatible)
export class MapusDB {
  constructor() {
    this.db = null;
    this.dbName = 'MapusDB';
    this.dbVersion = 1;
  }

  async init() {
    if (typeof window === 'undefined') return null;
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object stores
        if (!db.objectStoreNames.contains('rooms')) {
          const roomsStore = db.createObjectStore('rooms', { keyPath: 'id' });
          roomsStore.createIndex('name', 'name', { unique: false });
        }

        if (!db.objectStoreNames.contains('objects')) {
          const objectsStore = db.createObjectStore('objects', { keyPath: 'id' });
          objectsStore.createIndex('roomId', 'roomId', { unique: false });
        }

        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'id' });
        }
      };
    });
  }

  // Room operations
  async createRoom(roomId, details) {
    const tx = this.db.transaction(['rooms'], 'readwrite');
    const store = tx.objectStore('rooms');
    await store.put({ 
      id: roomId, 
      name: details.name || "New map",
      description: details.description || "Map description"
    });
    return roomId;
  }

  async getRoom(roomId) {
    const tx = this.db.transaction(['rooms'], 'readonly');
    const store = tx.objectStore('rooms');
    return new Promise((resolve, reject) => {
      const request = store.get(roomId);
      request.onsuccess = () => {
        const room = request.result;
        if (room) {
          resolve({
            name: room.name,
            description: room.description
          });
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async updateRoom(roomId, updates) {
    const tx = this.db.transaction(['rooms'], 'readwrite');
    const store = tx.objectStore('rooms');
    const room = await new Promise((resolve, reject) => {
      const request = store.get(roomId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    if (room) {
      const updatedRoom = { 
        id: roomId,
        name: room.name,
        description: room.description
      };
      if (updates.name !== undefined) {
        updatedRoom.name = updates.name;
      }
      if (updates.description !== undefined) {
        updatedRoom.description = updates.description;
      }
      await store.put(updatedRoom);
    }
  }

  // Object operations
  async addObject(roomId, objectId, objectData) {
    const tx = this.db.transaction(['objects'], 'readwrite');
    const store = tx.objectStore('objects');
    const data = { id: objectId, roomId, ...objectData };
    if (!data.coords) {
      data.coords = {};
    }
    await store.put(data);
  }

  async addObjectCoord(objectId, coord) {
    const obj = await this.getObject(objectId);
    if (obj) {
      if (!obj.coords) {
        obj.coords = {};
      }
      const coordId = this.generateId();
      obj.coords[coordId] = { set: coord };
      const tx = this.db.transaction(['objects'], 'readwrite');
      const store = tx.objectStore('objects');
      await store.put(obj);
    }
  }

  async getObject(objectId) {
    const tx = this.db.transaction(['objects'], 'readonly');
    const store = tx.objectStore('objects');
    return new Promise((resolve, reject) => {
      const request = store.get(objectId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllObjects(roomId) {
    const tx = this.db.transaction(['objects'], 'readonly');
    const store = tx.objectStore('objects');
    const index = store.index('roomId');
    return new Promise((resolve, reject) => {
      const request = index.getAll(roomId);
      request.onsuccess = () => {
        const objects = {};
        request.result.forEach(obj => {
          objects[obj.id] = obj;
        });
        resolve(objects);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async updateObject(objectId, updates) {
    const obj = await this.getObject(objectId);
    if (obj) {
      const tx = this.db.transaction(['objects'], 'readwrite');
      const store = tx.objectStore('objects');
      await store.put({ ...obj, ...updates });
    }
  }

  async deleteObject(objectId) {
    const tx = this.db.transaction(['objects'], 'readwrite');
    const store = tx.objectStore('objects');
    await store.delete(objectId);
  }

  // User operations
  async saveUser(userId, userData) {
    const tx = this.db.transaction(['users'], 'readwrite');
    const store = tx.objectStore('users');
    await store.put({ id: userId, ...userData });
  }

  async getUser(userId) {
    const tx = this.db.transaction(['users'], 'readonly');
    const store = tx.objectStore('users');
    return new Promise((resolve, reject) => {
      const request = store.get(userId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Generate unique ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

// Create singleton instance
let mapusDBInstance = null;

export function getMapusDB() {
  if (typeof window === 'undefined') return null;
  if (!mapusDBInstance) {
    mapusDBInstance = new MapusDB();
  }
  return mapusDBInstance;
}

