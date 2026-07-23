# Linear or Bilinear — Project Page

Project page for **"Linear or Bilinear: A Criterion for Koopman Rollouts in
Sampling-Based Predictive Control"** (Kangmin Lee, Sanghyun Kim · RCILab, Kyung Hee University).

Live site: https://rcilab.github.io/koopman-mppi

## Structure

The page is a single self-contained static site — no build step, no external CDN.

```
index.html                     # the whole page
static/css/site.css            # bespoke stylesheet
static/gifs/                   # animated results (unicycle parking, drone figure-8)
static/plots/                  # result charts as SVG (drone / pendulum / quad / tube)
static/images/figures/         # concept figure (Fig. 1) + social preview card
static/pdfs/paper.pdf          # the paper
static/images/icon/            # favicon
.nojekyll                      # serve static assets verbatim on GitHub Pages
```

## Deploy (GitHub Pages)

Push to the repository and enable Pages on the branch root — everything is static,
so it serves as-is.

## Regenerating assets

The animations and charts are rendered directly from the paper's experiment data
(the same checkpoints that produced the published figures). The generator scripts live
in `scripts/`; each reads an `*.npz` from the paper's `fig_data/` directory and writes to
`static/gifs/` or `static/plots/`. That source data lives outside this repository and is
not needed to serve the site — the finished GIFs and SVGs are already in `static/`.

## Credits

Original layout scaffold adapted from the
[Academic Project Page Template](https://github.com/eliahuhorwitz/Academic-project-page-template);
the design was rebuilt for this project. Released under
[CC BY-SA 4.0](http://creativecommons.org/licenses/by-sa/4.0/).
