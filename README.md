# Leigh Jannah Ramos — Portfolio

A static, dependency-free portfolio site. No build step, no framework.

## Files

```
index.html      markup + inline SVG icon sprite
style.css       all styles, theme tokens at the top
script.js       theme, nav, reveals, accordion, filters, lightbox, command palette
assets/         profile photo and certificate images
```

The only external request is the Google Fonts stylesheet in `<head>`.

## Run it locally

Open `index.html` in a browser, or serve the folder:

```
python3 -m http.server 8000
```

## Publish on GitHub Pages

1. Create a repo and push these files to the root of the `main` branch.
2. Settings → Pages → Source: "Deploy from a branch" → `main` / `(root)`.
3. Wait a minute, then open the URL Pages gives you.

## Editing

**Colors and spacing** — the `:root` block at the top of `style.css`. Change a
value there and it updates everywhere. The dark palette is defined twice on
purpose: once under `@media (prefers-color-scheme: dark)` for people who never
touch the toggle, once under `:root[data-theme="dark"]` for people who do.

**Roles in the rotating hero line** — the `roles` array in `script.js`.

**Command palette entries** — the `commands` array in `script.js`.

**Certificates** — each is a `<button class="cert" data-i="N">` in `index.html`.
Adding one means adding the button *and* a matching entry at the same index in
the `certData` array in `script.js`, which holds the title and verify link.

**Skill filters** — filter buttons carry `data-f`, skill cards carry `data-c`
with space-separated categories. A card shows up under every category listed in
its `data-c`.

## Keyboard shortcuts

- `Cmd/Ctrl + K` — open the jump-to palette
- `Esc` — close the palette, lightbox, or mobile menu
- `←` `→` — move between certificates while the lightbox is open
