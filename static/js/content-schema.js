
(function () {
  const DEFAULT_CONTENT = {
    templateVersion: "1.0.0",
    language: "en",
    slug: "",
    pageUrl: "",
    repoUrl: "",
    sections: {
      hero: true,
      moreWorks: false,
      teaser: true,
      abstract: true,
      imageCarousel: true,
      youtube: false,
      videoCarousel: false,
      poster: false,
      bibtex: true,
      people: true
    },
    meta: {
      title: "Academic Project Page",
      description: "",
      keywords: [],
      publishedTime: "",
      publicationYear: "",
      conferenceName: "",
      twitterSite: "",
      twitterCreator: "",
      socialPreviewImage: "",
      themeColor: "#2563eb",
      researchAreas: []
    },
    paper: {
      title: "Academic Project Page",
      venueText: "",
      contributionNote: "",
      abstract: "",
      bibtex: "",
      authors: [],
      links: [],
      teaser: {
        mode: "image",
        image: "",
        video: "",
        caption: ""
      },
      figureCarousel: [],
      youtube: {
        title: "Video Presentation",
        embedUrl: ""
      },
      videoCarousel: {
        title: "Another Carousel",
        items: []
      },
      poster: {
        title: "Poster",
        pdf: ""
      },
      people: []
    }
  };

  const DEFAULT_LAB = {
    templateVersion: "1.0.0",
    lab: {
      name: "RCILab",
      fullName: "RCILab",
      institutionName: "",
      institutionUrl: "",
      githubUrl: "",
      logo: "",
      favicon: "",
      twitter: "",
      socialLinks: []
    },
    moreWorksTitle: "More Works from Our Lab",
    moreWorks: []
  };

  function isObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  function deepMerge(base, override) {
    if (Array.isArray(base)) {
      return Array.isArray(override) ? override : base;
    }
    if (!isObject(base)) {
      return override === undefined ? base : override;
    }

    const result = { ...base };
    const source = isObject(override) ? override : {};

    for (const key of Object.keys(source)) {
      if (isObject(source[key]) && isObject(base[key])) {
        result[key] = deepMerge(base[key], source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }

  function normalizeContent(raw) {
    return deepMerge(DEFAULT_CONTENT, raw || {});
  }

  function normalizeLab(raw) {
    return deepMerge(DEFAULT_LAB, raw || {});
  }

  function templateVersionsCompatible(contentVersion, templateVersion) {
    if (!contentVersion || !templateVersion) return false;
    const a = String(contentVersion).split(".")[0];
    const b = String(templateVersion).split(".")[0];
    return a === b;
  }

  function getIconHtml(iconType) {
    switch (iconType) {
      case "pdf":
        return '<i class="fas fa-file-pdf"></i>';
      case "youtube":
        return '<i class="fab fa-youtube"></i>';
      case "github":
        return '<i class="fab fa-github"></i>';
      case "arxiv":
        return '<i class="ai ai-arxiv"></i>';
      case "supplementary":
        return '<i class="fas fa-file-pdf"></i>';
      case "website":
        return '<i class="fas fa-globe"></i>';
      case "video":
        return '<i class="fas fa-video"></i>';
      default:
        return '<i class="fas fa-link"></i>';
    }
  }

  window.RCIContentSchema = {
    DEFAULT_CONTENT,
    DEFAULT_LAB,
    normalizeContent,
    normalizeLab,
    templateVersionsCompatible,
    getIconHtml
  };
})();
