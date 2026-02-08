# 🧠 Subbrainarr

> "If I only had a brain..." - Your subtitle automation, probably

**The dashboard that gives Subgen a brain.**

---

## The Problem

You're watching TV. German drama. Intense scene. Emotional dialogue.

_There's a break in conversation and your TV starts throwing random crackhead rabble at you_

```
[Subtitle appears during silence]
"Thank you for watching"
"Subscribe to our channel"
"♪ music playing ♪"
"[inaudible]"
"..."
```

**What. The. Fuck.**

Meanwhile, when there IS dialogue:

- Japanese subs fly by at light speed (unreadable)
- German formal/informal completely lost (Sie? Du? Who knows!)
- VRAM maxed out (OOM errors)
- Same settings for everything (one size fits none)

Your subtitle setup is a **crackhead**. Time to evict it.

---

## The Solution

**Take over the subtitle crackhead game.**

Subbrainarr doesn't compete with other subtitle tools.  
It **dominates** them.

- ✅ All crackheads evicted (silence detection that works)
- ✅ Pure product only (no hallucinations, no garbage)
- ✅ Rule your empire (multi-language mastery)
- ✅ Serve quality (every language optimized)

**You're not managing subtitles anymore. You're running an operation.**

---

## What It Does

### 🎯 Per-Language Intelligence

```
Before: Same settings for everything
- Japanese anime gets verbose German-style translation
- German drama gets clipped Japanese-style subs
- Everything is wrong

After: Each language gets optimal settings
- Japanese: Concise subs (readable at normal speed)
- German: Nuanced translation (Sie vs du preserved)
- French: Proper formality levels
- Automatic. Zero manual switching.
```

### 🔇 Silence Detection That Works

```
Before: Crackhead subtitles during silence
"Thank you for watching"
"..."
"♪ music ♪"

After: Clean silence
[nothing]
[as it should be]
[peaceful]
```

### 🧠 Hardware Intelligence

```
Potato GPU (GTX 1660, 6GB):
"Use medium model with int8. Large will OOM."

Sweet Spot (RTX 3060, 12GB):
"Perfect for large-v3! Want to try beam_size: 6?"

Beast Mode (RTX 4090, 24GB):
"🦑 RELEASE THE KRAKEN"
```

### 📊 Dashboard That Doesn't Suck

- See what's processing (real-time, not "check logs")
- Queue management (drag to reorder, not edit YAML)
- VRAM monitoring (graphs, not nvidia-smi spam)
- Mobile-friendly (tune from toilet, we don't judge)

### 🎛️ Wizard Mode

```
Wizard: "Are subtitles too fast?"
You: "Yes"
Wizard: "Increasing length_penalty 1.3 → 1.4"
Wizard: "Test on sample file first?"
You: "Sure"
*3 minutes later*
Wizard: "Better?"
You: "Perfect"
Wizard: "Applied. You're welcome."
```

---

## Quick Start

**Docker Compose** (because we're not savages):

```yaml
version: "3.8"

services:
  subgen:
    image: mccloud/subgen:latest
    container_name: subgen
    # ... your existing subgen config ...

  subbrainarr:
    image: coaxk/subbrainarr:latest
    container_name: subbrainarr
    ports:
      - "9008:9001"
    environment:
      - SUBGEN_URL=http://subgen:9000
    volumes:
      - ./subbrainarr:/config
    depends_on:
      - subgen
```

```bash
docker-compose up -d
```

Open `http://localhost:9008`

**That's it. We're Docker Hub only. Deal with it.** 🐳

---

## First Run

1. **Connection:** Auto-detects Subgen (or enter URL)
2. **Library Scan:** Analyzes what languages you have
3. **Smart Setup:** "Found German, French, Japanese. Apply optimized settings?"
4. **Done:** Start processing

**Time to first subtitle: 3 minutes.**

---

## 👥 Community Profiles

**Share your tuning expertise. Get credited. Help the family.**

Browse and download community-contributed language profiles:

- "German Drama Optimization" by @hansgruber
- "Anime Settings (Crunchyroll Quality)" by @weebmaster3000
- "Parisian French Formal" by @lefrog

Submit your own profiles and get featured in the app.

**[View Community Profiles →](https://github.com/coaxk/subbrainarr-profiles)**

---

## Integration

Works with your stack:

- ✅ Plex / Jellyfin (webhooks, library scans)
- ✅ Bazarr (detects requests, shows source)
- ✅ Sonarr / Radarr (coming soon)
- ✅ Any Subgen instance (we're not picky)

Doesn't break anything:

- Subgen keeps working if you turn off Subbrainarr
- All changes are backed up
- You approve everything

---

## The Wizard of Oz Thing

Subgen = Scarecrow (works hard, feels dumb)

_"If I only had a brain..."_

Subbrainarr = The Wizard (gives it intelligence)

Turns out, Subgen was capable all along. Just needed to unlock it.

---

## Features

**v1.0** (Launch)

- 🎯 Per-language optimization (18 languages)
- 🧠 Hardware detection & recommendations
- 📊 Real-time dashboard
- 🎛️ Interactive tuning wizard
- 🔇 Silence hallucination elimination
- 📱 Mobile-responsive
- ⌨️ Keyboard shortcuts (Cmd+K everything)
- 🌙 Dark mode (only mode - we're not animals)
- 💾 Settings backup/rollback
- 📈 Stats & analytics

**v1.1** (Soon™)

- 🧪 A/B testing (compare settings)
- 👥 Community profiles (share configs)
- 🔔 Webhooks (Discord, Slack, etc.)
- ⏰ Scheduling (process overnight)
- 🔄 FFsubsync integration

---

## Privacy

**What we collect:** Nothing. Zilch. Zero. Nada.

**No telemetry. No analytics. No phone-home.**

Your data stays on your server where it belongs.

We're not the CIA. We're not the NSA. We're definitely not running a submarine operation out of a private island.

**Your subtitles are your business.** 🔒

_If three-letter agencies want your German subtitle preferences, they'll have to ask nicely (we also accept XRP, no more BTC since we found out Satoshi is actually Jeffrey Epstein)._

---

## Credits

**Created by:** [@coaxk](https://github.com/coaxk)

**Powered by:** [McCloud/subgen](https://github.com/McCloudS/subgen) - The excellent subtitle automation that makes this possible. Seriously, go star their repo. Without Subgen, we're nothing.

**Built with:** React, FastAPI, SQLite, too much coffee, Claude's wisdom, and a healthy disrespect for the status quo

**Inspired by:** Everyone who's edited compose.yaml at 2am, cursing at subtitle timing

**Special thanks:** The Wizard of Oz, for the metaphor. The self-hosted community, for existing.

---

## Support

- 📖 **Docs:** [subbrainarr.com/docs](https://subbrainarr.com/docs)
- 💬 **Discord:** [discord.gg/subbrainarr](https://discord.gg/subbrainarr)
- 🐛 **Issues:** [GitHub Issues](https://github.com/coaxk/subbrainarr/issues)
- ☕ **Donate:** [buymeacoffee.com/coaxk](https://buymeacoffee.com/coaxk)

---

## License

MIT - Do whatever you want. We're not your dad.

---

## The Bottom Line

**Stop fighting with YAML files at 2am.**

**Stop googling "whisper hallucination silence fix" for the 47th time.**

**Stop using the same settings for 12 different languages.**

Your subtitles deserve intelligence. Give them a brain.

**[Download] [Docs] [Discord] [Star on GitHub]**

---

_"There's a break in conversation and your subtitles stop throwing random crackhead rabble at you."_

**Welcome to Subbrainarr.** 🧠
