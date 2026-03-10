(function () {
  const panels = ["vitals", "skeletal", "muscular", "heart", "blood"];

  function setActive(tab) {
    panels.forEach((id) => {
      const btn = document.querySelector(`[data-tab="${id}"]`);
      const panel = document.getElementById(`panel-${id}`);

      if (btn) btn.classList.toggle("active-tab", id === tab);
      if (panel) panel.classList.toggle("active", id === tab);
    });
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
    let studyMode = localStorage.getItem(STORAGE_KEY) === "1";

    const studyToggle = document.getElementById(`studyToggle-${panelId}`);

    function applyStudyMode(on) {
      studyMode = !!on;
      localStorage.setItem(STORAGE_KEY, studyMode ? "1" : "0");
      panel.classList.toggle("study-mode", studyMode);

      if (studyToggle) {
        studyToggle.classList.toggle("active-mode", studyMode);
      }

      panel.querySelectorAll("li.fc-card").forEach((li) => {
        const btn = li.querySelector("button.fc-term");
        if (studyMode) {
          li.classList.add("fc-hidden");
          li.classList.remove("fc-revealed");
          if (btn) btn.setAttribute("aria-expanded", "false");
        } else {
          li.classList.remove("fc-hidden");
          li.classList.add("fc-revealed");
          if (btn) btn.setAttribute("aria-expanded", "true");
        }
      });
    }

    const lis = panel.querySelectorAll("li");
    lis.forEach((li) => {
      if (li.classList.contains("fc-card")) return;

      const b = li.querySelector("b");
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

      function setHidden(hidden) {
        if (hidden) {
          li.classList.add("fc-hidden");
          li.classList.remove("fc-revealed");
          termBtn.setAttribute("aria-expanded", "false");
        } else {
          li.classList.remove("fc-hidden");
          li.classList.add("fc-revealed");
          termBtn.setAttribute("aria-expanded", "true");
        }
      }

      setHidden(studyMode);

      termBtn.addEventListener("click", () => {
        const currentlyHidden = li.classList.contains("fc-hidden");
        setHidden(!currentlyHidden);
      });
    });

    if (studyToggle) {
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

  setActive("vitals");
})();