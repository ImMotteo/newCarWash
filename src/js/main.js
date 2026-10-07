/* =========================================================
   Новая Мойка — основной скрипт
   ========================================================= */
(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  function createFocusTrap(container) {
    const FOCUSABLE = [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      '[tabindex]:not([tabindex="-1"])',
    ].join(",");

    let lastActive = null;

    const getFocusable = () =>
      $$(FOCUSABLE, container).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );

    function onKeydown(e) {
      if (e.key !== "Tab") return;
      const list = getFocusable();
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    return {
      activate() {
        lastActive = document.activeElement;
        container.addEventListener("keydown", onKeydown);
        const list = getFocusable();
        if (list.length) list[0].focus();
      },
      deactivate() {
        container.removeEventListener("keydown", onKeydown);
        if (lastActive && typeof lastActive.focus === "function") {
          lastActive.focus();
        }
      },
    };
  }

  function formatTime(hours) {
    if (hours < 1) return Math.round(hours * 60) + " мин";
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (m === 0) return h + " ч";
    return h + " ч " + m + " мин";
  }

  function formatTimeRange(min, max) {
    if (Math.abs(min - max) < 0.01) return formatTime(min);
    return formatTime(min) + "–" + formatTime(max);
  }

  /* ------------------------------------------------------------------
     Логотип при скролле
  ------------------------------------------------------------------ */
  const logo = $(".header__logo img");
  const welcome = $(".welcome");
  const header = $("header");

  const LOGO_MAX = 280;
  const LOGO_MIN = 200;
  const LOGO_LIMIT = 200;
  const isDesktop = () => window.innerWidth > 992;

  let headerTicking = false;

  function updateHeader() {
    if (isDesktop() && logo) {
      const y = window.scrollY || window.pageYOffset;
      const progress = Math.min(y / LOGO_LIMIT, 1);
      logo.style.width = LOGO_MAX - progress * (LOGO_MAX - LOGO_MIN) + "px";
    } else if (logo) {
      logo.style.width = "";
    }

    if (welcome && header) {
      welcome.style.paddingTop = header.offsetHeight + "px";
    }
  }

  window.addEventListener("scroll", () => {
    if (!headerTicking) {
      window.requestAnimationFrame(() => {
        updateHeader();
        headerTicking = false;
      });
      headerTicking = true;
    }
  });
  window.addEventListener("resize", updateHeader);
  updateHeader();

  /* ------------------------------------------------------------------
     Бургер-меню
  ------------------------------------------------------------------ */
  const burger = $(".burger");
  const nav = $(".nav");

  if (burger && nav) {
    const closeMenu = () => {
      nav.classList.remove("nav--open");
      burger.classList.remove("burger--active");
      burger.setAttribute("aria-expanded", "false");
    };

    burger.addEventListener("click", () => {
      const open = nav.classList.toggle("nav--open");
      burger.classList.toggle("burger--active");
      burger.setAttribute("aria-expanded", String(open));
    });

    $$("a", nav).forEach((link) => link.addEventListener("click", closeMenu));

    document.addEventListener("click", (e) => {
      if (!nav.contains(e.target) && !burger.contains(e.target)) closeMenu();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ------------------------------------------------------------------
     Слайдер отзывов
  ------------------------------------------------------------------ */
  function initSlider(track, prevBtn, nextBtn) {
    if (!track) return;

    const getStep = () => {
      const first = track.firstElementChild;
      if (!first) return 0;
      const styles = getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap) || 16;
      return first.offsetWidth + gap;
    };

    const slide = (dir) => {
      track.scrollBy({ left: getStep() * (dir === "next" ? 1 : -1), behavior: "smooth" });
    };

    if (prevBtn) prevBtn.addEventListener("click", () => slide("prev"));
    if (nextBtn) nextBtn.addEventListener("click", () => slide("next"));

    const updateButtons = () => {
      const max = track.scrollWidth - track.clientWidth;
      if (prevBtn) prevBtn.style.opacity = track.scrollLeft <= 2 ? "0.35" : "1";
      if (nextBtn) nextBtn.style.opacity = track.scrollLeft >= max - 2 ? "0.35" : "1";
    };

    track.addEventListener("scroll", updateButtons, { passive: true });
    window.addEventListener("resize", updateButtons);
    setTimeout(updateButtons, 100);
  }

  initSlider(
    $("#reviews [data-slider-track]"),
    $(".reviews__arrow--prev"),
    $(".reviews__arrow--next")
  );

  /* ------------------------------------------------------------------
     Слайдер работ и табы
  ------------------------------------------------------------------ */
  (function initWorksSlider() {
    const worksSection = $("#works");
    if (!worksSection) return;

    const prevBtn = $(".works__arrow--prev", worksSection);
    const nextBtn = $(".works__arrow--next", worksSection);
    if (!prevBtn || !nextBtn) return;

    const tracks = $$(".works__track", worksSection);

    const getActiveTrack = () => {
      const panel = $(".works__panel.is-active", worksSection);
      return panel ? $("[data-slider-track]", panel) : null;
    };

    const getStep = (track) => {
      const first = track.firstElementChild;
      if (!first) return 0;
      const styles = getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap) || 16;
      return first.offsetWidth + gap;
    };

    const slide = (dir) => {
      const track = getActiveTrack();
      if (!track) return;
      track.scrollBy({ left: getStep(track) * (dir === "next" ? 1 : -1), behavior: "smooth" });
    };

    const updateButtons = () => {
      const track = getActiveTrack();
      if (!track) return;
      const max = track.scrollWidth - track.clientWidth;
      prevBtn.style.opacity = track.scrollLeft <= 2 ? "0.35" : "1";
      nextBtn.style.opacity = track.scrollLeft >= max - 2 ? "0.35" : "1";
    };

    prevBtn.addEventListener("click", () => slide("prev"));
    nextBtn.addEventListener("click", () => slide("next"));

    tracks.forEach((track) => {
      track.addEventListener("scroll", updateButtons, { passive: true });
    });
    window.addEventListener("resize", updateButtons);

    const tabs = $$(".works__tab", worksSection);
    const panels = $$(".works__panel", worksSection);

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const key = tab.getAttribute("data-works-tab");
        if (!key) return;

        tabs.forEach((t) => {
          const active = t === tab;
          t.classList.toggle("is-active", active);
          t.setAttribute("aria-selected", String(active));
        });

        panels.forEach((p) => {
          const active = p.getAttribute("data-works-panel") === key;
          p.classList.toggle("is-active", active);
          if (active) p.removeAttribute("hidden");
          else p.setAttribute("hidden", "");
        });

        const track = getActiveTrack();
        if (track) track.scrollTo({ left: 0, behavior: "auto" });
        setTimeout(updateButtons, 30);
      });
    });

    setTimeout(updateButtons, 100);
  })();

  /* ------------------------------------------------------------------
     Лайтбокс: фото + локальное видео + iframe
  ------------------------------------------------------------------ */
  const lightbox = $("#lightbox");
  const lightboxImg = $(".lightbox__img", lightbox);
  const lightboxVideo = $(".lightbox__video", lightbox);
  const lightboxIframe = $(".lightbox__iframe", lightbox);
  const lightboxClose = $(".lightbox__close", lightbox);
  const lightboxPrev = $(".lightbox__nav--prev", lightbox);
  const lightboxNext = $(".lightbox__nav--next", lightbox);
  const lightboxCounter = $("#lightboxCounter");
  const lightboxTrap = lightbox ? createFocusTrap(lightbox) : null;

  const lightboxTriggers = $$("[data-lightbox], .work, .gallery__item");

  /** Достаёт источник и тип контента для лайтбокса. */
  function resolveLightboxItem(el) {
    const type = (el.getAttribute("data-lightbox-type") || "image").toLowerCase();
    const img = $("img", el);

    let src = el.getAttribute("data-lightbox-src");
    let poster = el.getAttribute("data-lightbox-poster") || img?.getAttribute("src") || "";

    if (!src) {
      // Фото: может быть либо data-lightbox, либо src внутри img
      src = el.getAttribute("data-lightbox") || img?.getAttribute("src") || "";
    }

    return {
      trigger: el,
      type, // "image" | "video" | "iframe"
      src,
      poster,
      alt: img?.alt || "",
    };
  }

  /** Группирует триггеры по [data-lightbox-group] или по section[id]. */
  const lightboxGroups = new Map();

  lightboxTriggers.forEach((el) => {
    const groupEl = el.closest("[data-lightbox-group]");
    const section = el.closest("section[id]");
    let key;
    if (groupEl) key = groupEl.getAttribute("data-lightbox-group");
    else if (section) key = section.id;
    else key = "__global__";

    if (!lightboxGroups.has(key)) lightboxGroups.set(key, []);
    lightboxGroups.get(key).push(resolveLightboxItem(el));
  });

  let currentGroupKey = null;
  let currentIndex = -1;

  const getGroup = () => (currentGroupKey ? lightboxGroups.get(currentGroupKey) || [] : []);
  const getGroupLength = () => getGroup().length;

  /** Скрывает и очищает все элементы лайтбокса, чтобы остановить видео и выгрузить iframe. */
  function resetLightboxStage() {
    if (lightboxImg) {
      lightboxImg.removeAttribute("src");
      lightboxImg.alt = "";
      lightboxImg.style.display = "none";
    }
    if (lightboxVideo) {
      try {
        lightboxVideo.pause();
      } catch (e) {}
      lightboxVideo.removeAttribute("src");
      lightboxVideo.removeAttribute("poster");
      try {
        lightboxVideo.load();
      } catch (e) {}
      lightboxVideo.style.display = "none";
    }
    if (lightboxIframe) {
      lightboxIframe.removeAttribute("src");
      lightboxIframe.style.display = "none";
    }
  }

  function renderLightbox() {
    if (currentIndex < 0) return;
    const group = getGroup();
    const item = group[currentIndex];
    if (!item) return;

    resetLightboxStage();

    if (item.type === "video" && lightboxVideo) {
      lightboxVideo.src = item.src;
      if (item.poster) lightboxVideo.poster = item.poster;
      lightboxVideo.style.display = "block";
    } else if (item.type === "iframe" && lightboxIframe) {
      lightboxIframe.src = item.src;
      lightboxIframe.style.display = "block";
    } else if (lightboxImg) {
      lightboxImg.src = item.src;
      lightboxImg.alt = item.alt;
      lightboxImg.style.display = "block";
    }

    if (lightboxCounter) {
      lightboxCounter.textContent =
        group.length > 1 ? `${currentIndex + 1} / ${group.length}` : "";
    }

    const single = group.length <= 1;
    if (lightboxPrev) lightboxPrev.style.display = single ? "none" : "flex";
    if (lightboxNext) lightboxNext.style.display = single ? "none" : "flex";
  }

  function lockScroll() {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
  }

  function unlockScroll() {
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    document.body.style.touchAction = "";
  }

  function openLightbox(groupKey, index) {
    const group = lightboxGroups.get(groupKey);
    if (!lightbox || !group || index < 0 || index >= group.length) return;
    currentGroupKey = groupKey;
    currentIndex = index;
    renderLightbox();
    lightbox.classList.add("lightbox--open");
    lightbox.setAttribute("aria-hidden", "false");
    lockScroll();
    lightboxTrap?.activate();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("lightbox--open");
    lightbox.setAttribute("aria-hidden", "true");
    resetLightboxStage();
    currentGroupKey = null;
    currentIndex = -1;
    unlockScroll();
    lightboxTrap?.deactivate();
  }

  const showPrev = () => {
    const len = getGroupLength();
    if (len <= 1) return;
    currentIndex = (currentIndex - 1 + len) % len;
    renderLightbox();
  };

  const showNext = () => {
    const len = getGroupLength();
    if (len <= 1) return;
    currentIndex = (currentIndex + 1) % len;
    renderLightbox();
  };

  lightboxGroups.forEach((items, groupKey) => {
    items.forEach((item, index) => {
      item.trigger.addEventListener("click", () => openLightbox(groupKey, index));
    });
  });

  lightboxClose?.addEventListener("click", closeLightbox);
  lightboxPrev?.addEventListener("click", (e) => {
    e.stopPropagation();
    showPrev();
  });
  lightboxNext?.addEventListener("click", (e) => {
    e.stopPropagation();
    showNext();
  });

  lightbox?.addEventListener("click", (e) => {
    // Не закрываем по клику внутри stage или на видео
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox?.classList.contains("lightbox--open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showPrev();
    if (e.key === "ArrowRight") showNext();
  });

  let touchStartX = 0;
  let touchStartY = 0;
  lightbox?.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    },
    { passive: true }
  );
  lightbox?.addEventListener(
    "touchend",
    (e) => {
      if (getGroupLength() <= 1) return;
      // Не свайпаем, если открыт iframe (в нём свой плеер)
      const active = $('.lightbox__iframe[style*="block"]', lightbox);
      if (active) return;
      const dx = e.changedTouches[0].screenX - touchStartX;
      const dy = e.changedTouches[0].screenY - touchStartY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) showNext();
        else showPrev();
      }
    },
    { passive: true }
  );

  /* ------------------------------------------------------------------
     Модалка услуги
  ------------------------------------------------------------------ */
  const SERVICES = {
    "wash-2phase": {
      title: "Двухфазная мойка",
      price: "1 200 — 2 000 ₽",
      desc: "Классика, с которой начинается любой уход. Наносим пену в два этапа: сначала активную — она размягчает грязь, потом мягкую — смывает остатки и не оставляет разводов. Кузов сушим турбиной, резину черним, стёкла протираем до идеала.",
      list: [
        "Мойка кузова в два этапа",
        "Сушка турбиной",
        "Очистка и чернение резины",
        "Протирка стёкол и зеркал",
        "Лёгкая уборка ковриков",
      ],
    },
    "wash-premium": {
      title: "Премиум мойка",
      price: "от 5 000 ₽",
      desc: "Расширенный комплекс для тех, кто хочет после мойки сесть в чистую машину. Помимо полного цикла по кузову делаем уборку салона, протираем панель, ароматизируем и обновляем вид подкапотного пространства.",
      list: [
        "Всё из двухфазной мойки",
        "Уборка салона и багажника",
        "Протирка пластика и панели",
        "Чистка стёкол изнутри",
        "Ароматизация салона",
        "Уход за подкапотным пространством",
      ],
    },
    "wash-luxe": {
      title: "Двухфазный Люкс",
      price: "от 2 400 ₽",
      desc: "Мойка с усиленным уходом за лакокрасочным покрытием. После двойного нанесения пены наносим жидкий воск — он создаёт гидрофобный слой, с которым машина дольше остаётся чистой.",
      list: [
        "Двойное нанесение пены",
        "Глубокая очистка ЛКП от налёта",
        "Жидкий воск с гидрофобным эффектом",
        "Сушка кузова турбиной",
        "Чернение резины и подкрылков",
      ],
    },
    "body-chem": {
      title: "Химчистка кузова",
      price: "от 4 500 ₽",
      desc: "Убираем то, что обычная мойка не берёт: битум, следы реагентов, налёт от тополиных почек и следы от насекомых. Работаем по отдельным зонам, чтобы не повредить лак.",
      list: [
        "Удаление битумных пятен",
        "Очистка от следов реагентов",
        "Удаление следов насекомых и смолы",
        "Мягкая глиняная обработка",
        "Защитный воск по финишу",
      ],
    },
    "interior-light": {
      title: "Лёгкая химчистка салона",
      price: "от 4 500 ₽",
      desc: "Экспресс-вариант для тех, у кого нет времени оставлять машину на весь день. Проходим по основным зонам: сиденья, ковролин, пластик, стёкла. Освежаем, но без полной разборки.",
      list: [
        "Сухая и влажная уборка сидений",
        "Чистка ковролина и ковриков",
        "Протирка пластика и панели",
        "Чистка стёкол изнутри",
        "Ароматизация салона",
      ],
    },
    "interior-full": {
      title: "Химчистка салона",
      price: "от 17 000 ₽",
      desc: "Полный цикл с разборкой салона. Снимаем сиденья, чистим каждую щель, работаем с тканевой и кожаной обивкой отдельными составами. Возвращаем салону вид, близкий к заводскому.",
      list: [
        "Демонтаж и монтаж сидений",
        "Глубокая чистка ткани и кожи",
        "Очистка потолка и стоек",
        "Уход за пластиком и кожей",
        "Устранение запахов озоном",
        "Сушка и финишная сборка",
      ],
    },
    "glass-polish": {
      title: "Полировка стёкол",
      price: "от 9 000 ₽",
      desc: "Убираем водный камень, мелкие царапины и потёртости от щёток. После полировки стёкла становятся прозрачнее, а в дождь вода скатывается быстрее — обзор заметно улучшается.",
      list: [
        "Удаление водного камня",
        "Полировка мелких царапин",
        "Обработка боковых и задних стёкол",
        "Гидрофобное покрытие",
        "Финишная очистка",
      ],
    },
    "polish-ceramic": {
      title: "Полировка + керамика",
      price: "от 23 000 ₽",
      desc: "Комплекс для тех, кто хочет, чтобы машина долго выглядела как новая. Сначала убираем царапины и голограммы абразивной полировкой, потом наносим керамическое покрытие — оно защищает ЛКП от реагентов, ультрафиолета и мелких сколов.",
      list: [
        "Абразивная полировка ЛКП",
        "Удаление голограмм и царапин",
        "Обезжиривание поверхности",
        "Нанесение керамики (2–3 года)",
        "Полировка стёкол и фар",
        "Финишный осмотр под лампой",
      ],
    },
    "suspension-wash": {
      title: "Мойка подвески",
      price: "от 3 500 ₽",
      desc: "Очищаем днище, арки и скрытые полости от грязи и реагентов. Процедура полезная не только для внешнего вида, но и для металла — соль и грязь разъедают кузов снизу, если их вовремя не смывать.",
      list: [
        "Мойка арок и подкрылков",
        "Очистка днища под давлением",
        "Промывка скрытых полостей",
        "Обработка антикоррозийным составом",
      ],
    },
    "pre-sale": {
      title: "Предпродажная подготовка",
      price: "от 6 000 ₽",
      desc: "Приводим машину в товарный вид перед показом покупателю. Убираем следы эксплуатации, устраняем запахи, полируем мелкие царапины. Задача — чтобы покупатель увидел ухоженный автомобиль, а вы получили цену без торга.",
      list: [
        "Комплексная мойка кузова и салона",
        "Полировка мелких царапин",
        "Химчистка салона",
        "Устранение запахов",
        "Чернение резины и пластика",
        "Финишная фотосессия (по желанию)",
      ],
    },
    wrap: {
      title: "Оклейка плёнкой",
      price: "по договорённости",
      desc: "Два сценария: защита заводского ЛКП от сколов и царапин или полная смена цвета. Работаем с плёнками известных брендов, даём гарантию на поклейку. Стоимость зависит от площади и сложности кузова.",
      list: [
        "Антигравийная защита кузова",
        "Полная или частичная оклейка",
        "Смена цвета автомобиля",
        "Работа с плёнками премиум-брендов",
        "Гарантия на поклейку",
      ],
    },
    soundproof: {
      title: "Шумоизоляция",
      price: "от 30 000 ₽",
      desc: "Снижаем уровень шума, вибрации и гула в салоне. Работаем по зонам: двери, пол, арки, багажник, крыша. Комфортнее разговаривать, слушать музыку и просто ехать — особенно на трассе.",
      list: [
        "Шумоизоляция дверей",
        "Обработка пола и арок",
        "Изоляция багажника",
        "Шумоизоляция крыши",
        "Материалы проверенных брендов",
      ],
    },
  };

  const serviceModal = $("#serviceModal");
  const serviceModalImg = $("#serviceModalImg");
  const serviceModalTitle = $("#serviceModalTitle");
  const serviceModalDesc = $("#serviceModalDesc");
  const serviceModalList = $("#serviceModalList");
  const serviceModalPrice = $("#serviceModalPrice");
  const serviceModalTrap = serviceModal ? createFocusTrap(serviceModal) : null;

  function getCardBgUrl(card) {
    const bg = $(".service-item__bg", card);
    if (!bg) return "";
    const style = bg.getAttribute("style") || "";
    const match = style.match(/url\(["']?([^"')]+)["']?\)/);
    if (match) return match[1];
    const computed = getComputedStyle(bg).backgroundImage;
    const computedMatch = computed.match(/url\(["']?([^"')]+)["']?\)/);
    return computedMatch ? computedMatch[1] : "";
  }

  function openServiceModal(key, triggerCard) {
    const data = SERVICES[key];
    if (!data || !serviceModal) return;

    const imgUrl = triggerCard ? getCardBgUrl(triggerCard) : "";
    if (imgUrl) {
      serviceModalImg.src = imgUrl;
      serviceModalImg.alt = data.title;
    } else {
      serviceModalImg.removeAttribute("src");
      serviceModalImg.alt = "";
    }

    serviceModalTitle.textContent = data.title;
    serviceModalDesc.textContent = data.desc;
    serviceModalPrice.textContent = data.price;
    serviceModalList.innerHTML = data.list.map((item) => `<li>${item}</li>`).join("");

    serviceModal.classList.add("service-modal--open");
    serviceModal.setAttribute("aria-hidden", "false");
    lockScroll();
    serviceModalTrap?.activate();
  }

  function closeServiceModal() {
    if (!serviceModal) return;
    serviceModal.classList.remove("service-modal--open");
    serviceModal.setAttribute("aria-hidden", "true");
    serviceModalImg.removeAttribute("src");
    unlockScroll();
    serviceModalTrap?.deactivate();
  }

  $$(".service-item").forEach((card) => {
    card.addEventListener("click", () => {
      const key = card.getAttribute("data-service");
      if (key) openServiceModal(key, card);
    });
  });

  $$("[data-close-modal]").forEach((el) => {
    el.addEventListener("click", closeServiceModal);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeServiceModal();
  });

  /* ------------------------------------------------------------------
     Кнопка «Смотреть все» для услуг
  ------------------------------------------------------------------ */
  const servicesGrid = $("#servicesGrid");
  const servicesToggle = $("#servicesToggle");

  if (servicesGrid && servicesToggle) {
    servicesToggle.addEventListener("click", () => {
      const expanded = servicesGrid.classList.toggle("is-expanded");
      servicesToggle.textContent = expanded ? "Свернуть" : "Смотреть все";

      if (!expanded) {
        const section = $("#services");
        if (section) {
          const top = section.getBoundingClientRect().top + window.pageYOffset - 80;
          window.scrollTo({ top, behavior: "smooth" });
        }
      }
    });
  }

  /* ------------------------------------------------------------------
     Анимация появления при скролле
  ------------------------------------------------------------------ */
  const animated = $$("[data-animate]");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    animated.forEach((el) => io.observe(el));
  } else {
    animated.forEach((el) => el.classList.add("is-visible"));
  }

  /* ------------------------------------------------------------------
     Подсветка активного пункта меню
  ------------------------------------------------------------------ */
  const sections = $$("section[id]");
  const navLinks = $$(".nav__list a");

  if ("IntersectionObserver" in window && sections.length && navLinks.length) {
    const navIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach((l) =>
              l.classList.toggle("active", l.getAttribute("href") === "#" + id)
            );
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => navIO.observe(s));
  }

  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ------------------------------------------------------------------
     Cookie-баннер + Яндекс.Метрика
  ------------------------------------------------------------------ */
  (function initMetrika() {
    const METRIKA_ID = "00000000";
    const STORAGE_KEY = "cookie-consent";
    const banner = $("#cookieBanner");

    let loaded = false;

    function loadMetrika() {
      if (loaded) return;
      if (!METRIKA_ID || METRIKA_ID === "00000000") return;
      if (window.ym && typeof window.ym === "function" && window.ym.a) return;

      (function (m, e, t, r, i, k, a) {
        m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
        m[i].l = 1 * new Date();
        for (let j = 0; j < document.scripts.length; j++) {
          if (document.scripts[j].src === r) return;
        }
        k = e.createElement(t);
        a = e.getElementsByTagName(t)[0];
        k.async = 1;
        k.src = r;
        a.parentNode.insertBefore(k, a);
      })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

      window.ym(METRIKA_ID, "init", {
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: true,
      });

      loaded = true;
    }

    function setConsent(value) {
      try { localStorage.setItem(STORAGE_KEY, value); } catch (e) {}
      if (banner) banner.hidden = true;
      if (value === "accepted") loadMetrika();
    }

    let stored = null;
    try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) {}

    if (stored === "accepted") {
      loadMetrika();
    } else if (!stored) {
      if (banner) banner.hidden = false;
    }

    banner?.querySelector("[data-cookie-accept]")?.addEventListener("click", () => setConsent("accepted"));
    banner?.querySelector("[data-cookie-reject]")?.addEventListener("click", () => setConsent("rejected"));
  })();

  /* ------------------------------------------------------------------
     Калькулятор
  ------------------------------------------------------------------ */
  (function initCalculator() {
    const root = $("#calcGroups");
    const categorySelect = $("#calcCategory");
    const totalEl = $("#calcTotal");
    const timeEl = $("#calcTime");
    if (!root || !categorySelect || !totalEl) return;

    const GROUPS = [
      {
        id: "primary",
        title: "Основные услуги",
        type: "primary",
        items: [
          { name: "Двухфазная мойка кузова", prices: [1200, 1400, 1600], desc: "Ручная мойка шампунем, сушка, ковры, продувка", timeMin: 0.67, timeMax: 0.67 },
          { name: "Двухфазный Люкс", prices: [2400, 2600, 2800], desc: "Ручная мойка шампунем, сушка, ковры, пылесос салона, влажная уборка Квик детейлером, протирка стёкол, продувка", timeMin: 1.5, timeMax: 2 },
          { name: "Премиум мойка", prices: [5000, 5500, 6000], desc: "Ручная мойка шампунем, обезжиривание, кварцевое покрытие, уборка салона, уборка багажника, чернение, чистка дисков IRON OFF", timeMin: 2, timeMax: 2.5 },
          { name: "Трёхфазная мойка", prices: [2000, 2200, 2500], desc: "Ручная мойка с шампунем, обезжиривание, воск", timeMin: 1, timeMax: 1.2 },
          { name: "Русский Стандарт", prices: [2000, 2200, 2400], desc: "Ручная мойка с шампунем, обезжиривание, чернение, пылесос водительского места", timeMin: 0.67, timeMax: 1 },
          { name: "Химчистка кузова (Iron OFF)", prices: [4000, 4500, 5500], desc: "Ручная мойка с шампунем, обезжиривание, IRON OFF, глиняная обработка", timeMin: 1.5, timeMax: 1.5 },
          { name: "Твёрдый воск", prices: [3800, 4200, 4800], desc: "Ручная мойка с шампунем, обезжиривание, твёрдый воск", timeMin: 1.5, timeMax: 2 },
          { name: "Мойка двигателя с диэлектриком", prices: [2500, 2500, 2500], timeMin: 1, timeMax: 1 },
        ],
      },
      {
        id: "extra",
        title: "Доп. услуги",
        type: "collapsible",
        items: [
          { name: "Обезжиривание кузова", prices: [800, 900, 1000] },
          { name: "Уборка металлических креплений (IRON OFF)", prices: [1500, 1700, 1900] },
          { name: "Чистка дисков (1 шт., IRON OFF)", prices: [350, 350, 350] },
          { name: "Кондиционер кожи", prices: [1000, 1200, 1400] },
          { name: "Пылесос салона", prices: [500, 600, 700] },
          { name: "Очистка стёкол", prices: [500, 600, 700] },
          { name: "Уборка пластика", prices: [500, 600, 700] },
          { name: "Уборка багажника", prices: [500, 600, 700] },
          { name: "Мойка ковров", prices: [200, 200, 200] },
          { name: "Чернение", prices: [300, 300, 400] },
          { name: "Убрать клей / скотч", prices: [300, 300, 300], prefix: "от " },
        ],
      },
      {
        id: "interior",
        title: "Химчистка",
        type: "collapsible",
        items: [
          { name: "Химчистка салона", prices: [17000, 19000, 21000], prefix: "от " },
          { name: "Лёгкая химчистка", prices: [6000, 7000, 8000] },
          { name: "Химчистка 1 сиденья — кожа", prices: [1500, 1600, 1700] },
          { name: "Химчистка 1 сиденья — ткань", prices: [1800, 2000, 2200] },
          { name: "Химчистка заднего дивана", prices: [3000, 3500, 4000] },
          { name: "Химчистка пола", prices: [5000, 5500, 6000] },
          { name: "Химчистка консоли", prices: [3000, 3500, 4000] },
          { name: "Химчистка багажника", prices: [2000, 2200, 2400] },
          { name: "Химчистка потолка", prices: [5000, 5500, 6000] },
          { name: "Химчистка дверной карты (1 шт.)", prices: [700, 800, 900] },
        ],
      },
      {
        id: "polish",
        title: "Полировка",
        type: "collapsible",
        items: [
          { name: "Восстановительная полировка + керамика", prices: [23000, 25000, 28000], prefix: "от " },
          { name: "Лёгкая полировка кузова", prices: [8000, 9000, 10000] },
          { name: "Полировка царапины", prices: [1500, 1500, 1500] },
          { name: "Полировка фар (1 шт.)", prices: [1000, 1000, 1000] },
          { name: "Полировка 1 элемента", prices: [2000, 2000, 2000], prefix: "от " },
        ],
      },
      {
        id: "protection",
        title: "Защитные покрытия",
        type: "collapsible",
        items: [
          { name: "Анти-дождь", prices: [1500, 1500, 1700] },
          { name: "Анти-дождь 2x компонентный", prices: [3000, 3000, 3500] },
          { name: "Кварцевое покрытие", prices: [1000, 1100, 1200] },
          { name: "Керамика", prices: [7000, 8000, 9000] },
          { name: "Жидкое стекло", prices: [5000, 6000, 7000] },
          { name: "Воск обливочный", prices: [300, 400, 500] },
        ],
      },
    ];

    const itemKey = (gi, ii) => `g${gi}-i${ii}`;
    const getCatIndex = () => Number(categorySelect.value) - 1;

    function parseKey(key) {
      const m = key.match(/g(\d+)-i(\d+)/);
      if (!m) return null;
      return { gi: Number(m[1]), ii: Number(m[2]) };
    }

    function renderItem(gi, ii, item) {
      const key = itemKey(gi, ii);
      const prefix = item.prefix || "";
      const initialPrice = prefix + item.prices[0].toLocaleString("ru-RU") + " ₽";

      const infoBtn = item.desc
        ? `<button class="calc__info" type="button" aria-label="Подробнее об услуге">
             ?
             <span class="calc__tooltip" role="tooltip">${item.desc}</span>
           </button>`
        : "";

      const timeHTML = item.timeMin !== undefined
        ? `<span class="calc__item-time">${formatTimeRange(item.timeMin, item.timeMax)}</span>`
        : "";

      return `
        <label class="calc__item">
          <input type="checkbox" value="${key}" />
          <span class="calc__item-name">
            ${item.name}
            ${infoBtn}
          </span>
          <span class="calc__item-price">
            <span class="calc__item-price-value" data-price-for="${key}">${initialPrice}</span>
            ${timeHTML}
          </span>
        </label>
      `;
    }

    function renderPrimaryGroup(group, groupIndex) {
      const items = group.items.map((item, ii) => renderItem(groupIndex, ii, item)).join("");
      return `
        <div class="calc__group calc__group--primary" data-group-id="${group.id}">
          <h3 class="calc__group-title">${group.title}</h3>
          <div class="calc__group-items">${items}</div>
        </div>
      `;
    }

    function renderCollapsibleGroup(group, groupIndex) {
      const items = group.items.map((item, ii) => renderItem(groupIndex, ii, item)).join("");
      return `
        <div class="calc__group calc__group--collapsible" data-group-id="${group.id}">
          <button class="calc__group-toggle" type="button" aria-expanded="false">
            <span class="calc__group-title">${group.title}</span>
            <svg class="calc__group-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <div class="calc__group-items-wrap">
            <div class="calc__group-items">${items}</div>
          </div>
        </div>
      `;
    }

    function updateTotal() {
      const catIdx = getCatIndex();
      let sum = 0;
      let timeMin = 0;
      let timeMax = 0;
      let hasTime = false;

      root.querySelectorAll('input[type="checkbox"]:checked').forEach((input) => {
        const parsed = parseKey(input.value);
        if (!parsed) return;
        const item = GROUPS[parsed.gi]?.items[parsed.ii];
        if (!item) return;
        sum += item.prices[catIdx];
        if (item.timeMin !== undefined) {
          timeMin += item.timeMin;
          timeMax += item.timeMax;
          hasTime = true;
        }
      });

      totalEl.textContent = sum.toLocaleString("ru-RU") + " ₽";
      if (timeEl) {
        timeEl.textContent = hasTime ? formatTimeRange(timeMin, timeMax) : "—";
      }
    }

    function updateLabels() {
      const catIdx = getCatIndex();
      root.querySelectorAll("[data-price-for]").forEach((el) => {
        const parsed = parseKey(el.getAttribute("data-price-for"));
        if (!parsed) return;
        const item = GROUPS[parsed.gi]?.items[parsed.ii];
        if (!item) return;
        const prefix = item.prefix || "";
        el.textContent = prefix + item.prices[catIdx].toLocaleString("ru-RU") + " ₽";
      });
    }

    function openGroup(groupEl) {
      const wrap = $(".calc__group-items-wrap", groupEl);
      const btn = $(".calc__group-toggle", groupEl);
      if (!wrap) return;
      wrap.style.maxHeight = wrap.scrollHeight + "px";
      groupEl.classList.add("calc__group--open");
      btn?.setAttribute("aria-expanded", "true");
      window.setTimeout(() => {
        if (groupEl.classList.contains("calc__group--open")) {
          wrap.style.maxHeight = "none";
        }
      }, 400);
    }

    function closeGroup(groupEl) {
      const wrap = $(".calc__group-items-wrap", groupEl);
      const btn = $(".calc__group-toggle", groupEl);
      if (!wrap) return;
      wrap.style.maxHeight = wrap.scrollHeight + "px";
      void wrap.offsetHeight;
      wrap.style.maxHeight = "0";
      groupEl.classList.remove("calc__group--open");
      btn?.setAttribute("aria-expanded", "false");
    }

    function initTooltips() {
      const DELAY = 300;

      function closeAll() {
        root.querySelectorAll(".calc__info--active").forEach((b) => {
          b.classList.remove("calc__info--active");
        });
      }

      root.querySelectorAll(".calc__info").forEach((btn) => {
        let timer = null;

        const show = () => {
          closeAll();
          btn.classList.add("calc__info--active");
        };

        const hide = () => {
          clearTimeout(timer);
          btn.classList.remove("calc__info--active");
        };

        btn.addEventListener("mouseenter", () => {
          clearTimeout(timer);
          timer = setTimeout(show, DELAY);
        });

        btn.addEventListener("mouseleave", () => {
          clearTimeout(timer);
          hide();
        });

        btn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          clearTimeout(timer);
          if (btn.classList.contains("calc__info--active")) {
            hide();
          } else {
            timer = setTimeout(show, 0);
          }
        });
      });

      document.addEventListener("click", (e) => {
        if (!e.target.closest(".calc__info")) closeAll();
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeAll();
      });
    }

    root.addEventListener("click", (e) => {
      const btn = e.target.closest(".calc__group-toggle");
      if (!btn) return;
      const groupEl = btn.closest(".calc__group");
      if (!groupEl) return;
      if (groupEl.classList.contains("calc__group--open")) closeGroup(groupEl);
      else openGroup(groupEl);
    });

    root.addEventListener("change", (e) => {
      if (e.target.matches('input[type="checkbox"]')) updateTotal();
    });

    categorySelect.addEventListener("change", () => {
      updateLabels();
      updateTotal();
    });

    const primaryGroup = GROUPS.find((g) => g.type === "primary");
    const collapsibleGroups = GROUPS.filter((g) => g.type === "collapsible");

    const html = `
      ${primaryGroup ? renderPrimaryGroup(primaryGroup, GROUPS.indexOf(primaryGroup)) : ""}
      <div class="calc__grid">
        ${collapsibleGroups.map((g) => renderCollapsibleGroup(g, GROUPS.indexOf(g))).join("")}
      </div>
    `;

    root.innerHTML = html;

    initTooltips();
    updateLabels();
    updateTotal();
  })();
})();