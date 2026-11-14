# Linear or Bilinear — Project Page

Project page for **"Linear or Bilinear: A Criterion for Koopman Rollouts in
Sampling-Based Predictive Control"** (Kangmin Lee, Sanghyun Kim · RCILab, Kyung Hee University).

Live site: https://rcilab.github.io/koopman-mppi

## Structure

The page is a single self-contained static site — no build step, no external CDN.

```
index.html                     # the whole page
static/css/site.css            # bespoke stylesheet
static/gifs/                   # closed-loop demos: unicycle, drone figure-8, quadrotor, pendulum
                               #   (oracle / linear / bilinear for each)
static/images/figures/         # criterion figure (Fig. 1 panels + legend) + social preview card
static/pdfs/paper.pdf          # the paper
static/images/icon/            # favicon
.nojekyll                      # serve static assets verbatim on GitHub Pages
```

## Deploy (GitHub Pages)

Push to the repository and enable Pages on the branch root — everything is static,
so it serves as-is.

## Assets

The demo GIFs are rendered from the closed-loop trajectories of the paper's experiments,
with the same trained models and MPPI settings as the paper. The renderers and the
trajectory data are kept with the experiment archive outside this repository; the
finished GIFs are already in `static/`.

## Credits

Original layout scaffold adapted from the
[Academic Project Page Template](https://github.com/eliahuhorwitz/Academic-project-page-template);
the design was rebuilt for this project. Released under
[CC BY-SA 4.0](http://creativecommons.org/licenses/by-sa/4.0/).
