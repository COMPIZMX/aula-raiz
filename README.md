# Aula Raíz — Education in reels, in the language of the student

**Live demo: https://estudio.compizmx.com**

Aula Raíz turns any lesson into a short, epic reel students actually remember: an original script, vivid Aztec-inspired scenes, narration, and original music, generated in minutes — in Spanish and in the languages students speak at home, like Maya, Huichol (Wixárika), Nahuatl, and Zapotec. It also includes a language-learning option: the same format turns words, phrases, and pronunciation into short lessons for learning Maya, Huichol, Nahuatl, Zapotec, English, or whichever language the student chooses.

Built on Meta's models — lesson scripts are generated live by Muse Spark through the Meta Model API — and based on the pipeline behind the *Historia de México* daily reel series, Aula Raíz puts learning in the hands of teachers and students, making it simpler and far more memorable.

## The problem

Millions of students in Mexico learn in classrooms where the teaching language is not the language spoken at home. Mexico recognizes 68 national Indigenous languages, yet school materials exist almost only in Spanish. Lessons feel distant, retention drops, and parents who speak the home language cannot help with homework because nothing is written in the words they know.

## What it does

- **Create a lesson** — Type a topic, pick the school level (elementary or middle school) and the students' language (Spanish, Nahuatl, Maya, Huichol/Wixárika, Zapotec, Mixtec, Otomi, Purépecha, Totonaco). Aula Raíz generates the lesson reel script, scene by scene, with a review card.
- **Learn a language** — Mini lessons with everyday phrases (greetings, thanks, first numbers, goodbyes) in Maya, Huichol, Nahuatl, Zapotec or English, with a practice mode that hides the translations so students can test themselves out loud.
- **Homework companion** — Teachers assign written homework and students complete it with resources inside the same app (charts, tables, maps and images), so parents can finally help too — everything is in their language.

It runs in any browser on any device: nothing to install, no account, light on data. One phone shared by the whole family is enough.

## Tech

- **Web app** (`index.html`) — a single-file app, lightweight by design, so it works on the phones and connections real families have. No install, no account.
- **Lesson engine** — when a student creates a lesson, the app calls a small bridge (`worker/aula-api.js`, a Cloudflare Worker) that holds the API key server-side and asks **Muse Spark** (Meta Model API, `POST /v1/chat/completions`) for a structured lesson script: hook, three scenes, review card, review question, and a greeting in the student's language. The app renders the response with a "Generated live with Muse Spark" badge.
- **Offline safety net** — the app ships with curated local lesson banks and templates. If the API is unreachable, lessons still generate locally, so a classroom demo never fails.
- **Language mode** — phrase banks for Maya, Huichol (Wixárika), Nahuatl, Zapotec and English, with listen-aloud (English) and a self-test practice mode.
- **Roadmap** — scene art generated with Muse Image, and community-speaker review of the generated greetings and scripts before classroom use.

Everything in this repository was built during the hackathon (October 2026).

## Submission

Meta Global AI Developer Hackathon — Indie Developer Track · Build for Your World.

© Jaime Porras-Gomez · Compiz Tech Services — All rights reserved
