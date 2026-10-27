/**
 * Validates inputs and parses grid structure for the crossword solver.
 *
 * @param {any} puzzle - The crossword puzzle grid string.
 * @param {any} words - An array of words to fill into the puzzle.
 * @returns {{ grid: string[][], slots: Array<{ r: number, c: number, len: number, dir: 'H' | 'V' }> } | null}
 */
function validateInputs(puzzle, words) {
  // 1. Basic type and emptiness validation
  if (typeof puzzle !== 'string' || !Array.isArray(words)) {
    return null;
  }

  if (puzzle.trim() === '' || words.length === 0) {
    return null;
  }

  // Check for duplicate words or non-string elements in words array
  const wordSet = new Set();
  for (const w of words) {
    if (typeof w !== 'string' || w.length === 0 || wordSet.has(w)) {
      return null;
    }
    wordSet.add(w);
  }

  // 2. Parse grid and validate structure
  const rawRows = puzzle.split('\n');
  const rows = rawRows.filter((r, idx) => !(idx === rawRows.length - 1 && r === ''));
  if (rows.length === 0) {
    return null;
  }

  const height = rows.length;
  const width = rows[0].length;
  if (width === 0) {
    return null;
  }

  for (let r = 0; r < height; r++) {
    if (rows[r].length !== width) {
      return null;
    }
  }

  const grid = [];
  const startCounts = [];

  for (let r = 0; r < height; r++) {
    grid[r] = [];
    startCounts[r] = [];
    for (let c = 0; c < width; c++) {
      const ch = rows[r][c];
      if (ch === '.') {
        grid[r][c] = '.';
        startCounts[r][c] = -1; // Blocked cell
      } else if (ch >= '0' && ch <= '2') {
        grid[r][c] = '';
        startCounts[r][c] = parseInt(ch, 10);
      } else {
        return null; // Invalid character (e.g. letters, symbols, digits > 2)
      }
    }
  }

  // 3. Identify all horizontal and vertical slots (length >= 2)
  const slots = [];
  const expectedStarts = Array.from({ length: height }, () => Array(width).fill(0));

  // Find horizontal slots
  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      if (grid[r][c] !== '.') {
        if ((c === 0 || grid[r][c - 1] === '.') && (c + 1 < width && grid[r][c + 1] !== '.')) {
          let len = 0;
          while (c + len < width && grid[r][c + len] !== '.') {
            len++;
          }
          slots.push({ r, c, len, dir: 'H' });
          expectedStarts[r][c]++;
        }
      }
    }
  }

  // Find vertical slots
  for (let c = 0; c < width; c++) {
    for (let r = 0; r < height; r++) {
      if (grid[r][c] !== '.') {
        if ((r === 0 || grid[r - 1][c] === '.') && (r + 1 < height && grid[r + 1][c] !== '.')) {
          let len = 0;
          while (r + len < height && grid[r + len][c] !== '.') {
            len++;
          }
          slots.push({ r, c, len, dir: 'V' });
          expectedStarts[r][c]++;
        }
      }
    }
  }

  // 4. Validate that declared word start counts match actual slots
  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      if (startCounts[r][c] !== -1 && startCounts[r][c] !== expectedStarts[r][c]) {
        return null;
      }
    }
  }

  // Slots count must strictly equal words count
  if (slots.length !== words.length) {
    return null;
  }

  // Multiset of slot lengths must match multiset of word lengths
  const slotLengths = slots.map(s => s.len).sort((a, b) => a - b);
  const wordLengths = words.map(w => w.length).sort((a, b) => a - b);
  for (let i = 0; i < slotLengths.length; i++) {
    if (slotLengths[i] !== wordLengths[i]) {
      return null;
    }
  }

  return { grid, slots };
}

module.exports = {
  validateInputs,
};
