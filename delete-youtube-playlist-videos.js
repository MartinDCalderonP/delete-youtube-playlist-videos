;(async () => {
  const language = 'en'
  const monthsOld = 5
  const delayBetweenDeletes = 1000

  const t = translations[language]

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  const extractDateText = (videoElement) => {
    const dateElements = videoElement.querySelectorAll(
      '#video-info span, #metadata-line span'
    )

    for (const elem of dateElements) {
      const text = elem.textContent.trim()
      if (
        t.dateKeywords.some((keyword) => text.toLowerCase().includes(keyword))
      ) {
        return text
      }
    }

    const allText = videoElement.textContent
    const match = allText.match(t.datePattern)
    return match ? match[0] : ''
  }

  const getDateFromText = (dateText) => {
    if (!dateText) return null

    const timeUnits = [
      {
        pattern: /(mes|meses|month|months)/i,
        method: 'setMonth',
        getValue: (date) => date.getMonth()
      },
      {
        pattern: /(año|años|year|years)/i,
        method: 'setFullYear',
        getValue: (date) => date.getFullYear()
      },
      {
        pattern: /(semana|semanas|week|weeks)/i,
        method: 'setDate',
        getValue: (date) => date.getDate(),
        multiplier: 7
      },
      {
        pattern: /(día|días|day|days)/i,
        method: 'setDate',
        getValue: (date) => date.getDate()
      }
    ]

    for (const unit of timeUnits) {
      const match = dateText.match(
        new RegExp(String.raw`(\d+)\s+${unit.pattern.source}`, 'i')
      )
      if (match) {
        const value = Number.parseInt(match[1]) * (unit.multiplier || 1)
        const date = new Date()
        date[unit.method](unit.getValue(date) - value)
        return date
      }
    }

    return null
  }

  const shouldDeleteVideo = (videoElement) => {
    if (!monthsOld) return true

    const dateText = extractDateText(videoElement)
    if (!dateText) return false

    const videoDate = getDateFromText(dateText)
    if (!videoDate) return false

    const cutoffDate = new Date()
    cutoffDate.setMonth(cutoffDate.getMonth() - monthsOld)

    return videoDate < cutoffDate
  }

  const getVideoInfo = (videoElement) => {
    const titleElement = videoElement.querySelector(
      '#video-title, h3 a, #video-title-link'
    )
    const title = titleElement ? titleElement.textContent.trim() : t.untitled
    const dateText = extractDateText(videoElement) || 'Date not found'

    return { title, dateText }
  }

  const deleteVideo = async (videoElement, index, total) => {
    const menuButton = videoElement.querySelector(
      'button[aria-label*="Menú"], button[aria-label*="Menu"], button[aria-label*="Acción"], button[aria-label*="Action"], ytd-menu-renderer button, #button[aria-label*="menú"]'
    )

    if (!menuButton) {
      console.error(`❌ ${t.menuNotFound}`)
      console.log(`   ${t.triedSelectors}`)
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
      console.log(`   ${t.optionsAvailable}`)
      menuItems.forEach((item, idx) => {
        console.log(`      ${idx + 1}. "${item.textContent.trim()}"`)
      })
      document.body.click()
      await sleep(300)
      return false
    }

    console.log(`   ${t.optionFound}: "${deleteButton.textContent.trim()}"`)
    deleteButton.click()
    await sleep(300)

    console.log(`✅ [${index}/${total}] ${t.videoDeleted}`)
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
    if (scrollAttempts % 5 === 0)
      console.log(`   ${t.loading}... (${scrollAttempts})`)
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
    .map((video) => ({ element: video, info: getVideoInfo(video) }))
    .filter(({ element }) => shouldDeleteVideo(element))

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

  console.log(`📝 ${t.firstVideos}`)
  videosToDelete.slice(0, 5).forEach(({ info }, index) => {
    console.log(`   ${index + 1}. ${info.title}`)
    console.log(`      ${info.dateText}`)
  })

  if (videosToDelete.length > 5) {
    console.log(`   ${t.moreVideos(videosToDelete.length - 5)}`)
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

    console.log(
      `[${i + 1}/${videosToDelete.length}] ${t.deleting}: ${info.title}`
    )

    try {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      await sleep(500)

      const success = await deleteVideo(element, i + 1, videosToDelete.length)
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
