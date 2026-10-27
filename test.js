const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Load crosswordSolver from crosswordSolver.js
let crosswordSolver;
try {
  crosswordSolver = require('./crosswordSolver');
} catch (e) {}

if (typeof crosswordSolver !== 'function') {
  const code = fs.readFileSync(path.join(__dirname, 'crosswordSolver.js'), 'utf8');
  const context = {
    console,
    process,
    require,
    Buffer,
    setTimeout,
    clearTimeout
  };
  vm.createContext(context);
  vm.runInContext(code + '\n;this.crosswordSolver = crosswordSolver;', context);
  crosswordSolver = context.crosswordSolver;
}

if (typeof crosswordSolver !== 'function') {
  console.error('Failed to load crosswordSolver function from crosswordSolver.js');
  process.exit(1);
}

// Test Runner Helper
let passedCount = 0;
let failedCount = 0;
const results = [];

function runCase(category, name, puzzle, words, expected) {
  let output = '';
  const originalLog = console.log;
  console.log = (...args) => {
    output += args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ') + '\n';
  };

  const startTime = process.hrtime.bigint();
  try {
    crosswordSolver(puzzle, words);
  } catch (err) {
    output = `EXCEPTION: ${err.message}\n`;
  }
  const endTime = process.hrtime.bigint();
  console.log = originalLog;

  const durationMs = Number(endTime - startTime) / 1e6;
  const actual = output.trim();
  const trimmedExpected = typeof expected === 'string' ? expected.trim() : expected;
  const passed = actual === trimmedExpected;

  if (passed) {
    passedCount++;
  } else {
    failedCount++;
  }

  results.push({
    category,
    name,
    passed,
    durationMs,
    expected: trimmedExpected,
    actual
  });
}

// -------------------------------------------------------------
// Category 1: Valid Crosswords (Unique Solutions)
// -------------------------------------------------------------

// 1. Basic 4x4 puzzle
const puzzle1 = '2001\n0..0\n1000\n0..0';
const words1 = ['casa', 'alan', 'ciao', 'anta'];
const exp1 = 'casa\ni..l\nanta\no..n';
runCase('1. Valid Puzzles', 'Basic 4x4 standard crossword', puzzle1, words1, exp1);

// 2. Beach puzzle (15x13)
const puzzle2 = `...1...........
..1000001000...
...0....0......
.1......0...1..
.0....100000000
100000..0...0..
.0.....1001000.
.0.1....0.0....
.10000000.0....
.0.0......0....
.0.0.....100...
...0......0....
..........0....`;

const words2 = [
  'sun',
  'sunglasses',
  'suncream',
  'swimming',
  'bikini',
  'beach',
  'icecream',
  'tan',
  'deckchair',
  'sand',
  'seaside',
  'sandals',
];

const exp2 = `...s...........
..sunglasses...
...n....u......
.s......n...s..
.w....deckchair
bikini..r...n..
.m.....seaside.
.m.b....a.a....
.icecream.n....
.n.a......d....
.g.c.....tan...
...h......l....
..........s....`;
runCase('1. Valid Puzzles', 'Beach puzzle (15x13)', puzzle2, words2, exp2);

// 3. Food puzzle (11x11)
const puzzle3 = `..1.1..1...
10000..1000
..0.0..0...
..1000000..
..0.0..0...
1000..10000
..0.1..0...
....0..0...
..100000...
....0..0...
....0......`;

const words3 = [
  'popcorn',
  'fruit',
  'flour',
  'chicken',
  'eggs',
  'vegetables',
  'pasta',
  'pork',
  'steak',
  'cheese',
];

const exp3 = `..p.f..v...
flour..eggs
..p.u..g...
..chicken..
..o.t..t...
pork..pasta
..n.s..b...
....t..l...
..cheese...
....a..s...
....k......`;
runCase('1. Valid Puzzles', 'Food puzzle (11x11)', puzzle3, words3, exp3);

// 4. Word order invariance (reversed words array)
runCase('1. Valid Puzzles', 'Word order invariance (Beach reversed)', puzzle2, [...words2].reverse(), exp2);

// 5. Valid puzzle with trailing newline
runCase('1. Valid Puzzles', 'Puzzle with trailing newline', puzzle1 + '\n', words1, exp1);

// 6. Horizontal only words with unique lengths
const puzzleH = '1000.\n.....\n10000';
const wordsH = ['word', 'hello'];
const expH = 'word.\n.....\nhello';
runCase('1. Valid Puzzles', 'Horizontal only words (distinct lengths)', puzzleH, wordsH, expH);

// 6. Vertical only words with unique lengths
const puzzleV = '1.1\n0.0\n0.0\n..0';
const wordsV = ['cat', 'dogs'];
const expV = 'c.d\na.o\nt.g\n..s';
runCase('1. Valid Puzzles', 'Vertical only words (distinct lengths)', puzzleV, wordsV, expV);

// -------------------------------------------------------------
// Category 2: Invalid Data Types
// -------------------------------------------------------------
runCase('2. Invalid Types', 'Puzzle as number (123)', 123, words1, 'Error');
runCase('2. Invalid Types', 'Puzzle as boolean (true)', true, words1, 'Error');
runCase('2. Invalid Types', 'Puzzle as null', null, words1, 'Error');
runCase('2. Invalid Types', 'Puzzle as undefined', undefined, words1, 'Error');
runCase('2. Invalid Types', 'Puzzle as object', { grid: '100' }, words1, 'Error');
runCase('2. Invalid Types', 'Puzzle as array', ['100', '000'], words1, 'Error');

