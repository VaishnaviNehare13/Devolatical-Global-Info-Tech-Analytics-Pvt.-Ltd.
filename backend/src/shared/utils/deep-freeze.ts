/**
 * Recursively freezes nested objects to enforce absolute runtime immutability.
 * Useful for configurations and constant objects.
 *
 * @param obj The object to deeply freeze.
 * @returns The frozen object with recursive read-only types.
 */
export function deepFreeze<T extends Record<string, any>>(obj: T): T {
  const propNames = Reflect.ownKeys(obj);

  for (const name of propNames) {
    const value = obj[name as keyof T];

    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
      deepFreeze(value);
    }
  }

  return Object.freeze(obj);
}
