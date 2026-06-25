# Figma → Page Mapping

Canonical map of Figma frames to project pages, for design-to-code work via the
Figma MCP server. Confirmed by the project owner; last updated 2026-06-25.

- **Figma file:** FYP – Culture Educational Game
- **File key:** `DfoGq2GSyOCy4GZ9Ugdrng`
- **File URL:** https://www.figma.com/design/DfoGq2GSyOCy4GZ9Ugdrng/FYP---Culture-Educational-Game

## How to use

The Figma MCP server is installed and authenticated (account: Sook May,
phangsookmay123@gmail.com). To work on a screen, call the Figma tools with the
`fileKey` above and the relevant `nodeId` below — e.g.
`get_design_context` / `get_screenshot`. Prefer a frame-specific node id over the
page root (`0:1`), which dumps the whole file and overflows.

> **Per-page primary frame is set explicitly below.** Some screens use the redesigned
> frames inside the container `273:14` ("New Design – Screens") — currently `recover`,
> `reward`, and `avatar` — while others (`login`, `narrative`, `activity`) use the
> original frames. Always use the "Primary frame" column; the secondary column is
> reference only.

## Page → frame mapping (all project pages)

| Project page | Primary frame (use this) | Node ID | Older / secondary frame(s) |
|---|---|---|---|
| `home` | Main Page | `293:2441` | `18:6382`, `117:25` |
| Shared topbar (`js/ui.js`) | Top Menu Bar | `332:26` | `129:10` |
| `login` | Login Page | `298:87` | New Design · Login `273:15` |
| `login` (register flow) | Create Account | `334:14` | New Design · Create Account `273:52` |
| `recover` (Forgot Password — **page not built yet**) | New Design · Forgot Password | `273:86` | — |
| `map` | My Map | `123:208` / `333:17` | Map `29:7509` |
| `narrative` | narrative | `333:16` | New Design · Penang Content `273:142`; Cultural Content – Penang `208:44` |
| `activity` (Drag-Match) | Drag and Match Mini-Game | `226:323` | New Design · Match the Culture `273:222` |
| `quiz` | Quiz | `39:100` | — |
| `guess` | Guess My State Mini-Game | `226:434` | — |
| `stampbook` | Stamp | `38:7` / `333:14` | — |
| `reward` | New Design · Stamp Earned | `273:382` | — |
| `avatar` | New Design · Avatar Shop | `273:280` | — |
| `settings` | Setting | `139:108` / `333:15` | User Setting `39:151` |

## Pages with NO Figma frame

These project pages have no corresponding design in the Figma file (build from the
existing code / app conventions, or design them later):

- `index` — entry/splash redirect; no design frame.
- `dashboard` — student dashboard; no design frame found.
- `teacher` — teacher view; no design frame found.

## Supporting art / mascot frames (not screens)

| Figma frame | Node ID | Notes |
|---|---|---|
| New Design – Screens (container) | `273:14` | Parent of all `273:*` redesign frames above |
| Malayan Tiger Mascot Poses | `225:60` | Rimau mascot poses |
| Malaysian Game Mascots | `226:189` | Mascot art for the mini-games |
