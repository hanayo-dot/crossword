const { validateInputs } = require('./validator');
const { solveCrossword } = require('./solverEngine');

/**
 * Main entry point for the crossword solver.
 * Validates the puzzle and words, solves the grid, and logs the solution or 'Error'.
 *
 * @param {string} puzzle - Crossword puzzle structure representation.
 * @param {string[]} words - List of words to fill the puzzle with.
 */
function crosswordSolver(puzzle, words) {
  const parsed = validateInputs(puzzle, words);
  if (!parsed) {
    console.log('Error');
    return;
  }

  const { grid, slots } = parsed;
  const solutions = solveCrossword(grid, slots, words);

  if (solutions.length === 1) {
    console.log(solutions[0]);
  } else {
    console.log('Error');
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = crosswordSolver;
}
