// IndexedDB wrapper for Mapus
class MapusDB {
  constructor() {
    this.db = null;
    this.dbName = 'MapusDB';
    this.dbVersion = 1;
  }

  async init() {
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
    await store.put({ id: roomId, ...details });
    return roomId;
  }

  async getRoom(roomId) {
    const tx = this.db.transaction(['rooms'], 'readonly');
    const store = tx.objectStore('rooms');
    return new Promise((resolve, reject) => {
      const request = store.get(roomId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateRoom(roomId, updates) {
    const room = await this.getRoom(roomId);
    if (room) {
      const tx = this.db.transaction(['rooms'], 'readwrite');
      const store = tx.objectStore('rooms');
      await store.put({ ...room, ...updates });
    }
  }

  // Object operations
  async addObject(roomId, objectId, objectData) {
    const tx = this.db.transaction(['objects'], 'readwrite');
    const store = tx.objectStore('objects');
    const data = { id: objectId, roomId, ...objectData };
    // Initialize coords array if not present
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

  // Generate unique ID (similar to Firebase push().key)
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

// Create global instance
const mapusDB = new MapusDB();

