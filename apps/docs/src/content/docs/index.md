---
title: Saksham's Docs
description: Working notes, engineering guides, and practical references.
template: splash
---

<div class="portfolio-home">
  <div class="pointer-glow" aria-hidden="true"></div>
  <section class="docs-hero">
    <div class="docs-hero-copy">
      <p class="kicker"><span>&gt;_</span> HELLO, WORLD. I'M SAKSHAM.</p>
      <h1>DOCUMENTING<br /><em>IDEAS</em> INTO<br />SYSTEMS<span>_</span></h1>
      <p class="hero-intro">A practical engineering notebook for building scalable products, clean interfaces, and systems that do the heavy lifting.</p>
      <div class="hero-actions">
        <a href="/guides/about/" class="primary-button">EXPLORE THE NOTES <span>↓</span></a>
        <a href="/reference/toolbox/" class="text-link">OPEN THE TOOLBOX <span>↗</span></a>
      </div>
    </div>
    <div class="terminal-card">
      <div class="terminal-head"><span class="dots"><i></i><i></i><i></i></span><span>saksham@docs:~</span><span>⌁</span></div>
      <div class="terminal-body">
        <p><span class="green">const</span> docs = {</p>
        <p class="indent"><span class="blue">purpose:</span> <span class="yellow">"share what works"</span>,</p>
        <p class="indent"><span class="blue">topics:</span> [<span class="yellow">"systems"</span>, <span class="yellow">"interfaces"</span>],</p>
        <p class="indent"><span class="blue">format:</span> <span class="purple">"clear and useful"</span>,</p>
        <p class="indent"><span class="blue">status:</span> <span class="yellow">"always evolving"</span></p>
        <p>};</p>
        <p class="terminal-output"><span class="green">✓</span> ready to share useful notes<span class="blink">▌</span></p>
      </div>
      <div class="terminal-foot"><span>UTF-8</span><span>main*</span><span>docs.md</span></div>
    </div>
  </section>
</div>

## Find your way around

<div class="card-grid">
  <a class="card" href="/guides/about/">
    <span class="card-id">01 / GUIDES</span>
    <h3>Build with intent.</h3>
    <p>Step-by-step playbooks for turning an idea into a maintainable product.</p>
    <b>OPEN GUIDE ↗</b>
  </a>
  <a class="card" href="/reference/toolbox/">
    <span class="card-id">02 / REFERENCE</span>
    <h3>Ship with confidence.</h3>
    <p>Fast answers, conventions, and checklists I reach for while shipping.</p>
    <b>OPEN REFERENCE ↗</b>
  </a>
  <a class="card" href="/guides/about/">
    <span class="card-id">03 / SELF NOTES</span>
    <h3>Keep learning.</h3>
    <p>A public scratchpad for lessons learned, useful patterns, and things worth remembering.</p>
    <b>READ THE NOTES ↗</b>
  </a>
</div>

## Language tracks

Build a strong foundation in the languages behind reliable software:

- [Rust](/languages/rust/) for memory-safe systems and concurrent services.
- [C++](/languages/cpp/) for performance-sensitive applications and native tooling.
- [Python](/languages/python/) for automation, services, data, and readable application code.

## A note on this site

These docs are intentionally practical. They are written while building real things, so they may change as tools and understanding improve.

<script>
  const glow = document.querySelector(".pointer-glow");
  window.addEventListener("pointermove", (event) => {
    if (glow && window.matchMedia("(pointer: fine)").matches) {
      glow.style.setProperty("--pointer-x", `${event.clientX}px`);
      glow.style.setProperty("--pointer-y", `${event.clientY}px`);
    }
  });
</script>
