(async function () {
  const CONFIG = window.RCI_TEMPLATE_CONFIG || {
    templateName: "RCI_paper_page_template",
    templateVersion: "1.0.0",
    contentPath: "static/data/content.json",
    labPath: "static/data/lab.json"
  };

  const Schema = window.RCIContentSchema;

  function qs(selector) {
    return document.querySelector(selector);
  }

  function qsa(selector) {
    return Array.from(document.querySelectorAll(selector));
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el && value !== undefined && value !== null) {
      el.textContent = value;
    }
  }

  function setHTML(id, value) {
    const el = document.getElementById(id);
    if (el && value !== undefined && value !== null) {
      el.innerHTML = value;
    }
  }

  function setAttr(id, attr, value) {
    const el = document.getElementById(id);
    if (el && value !== undefined && value !== null && value !== "") {
      el.setAttribute(attr, value);
    }
  }

  function setSectionTitle(id, value) {
    const el = document.getElementById(id);
    if (!el) return;

    const text = String(value ?? "").trim();

    if (!text) {
      el.hidden = true;
      el.textContent = "";
      return;
    }

    el.textContent = text;
    el.hidden = false;
  }

  function showSection(sectionKey, visible) {
    const el = document.querySelector(`[data-section="${sectionKey}"]`);
    if (!el) return;
    el.hidden = !visible;
  }

  function safeArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function chunkArray(array, size) {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  }

  let peopleCarouselState = {
    page: 0,
    totalPages: 0
  };

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  async function fetchJson(path) {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Failed to load ${path}: ${res.status}`);
    }
    return res.json();
  }

  function updateMeta(content, lab) {
    const meta = content.meta || {};
    const paper = content.paper || {};
    const authors = safeArray(paper.authors);
    const keywordList = safeArray(meta.keywords);
    const pageUrl = content.pageUrl || window.location.href;
    const previewImage = meta.socialPreviewImage
      ? new URL(meta.socialPreviewImage, window.location.href).href
      : "";
    const authorNames = authors.map(a => a.name).join(", ");
    const titleText = paper.title || meta.title || "Academic Project Page";
    const abstractText = paper.abstract?.text || "";
    const bibtexContent = paper.bibtex?.content || "";

    document.title = `${titleText}${authorNames ? ` - ${authorNames}` : ""} | Academic Research`;

    setAttr("meta-name-title", "content", `${titleText}${authorNames ? ` - ${authorNames}` : ""}`);
    setAttr("meta-description", "content", meta.description || "");
    setAttr("meta-keywords", "content", keywordList.join(", "));
    setAttr("meta-author", "content", authorNames);

    setAttr("meta-og-site-name", "content", lab.lab?.fullName || lab.lab?.name || "RCILab");
    setAttr("meta-og-title", "content", titleText);
    setAttr("meta-og-description", "content", meta.description || "");
    setAttr("meta-og-url", "content", pageUrl);
    setAttr("meta-og-image", "content", previewImage);
    setAttr("meta-og-image-alt", "content", `${titleText} - Research Preview`);
    setAttr("meta-article-published-time", "content", meta.publishedTime || "");
    setAttr("meta-article-section", "content", "Research");

    setAttr("meta-twitter-site", "content", meta.twitterSite || "");
    setAttr("meta-twitter-creator", "content", meta.twitterCreator || "");
    setAttr("meta-twitter-title", "content", titleText);
    setAttr("meta-twitter-description", "content", meta.description || "");
    setAttr("meta-twitter-image", "content", previewImage);
    setAttr("meta-twitter-image-alt", "content", `${titleText} - Research Preview`);

    setAttr("meta-citation-title", "content", titleText);
    setAttr("meta-citation-publication-date", "content", meta.publicationYear || "");
    setAttr("meta-citation-conference-title", "content", meta.conferenceName || "");
    const paperLink = (safeArray(paper.links).find(link => link.label?.toLowerCase() === "paper") || {}).url || "";
    setAttr("meta-citation-pdf-url", "content", paperLink ? new URL(paperLink, window.location.href).href : "");

    qsa('meta[name="citation_author"], meta[property="article:tag"]').forEach(el => el.remove());

    authors.forEach(author => {
      const metaAuthor = document.createElement("meta");
      metaAuthor.setAttribute("name", "citation_author");
      const first = author.citation?.first || "";
      const last = author.citation?.last || "";
      metaAuthor.setAttribute("content", `${last}, ${first}`.trim().replace(/^,\s*/, ""));
      document.head.appendChild(metaAuthor);
    });

    keywordList.forEach(keyword => {
      const metaTag = document.createElement("meta");
      metaTag.setAttribute("property", "article:tag");
      metaTag.setAttribute("content", keyword);
      document.head.appendChild(metaTag);
    });

    const scholarJson = {
      "@context": "https://schema.org",
      "@type": "ScholarlyArticle",
      "headline": titleText,
      "description": meta.description || "",
      "author": authors.map(author => ({
        "@type": "Person",
        "name": author.name || "",
        "affiliation": {
          "@type": "Organization",
          "name": author.affiliation || lab.lab?.fullName || lab.lab?.name || ""
        }
      })),
      "datePublished": meta.publishedTime ? meta.publishedTime.slice(0, 10) : "",
      "publisher": {
        "@type": "Organization",
        "name": meta.conferenceName || ""
      },
      "url": pageUrl,
      "image": previewImage,
      "keywords": keywordList,
      "abstract": abstractText,
      "citation": bibtexContent,
      "isAccessibleForFree": true,
      "license": "https://creativecommons.org/licenses/by-sa/4.0/",
      "mainEntity": {
        "@type": "WebPage",
        "@id": pageUrl
      },
      "about": safeArray(meta.researchAreas).map(area => ({
        "@type": "Thing",
        "name": area
      }))
    };

    const orgJson = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": lab.lab?.fullName || lab.lab?.name || "RCILab",
      "url": lab.lab?.institutionUrl || lab.lab?.githubUrl || "",
      "logo": lab.lab?.logo ? new URL(lab.lab.logo, window.location.href).href : "",
      "sameAs": safeArray(lab.lab?.socialLinks)
    };

    const scholarNode = document.getElementById("structured-data-scholar");
    const orgNode = document.getElementById("structured-data-org");
    if (scholarNode) scholarNode.textContent = JSON.stringify(scholarJson, null, 2);
    if (orgNode) orgNode.textContent = JSON.stringify(orgJson, null, 2);
  }

  function renderHero(content) {
    const paper = content.paper || {};

    setText("paper-title", paper.title || "Academic Project Page");
    setHTML("publication-venue", paper.venueText || "");
    if (paper.contributionNote) {
      setHTML("contribution-note", paper.contributionNote);
      qs("#contribution-note")?.removeAttribute("hidden");
    } else {
      qs("#contribution-note")?.setAttribute("hidden", "");
    }

    const authorContainer = document.getElementById("publication-authors");
    const authorTemplate = document.getElementById("author-template");
    if (authorContainer && authorTemplate) {
      authorContainer.innerHTML = "";
      const authors = safeArray(paper.authors);
      authors.forEach((author, index) => {
        const fragment = authorTemplate.content.cloneNode(true);
        const link = fragment.querySelector(".author-link");
        const mark = fragment.querySelector(".author-mark");
        const comma = fragment.querySelector(".author-comma");

        link.textContent = author.name || "";
        link.href = author.url || "#";

        if (author.mark) {
          mark.textContent = author.mark;
          mark.hidden = false;
        } else {
          mark.hidden = true;
        }

        if (index === authors.length - 1) {
          comma.textContent = "";
        }

        authorContainer.appendChild(fragment);
      });
    }

    const linksContainer = document.getElementById("publication-links");
    const linkTemplate = document.getElementById("link-button-template");
    if (linksContainer && linkTemplate) {
      linksContainer.innerHTML = "";
      safeArray(paper.links).forEach(linkData => {
        const fragment = linkTemplate.content.cloneNode(true);
        const anchor = fragment.querySelector("a");
        const icon = fragment.querySelector(".icon");
        const label = fragment.querySelector(".button-text");

        anchor.href = linkData.url || "#";
        icon.innerHTML = Schema.getIconHtml(linkData.iconType);
        label.textContent = linkData.label || "Link";

        linksContainer.appendChild(fragment);
      });
    }
  }

  function renderTeaser(content) {
    const teaser = content.paper?.teaser || {};
    const sectionVisible = !!content.sections?.teaser;
    showSection("teaser", sectionVisible);
    if (!sectionVisible) return;

    const imageWrapper = qs("#teaser-image-wrapper");
    const videoWrapper = qs("#teaser-video-wrapper");

    if (teaser.mode === "video" && teaser.video) {
      videoWrapper?.removeAttribute("hidden");
      imageWrapper?.setAttribute("hidden", "");
      setAttr("teaser-video-source", "src", teaser.video);
      const video = qs("#teaser-video");
      if (video) video.load();
    } else if (teaser.image) {
      imageWrapper?.removeAttribute("hidden");
      videoWrapper?.setAttribute("hidden", "");
      setAttr("teaser-image", "src", teaser.image);
      setAttr("teaser-image", "alt", teaser.caption || "Teaser image");
    }

    setText("teaser-caption", teaser.caption || "");
  }

  function renderAbstract(content) {
    const visible = !!content.sections?.abstract;
    showSection("abstract", visible);
    if (!visible) return;

    setSectionTitle("abstract-title", content.paper?.abstract?.title);
    setText("paper-abstract", content.paper?.abstract?.text || "");
  }

  function renderFigureCarousel(content) {
    const items = safeArray(content.paper?.figureCarousel?.items);
    const visible = !!content.sections?.imageCarousel && items.length > 0;
    showSection("imageCarousel", visible);
    if (!visible) return;

    setSectionTitle("image-carousel-title", content.paper?.figureCarousel?.title);

    const container = document.getElementById("results-carousel");
    const template = document.getElementById("figure-carousel-item-template");
    if (!container || !template) return;

    container.innerHTML = "";
    items.forEach(item => {
      const fragment = template.content.cloneNode(true);
      const img = fragment.querySelector(".carousel-image");
      const caption = fragment.querySelector(".carousel-caption");

      img.src = item.image || "";
      img.alt = item.alt || "Research result visualization";
      caption.textContent = item.caption || "";

      container.appendChild(fragment);
    });
  }

  function renderYoutube(content) {
    const visible = !!content.sections?.youtube && !!content.paper?.youtube?.embedUrl;
    showSection("youtube", visible);
    if (!visible) return;

    setSectionTitle("youtube-section-title", content.paper?.youtube?.title);
    setAttr("youtube-embed", "src", content.paper?.youtube?.embedUrl || "");
  }

  function renderVideoCarousel(content) {
    const items = safeArray(content.paper?.videoCarousel?.items);
    const visible = !!content.sections?.videoCarousel && items.length > 0;
    showSection("videoCarousel", visible);
    if (!visible) return;

    setSectionTitle("video-carousel-title", content.paper?.videoCarousel?.title);

    const container = document.getElementById("video-carousel");
    const template = document.getElementById("video-carousel-item-template");
    if (!container || !template) return;

    container.innerHTML = "";
    items.forEach(item => {
      const fragment = template.content.cloneNode(true);
      const source = fragment.querySelector(".carousel-video-source");
      const video = fragment.querySelector(".carousel-video");
      const caption = fragment.querySelector(".carousel-video-caption");

      source.src = item.video || "";
      if (item.caption) {
        caption.textContent = item.caption;
        caption.hidden = false;
      } else {
        caption.hidden = true;
        caption.textContent = "";
      }

      container.appendChild(fragment);
      video.load();
    });
  }

  function renderPoster(content) {
    const visible = !!content.sections?.poster && !!content.paper?.poster?.pdf;
    showSection("poster", visible);
    if (!visible) return;

    setSectionTitle("poster-title", content.paper?.poster?.title);
    setAttr("poster-iframe", "src", content.paper?.poster?.pdf || "");
  }

  function renderBibtex(content) {
    const visible = !!content.sections?.bibtex;
    showSection("bibtex", visible);
    if (!visible) return;

    setSectionTitle("bibtex-title", content.paper?.bibtex?.title);

    const pre = document.getElementById("bibtex-code");
    const code = pre?.querySelector("code");
    if (pre && code) {
      code.textContent = content.paper?.bibtex?.content || "";
    }
  }

  function updatePeopleCarouselUI() {
    const track = document.getElementById("people-track");
    const pagination = document.getElementById("people-pagination");
    const prev = document.getElementById("people-prev");
    const next = document.getElementById("people-next");

    if (!track || !pagination || !prev || !next) return;

    track.style.transform = `translateX(-${peopleCarouselState.page * 100}%)`;

    const dots = pagination.querySelectorAll(".slider-page");
    dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === peopleCarouselState.page);
    });

    const atFirst = peopleCarouselState.page === 0;
    const atLast = peopleCarouselState.page >= peopleCarouselState.totalPages - 1;
    const singlePage = peopleCarouselState.totalPages <= 1;

    prev.classList.toggle("is-hidden", atFirst || singlePage);
    next.classList.toggle("is-hidden", atLast || singlePage);
    pagination.hidden = singlePage;
  }

  function setupPeopleCarousel(totalPages) {
    const prev = document.getElementById("people-prev");
    const next = document.getElementById("people-next");
    const pagination = document.getElementById("people-pagination");

    peopleCarouselState.page = 0;
    peopleCarouselState.totalPages = totalPages;

    if (!prev || !next || !pagination) return;

    prev.onclick = () => {
      if (peopleCarouselState.page > 0) {
        peopleCarouselState.page -= 1;
        updatePeopleCarouselUI();
      }
    };

    next.onclick = () => {
      if (peopleCarouselState.page < peopleCarouselState.totalPages - 1) {
        peopleCarouselState.page += 1;
        updatePeopleCarouselUI();
      }
    };

    pagination.innerHTML = "";
    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "slider-page";
      dot.setAttribute("aria-label", `Go to people page ${i + 1}`);
      dot.onclick = () => {
        peopleCarouselState.page = i;
        updatePeopleCarouselUI();
      };
      pagination.appendChild(dot);
    }

    updatePeopleCarouselUI();
  }

  function renderPeople(content) {
    const people = safeArray(content.paper?.people?.items);
    const visible = !!content.sections?.people && people.length > 0;
    showSection("people", visible);
    if (!visible) return;

    setSectionTitle("people-title", content.paper?.people?.title);

    const grid = document.getElementById("people-grid");
    const gridTemplate = document.getElementById("person-template");
    const carouselWrapper = document.getElementById("people-carousel-wrapper");
    const track = document.getElementById("people-track");
    const cardTemplate = document.getElementById("person-carousel-card-template");
    const pagination = document.getElementById("people-pagination");

    if (!grid || !gridTemplate || !carouselWrapper || !track || !cardTemplate || !pagination) {
      console.error("People render aborted: required DOM node missing.");
      return;
    }

    grid.innerHTML = "";
    track.innerHTML = "";
    pagination.innerHTML = "";

    // under 4 people
    if (people.length <= 4) {
      grid.hidden = false;
      carouselWrapper.hidden = true;
      pagination.hidden = true;

      people.forEach(person => {
        const fragment = gridTemplate.content.cloneNode(true);
        const img = fragment.querySelector(".person-image");
        const imageLink = fragment.querySelector(".person-image-link");
        const link = fragment.querySelector(".person-link");

        img.src = person.image || "static/images/people/placeholder.png";
        img.alt = person.alt || person.name || "Person";

        if (imageLink) {
          imageLink.href = person.url || "#";
        }

        if (link) {
          link.textContent = person.name || "Person Name";
          link.href = person.url || "#";
        }

        grid.appendChild(fragment);
      });

      return;
    }

    // more than 4 people
    grid.hidden = true;
    carouselWrapper.hidden = false;
    pagination.hidden = false;

    const pages = chunkArray(people, 4);

    pages.forEach(pagePeople => {
      const page = document.createElement("div");
      page.className = "people-carousel-page";

      pagePeople.forEach(person => {
        const fragment = cardTemplate.content.cloneNode(true);
        const img = fragment.querySelector(".person-image");
        const imageLink = fragment.querySelector(".person-image-link");
        const link = fragment.querySelector(".person-link");

        img.src = person.image || "static/images/people/placeholder.png";
        img.alt = person.alt || person.name || "Person";

        if (imageLink) {
          imageLink.href = person.url || "#";
        }

        if (link) {
          link.textContent = person.name || "Person Name";
          link.href = person.url || "#";
        }

        page.appendChild(fragment);
      });

      track.appendChild(page);
    });

    setupPeopleCarousel(pages.length);
  }

  function renderMoreWorks(content, lab) {
    const items = safeArray(lab.moreWorks);
    const visible = !!content.sections?.moreWorks && items.length > 0;
    showSection("moreWorks", visible);
    if (!visible) return;

    setText("more-works-title", lab.moreWorksTitle || "More Works from Our Lab");

    const container = document.getElementById("works-list");
    const template = document.getElementById("work-item-template");
    if (!container || !template) return;

    container.innerHTML = "";
    items.forEach(work => {
      const fragment = template.content.cloneNode(true);
      const anchor = fragment.querySelector(".work-item");
      const title = fragment.querySelector(".work-title");
      const desc = fragment.querySelector(".work-description");
      const venue = fragment.querySelector(".work-venue");

      anchor.href = work.url || "#";
      title.textContent = work.title || "";
      desc.textContent = work.description || "";
      venue.textContent = work.venue || "";

      container.appendChild(fragment);
    });
  }

  function applyLabBranding(lab) {
    if (lab.lab?.favicon) {
      qsa('link[rel="icon"], link[rel="apple-touch-icon"]').forEach(link => {
        link.setAttribute("href", lab.lab.favicon);
      });
    }
  }

  function isEffectivelyHidden(el) {
    let current = el;
    while (current) {
      if (current.hidden) return true;
      current = current.parentElement;
    }
    return false;
  }

  function initializeCarouselIfReady(selector, options = {}) {
    const el = document.querySelector(selector);
    if (!el) return;
  
    if (isEffectivelyHidden(el)) return;
  
    const items = el.querySelectorAll(".item");
    if (items.length < 2) return;
  
    if (window.bulmaCarousel && typeof window.bulmaCarousel.attach === "function") {
      window.bulmaCarousel.attach(selector, {
        slidesToScroll: 1,
        slidesToShow: 1,
        loop: false,
        infinite: false,
        pagination: true,
        navigation: true,
        ...options
      });
    }
  }

  function reinitializeCarousels() {
    initializeCarouselIfReady("#results-carousel", {
      loop: true,
      infinite: true
    });
  
    initializeCarouselIfReady("#video-carousel", {
      loop: true,
      infinite: true
    });
  }
  
  function showVersionWarning(content) {
    const compatible = Schema.templateVersionsCompatible(
      content.templateVersion,
      CONFIG.templateVersion
    );

    if (compatible) return;

    const main = document.getElementById("main-content");
    if (!main) return;

    const warning = document.createElement("section");
    warning.className = "section";
    warning.innerHTML = `
      <div class="container is-max-desktop">
        <div class="notification is-warning">
          Template version mismatch detected.
          This page content is <strong>${escapeHtml(content.templateVersion || "unknown")}</strong>,
          but the current template expects <strong>${escapeHtml(CONFIG.templateVersion)}</strong>.
          Central manager should require a migration before editing.
        </div>
      </div>
    `;
    main.prepend(warning);
  }

  function getThemeBackgrounds() {
    const rootStyle = getComputedStyle(document.documentElement);

    return {
      white: rootStyle.getPropertyValue('--background-primary').trim() || '#ffffff',
      secondary: rootStyle.getPropertyValue('--background-secondary').trim() || '#f8fafc',
      accent: rootStyle.getPropertyValue('--background-accent').trim() || '#f1f5f9',
      muted: rootStyle.getPropertyValue('--background-muted').trim() || '#f3f4f6',
      highlight: rootStyle.getPropertyValue('--background-highlight').trim() || '#eef6ff',
      accentSoft: rootStyle.getPropertyValue('--background-accent-soft').trim() || '#f1f5f9'
    };
  }

  function resolveBackgroundValue(mode, value, palette) {
    if (mode === 'custom') {
      return value || palette.white;
    }

    if (mode === 'fixed') {
      switch ((value || '').trim()) {
        case 'white':
          return palette.white;
        case 'secondary':
          return palette.secondary;
        case 'accent':
          return palette.accent;
        case 'muted':
          return palette.muted;
        case 'highlight':
          return palette.highlight;
        case 'accent-soft':
          return palette.accentSoft;
        default:
          return palette.white;
      }
    }

    return null;
  }

  function clearSectionBackground(block) {
    if (!block) return;

    block.style.removeProperty('background');
    block.style.removeProperty('background-color');

    const heroBody = block.querySelector('.hero-body');
    if (heroBody) {
      heroBody.style.removeProperty('background');
      heroBody.style.removeProperty('background-color');
    }
  }

  function setSectionBackground(block, color) {
    if (!block || !color) return;

    block.style.setProperty('background', color, 'important');
    block.style.setProperty('background-color', color, 'important');

    const heroBody = block.querySelector('.hero-body');
    if (heroBody) {
      heroBody.style.setProperty('background', color, 'important');
      heroBody.style.setProperty('background-color', color, 'important');
    }
  }

  function getVisibleBackgroundBlocksInDomOrder() {
    return Array.from(
      document.querySelectorAll('#main-content section[data-bg-mode], footer[data-bg-mode]')
    ).filter(el => !el.hidden);
  }

  function applyAlternatingBackgrounds() {
    const palette = getThemeBackgrounds();
    const blocks = getVisibleBackgroundBlocksInDomOrder();

    blocks.forEach(clearSectionBackground);

    let autoIndex = 0;

    blocks.forEach(block => {
      const mode = block.dataset.bgMode;
      const value = block.dataset.bgValue || '';

      if (mode === 'fixed' || mode === 'custom') {
        const resolved = resolveBackgroundValue(mode, value, palette);
        setSectionBackground(block, resolved);
        return;
      }

      if (mode === 'auto') {
        const color = autoIndex % 2 === 0 ? palette.secondary : palette.white;
        setSectionBackground(block, color);
        autoIndex += 1;
      }
    });
  }

  try {
    const [rawContent, rawLab] = await Promise.all([
      fetchJson(CONFIG.contentPath),
      fetchJson(CONFIG.labPath)
    ]);

    const content = Schema.normalizeContent(rawContent);
    const lab = Schema.normalizeLab(rawLab);

    applyLabBranding(lab);
    showVersionWarning(content);
    updateMeta(content, lab);
    renderHero(content);
    renderTeaser(content);
    renderAbstract(content);
    renderFigureCarousel(content);
    renderYoutube(content);
    renderVideoCarousel(content);
    renderPoster(content);
    renderBibtex(content);
    renderPeople(content);
    renderMoreWorks(content, lab);

    requestAnimationFrame(() => {
      reinitializeCarousels();
      applyAlternatingBackgrounds();
    });
  } catch (error) {
    console.error(error);
    const main = document.getElementById("main-content");
    if (main) {
      main.innerHTML = `
        <section class="section">
          <div class="container is-max-desktop">
            <div class="notification is-danger">
              Failed to render page content.<br>
              <strong>${escapeHtml(error.message)}</strong>
            </div>
          </div>
        </section>
      `;
    }
  }
})();
