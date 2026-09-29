const test = require('node:test')
const assert = require('node:assert/strict')

const {
  getDateFromText,
  shouldDeleteVideo
} = require('./delete-youtube-playlist-videos')
const translations = require('./translations')

const { dateKeywords, datePattern } = translations.en
const NOW = new Date('2026-03-18T10:00:00.000Z')

const createVideoElement = ({ spans, textContent }) => ({
  querySelector: () => null,
  querySelectorAll: () => spans.map((text) => ({ textContent: ` ${text} ` })),
  textContent
})

test('getDateFromText returns null for non-parseable text', () => {
  const result = getDateFromText({ dateText: 'yesterday', now: NOW })

  assert.equal(result, null)
})

test('getDateFromText parses weeks and days correctly', () => {
  const weeksDate = getDateFromText({ dateText: '3 weeks ago', now: NOW })
  const daysDate = getDateFromText({ dateText: '10 days ago', now: NOW })

  assert.equal(weeksDate.toISOString(), '2026-02-25T10:00:00.000Z')
  assert.equal(daysDate.toISOString(), '2026-03-08T10:00:00.000Z')
})

test('shouldDeleteVideo returns false for non-parseable date text', () => {
  const videoElement = createVideoElement({
    spans: ['very old video'],
    textContent: 'uploaded recently'
  })

  const result = shouldDeleteVideo({
    dateKeywords,
    datePattern,
    monthsOld: 5,
    now: NOW,
    videoElement
  })

  assert.equal(result, false)
})

test('shouldDeleteVideo keeps video on exact cutoff date', () => {
  const videoElement = createVideoElement({
    spans: ['5 months ago'],
    textContent: '5 months ago'
  })

  const result = shouldDeleteVideo({
    dateKeywords,
    datePattern,
    monthsOld: 5,
    now: NOW,
    videoElement
  })

  assert.equal(result, false)
})

test('shouldDeleteVideo handles spanish unit in text', () => {
  const videoElement = createVideoElement({
    spans: ['hace 2 semanas'],
    textContent: 'hace 2 semanas'
  })

  const result = shouldDeleteVideo({
    dateKeywords: translations.es.dateKeywords,
    datePattern: translations.es.datePattern,
    monthsOld: 1,
    now: NOW,
    videoElement
  })

  assert.equal(result, false)
})
