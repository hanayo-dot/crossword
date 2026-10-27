/**
 * Checks if a word can be placed in the specified slot of the grid.
 *
 * @param {string[][]} grid
 * @param {{ r: number, c: number, len: number, dir: 'H' | 'V' }} slot
 * @param {string} word
 * @returns {boolean}
 */
function canPlace(grid, slot, word) {
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

/**
 * Places a word into the grid at the given slot, tracking modified cells for backtracking.
 *
 * @param {string[][]} grid
 * @param {{ r: number, c: number, len: number, dir: 'H' | 'V' }} slot
 * @param {string} word
 * @returns {Array<{ r: number, c: number }>}
 */
function placeWord(grid, slot, word) {
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

/**
 * Reverts the placed characters during backtracking.
 *
 * @param {string[][]} grid
 * @param {Array<{ r: number, c: number }>} placedPositions
 */
function unplaceWord(grid, placedPositions) {
  for (const { r, c } of placedPositions) {
    grid[r][c] = '';
  }
}

/**
 * Solves the crossword puzzle using recursive backtracking.
 * Stops searching once more than 1 solution is discovered to enforce uniqueness.
 *
 * @param {string[][]} grid
 * @param {Array<{ r: number, c: number, len: number, dir: 'H' | 'V' }>} slots
 * @param {string[]} words
 * @returns {string[]} An array of formatted solutions.
 */
function solveCrossword(grid, slots, words) {
  const solutions = [];
  const usedWords = new Array(words.length).fill(false);

  function solve(slotIndex) {
    // Prune early if more than 1 solution exists (ambiguous crossword)
    if (solutions.length > 1) return;

    if (slotIndex === slots.length) {
      const formattedGrid = grid.map(row => row.join('')).join('\n');
      solutions.push(formattedGrid);
      return;
    }

    const slot = slots[slotIndex];

    for (let i = 0; i < words.length; i++) {
      if (!usedWords[i]) {
        const word = words[i];
        if (canPlace(grid, slot, word)) {
          usedWords[i] = true;
          const placed = placeWord(grid, slot, word);

          solve(slotIndex + 1);

          unplaceWord(grid, placed);
          usedWords[i] = false;

          if (solutions.length > 1) return;
        }
      }
    }
  }

  solve(0);
  return solutions;
}

module.exports = {
  canPlace,
  placeWord,
  unplaceWord,
  solveCrossword,
};
