function crosswordSolver(puzzle, words) {
  // 1. Basic type and emptiness validation
  if (typeof puzzle !== 'string' || !Array.isArray(words)) {
    console.log('Error');
    return;
  }

  if (puzzle.trim() === '' || words.length === 0) {
    console.log('Error');
    return;
  }

  // Check for duplicate words or non-string elements in words array
  const wordSet = new Set();
  for (const w of words) {
    if (typeof w !== 'string' || w.length === 0 || wordSet.has(w)) {
      console.log('Error');
      return;
    }
    wordSet.add(w);
  }

  // 2. Parse grid and validate structure
  const rawRows = puzzle.split('\n');
  const rows = rawRows.filter((r, idx) => !(idx === rawRows.length - 1 && r === ''));
  if (rows.length === 0) {
    console.log('Error');
    return;
  }

  const height = rows.length;
  const width = rows[0].length;
  if (width === 0) {
    console.log('Error');
    return;
  }

  for (let r = 0; r < height; r++) {
    if (rows[r].length !== width) {
      console.log('Error');
      return;
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
        console.log('Error'); // Invalid character
        return;
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
        // Start of a horizontal word if:
        // - At left edge or left cell is blocked
        // - Right cell exists and is fillable
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
        // Start of a vertical word if:
        // - At top edge or above cell is blocked
        // - Below cell exists and is fillable
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
        console.log('Error');
        return;
      }
    }
  }

  // Slots count must strictly equal words count
  if (slots.length !== words.length) {
    console.log('Error');
    return;
  }

  // 5. Backtracking to find all valid configurations
  const solutions = [];
  const usedWords = new Array(words.length).fill(false);

  function canPlace(slot, word) {
    if (slot.len !== word.length) return false;
    const { r, c, dir } = slot;

    for (let i = 0; i < word.length; i++) {
      const cr = dir === 'H' ? r : r + i;
      const cc = dir === 'H' ? c + i : c;
      const curr = grid[cr][cc];
      if (curr !== '' && curr !== word[i]) {
        return false;
      }
    }
    return true;
  }

  function placeWord(slot, word) {
    const placedPositions = [];
    const { r, c, dir } = slot;

    for (let i = 0; i < word.length; i++) {
      const cr = dir === 'H' ? r : r + i;
      const cc = dir === 'H' ? c + i : c;
      if (grid[cr][cc] === '') {
        grid[cr][cc] = word[i];
        placedPositions.push({ r: cr, c: cc });
      }
    }
    return placedPositions;
  }

  function unplaceWord(placedPositions) {
    for (const { r, c } of placedPositions) {
      grid[r][c] = '';
    }
  }

  function solve(slotIndex) {
    // Stop early if more than 1 solution is discovered
    if (solutions.length > 1) return;

    if (slotIndex === slots.length) {
      const res = grid.map(row => row.join('')).join('\n');
      solutions.push(res);
      return;
    }

    const slot = slots[slotIndex];

    for (let i = 0; i < words.length; i++) {
      if (!usedWords[i]) {
        const word = words[i];
        if (canPlace(slot, word)) {
          usedWords[i] = true;
          const placed = placeWord(slot, word);

          solve(slotIndex + 1);

          unplaceWord(placed);
          usedWords[i] = false;

          if (solutions.length > 1) return;
        }
      }
    }
  }

  solve(0);

  // 6. Must have exactly one unique solution
  if (solutions.length === 1) {
    console.log(solutions[0]);
  } else {
    console.log('Error');
  }
}