---
name: remotion-orchestactor
description: Orchestrate creative Remotion videos by reusing the local templates/ library. Use this whenever the user asks to make, create, build, improve, or animate a video, composition, intro, title, lower-third, logo reveal, chart, transition, text animation, gallery, or any Remotion scene — even if they don't say 'template'. Consult templates/ first for design style before writing new markup.
---

# Remotion Orchestactor

Build creative Remotion videos by remixing `templates/` instead of starting blank.

## When to use

- Any video / composition / scene request in Remotion
- User wants intro, outro, title, kinetic text, logo reveal, chart, counter, gallery, transition, overlay, effect
- User says "make it more creative", "improve design", "like reference"

## Prerequisites

This skill composes on top of official Remotion skills. Load as needed:

1. Video creation: `remotion-best-practices` for Studio preview vs render routing
2. New project / composition: `remotion-create` for scaffold
3. Writing markup: `remotion-markup` for `useCurrentFrame`, `interpolate`, `Interactive`, `premountFor`, media, transitions — ALWAYS obey it. Never use CSS `transition`/`animation` or Tailwind animation classes.

This skill adds creativity + consistency. It does not replace correctness rules.

## Template library

Source: `templates/` (81 self-contained `.tsx` components). All use `useCurrentFrame` + `spring`/`interpolate`, dark base `#111827`, accent gradients `#4361ee → #7209b7`, `#3b82f6`, Inter/system-ui, absolute full-size container.

Browse by intent — read 2-3 candidates fully before writing code:

**Intros / Titles / Chapters:**
`cinematic-title-intro.tsx`, `chapter-title.tsx`, `countdown-intro.tsx`, `title-split.tsx`, `letterbox-reveal.tsx`, `spotlight-reveal.tsx`

**Kinetic text:**
`animated-text.tsx`, `animated-list.tsx`, `bounce-text.tsx`, `bubble-pop-text.tsx`, `floating-bubble-text.tsx`, `glitch-text.tsx`, `popping-text.tsx`, `pulsing-text.tsx`, `slide-text.tsx`, `text-highlight.tsx`, `typewriter-subtitle.tsx`, `logo-typewriter.tsx`

**Lower-thirds / Overlays / Cards:**
`lower-third.tsx`, `quote-card.tsx`, `notification-pop.tsx`, `subscribe-reminder.tsx`, `polaroid-frame.tsx`, `photo-stack.tsx`, `end-card.tsx`, `credits-roll.tsx`, `stat-counter.tsx`

**Charts / Data:**
`chart-animation.tsx`, `area-chart.tsx`, `line-chart.tsx`, `bar` in `chart-animation`, `pie-chart.tsx`, `donut-chart.tsx`, `comparison-chart.tsx`, `circular-progress.tsx`, `progress-bars.tsx`, `progress-steps.tsx`, `sound-wave.tsx`

**Galleries / Media:**
`gallery-grid.tsx`, `masonry-gallery.tsx`, `image-carousel.tsx`, `rotating-carousel.tsx`, `image-zoom-reveal.tsx`, `image-comparison-slider.tsx`, `picture-in-picture.tsx`, `split-screen.tsx`, `ken-burns.tsx`, `parallax-pan.tsx`

**Logo reveals:**
`logo-spin-reveal.tsx`, `logo-blur-reveal.tsx`, `logo-bounce-drop.tsx`, `logo-fade-reveal.tsx`, `logo-glitch-reveal.tsx`, `logo-scale-rotate.tsx`, `logo-split-reveal.tsx`, `logo-stroke-draw.tsx`

**Transitions / FX / Backgrounds:**
`blinds-transition.tsx`, `clock-wipe.tsx`, `cross-dissolve.tsx`, `fade-through-black.tsx`, `iris-transition.tsx`, `morph-transition.tsx`, `pixel-transition.tsx`, `push-transition.tsx`, `slide-wipe.tsx`, `whip-pan.tsx`, `zoom-through.tsx`, `zoom-pulse.tsx`, `film-burn.tsx`, `camera-shake.tsx`, `card-flip.tsx`, `bokeh-circles.tsx`, `geometric-patterns.tsx`, `gradient-shift.tsx`, `grid-pulse.tsx`, `liquid-wave.tsx`, `matrix-rain.tsx`, `noise-grain.tsx`, `particle-explosion.tsx`, `starfield.tsx`, `vignette-pulse.tsx`, `countdown-timer.tsx`

