(function () {
  const panels = ["vitals", "skeletal", "muscular", "heart", "blood", "respiratory", "skin"];
  const LAST_TAB_KEY = "anatomy-notes-active-tab";

  function setActive(tab) {
    const resolved = panels.includes(tab) ? tab : "vitals";

    panels.forEach((id) => {
      const btn = document.querySelector(`[data-tab="${id}"]`);
      const panel = document.getElementById(`panel-${id}`);

      if (btn) {
        btn.classList.toggle("active-tab", id === resolved);
        btn.setAttribute("aria-selected", id === resolved ? "true" : "false");
      }
      if (panel) panel.classList.toggle("active", id === resolved);
    });

    try {
      localStorage.setItem(LAST_TAB_KEY, resolved);
    } catch (e) {}

    if (location.hash !== `#${resolved}`) {
      history.replaceState(null, "", `#${resolved}`);
    }
  }

  function setCardHidden(li, btn, hidden) {
    if (hidden) {
      li.classList.add("fc-hidden");
      li.classList.remove("fc-revealed");
      if (btn) btn.setAttribute("aria-expanded", "false");
    } else {
      li.classList.remove("fc-hidden");
      li.classList.add("fc-revealed");
      if (btn) btn.setAttribute("aria-expanded", "true");
    }
  }

  function bindFlashcardButton(li, studyMode) {
    if (!li || !li.classList.contains("fc-card")) return;

    const btn = li.querySelector("button.fc-term");
    if (!btn) return;

    if (btn.dataset.fcBound === "1") return;
    btn.dataset.fcBound = "1";

    setCardHidden(li, btn, !!studyMode);

    btn.addEventListener("click", () => {
      const currentlyHidden = li.classList.contains("fc-hidden");
      setCardHidden(li, btn, !currentlyHidden);
    });
  }


  function updateStickyOffsets() {
    const tabbar = document.querySelector(".tabbar");
    const height = tabbar ? Math.ceil(tabbar.getBoundingClientRect().height) : 0;
    document.documentElement.style.setProperty("--tabbar-height", `${height}px`);
  }

  window.toggleAll = function (panelId, open) {
    const panel = document.getElementById(`panel-${panelId}`);
    if (!panel) return;

    panel.querySelectorAll("details").forEach((d) => {
      d.open = !!open;
    });
  };

  function initFlashcards(panelId) {
    const panel = document.getElementById(`panel-${panelId}`);
    if (!panel) return;

    const STORAGE_KEY = `studyMode-${panelId}`;
    let studyMode = false;

    try {
      studyMode = localStorage.getItem(STORAGE_KEY) === "1";
    } catch (e) {}

    const studyToggle = document.getElementById(`studyToggle-${panelId}`);

    function applyStudyMode(on) {
      studyMode = !!on;
      try {
        localStorage.setItem(STORAGE_KEY, studyMode ? "1" : "0");
      } catch (e) {}

      panel.classList.toggle("study-mode", studyMode);

      if (studyToggle) {
        studyToggle.classList.toggle("active-mode", studyMode);
      }

      panel.querySelectorAll("li.fc-card").forEach((li) => {
        const btn = li.querySelector("button.fc-term");
        setCardHidden(li, btn, studyMode);
      });
    }

    panel.querySelectorAll("li").forEach((li) => {
      if (li.classList.contains("fc-card")) {
        bindFlashcardButton(li, studyMode);
        return;
      }

      const b = li.querySelector(":scope > b, :scope > strong");
      if (!b) return;

      const afterBold =
        b.nextSibling && b.nextSibling.nodeType === Node.TEXT_NODE
          ? b.nextSibling.textContent
          : "";

      if (!afterBold.trim().startsWith(":")) return;

      li.classList.add("fc-card");

      const termText = b.textContent.trim();
      const termBtn = document.createElement("button");
      termBtn.type = "button";
      termBtn.className = "fc-term";
      termBtn.textContent = termText;

      b.replaceWith(termBtn);

      const defSpan = document.createElement("span");
      defSpan.className = "fc-def";

      const nodesToMove = [];
      let n = termBtn.nextSibling;
      while (n) {
        nodesToMove.push(n);
        n = n.nextSibling;
      }

      nodesToMove.forEach((node) => defSpan.appendChild(node));
      li.appendChild(defSpan);

      bindFlashcardButton(li, studyMode);
    });

    if (studyToggle && studyToggle.dataset.bound !== "1") {
      studyToggle.dataset.bound = "1";
      studyToggle.addEventListener("click", () => {
        applyStudyMode(!studyMode);
      });
    }

    panel.querySelectorAll("details").forEach((d) => {
      d.open = false;
    });

    applyStudyMode(studyMode);
  }

  document.querySelectorAll(".tabbar button[data-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      setActive(btn.getAttribute("data-tab"));
    });
  });

  panels.forEach(initFlashcards);

  let startingTab = location.hash.replace(/^#/, "");
  if (!panels.includes(startingTab)) {
    try {
      const savedTab = localStorage.getItem(LAST_TAB_KEY);
      if (panels.includes(savedTab)) startingTab = savedTab;
    } catch (e) {}
  }

  setActive(panels.includes(startingTab) ? startingTab : "vitals");

  updateStickyOffsets();
  window.addEventListener("resize", updateStickyOffsets);
  const tabbar = document.querySelector(".tabbar");
  if (tabbar && window.ResizeObserver) {
    new ResizeObserver(updateStickyOffsets).observe(tabbar);
  }

  window.addEventListener("hashchange", () => {
    const hashTab = location.hash.replace(/^#/, "");
    if (panels.includes(hashTab)) setActive(hashTab);
  });
})();
