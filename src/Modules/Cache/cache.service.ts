import { Injectable, Logger } from "@nestjs/common";
import NodeCache from "node-cache";
import { CACHE_KEYS, CACHE_TTL } from "./cache.constants";

@Injectable()
export class CacheService {
  private readonly cache: NodeCache;
  private readonly logger = new Logger(CacheService.name);

  constructor() {
    this.cache = new NodeCache({
      stdTTL: 300,
      checkperiod: 60,
      useClones: false,
      deleteOnExpire: true,
    });
  }

  // =========================
  // CORE METHODS
  // =========================

  get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  set<T>(key: string, value: T, ttl?: number): boolean {
    return this.cache.set(key, value, ttl ?? CACHE_TTL.DEFAULT);
  }

  del(key: string | string[]): number {
    return this.cache.del(key);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  flush(): void {
    this.cache.flushAll();
    this.logger.warn("Cache flushed");
  }

  // =========================
  // GET OR SET (IMPORTANT)
  // =========================

async getOrSet<T>(
  key: string,
  factory: () => Promise<T>,
  ttl?: number,
): Promise<{ data: T; cached: boolean }> {
  const cached = this.get<T>(key);

  if (cached) {
    return {
      data: cached,
      cached: true,
    };
  }

  const value = await factory();
  this.set(key, value, ttl);

  return {
    data: value,
    cached: false,
  };
}

  // =========================
  // PATTERN INVALIDATION
  // =========================

  private getKeysWithPrefix(prefix: string): string[] {
    return this.cache.keys().filter((k) => k.startsWith(prefix));
  }

  invalidatePattern(prefix: string): number {
    return this.del(this.getKeysWithPrefix(prefix));
  }

  // =========================
  // DOMAIN CACHE INVALIDATION
  // =========================

  invalidateAcademy(academyId: string) {
    this.invalidatePattern(`academy:${academyId}`);
    this.invalidatePattern(`athletes:academy:${academyId}`);
    this.invalidatePattern(`subscription:${academyId}`);
    this.invalidatePattern(`dashboard:academy:${academyId}`);
    this.invalidatePattern("academies:list:"); // Invalida listas que podem conter essa academia

    this.logger.log(`Invalidated academy cache: ${academyId}`);
  }

  invalidateUser(userId: string) {
    this.del([
      `user:${userId}`,
      `user:permissions:${userId}`,
    ]);
  }

  invalidateAthlete(athleteId: string, academyId?: string) {
    this.del(`athlete:${athleteId}`);

    if (academyId) {
      this.invalidatePattern(`athletes:academy:${academyId}`);
    }
  }

  invalidateSubscription(academyId: string) {
    this.del([
      `subscription:${academyId}`,
      `subscription:status:${academyId}`,
    ]);
  }

  invalidatePayments(academyId: string) {
    this.invalidatePattern(`payments:${academyId}`);
  }

  invalidateAuth(accountId: string) {
    this.del([
      `auth:token:${accountId}`,
      `2fa:${accountId}`,
    ]);
  }

  invalidateDownloadKeys(academyId: string) {
    this.invalidatePattern(`downloadKey:${academyId}`);
  }

  // =========================
  // STATS
  // =========================

  getStats() {
    return this.cache.getStats();
  }
}