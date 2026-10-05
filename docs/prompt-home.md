# Agent-first homepage

The homepage follows the public Night prompt landing: monochrome HA7CH wordmark, a short instruction, one prompt, and a copy button. Chinese is the default on every fresh load. The top-right language selector switches the prompt, accessible labels and copy feedback between Chinese and English. The copy action reads the visible prompt text; clipboard failure selects that text for manual copying.

The prompt links to `/SKILL.md`. The company Skill answers in the visitor's language and routes enterprise deployment, education, creator collaboration, investment and event questions to the appropriate public sources. It has no automatic inquiry, booking or payment capability. Existing subpages, Markdown content, catalog sources and event redirects remain available.

Validation for this change:

- Node 24 build and 26 unit tests passed.
- Local endpoint suite: 6 passed; production-only domain check skipped for preview.
- Browser at 1440×1000 and 390×844: Chinese → English → Chinese; each copied clipboard value exactly matched visible text, with no horizontal overflow.
- Desktop/mobile visual inspection against the public Night homepage and supplied screenshot.

Release is preview-only pending confirmation. Production is unchanged by this change.
