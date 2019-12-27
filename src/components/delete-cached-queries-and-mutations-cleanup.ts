import { removeQueriesAndMutationsFromCache } from "../state/resolvers/delete-references-from-cache";
import { InMemoryCache, NormalizedCacheObject } from "apollo-cache-inmemory";
import { CachePersistor } from "apollo-cache-persist";

export function deleteCachedQueriesAndMutationsCleanupFn(
  cache: InMemoryCache,
  mutations: string[],
  persistor: CachePersistor<NormalizedCacheObject>,
) {
  removeQueriesAndMutationsFromCache(cache, mutations);
  persistor.persist();
}
