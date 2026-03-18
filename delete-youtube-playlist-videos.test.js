const test = require('node:test')
const assert = require('node:assert/strict')

const {
  extractDateText,
  getDateFromText,
  getVideoInfo,
  shouldDeleteVideo
} = require('./delete-youtube-playlist-videos')
const translations = require('./translations')

const { dateKeywords, datePattern, untitled } = translations.en
const NOW = new Date('2026-03-18T10:00:00.000Z')

const createVideoElement = ({ spans = [], textContent = '', title = '' }) => ({
  querySelector: () => (title ? { textContent: `  ${title}  ` } : null),
  querySelectorAll: () => spans.map((text) => ({ textContent: ` ${text} ` })),
  textContent
})

;[
  {
    expected: '8 months ago',
    name: 'extractDateText returns keyword date from spans',
    spans: ['500 views', '8 months ago'],
    textContent: 'Fallback 4 weeks ago'
  },
  {
    expected: '3 weeks ago',
    name: 'extractDateText falls back to pattern match in full text',
    spans: ['500 views', 'No relative date'],
    textContent: 'Uploaded metadata says 3 weeks ago'
  }
].forEach(({ expected, name, spans, textContent }) => {
  test(name, () => {
    const videoElement = createVideoElement({
      spans,
      textContent,
      title: 'Video'
    })
    const result = extractDateText({ dateKeywords, datePattern, videoElement })

    assert.equal(result, expected)
  })
})
;[
  ['2 months ago', '2026-01-18T10:00:00.000Z'],
  ['1 año', '2025-03-18T10:00:00.000Z']
].forEach(([dateText, expected]) => {
  test(`getDateFromText parses "${dateText}"`, () => {
    const result = getDateFromText({ dateText, now: NOW })

    assert.equal(result.toISOString(), expected)
  })
})
;[
  ['8 months ago', true],
  ['2 months ago', false]
].forEach(([dateText, expected]) => {
  test(`shouldDeleteVideo evaluates cutoff for "${dateText}"`, () => {
    const videoElement = createVideoElement({
      spans: [dateText],
      textContent: dateText,
      title: 'Video'
    })
    const result = shouldDeleteVideo({
      dateKeywords,
      datePattern,
      monthsOld: 5,
      now: NOW,
      videoElement
    })

    assert.equal(result, expected)
  })
})

test('shouldDeleteVideo returns true when filter is disabled', () => {
  const videoElement = createVideoElement({
    spans: ['no date'],
    textContent: 'no date',
    title: 'Any'
  })
  const result = shouldDeleteVideo({
    dateKeywords,
    datePattern,
    monthsOld: 0,
    now: NOW,
    videoElement
  })

  assert.equal(result, true)
})
;[
  {
    expected: { dateText: 'Date not found', title: untitled },
    name: 'getVideoInfo returns fallback title and date text',
    videoElement: createVideoElement({
      spans: ['no keyword here'],
      textContent: 'No relative date in full text'
    })
  }
].forEach(({ expected, name, videoElement }) => {
  test(name, () => {
    const result = getVideoInfo({
      dateKeywords,
      datePattern,
      untitled,
      videoElement
    })

    assert.deepEqual(result, expected)
  })
})
