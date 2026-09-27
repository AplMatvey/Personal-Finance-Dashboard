import { useEffect, useState, type SetStateAction } from 'react';
import { readStored, writeStored } from '../services/storage';

export function useStoredState<T>(
  key: string,
  validate: (value: unknown) => value is T,
  fallback: () => T,
  recovery: () => T = fallback,
) {
  const [initial] = useState(() =>
    readStored(key, validate, fallback, recovery),
  );
  const [data, setData] = useState(initial.data);
  const [blocked, setBlocked] = useState(initial.blocked);
  const [error, setError] = useState(initial.error);
  useEffect(() => {
    if (blocked) return;
    const result = writeStored(key, data);
    // Storage can fail only at write time; reflect that external result in the UI.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(result);
  }, [key, data, blocked]);
  function reset(value: T) {
    const result = writeStored(key, value);
    setData(value);
    setError(result);
    setBlocked(result !== null);
  }
  function update(value: SetStateAction<T>) {
    setData(value);
  }
  return { data, update, error, reset };
}
