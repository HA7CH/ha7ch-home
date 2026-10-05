# Agent-first homepage

The homepage follows the public Night prompt landing: monochrome HA7CH wordmark, a short instruction, one prompt, and a copy button. Chinese is the default on every fresh load. The top-right language selector switches the prompt, accessible labels and copy feedback between Chinese and English. The copy action reads the visible prompt text; clipboard failure selects that text for manual copying.

The prompt links to `/SKILL.md`. The company Skill answers in the visitor's language and routes enterprise deployment, education, creator collaboration, investment and event questions to the appropriate public sources. It has no automatic inquiry, booking or payment capability. Existing subpages, Markdown content, catalog sources and event redirects remain available.

Validation for this change:

- Node 24 build and 26 unit tests passed.
- Local endpoint suite: 6 passed; production-only domain check skipped for preview.
- Browser at 1440×1000 and 390×844: Chinese → English → Chinese; each copied clipboard value exactly matched visible text, with no horizontal overflow.
- Desktop/mobile visual inspection against the public Night homepage and supplied screenshot.

The user has approved the preview. Production remains unchanged pending required review and the release checks below.

## Blind prompt trial (2026-10-06)

The user approved the preview. Before release, both prompts were copied from the actual page and submitted, alone, to separate new logged-out Gemini Flash-Lite conversations. The original Chinese answer reported it could not read SKILL.md, then used other material and confused current Night/Camp naming. The English answer drifted to HA7CH School and the old repository description. Neither result proves successful loading of the company Skill.

The minimum repair adds a full HTTPS URL, an explicit response language and an instruction to disclose retrieval failure instead of guessing. Separate new conversations with the revised prompts are recorded separately from the original tests. The Skill now includes a plain-language company/ANC explanation and avoids sending visitors back to the minimal homepage for service details. SKILL.md retains its Markdown body and frontmatter but is served as UTF-8 text/plain: the web reader in additional retrieval checks explicitly rejected text/markdown, while curl read it successfully.

Native subagent trials were excluded from the blind results because they inherited company instructions despite being started without conversation history. No private knowledge was submitted to Gemini. No registration, message to HA7CH, or payment was attempted.

The content-type and Skill edits are candidate changes, not yet proven on production. Required repository review is pending; production release and public semantic retest remain outstanding.
