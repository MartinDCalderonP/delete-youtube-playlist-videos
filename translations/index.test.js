import test from 'node:test'
import { match } from 'node:assert/strict'

import translations from './index'

const testEach = ({ cases, run }) => {
  cases.forEach((testCase) => {
    const { name } = testCase
    test(name, () => run({ testCase }))
  })
}

const confirmMessageCases = [
  {
    count: 1,
    expected: /delete 1 video from the playlist/i,
    language: 'en',
    name: 'confirmMessage uses singular noun when count is 1 in English'
  },
  {
    count: 2,
    expected: /delete 2 videos from the playlist/i,
    language: 'en',
    name: 'confirmMessage uses plural noun when count is greater than 1 in English'
  },
  {
    count: 1,
    expected: /eliminar 1 video de la playlist/i,
    language: 'es',
    name: 'confirmMessage uses singular noun when count is 1 in Spanish'
  },
  {
    count: 2,
    expected: /eliminar 2 videos de la playlist/i,
    language: 'es',
    name: 'confirmMessage uses plural noun when count is greater than 1 in Spanish'
  }
]

testEach({
  cases: confirmMessageCases,
  run: ({ testCase }) => {
    const { count, expected, language } = testCase
    const message = translations[language].confirmMessage(count)

    match(message, expected)
  }
})
