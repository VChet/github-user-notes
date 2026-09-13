// ==UserScript==
// @name         GitHub User Notes
// @version      0.1.0
// @description  Add private local notes to GitHub user profiles
// @license      MIT
// @author       VChet
// @icon         https://github.com/favicon.ico
// @namespace    github-user-notes
// @match        https://github.com/*
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
  const styles = ".github-user-notes-text { white-space: pre-wrap; }";

  function getUsername() {
    const usernameEl = document.querySelector(".p-nickname.vcard-username");
    if (!usernameEl) return null;

    const username = usernameEl.textContent.trim().split(/\s+/)[0].toLowerCase();
    return username;
  }

  function getNote(username) {
    return GM_getValue(`${KEY_PREFIX}${username}`, "");
  }
  function setNote(username, note) {
    const key = `${KEY_PREFIX}${username}`;
    note = note.trim();
    note ? GM_setValue(key, note) : GM_deleteValue(key);
  }

  function createNotesBlock(username) {
    const note = getNote(username);

    const containerEl = document.createElement("div");
    containerEl.classList.add("github-user-notes", "border-top", "color-border-muted", "pt-3", "mt-3");

    const titleEl = document.createElement("h2");
    titleEl.classList.add("h4", "mb-2");
    titleEl.textContent = "Personal note";

    const textEl = document.createElement("div");
    textEl.classList.add("github-user-notes-text");
    textEl.textContent = note;

    const textareaEl = document.createElement("textarea");
    textareaEl.classList.add("form-control", "FormControl-input", "FormControl-textarea");
    textareaEl.maxLength = MAX_NOTE_LENGTH;
    textareaEl.placeholder = "Enter your note here…";
    textareaEl.value = note;
    textareaEl.hidden = true;

    const captionEl = document.createElement("span");
    captionEl.classList.add("FormControl-caption");
    captionEl.textContent = `Maximum ${MAX_NOTE_LENGTH} characters. This note will only be visible to you.`;
    captionEl.hidden = true;

    const buttonEl = document.createElement("button");
    buttonEl.type = "button";
    buttonEl.classList.add("btn", "btn-block", "mt-2");
    buttonEl.textContent = "Edit note";

    containerEl.append(titleEl, textEl, textareaEl, captionEl, buttonEl);

    buttonEl.addEventListener("click", () => {
      if (textareaEl.hidden) {
        textEl.hidden = true;
        textareaEl.hidden = false;
        captionEl.hidden = false;
        buttonEl.textContent = "Save note";
        textareaEl.focus();
        return;
      }

      setNote(username, textareaEl.value);
      textEl.textContent = textareaEl.value;
      textareaEl.hidden = true;
      captionEl.hidden = true;
      textEl.hidden = false;
      buttonEl.textContent = "Edit note";
    });

    return containerEl;
  }

  function addStyles() {
    if (document.querySelector("#github-user-notes-styles")) return;
    const style = document.createElement("style");
    style.id = "github-user-notes-styles";
    style.textContent = styles;
    document.head.append(style);
  }

  function addNotesBlock() {
    if (!location.pathname.match(/^\/[^/]+\/?$/)) return;
    if (document.querySelector(".github-user-notes")) return;

    const profileArea = document.querySelector(".js-profile-editable-area.d-flex.flex-column.d-md-block");
    if (!profileArea) return;

    const username = getUsername();
    if (!username) return;

    const notesBlock = createNotesBlock(username);
    profileArea.after(notesBlock);
  }

  addStyles();
  addNotesBlock();

  document.addEventListener("turbo:load", addNotesBlock);
})();
