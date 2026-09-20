export function alterMapState<K, V>(
  map: Map<K, V>,
  action: (m: Map<K, V>) => void,
) {
  const tmp = new Map(map.entries());

  action(tmp);

  return tmp;
}

export function alterSetState<V>(set: Set<V>, action: (s: Set<V>) => void) {
  const tmp = new Set(set.values());

  action(tmp);

  return tmp;
}
