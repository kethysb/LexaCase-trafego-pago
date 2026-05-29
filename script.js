const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const nav = document.querySelector("[data-nav]");
const lexaPhone = "5519999008650";
const lexaContent = {
  content_name: "LexaCase Americana Shopping - capinhas, películas e acessórios",
  content_category: "phone_accessories",
  content_type: "product_group",
  brand: "LexaCase",
};

window.__trackedMetaEvents = window.__trackedMetaEvents || [];

const cleanText = (value) => (value || "").replace(/\s+/g, " ").trim().slice(0, 120);

const getElementLabel = (element) =>
  cleanText(
    element.dataset.whatsappSource ||
      element.getAttribute("aria-label") ||
      element.innerText ||
      element.textContent ||
      element.href ||
      element.getAttribute("href") ||
      element.tagName,
  );

const getSectionName = (element) => {
  const section = element.closest("section, header, footer");
  return section?.id || section?.getAttribute("aria-label") || section?.className || "page";
};

const trackMetaEvent = (eventName, parameters = {}, custom = false) => {
  const payload = {
    ...lexaContent,
    ...parameters,
  };

  window.__trackedMetaEvents.push({
    eventName,
    custom,
    parameters: payload,
    timestamp: new Date().toISOString(),
  });

  if (typeof fbq === "function") {
    fbq(custom ? "trackCustom" : "track", eventName, payload);
  }
};

trackMetaEvent("ViewContent");

const setHeaderState = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 20);
};

const scrollDepthsTracked = new Set();
const trackScrollDepth = () => {
  const doc = document.documentElement;
  const pageHeight = Math.max(doc.scrollHeight, document.body.scrollHeight);
  const viewportBottom = window.scrollY + window.innerHeight;
  const depth = Math.min(100, Math.round((viewportBottom / pageHeight) * 100));

  [25, 50, 75, 90].forEach((threshold) => {
    if (depth >= threshold && !scrollDepthsTracked.has(threshold)) {
      scrollDepthsTracked.add(threshold);
      trackMetaEvent("ScrollDepth", { scroll_depth: threshold }, true);
    }
  });
};

setHeaderState();
trackScrollDepth();

window.addEventListener(
  "scroll",
  () => {
    setHeaderState();
    trackScrollDepth();
  },
  { passive: true },
);

[15, 30, 60, 120].forEach((seconds) => {
  window.setTimeout(() => {
    trackMetaEvent("TimeOnPage", { seconds_on_page: seconds }, true);
  }, seconds * 1000);
});

menuButton?.addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("menu-open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

nav?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    document.body.classList.remove("menu-open");
    menuButton?.setAttribute("aria-expanded", "false");
  }
});

document.addEventListener("click", (event) => {
  const target = event.target.closest("a, button, [role='button']");
  if (!target) return;

  const href = target.href || target.getAttribute("href") || "";
  const label = getElementLabel(target);
  const isWhatsapp = href.includes(`wa.me/${lexaPhone}`);
  const clickPayload = {
    click_label: label,
    click_url: href,
    click_section: getSectionName(target),
    click_type: isWhatsapp ? "whatsapp" : target.tagName.toLowerCase(),
  };

  trackMetaEvent("SiteClick", clickPayload, true);

  if (isWhatsapp) {
    const eventPayload = {
      ...clickPayload,
      destination_phone: lexaPhone,
      button_source: target.dataset.whatsappSource || label || "whatsapp",
    };

    trackMetaEvent("Lead", {
      ...eventPayload,
      lead_type: "whatsapp",
    });
    trackMetaEvent("WhatsAppClick", eventPayload, true);
  }
});

document.querySelectorAll("video").forEach((video, index) => {
  const progressTracked = new Set();
  const videoName = cleanText(video.getAttribute("aria-label") || video.currentSrc || `video-${index + 1}`);
  const baseVideoPayload = {
    video_name: videoName,
    video_index: index + 1,
  };

  video.addEventListener("play", () => {
    trackMetaEvent("VideoPlay", baseVideoPayload, true);
  });

  video.addEventListener("timeupdate", () => {
    if (!Number.isFinite(video.duration) || video.duration <= 0) return;

    const progress = Math.round((video.currentTime / video.duration) * 100);
    [25, 50, 75].forEach((threshold) => {
      if (progress >= threshold && !progressTracked.has(threshold)) {
        progressTracked.add(threshold);
        trackMetaEvent("VideoProgress", {
          ...baseVideoPayload,
          video_progress: threshold,
        }, true);
      }
    });
  });

  video.addEventListener("ended", () => {
    trackMetaEvent("VideoComplete", baseVideoPayload, true);
  });
});

const reveals = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 },
  );

  reveals.forEach((item) => observer.observe(item));
} else {
  reveals.forEach((item) => item.classList.add("is-visible"));
}
