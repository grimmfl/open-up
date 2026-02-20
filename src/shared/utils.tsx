export function alterMapState<K, V>(map: Map<K, V>, action: ((m: Map<K, V>) => void )) {
  const tmp = new Map(map.entries());

  action(tmp);

  return tmp;
}
