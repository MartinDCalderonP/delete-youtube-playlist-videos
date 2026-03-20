const extractDateText = ({ dateKeywords, datePattern, videoElement }) => {
  const dateElements = videoElement.querySelectorAll(
    '#video-info span, #metadata-line span'
  )

  for (const elem of dateElements) {
    const text = elem.textContent.trim()
    if (dateKeywords.some((keyword) => text.toLowerCase().includes(keyword))) {
      return text
    }
  }

  const allText = videoElement.textContent
  const match = allText.match(datePattern)
  return match ? match[0] : ''
}

const getDateFromText = ({ dateText, now }) => {
  if (!dateText) return null

  const timeUnits = [
    {
      getValue: (date) => date.getMonth(),
      method: 'setMonth',
      pattern: /(mes|meses|month|months)/i
    },
    {
      getValue: (date) => date.getFullYear(),
      method: 'setFullYear',
      pattern: /(año|años|year|years)/i
    },
    {
      getValue: (date) => date.getDate(),
      method: 'setDate',
      multiplier: 7,
      pattern: /(semana|semanas|week|weeks)/i
    },
    {
      getValue: (date) => date.getDate(),
      method: 'setDate',
      pattern: /(día|días|day|days)/i
    }
  ]

  for (const unit of timeUnits) {
    const match = dateText.match(
      new RegExp(String.raw`(\d+)\s+${unit.pattern.source}`, 'i')
    )

    if (match) {
      const value = Number.parseInt(match[1], 10) * (unit.multiplier ?? 1)
      const date = now ? new Date(now) : new Date()
      date[unit.method](unit.getValue(date) - value)
      return date
    }
  }

  return null
}

const shouldDeleteVideo = ({
  dateKeywords,
  datePattern,
  monthsOld,
  now,
  videoElement
}) => {
  if (!monthsOld) return true

  const dateText = extractDateText({ dateKeywords, datePattern, videoElement })
  if (!dateText) return false

  const videoDate = getDateFromText({ dateText, now })
  if (!videoDate) return false

  const cutoffDate = now ? new Date(now) : new Date()
  cutoffDate.setMonth(cutoffDate.getMonth() - monthsOld)

  return videoDate < cutoffDate
}

const getVideoInfo = ({
  dateKeywords,
  datePattern,
  untitled,
  videoElement
}) => {
  const titleElement = videoElement.querySelector(
    '#video-title, h3 a, #video-title-link'
  )
  const title = titleElement ? titleElement.textContent.trim() : untitled
  const dateText =
    extractDateText({ dateKeywords, datePattern, videoElement }) ||
    'Date not found'

  return { dateText, title }
}

const shouldLogProgress = ({ index, interval, total }) =>
  index === 1 || index === total || index % interval === 0

const shouldRunInBrowser =
  globalThis.window !== undefined &&
  typeof document !== 'undefined' &&
  typeof translations !== 'undefined'

