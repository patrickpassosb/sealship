// Sealship — Cache Interface
// Abstract interface making it trivial to swap implementations (Memory → Redis)

export interface CacheInterface {
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
    delete(key: string): Promise<void>;
    has(key: string): Promise<boolean>;
    clear(): Promise<void>;
}

interface CacheEntry<T> {
    value: T;
    expiresAt: number | null; // null = never expires
}

/**
 * In-memory cache implementation using a Map.
 * Suitable for development and hackathon demos.
 *
 * To swap to Redis later, implement CacheInterface with ioredis:
 *   import Redis from 'ioredis';
 *   class RedisCache implements CacheInterface { ... }
 */
export class MemoryCache implements CacheInterface {
    private store: Map<string, CacheEntry<unknown>> = new Map();

    async get<T>(key: string): Promise<T | null> {
        const entry = this.store.get(key);
        if (!entry) return null;

        // Check expiration
        if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return null;
        }

        return entry.value as T;
    }

    async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
        const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
        this.store.set(key, { value, expiresAt });
    }

    async delete(key: string): Promise<void> {
        this.store.delete(key);
    }

    async has(key: string): Promise<boolean> {
        const entry = this.store.get(key);
        if (!entry) return false;

        if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return false;
        }

        return true;
    }

    async clear(): Promise<void> {
        this.store.clear();
    }

    /** Clean up expired entries (call periodically if desired) */
    prune(): number {
        let pruned = 0;
        const now = Date.now();

        for (const [key, entry] of this.store.entries()) {
            if (entry.expiresAt !== null && now > entry.expiresAt) {
                this.store.delete(key);
                pruned++;
            }
        }

        return pruned;
    }

    get size(): number {
        return this.store.size;
    }
}

// Singleton cache instance
let cacheInstance: CacheInterface | null = null;

/**
 * Get the global cache instance.
 * Returns MemoryCache by default. To switch to Redis:
 * 1. Create a RedisCache class implementing CacheInterface
 * 2. Update this function to return RedisCache when REDIS_URL env is set
 */
export function getCache(): CacheInterface {
    if (!cacheInstance) {
        // Future: Check for REDIS_URL env and instantiate RedisCache instead
        // if (process.env.REDIS_URL) {
        //   cacheInstance = new RedisCache(process.env.REDIS_URL);
        // } else {
        cacheInstance = new MemoryCache();
        // }
    }
    return cacheInstance;
}
