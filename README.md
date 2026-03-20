# YouTube Playlist Video Deletion Script

This script allows you to delete videos from a YouTube playlist directly from the browser console, with the option to filter by date added.

> **🌐 Language:** You can configure message language separately from the language used to find menu options in YouTube.

> **📁 Files:** The script consists of two files:
>
> - `translations/index.js` - Contains all text strings and keywords in English and Spanish
> - `delete-youtube-playlist-videos.js` - Main script logic
>
> Both files must be copied to the browser console in order (translations first, then main script).

## 🚀 Features

- ✅ Delete videos from a YouTube playlist
- ✅ Filter by date: delete only videos older than X months
- ✅ Real-time progress display
- ✅ Confirmation before deletion
- ✅ Handles large playlists with automatic scrolling
- ✅ Multilingual support (English/Spanish)
- ✅ Unit tests for date parsing, filtering, and video metadata extraction
- ✅ Edge-case tests for cutoff boundaries and non-parseable dates

## 🧱 Project structure

```
.
├── delete-youtube-playlist-videos.js
├── delete-youtube-playlist-videos.test.js
├── delete-youtube-playlist-videos.edge.test.js
├── translations/
│   └── index.js
└── README.md
```

Notes:

- `delete-youtube-playlist-videos.js` runs in the browser console and also exposes pure functions for Node tests.
- Tests import translations from `./translations` (resolved to `translations/index.js`).

## 📋 Requirements

- Web browser (Chrome, Firefox, Edge, etc.)
- Logged into YouTube
- Playlist owner or have editing permissions

## 🎯 Usage

### Step 1: Open your playlist on YouTube

Navigate to the playlist you want to edit. The URL should look like this:

```
https://www.youtube.com/playlist?list=PLxxxxxxxxxxxxxx
```

### Step 2: Open the browser console

- **Chrome/Edge**: Press `F12` or `Cmd + Option + J` (Mac) / `Ctrl + Shift + J` (Windows/Linux)
- **Firefox**: Press `F12` or `Cmd + Option + K` (Mac) / `Ctrl + Shift + K` (Windows/Linux)
- **Safari**: Press `Cmd + Option + C` (after enabling the developer menu)

### Step 3: Copy and paste the script

The script requires both files to be loaded in order:

1. **First**, open the `translations/index.js` file
   - Copy all the content (Ctrl+A / Cmd+A, then Ctrl+C / Cmd+C)
   - Paste it into the browser console
   - Press `Enter`
   - You should see `undefined` (this is normal)

2. **Then**, open the `delete-youtube-playlist-videos.js` file
   - Copy all the content
   - Paste it into the browser console
   - Press `Enter`
   - The script will start running immediately

> **Why two files?** Separating translations from logic makes the code cleaner, easier to maintain, and allows for easy addition of new languages.

### Step 4: Configure the script (optional)

Before copying the script to the console, you can edit these values at the top of the `delete-youtube-playlist-videos.js` file:

```javascript
const messagesLanguage = 'en' // 'en' | 'es' | 'auto' (console output)
const menuSearchLanguage = 'both' // 'auto' | 'en' | 'es' | 'both' (YouTube UI labels)
const monthsOld = 4 // Delete videos older than 4 months (0 = delete all)
const delayBetweenDeletes = 1000 // Wait time between deletions (1000ms = 1 second)
```

**Tips:**

- Use `messagesLanguage = 'en'` and `menuSearchLanguage = 'es'` if you want English logs with Spanish YouTube UI.
- Use `menuSearchLanguage = 'both'` if the UI language can vary.
- Use `auto` to detect from page/browser language (`es`/`en`) with English fallback.
- Increase `delayBetweenDeletes` to 2000 or more for large playlists

## 📊 Sample output (English)

```
🎬 Starting playlist video deletion script
⚙️ Settings:
   - Age: 4 months

📜 Loading all playlist videos...
   Loading... (5)
   Loading... (10)
Total videos found: 150

🔍 Analyzing videos...

📊 Summary:
   - Total: 150
   - Videos to delete: 87
   - Videos to keep: 63

📝 First videos to be deleted:
   1. Old video 1
      6 months ago
   2. Old video 2
      8 months ago
   ... and 85 more videos

🗑️ Starting video deletion...

[1/87] Deleting: Old video 1
   Option found: "Remove from playlist"
✅ [1/87] Video deleted
[2/87] Deleting: Old video 2
   Option found: "Remove from playlist"
✅ [2/87] Video deleted
...

═══════════════════════════════════════
✅ PROCESS COMPLETED
═══════════════════════════════════════
   Videos deleted: 87
   Errors: 0
═══════════════════════════════════════
```

## ⚠️ Warnings

- **THIS ACTION CANNOT BE UNDONE**: Once deleted, videos cannot be recovered to the playlist.
- **Large playlists**: For playlists with hundreds of videos, the process may take several minutes.
- **YouTube changes**: If YouTube updates its interface, the script may stop working.

## 🧪 Testing

Run all tests directly with Node's built-in test runner:

```bash
node --test
```

Current test coverage includes:

- Date extraction from YouTube metadata spans and fallback text
- Relative date parsing for English and Spanish units
- Deletion decisions using `monthsOld` cutoff
- Disabled filter behavior (`monthsOld = 0`)
- Boundary behavior for exact cutoff dates
- Fallback metadata behavior (`untitled`, `Date not found`)

## 🛠️ Troubleshooting

### The script doesn't find videos

- Make sure you're in the correct playlist view
- Wait for the page to fully load before running
- Refresh the page and try again

### Videos are not deleted

- Verify that you have editing permissions on the playlist
- Try increasing `delayBetweenDeletes` to 2000 or more
- The script now checks delete keywords in both English and Spanish menu labels

### The script doesn't detect dates correctly

- Make sure the `language` variable matches your YouTube interface language
- The script detects "X days/weeks/months/years ago" (English) or "hace X días/semanas/meses/años" (Spanish)

### The script stops midway

- YouTube may have detected automated activity
- Wait a few minutes and run again
- Consider increasing `delayBetweenDeletes`

## ❓ FAQ

**Q: What happens if I close the browser while running?**
A: The script stops. Already deleted videos won't be restored. You can run it again to continue.

**Q: Does this work with private playlists?**
A: Yes, as long as you have editing permissions.

**Q: Can I add support for other languages?**
A: Yes, add a new language object in `translations/index.js` with all required keys.

## ⚖️ Disclaimer

This script is provided "as is", without warranties. Use at your own risk. Make a backup of your playlist before using.
