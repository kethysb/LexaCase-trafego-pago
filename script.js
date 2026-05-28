const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const nav = document.querySelector("[data-nav]");
const lexaContent = {
  content_name: "LexaCase Americana Shopping - capinhas, películas e acessórios",
  content_category: "phone_accessories",
  content_type: "product_group",
  brand: "LexaCase",
};
const lexaPhone = "5519999008650";

const trackMetaEvent = (eventName, parameters, custom = false) => {
  if (typeof fbq !== "function") {
    return;
  }

  fbq(custom ? "trackCustom" : "track", eventName, parameters);
};

trackMetaEvent("ViewContent", lexaContent);

const setHeaderState = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 20);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

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

document.querySelectorAll(`a[href^="https://wa.me/${lexaPhone}"]`).forEach((link) => {
  link.addEventListener("click", () => {
    const buttonSource = link.dataset.whatsappSource || "sem-origem";
    const eventPayload = {
      ...lexaContent,
      destination_phone: lexaPhone,
      button_source: buttonSource,
    };

    trackMetaEvent("Lead", {
      ...eventPayload,
      lead_type: "whatsapp",
    });
    trackMetaEvent("WhatsAppClick", eventPayload, true);
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