runCase('2. Invalid Types', 'Words as number (123)', puzzle1, 123, 'Error');
runCase('2. Invalid Types', 'Words as string', puzzle1, 'casa alan ciao anta', 'Error');
runCase('2. Invalid Types', 'Words as null', puzzle1, null, 'Error');
runCase('2. Invalid Types', 'Words as undefined', puzzle1, undefined, 'Error');
runCase('2. Invalid Types', 'Words as object', puzzle1, { 0: 'casa' }, 'Error');
runCase('2. Invalid Types', 'Both arguments invalid', 123, 123, 'Error');

// -------------------------------------------------------------
// Category 3: Empty and Malformed Inputs
// -------------------------------------------------------------
runCase('3. Empty & Malformed', 'Empty puzzle string', '', words1, 'Error');
runCase('3. Empty & Malformed', 'Whitespace-only puzzle string', '   \n  \t ', words1, 'Error');
runCase('3. Empty & Malformed', 'Empty words array', puzzle1, [], 'Error');
runCase('3. Empty & Malformed', 'Words array with empty string', puzzle1, ['casa', 'alan', 'ciao', ''], 'Error');
runCase('3. Empty & Malformed', 'Words array with non-string element', puzzle1, ['casa', 'alan', 'ciao', 42], 'Error');
runCase('3. Empty & Malformed', 'Words array with null element', puzzle1, ['casa', 'alan', 'ciao', null], 'Error');
runCase('3. Empty & Malformed', 'Words array with duplicates', puzzle1, ['casa', 'casa', 'ciao', 'anta'], 'Error');

// -------------------------------------------------------------
// Category 4: Grid Structure and Geometry Errors
// -------------------------------------------------------------
runCase('4. Grid Structure', 'Inconsistent row lengths (jagged grid)', '1000\n100\n1000', ['cat', 'cats', 'dogs'], 'Error');
runCase('4. Grid Structure', 'Invalid characters (letters in grid)', 'a001\n0..0\n1000\n0..0', words1, 'Error');
runCase('4. Grid Structure', 'Invalid characters (special symbols)', '2001\n0..#\n1000\n0..0', words1, 'Error');
runCase('4. Grid Structure', 'Starting word count higher than 2 (3000)', '0001\n0..0\n3000\n0..0', words1, 'Error');
runCase('4. Grid Structure', 'Starting count mismatch (declared 2 but only 1 slot)', '2001\n0..0\n2000\n0..0', words1, 'Error');
runCase('4. Grid Structure', 'Starting count mismatch (declared 1 but 2 slots start)', '1001\n0..0\n1000\n0..0', words1, 'Error');
runCase('4. Grid Structure', 'Starting count mismatch (declared 0 but a slot starts)', '0001\n0..0\n1000\n0..0', words1, 'Error');
runCase('4. Grid Structure', 'Starting count mismatch (declared 1 on blocked cell)', '1001\n0..1\n1000\n0..0', words1, 'Error');

// -------------------------------------------------------------
// Category 5: Slot and Word Count Mismatches
// -------------------------------------------------------------
runCase('5. Count & Length Mismatch', 'More words than slots (5 words for 4 slots)', puzzle1, ['casa', 'alan', 'ciao', 'anta', 'extra'], 'Error');
runCase('5. Count & Length Mismatch', 'Fewer words than slots (3 words for 4 slots)', puzzle1, ['casa', 'alan', 'ciao'], 'Error');
runCase('5. Count & Length Mismatch', 'Word length mismatch (slot is 4, word is 3)', puzzle1, ['cat', 'alan', 'ciao', 'anta'], 'Error');
runCase('5. Count & Length Mismatch', 'Word length mismatch (slot is 4, word is 5)', puzzle1, ['apple', 'alan', 'ciao', 'anta'], 'Error');

// -------------------------------------------------------------
// Category 6: Solvability and Uniqueness Constraints
// -------------------------------------------------------------
runCase('6. Solvability Constraints', 'No solution (conflicting intersection characters)', puzzle1, ['aaab', 'aaac', 'aaad', 'aaae'], 'Error');
runCase('6. Solvability Constraints', 'No solution (all words valid length but no overlap possible)', puzzle1, ['wxyz', 'bcde', 'fghi', 'jklm'], 'Error');
runCase('6. Solvability Constraints', 'Multiple solutions (interchangeable symmetrical words)', '2000\n0...\n0...\n0...', ['abba', 'assa'], 'Error');
const multiPuzzle = '200\n0..\n0..';
runCase('6. Solvability Constraints', 'Multiple solutions (3x3 corner)', multiPuzzle, ['aba', 'aca'], 'Error');

// -------------------------------------------------------------
// Print Summary Report
// -------------------------------------------------------------
console.log('\n======================================================');
console.log('            CROSSWORD SOLVER TEST SUITE');
console.log('======================================================\n');

let currentCat = '';
for (const res of results) {
  if (res.category !== currentCat) {
    currentCat = res.category;
    console.log(`\n--- ${currentCat} ---`);
  }
  const status = res.passed ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m';
  console.log(`[${status}] ${res.name} (${res.durationMs.toFixed(2)} ms)`);
  if (!res.passed) {
    console.log(`   Expected:\n${res.expected}`);
    console.log(`   Actual:\n${res.actual}`);
  }
}

console.log('\n======================================================');
console.log(`Total Tests : ${results.length}`);
console.log(`Passed      : \x1b[32m${passedCount}\x1b[0m`);
console.log(`Failed      : ${failedCount > 0 ? `\x1b[31m${failedCount}\x1b[0m` : '0'}`);
console.log('======================================================\n');

if (failedCount > 0) {
  process.exit(1);
}
