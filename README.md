# CareerCraft

Free, private, job-specific resume builder. Static site: HTML, CSS, vanilla JS. No backend, login, API keys or paid services.

## Files
`index.html` (landing + shell), `style.css`, `app.js` (all logic), `assets/images/` (empty, for your own images).

## Run locally
Open `index.html` in a browser (internet needed once to load the jsPDF library from cdnjs).

## Publish on GitHub Pages
1. Create a public repo and upload the contents of this folder to the repo root (`index.html` at the top level).
2. Repo **Settings → Pages → Build and deployment**: Source = *Deploy from a branch*, Branch = `main`, Folder = `/ (root)`. Save.
3. After a minute the site is live at `https://<username>.github.io/<repo>/`. All paths are relative.

## Resume output
Body text is always black. On the final step, users style the resume: separate colours for the name and the section headings (eight muted swatches or any custom colour), plus alignment for the name, section headings and sub-headings (job, project and education lines: left with date on the right, left, centred or right). Choices apply to the preview, the PDF and printing and are saved with the draft. Three templates:
Classic ATS (Arial, centred, thin rules), Modern Professional (Arial, left-aligned name, heavy rules), Executive (Times, double rules).
LinkedIn, GitHub and Portfolio appear as those words and are clickable links.
The PDF is drawn directly (not a screenshot), so text is selectable, pages break cleanly and every page keeps its margins.
Skills accept "Group: item, item" lines (like "Data Handling: SQL, Excel") and are printed with bold group names.

## ATS estimate (100 points)
JD keyword relevance 40 (related terms count half), relevant skills 20, experience/project relevance 15, completeness 15, formatting 10. It is an estimate, not an employer ATS result.

## Honesty rules
Nothing is auto-added. Missing JD skills are shown only; you tick the ones you truly have. Rewrites only fix weak openers; missing numbers are flagged, never invented.

## Limitations
- PDF uses built-in fonts (Helvetica/Times): characters outside Latin-1 (for example Tamil or Hindi text) are dropped from the PDF.
- Keyword extraction uses a built-in skills dictionary plus frequent terms; niche skills may be missed. Synonym matching is a small fixed list.
- The on-screen preview approximates the PDF layout; line breaks can differ slightly. The PDF is the final version.
- "Print instead" uses the browser's print dialog: turn off "Headers and footers" so no title or date prints.
- Drafts live in this browser only; clearing site data loses them. Rewrite suggestions are rule-based, not AI.

## Testing checklist
Fresher and experienced flows; email/phone/URL validation; 2+ education, experience and project entries; JD analysis; accept/edit/keep suggestions; add-ticked-skills; template switching; long names and long bullets; multi-page PDF (15+ bullets, no cut-off lines, margins on page 2); links open from the PDF; Print instead; reload restores draft; Clear draft confirms; deployed Pages URL loads CSS/JS; phone layout.
