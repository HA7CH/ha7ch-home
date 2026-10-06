# Agent-first homepage

The homepage follows the public Night prompt landing: monochrome HA7CH wordmark, a short instruction, one prompt, and a copy button. Chinese is the default on every fresh load. The top-right language selector switches the prompt, accessible labels and copy feedback between Chinese and English. The copy action reads the visible prompt text; clipboard failure selects that text for manual copying.

The prompt links to `/SKILL.md`. The company Skill answers in the visitor's language and routes enterprise deployment, education, creator collaboration, investment and event questions to the appropriate public sources. It has no automatic inquiry, booking or payment capability. Existing subpages, Markdown content, catalog sources and event redirects remain available.

Validation for this change:

- Node 24 build and 26 unit tests passed.
- Local endpoint suite: 6 passed; production-only domain check skipped for preview.
- Browser at 1440×1000 and 390×844: Chinese → English → Chinese; each copied clipboard value exactly matched visible text, with no horizontal overflow.
- Desktop/mobile visual inspection against the public Night homepage and supplied screenshot.

The user approved the preview and authorized publication. The final application release is commit `496bcef936e63d08cc655ee8690fce940faaf192`, live at https://ha7ch.com/.

## Blind prompt trial (2026-10-06)

The user approved the preview. Before release, both prompts were copied from the actual page and submitted, alone, to separate new logged-out Gemini Flash-Lite conversations. The original Chinese answer reported it could not read SKILL.md, then used other material and confused current Night/Camp naming. The English answer drifted to HA7CH School and the old repository description. Neither result proves successful loading of the company Skill.

The minimum repair adds a full HTTPS URL, an explicit response language and an instruction to disclose retrieval failure instead of guessing. Separate new conversations with the revised prompts are recorded separately from the original tests. The Skill now includes a plain-language company/ANC explanation and avoids sending visitors back to the minimal homepage for service details. SKILL.md retains its Markdown body and frontmatter but is served as UTF-8 text/plain: the web reader in additional retrieval checks explicitly rejected text/markdown, while curl read it successfully.

Native subagent trials were excluded from the blind results because they inherited company instructions despite being started without conversation history. No private knowledge was submitted to Gemini. No registration, message to HA7CH, or payment was attempted.

The content-type and Skill edits were published and read back from production. The target branch has no required review rules; Claude review was requested but has not returned. No reviewer approval is implied, and this agent did not merge the PR.

A public About fallback was added after the MIME repair still did not let guest Gemini read the Skill. A fresh Chinese trial then correctly explained the company, four departments and ANC. Its follow-up revealed that the fallback page lacked Night/Camp distinctions and a direct contact, so those already-public facts and the programs' current Skill links were added to About. The Contact page's removed `/#events` anchor was replaced with the direct current Night/Camp Skill links. Neither page duplicates event dates or prices.


## Final public verification

The released homepage and Skill were read from ha7ch.com. The Skill matches the release source bytes and responds as text/plain UTF-8. The public endpoint suite passed 7/7. On the live homepage, actual clipboard content matched displayed Chinese/English/Chinese at 1440×1000 and 390×844, with a fresh default of Chinese and no horizontal overflow.

New logged-out Gemini Flash-Lite conversations received only the Chinese or English prompt copied from the final public homepage. Both explicitly based their introductions on the official About fallback and explained the company and four departments. Follow-ups correctly described enterprise workflow diagnosis/deployment, ANC's shared operating layer, Night as a community gathering, Camp as hands-on training, and the public contact email. No event dates, pricing, bookings, inquiries or payments were invented or performed.

This establishes useful bilingual company explanations in the tested guest Gemini condition. It does not establish direct Gemini loading of SKILL.md or compatibility with every model. Original retrieval failures, exclusion of contaminated native-agent trials, and repair iterations were preserved separately; HTTP success alone was never treated as semantic acceptance.

## Short URL prompt correction

The homepage now displays and copies exactly `帮我了解 ha7ch.com` or `Help me learn about ha7ch.com`. No extra instructions are added to the clipboard. The default remains Chinese. The language radio menu reuses the existing MIT-licensed Kumo 2.13.2 DropdownMenu (built on Base UI), with keyboard navigation, checked indicators, Escape/focus return and 44px items. API reference: https://kumo-ui.com/components/dropdown/ . No dependency or framework migration.

The root includes a compact, expandable About disclosure containing the actual company introduction and public service/Skill/contact links. The HTML is server-rendered; it is not a bot-only response or a hidden instruction. The root Markdown representation uses the same introduction data, in Chinese and English. Existing detail pages and the public Skill remain available. This replaces the homepage's long instructions and old event-heavy root Markdown with a concise entry point.

Local build, 26 unit checks and 6 local endpoint checks passed. Actual desktop/mobile clipboard checks confirm exact short text; keyboard selection and Escape focus return were exercised. An initial overly rapid keyboard test ran before the menu mounted and timed out; waiting for the menu before keyboard selection succeeded. Live deployment and new blind short-prompt trials are recorded separately; older long-prompt trials are not evidence for this version.