if (shouldRunInBrowser) {
  ;(async () => { // NOSONAR: IIFE is used so the whole script runs when pasted in the console
    const delayBetweenDeletes = 1000
    const language = 'en'
    const progressLogInterval = 10
    const monthsOld = 5

    const t = translations[language]

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

    const deleteVideo = async ({ index, total, videoElement }) => {
      const menuButton = videoElement.querySelector(
        'button[aria-label*="Menú"], button[aria-label*="Menu"], button[aria-label*="Acción"], button[aria-label*="Action"], ytd-menu-renderer button, #button[aria-label*="menú"]'
      )

      if (!menuButton) {
        console.error(`❌ ${t.menuNotFound}`)
        return false
      }

      menuButton.click()
      await sleep(800)

      const menuItems = document.querySelectorAll(
        'ytd-menu-service-item-renderer, tp-yt-paper-item, ytd-menu-navigation-item-renderer, [role="menuitem"]'
      )

      const deleteButton = [...menuItems].find((item) =>
        t.deleteKeywords.some((keyword) =>
          item.textContent.trim().toLowerCase().includes(keyword)
        )
      )

      if (!deleteButton) {
        console.error(`❌ ${t.removeNotFound}`)
        document.body.click()
        await sleep(300)
        return false
      }

      deleteButton.click()
      await sleep(300)

      return true
    }

    console.log('═══════════════════════════════════════')
    console.log(`🎬 ${t.scriptStart}`)
    console.log('═══════════════════════════════════════')
    console.log(`⚙️ ${t.settings}`)
    console.log(
      `   - ${t.settingsAge}: ${monthsOld ? t.ageMonths(monthsOld) : t.ageAll}`
    )
    console.log('═══════════════════════════════════════')

    console.log(`📜 ${t.loadingAll}`)

    let lastHeight = 0
    let scrollAttempts = 0

    while (
      lastHeight !== document.documentElement.scrollHeight &&
      scrollAttempts < 50
    ) {
      lastHeight = document.documentElement.scrollHeight
      window.scrollTo(0, lastHeight)
      await sleep(1000)
      scrollAttempts++
    }

    window.scrollTo(0, 0)
    await sleep(1000)

    console.log('═══════════════════════════════════════')
    const allVideos = Array.from(
      document.querySelectorAll('ytd-playlist-video-renderer')
    )
    console.log(t.totalVideos(allVideos.length))

    if (allVideos.length === 0) {
      console.error(`❌ ${t.noVideos}`)
      throw new Error(t.noVideos)
    }

    console.log(`🔍 ${t.analyzing}`)
    const videosToDelete = allVideos
      .map((video) => ({
        element: video,
        info: getVideoInfo({
          dateKeywords: t.dateKeywords,
          datePattern: t.datePattern,
          untitled: t.untitled,
          videoElement: video
        })
      }))
      .filter(({ element }) =>
        shouldDeleteVideo({
          dateKeywords: t.dateKeywords,
          datePattern: t.datePattern,
          monthsOld,
          videoElement: element
        })
      )

    console.log('═══════════════════════════════════════')
    console.log(`📊 ${t.summary}`)
    console.log(`   - Total: ${allVideos.length}`)
    console.log(`   - ${t.videosToDelete}: ${videosToDelete.length}`)
    console.log(
      `   - ${t.videosToKeep}: ${allVideos.length - videosToDelete.length}`
    )
    console.log('═══════════════════════════════════════')

    if (videosToDelete.length === 0) {
      console.log(`✨ ${t.noVideosToDelete}`)
      throw new Error(t.noVideosToDelete)
    }

    console.log('═══════════════════════════════════════')

    if (!confirm(t.confirmMessage(videosToDelete.length))) {
      console.log('═══════════════════════════════════════')
      console.log(`❌ ${t.operationCanceled}`)
      console.log('═══════════════════════════════════════')
      throw new Error(t.operationCanceled)
    }

    console.log('═══════════════════════════════════════')
    console.log(`🗑️ ${t.deletingVideos}`)
    console.log('═══════════════════════════════════════')

    let deletedCount = 0
    let errorCount = 0

    for (let i = 0; i < videosToDelete.length; i++) {
      const { element, info } = videosToDelete[i]
      const index = i + 1

      if (
        shouldLogProgress({
          index,
          interval: progressLogInterval,
          total: videosToDelete.length
        })
      ) {
        console.log(
          `[${index}/${videosToDelete.length}] ${t.deleting}: ${info.title}`
        )
      }

      try {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        await sleep(500)

        const success = await deleteVideo({
          index,
          total: videosToDelete.length,
          videoElement: element
        })
        success ? deletedCount++ : errorCount++

        await sleep(delayBetweenDeletes)
      } catch (error) {
        console.error(`❌ ${t.errorDeleting}: ${error.message}`)
        errorCount++
      }
    }

    console.log('═══════════════════════════════════════')
    console.log(`✅ ${t.processCompleted}`)
    console.log('═══════════════════════════════════════')
    console.log(`   ${t.deletedCount}: ${deletedCount}`)
    console.log(`   ${t.errorCount}: ${errorCount}`)
    console.log('═══════════════════════════════════════')
  })()
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    extractDateText,
    getDateFromText,
    getVideoInfo,
    shouldLogProgress,
    shouldDeleteVideo
  }
}
