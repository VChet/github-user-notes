// ==UserScript==
// @name         GitHub User Notes
// @version      0.2.1
// @description  Add private local notes to GitHub and Gist user profiles
// @license      MIT
// @author       VChet
// @icon         https://github.com/favicon.ico
// @namespace    github-user-notes
// @match        https://github.com/*
// @match        https://gist.github.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @homepage     https://github.com/VChet/github-user-notes
// @homepageURL  https://github.com/VChet/github-user-notes
// @supportURL   https://github.com/VChet/github-user-notes
// @updateURL    https://github.com/VChet/github-user-notes/raw/master/github-user-notes.user.js
// @downloadURL  https://github.com/VChet/github-user-notes/raw/master/github-user-notes.user.js
// ==/UserScript==

(() => {
  const MAX_NOTE_LENGTH = 250;
  const KEY_PREFIX = "user-note:";

  function getUsername() {
    const usernameEl = document.querySelector(".p-nickname.vcard-username");
    if (!usernameEl) return null;

    const username = usernameEl.textContent.trim().split(/\s+/)[0].toLowerCase();
    return username;
  }

  function addNotesBlock() {
    if (!location.pathname.match(/^\/[^/]+\/?$/)) return;
    if (document.querySelector(".github-user-notes")) return;

    const profileArea = document.querySelector(".js-profile-editable-area.d-flex.flex-column.d-md-block");
    if (!profileArea) return;

    const username = getUsername();
    if (!username) return;

    const KEY = `${KEY_PREFIX}${username}`;
    const savedNote = GM_getValue(KEY, "");

    const containerEl = document.createElement("div");
    containerEl.classList.add("github-user-notes", "border-top", "color-border-muted", "pt-3", "mt-3");

    const titleEl = document.createElement("h2");
    titleEl.classList.add("h4", "mb-2");
    titleEl.textContent = "Personal note";
    titleEl.hidden = !savedNote;

    const textEl = document.createElement("div");
    textEl.style.whiteSpace = "pre-wrap";
    textEl.textContent = savedNote;

    const textareaEl = document.createElement("textarea");
    textareaEl.classList.add("form-control", "FormControl-input", "FormControl-textarea");
    textareaEl.id = "github-user-notes-textarea";
    textareaEl.maxLength = MAX_NOTE_LENGTH;
    textareaEl.placeholder = "Enter your note here…";
    textareaEl.value = savedNote;
    textareaEl.style.resize = "vertical";
    textareaEl.style.minHeight = "2lh";
    textareaEl.hidden = true;

    const captionEl = document.createElement("span");
    captionEl.classList.add("FormControl-caption");
    captionEl.textContent = `Maximum ${MAX_NOTE_LENGTH} characters. This note will only be visible to you.`;
    captionEl.hidden = true;

    const buttonEl = document.createElement("button");
    buttonEl.type = "button";
    buttonEl.classList.add("btn", "btn-block", "mt-2");
    buttonEl.textContent = savedNote ? "Edit note" : "Add note";

    function setEditState(isEditing) {
      const hasNote = !!textEl.textContent.trim();
      textareaEl.hidden = !isEditing;
      captionEl.hidden = !isEditing;
      textEl.hidden = isEditing;
      titleEl.hidden = isEditing || !hasNote;
      buttonEl.textContent = isEditing ? "Save note" : hasNote ? "Edit note" : "Add note";
      buttonEl.classList.toggle("Button--primary", isEditing);
    }

    buttonEl.addEventListener("click", () => {
      if (textareaEl.hidden) {
        setEditState(true);
        textareaEl.focus();
        return;
      }

      const newNote = textareaEl.value.trim();
      newNote ? GM_setValue(KEY, newNote) : GM_deleteValue(KEY);
      textareaEl.value = newNote;
      textEl.textContent = newNote;
      setEditState(false);
    });

    containerEl.append(titleEl, textEl, textareaEl, captionEl, buttonEl);
    profileArea.after(containerEl);
  }

  addNotesBlock();
  document.addEventListener("turbo:load", addNotesBlock);

  const observer = new MutationObserver(addNotesBlock);
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
