(function () {
  const INCLUDE_ATTR = 'data-include';

  async function loadIncludes() {
    const includeNodes = Array.from(document.querySelectorAll(`[${INCLUDE_ATTR}]`));

    if (includeNodes.length === 0) {
      return;
    }

    await Promise.all(
      includeNodes.map(async (node) => {
        const src = node.getAttribute(INCLUDE_ATTR);
        if (!src) {
          return;
        }

        try {
          const response = await fetch(src, { cache: 'no-cache' });
          if (!response.ok) {
            throw new Error(`Failed to fetch include: ${response.status}`);
          }

          const markup = await response.text();
          const template = document.createElement('template');
          template.innerHTML = markup.trim();
          node.replaceWith(template.content.cloneNode(true));
        } catch (error) {
          console.error(`Include load error for ${src}`, error);
        }
      })
    );
  }

  function configurePageAnchors() {
    const isHome = document.body.dataset.navCurrent === 'home';
    document.querySelectorAll('.site-nav__link[data-home-href]').forEach((link) => {
      const targetHref = isHome ? link.dataset.homeHref : link.dataset.defaultHref;
      if (targetHref) {
        link.setAttribute('href', targetHref);
      }
    });
  }

  function setActiveNavLink() {
    const current = document.body.dataset.navCurrent;
    if (!current) {
      return;
    }

    document.querySelectorAll('.site-nav__link[aria-current="page"]').forEach((link) => {
      link.removeAttribute('aria-current');
    });

    const activeLink = document.querySelector(`.site-nav__link[data-nav-id="${current}"]`);
    if (activeLink) {
      activeLink.setAttribute('aria-current', 'page');
    }
  }

  function initNavToggle() {
    const navToggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.site-nav');

    if (!nav || !navToggle) {
      return;
    }

    const closeNav = () => {
      nav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    };

    navToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    nav.addEventListener('click', (event) => {
      if (event.target instanceof HTMLElement && event.target.tagName === 'A') {
        closeNav();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 720) {
        closeNav();
      }
    });
  }

  function updateYear() {
    const yearEl = document.getElementById('year');
    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }
  }

  function init() {
    loadIncludes()
      .catch((error) => {
        console.error('Error loading includes', error);
      })
      .finally(() => {
        configurePageAnchors();
        initNavToggle();
        setActiveNavLink();
        updateYear();
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
