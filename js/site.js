(function () {
  const INCLUDE_ATTR = 'data-include';

  function enableExecutableScripts(fragment) {
    fragment.querySelectorAll('script').forEach((originalScript) => {
      const executableScript = document.createElement('script');
      Array.from(originalScript.attributes).forEach((attr) => {
        executableScript.setAttribute(attr.name, attr.value);
      });
      executableScript.textContent = originalScript.textContent;
      originalScript.replaceWith(executableScript);
    });
  }

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
          const fragment = template.content;
          enableExecutableScripts(fragment);
          node.replaceWith(fragment);
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

  function initChatbaseTriggers() {
    const triggers = document.querySelectorAll('[data-chatbase-trigger]');
    if (triggers.length === 0) {
      return;
    }

    const activateChat = () => {
      const { chatbase } = window;
      if (typeof chatbase === 'function') {
        try {
          chatbase('open');
          return true;
        } catch (error) {
          console.error('Chatbase open call failed', error);
        }
      }

      const bubbleButton = document.getElementById('chatbase-bubble-button');
      if (bubbleButton instanceof HTMLElement) {
        bubbleButton.click();
        return true;
      }

      return false;
    };

    triggers.forEach((trigger) => {
      trigger.addEventListener('click', (event) => {
        event.preventDefault();
        activateChat();
      });
    });
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
        initChatbaseTriggers();
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
