import { createHash } from "crypto";

/**
 * Gera um hash consistente para filtros de query
 */
export function hashFilters(filters: Record<string, any> | undefined): string {
  if (!filters || Object.keys(filters).length === 0) {
    return "all";
  }

  const normalized = JSON.stringify(
    Object.keys(filters)
      .sort()
      .reduce((acc, key) => {
        acc[key] = filters[key];
        return acc;
      }, {} as Record<string, any>),
  );

  return createHash("md5").update(normalized).digest("hex");
}