If no template matches, pick closest motion pattern (e.g. spring entrance from `lower-third`, stagger from `animated-text`, bar grow from `chart-animation`) and adapt.

## Design system — match unless user overrides

Extracted from templates. Reuse for coherence:

- Background: `linear-gradient(135deg, #111827 0%, #1a1a2e 100%)` or `#111827 → #1f2937`
- Accents: `#4361ee`, `#7209b7`, `#3b82f6`, `#f72585`, `#4cc9f0`, `#c084fc`
- Text: white `bold 2-5rem`, sub `rgba(255,255,255,0.7-0.8) 1-1.5rem weight 300`, `letterSpacing 0.02-0.1em`, `Inter, system-ui, sans-serif`
- Card: `rgba(0,0,0,0.2-0.7)`, `borderRadius 4-16px`, `boxShadow 0 10px 30px rgba(0,0,0,0.3)`
- Motion: `spring({frame, fps, from, to, durationInFrames: 20-40, config: {damping: 12-15, mass: 0.6-0.8}})` for entrances; `interpolate(frame, [a,b], [c,d], {extrapolateLeft:'clamp', extrapolateRight:'clamp'})` for progress/scrub; stagger `frame - i*3` or `i*5`; delayed `Math.max(0, frame-15)`
- Layout: outer `position:absolute top:0 left:0 width:100% height:100% display:flex alignItems:center justifyContent:center`

## Workflow

1. **Clarify:** duration, dimensions (default 1280x720 30fps), texts/data/colors to replace placeholders like "Your Story Begins", "John Smith", "LOGO".
2. **Select:** `ls templates/` + read 2-3 candidates. Never invent from scratch if a template is 70%+ fit.
3. **Adapt, don't copy:**
   - Keep motion math, replace content via props (`title`, `subtitle`, `data`, `accentColor`)
   - Parametrize hardcoded strings/colors into props with sensible defaults
   - Convert `export default function X()` to named export if composing multi-scene
   - Keep `useCurrentFrame`/`useVideoConfig` driven; inline `interpolate` in `style`; prefer `scale`/`translate`/`rotate` props per `remotion-markup`
   - Add `premountFor={fps}` and `name=""` when wrapping in `Interactive` / `Sequence` / media
4. **Compose:** multi-scene via `<Series>` / `<TransitionSeries>` or connected compositions per `remotion-markup`. One template = one scene/layer. Wire timing explicitly.
5. **Preview first:** open Remotion Studio before rendering, per `remotion-best-practices`. Render only on explicit "render/export/mp4".
6. **Verify:** `npx tsc --noEmit`, Studio loads, no CSS animation, assets via `staticFile()` in `public/`.

## Examples

**Input:** "add a lower third for Jane, Product Designer"
**Output:** read `lower-third.tsx`, keep `accentSlide/barSlide/textOpacity` springs, expose `{name, role, accentColor}` props, register as connected composition.

**Input:** "animate monthly sales"
**Output:** read `chart-animation.tsx` + `line-chart.tsx`, keep `interpolate(frame,[i*3,15+i*3],[0,1])` bar grow + palette, replace `data` prop, title/subtitle props.

**Input:** "cinematic opener + logo"
**Output:** combine `cinematic-title-intro.tsx` (titleY/titleOpacity springs + underlineWidth interpolate) → `logo-spin-reveal.tsx` (rotateY spring + text slide), unified gradient + Inter.

## Don'ts

- Don't ignore `templates/` and write generic markup.
- Don't hardcode user text inside reusable component — use props.
- Don't break `remotion-markup` rules to match a template (e.g. template uses `transform: translateY()` string — prefer `translate` prop for new code).
- Don't overwrite user edits outside conversation; ask if diff surprises you.
