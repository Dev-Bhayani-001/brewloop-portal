/** Small deterministic PRNG so seed data looks the same on every load. */
export function createRandom(seed = 42) {
  let state = seed
  const next = () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
  return {
    next,
    int: (min, max) => Math.floor(next() * (max - min + 1)) + min,
    pick: (list) => list[Math.floor(next() * list.length)],
  }
}

export const generateCardNumber = (prefix, sequence) =>
  `${prefix}-${String(sequence).padStart(5, '0')}`
