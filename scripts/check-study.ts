// Run with: npm test
import assert from 'node:assert/strict';
import { MASTERED, answerOptions, nextLevel, pickNext, shuffle } from '../src/utils/study.ts';

const card = (id: string, back = `back ${id}`) =>
  ({ id, deckId: 'd', front: id, back, interval: 0, repetitions: 0, easeFactor: 2.5, dueDate: '', state: 'new', createdAt: '' }) as const;
const cards = ['a', 'b', 'c', 'd', 'e'].map((id) => card(id));

assert.deepEqual([...shuffle([1, 2, 3, 4])].sort(), [1, 2, 3, 4]);

assert.equal(nextLevel(0, false), 0, 'wrong answer never drops below 0');
assert.equal(nextLevel(1, false), 0, 'wrong answer drops one level');
assert.equal(nextLevel(2, true), MASTERED, 'three correct answers masters a card');
assert.equal(nextLevel(MASTERED, true), MASTERED);

const levels = { a: MASTERED, b: MASTERED, c: MASTERED, d: 0 };
assert.equal(pickNext(cards, levels, 'x', () => 0)?.id, 'd', 'mastered cards are never picked');
for (let i = 0; i < 50; i++) assert.notEqual(pickNext(cards, {}, 'a')?.id, 'a', 'no immediate repeat');
assert.equal(pickNext([cards[0]], {}, 'a')?.id, 'a', 'a lone card can repeat');
assert.equal(pickNext(cards, Object.fromEntries(cards.map((c) => [c.id, MASTERED])), undefined), undefined);

const options = answerOptions(cards[0], [...cards, card('f', 'back b')]);
assert.equal(options.length, 4);
assert.ok(options.includes('back a'));
assert.equal(new Set(options).size, 4, 'options are distinct');
assert.deepEqual(answerOptions(cards[0], [cards[0]]), ['back a']);

console.log('study checks passed');
