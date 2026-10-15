import assert from 'node:assert/strict'
import test from 'node:test'
import { mentionedProjectIds, resolvePortfolioEntities } from './portfolioEntities.js'

test('recognizes dictated Rappi names with repeated words, accents and punctuation', () => {
  for (const name of ['Rappi', 'rapi', 'Rappy', 'Rapy', 'Raffi', 'Raffy']) {
    assert.deepEqual(resolvePortfolioEntities(`¿Qué qué hace Mateo en ${name}.`), [{ id: 'rappi', match: 'exact' }], name)
  }
  assert.deepEqual(mentionedProjectIds('¿Qué diseña para Mi Tienda?'), ['rappi'])
})

test('resolves small proper-name errors and spaced aliases before intent routing', () => {
  for (const [name, id] of [['Credicrop', 'credicorp'], ['Credicor', 'credicorp'], ['MiBancco', 'mibanco'], ['Kapittal', 'kapital'], ['Rapppi', 'rappi']]) {
    assert.deepEqual(resolvePortfolioEntities(`What does Mateo do at ${name}?`), [{ id, match: 'fuzzy' }], name)
  }
  assert.deepEqual(mentionedProjectIds('¿Qué hizo en Modio y Mi Banco?'), ['modyo', 'mibanco'])
})

test('uses word boundaries and does not turn common words into company names', () => {
  for (const question of ['modo de trabajo', 'mando el resumen', 'capital de trabajo', 'rapid delivery', 'Modyology', 'Nubank']) {
    assert.deepEqual(mentionedProjectIds(question), [], question)
  }
})
