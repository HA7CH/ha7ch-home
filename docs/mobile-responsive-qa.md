# Mobile responsive pass — 2026-09-05

Scope: local preview at `http://127.0.0.1:3000`; pre-push checks for the user-authorized release.

## Layout rules

- Preserve the desktop typography, palette, content and narrow editorial layout.
- At 768px and below, use safe-area-aware gutters, readable body type and 44px standalone controls.
- Final compact pass: base remains 16px; directory titles are 15px, descriptions 14px with 21px leading, article reading text remains 16px. Phone list rows have 12px vertical padding and sections 32px top spacing. This replaces the earlier spacious 18px rows.
- At 600px and below, titles and metadata share a row, descriptions span the width, and redundant group labels are hidden. Events retain a separate date/status row and a full-width title. Dates remain visible on writing and projects.
- HDC/HCN keep their Motion effect and inherit the compact 15px list title on phones.
- Participants retains one overlapping avatar row on every viewport, with the original spring expansion and tooltip. No expanded people grid, project counts or extra rows. Eligibility is documented separately in `participants-sources.md`.
- Coarse pointers do not trigger desktop sibling-dimming or hover movement.
- Article tables scroll inside their own labelled, keyboard-focusable region. The page itself does not scroll horizontally.
- Share-preview images keep their aspect ratio and fit the viewport. The OG gallery lazy-loads images.
- The exported Beijing deck receives touch-target fixes via `public/beijing-fde-pro-deck/mobile.css`, without editing its compiled assets. Retain the stylesheet link when refreshing the deck export.

## Browser checks

At 320 × 740, the following routes had `document.documentElement.scrollWidth === innerWidth`:

- `/`, `/hdc`, `/hcn`, `/academy`, `/anc-fund`
- `/wechat`, `/rednote`
- `/writing/six-cell-ai-collaboration`, `/writing/six-cell-ai-collaboration/zh`
- `/raily/support`, `/raily/privacy`, `/glimmer/support`, `/glimmer/privacy`
- `/og`, `/writing/six-cell-ai-collaboration/og`
- `/beijing-fde-pro-deck/index.html` (also checked the `/beijing-fde-pro` iframe entry)

Additional checks of homepage, HDC and the Chinese table article at 375 × 812, 430 × 932, 600 × 900, 768 × 1024, 844 × 390 and 1280 × 900 found no page-level horizontal overflow. The homepage was visually inspected at 390 × 844 before and after changes.

Measured controls:

- Homepage social links: 44px height.
- Article export and language links: 44px height.
- Deck theme switch and each of five page buttons: 44 × 44px.
- Article table at 320px: 280px container with 544px scrollable content.

The article uses a shared component and stylesheet; representative English/Chinese pages include a long title and a table. The check does not assert that every individual essay has been visually inspected.

## Final service and compact-layout regression

At 320 × 740, 390 × 844 and 1280 × 900, `/`, `/hdc`, `/academy`, `/hdc/diagnosis` and `/academy/executive-ai-camp` all had `scrollWidth === innerWidth`, a 16px body base, and the expected page heading. The two detail pages expose the verified public Skill repositories. Diagnosis and the compact homepage were visually inspected at 390px.

`npm run build` completed successfully, generating 152 pages; changed components and data passed ESLint and TypeScript checks. The two published Skills pass the Skill Creator validator, and remote `npx skills add HA7CH/<repo> --list` detects exactly the intended Skill in each repository without installation.

## Limits

These are browser viewport checks, not physical iPhone/Android or WeChat-client acceptance. External mee7/App Store destinations, backend actions and exports were not modified. OS-specific download behavior and mobile Safari/WeChat should still be checked on a real phone before release.
