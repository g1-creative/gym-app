// Offline storage utilities using IndexedDB
// This allows storing workout data locally when offline

const DB_NAME = 'gym-tracker-offline'
const DB_VERSION = 1
const STORE_NAME = 'pending-operations'

interface PendingOperation {
  id: string
  type: 'set' | 'session' | 'note'
  data: any
  timestamp: number
}

export async function initOfflineDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('timestamp', 'timestamp', { unique: false })
      }
    }
  })
}

export async function savePendingOperation(operation: Omit<PendingOperation, 'id' | 'timestamp'>) {
  try {
    const db = await initOfflineDB()
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)

    const pendingOp: PendingOperation = {
      ...operation,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    }

    await store.add(pendingOp)
    return pendingOp.id
  } catch (error) {
    console.error('Error saving pending operation:', error)
    throw error
  }
}

export async function getPendingOperations(): Promise<PendingOperation[]> {
  try {
    const db = await initOfflineDB()
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const index = store.index('timestamp')

    return new Promise((resolve, reject) => {
      const request = index.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('Error getting pending operations:', error)
    return []
  }
}

export async function removePendingOperation(id: string) {
  try {
    const db = await initOfflineDB()
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    await store.delete(id)
  } catch (error) {
    console.error('Error removing pending operation:', error)
    throw error
  }
}

export async function syncPendingOperations() {
  const operations = await getPendingOperations()
  
  // This would be called when coming back online
  // You'd process each operation and sync with Supabase
  // Implementation depends on your specific sync strategy
  
  console.log('Syncing pending operations:', operations.length)
  // TODO: Implement actual sync logic
}


