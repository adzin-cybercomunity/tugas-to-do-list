/* ====================================================
   To-Do List Life Dashboard - script.js
   Handles: clock/greeting, theme toggle, focus timer,
   tasks (CRUD + localStorage), quick links (CRUD + localStorage)
   ==================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------
     1. CLOCK + GREETING
  --------------------------- */
  const clockEl = document.getElementById('clock');
  const dateEl = document.getElementById('date');
  const greetingEl = document.getElementById('greeting');
  const greetingNameEl = document.getElementById('greeting-name');
  const nameInput = document.getElementById('name-input');
  const nameSaveBtn = document.getElementById('name-save');

  const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  function pad(n) {
    return n.toString().padStart(2, '0');
  }

  function getGreetingText(hour) {
    if (hour < 5) return 'Good Night';
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }

  function updateClock() {
    const now = new Date();
    clockEl.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    dateEl.textContent = `${WEEKDAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
    greetingEl.textContent = getGreetingText(now.getHours());
  }

  updateClock();
  setInterval(updateClock, 1000);

  // Custom name in greeting
  function loadName() {
    const savedName = localStorage.getItem('dashboard_username');
    if (savedName) {
      greetingNameEl.textContent = `, ${savedName}`;
      nameInput.value = savedName;
    }
  }

  nameSaveBtn.addEventListener('click', () => {
    const value = nameInput.value.trim();
    if (value) {
      localStorage.setItem('dashboard_username', value);
      greetingNameEl.textContent = `, ${value}`;
    } else {
      localStorage.removeItem('dashboard_username');
      greetingNameEl.textContent = '';
    }
  });

  nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') nameSaveBtn.click();
  });

  loadName();

  /* ---------------------------
     2. THEME TOGGLE (Light/Dark mode)
  --------------------------- */
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('dashboard_theme', theme);
  }

  const savedTheme = localStorage.getItem('dashboard_theme') || 'light';
  applyTheme(savedTheme);

  themeToggleBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });

  /* ---------------------------
     3. FOCUS TIMER (with custom length)
  --------------------------- */
  const timerDisplay = document.getElementById('timer-display');
  const startBtn = document.getElementById('start-btn');
  const stopBtn = document.getElementById('stop-btn');
  const resetBtn = document.getElementById('reset-btn');
  const timerLengthInput = document.getElementById('timer-length');

  let totalSeconds = 25 * 60;
  let remainingSeconds = totalSeconds;
  let timerInterval = null;

  function renderTimer() {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    timerDisplay.textContent = `${pad(minutes)}:${pad(seconds)}`;
  }

  function startTimer() {
    if (timerInterval) return; // already running
    timerInterval = setInterval(() => {
      if (remainingSeconds > 0) {
        remainingSeconds--;
        renderTimer();
      } else {
        clearInterval(timerInterval);
        timerInterval = null;
        timerDisplay.textContent = "Time's up!";
      }
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  function resetTimer() {
    stopTimer();
    const minutesValue = parseInt(timerLengthInput.value, 10);
    totalSeconds = (isNaN(minutesValue) || minutesValue <= 0) ? 25 * 60 : minutesValue * 60;
    remainingSeconds = totalSeconds;
    renderTimer();
  }

  startBtn.addEventListener('click', startTimer);
  stopBtn.addEventListener('click', stopTimer);
  resetBtn.addEventListener('click', resetTimer);
  timerLengthInput.addEventListener('change', resetTimer);

  renderTimer();

  /* ---------------------------
     4. TO-DO LIST (CRUD + localStorage + duplicate guard + sort)
  --------------------------- */
  const taskInput = document.getElementById('task-input');
  const addTaskBtn = document.getElementById('add-task-btn');
  const taskList = document.getElementById('task-list');
  const duplicateHint = document.getElementById('duplicate-hint');
  const sortSelect = document.getElementById('sort-select');

  const TASKS_KEY = 'dashboard_tasks';

  function loadTasks() {
    try {
      return JSON.parse(localStorage.getItem(TASKS_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveTasks(tasks) {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  }

  let tasks = loadTasks();

  function getSortedTasks() {
    const mode = sortSelect.value;
    const copy = [...tasks];
    if (mode === 'az') {
      copy.sort((a, b) => a.text.localeCompare(b.text));
    } else if (mode === 'za') {
      copy.sort((a, b) => b.text.localeCompare(a.text));
    } else if (mode === 'done') {
      copy.sort((a, b) => (a.done === b.done) ? 0 : (a.done ? 1 : -1));
    }
    return copy;
  }

  function renderTasks() {
    taskList.innerHTML = '';
    const sorted = getSortedTasks();

    sorted.forEach((task) => {
      const li = document.createElement('li');
      li.className = 'task-item' + (task.done ? ' done' : '');
      li.dataset.id = task.id;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.done;
      checkbox.addEventListener('change', () => toggleDone(task.id));

      const textSpan = document.createElement('span');
      textSpan.className = 'task-text';
      textSpan.contentEditable = 'true';
      textSpan.textContent = task.text;
      textSpan.addEventListener('blur', () => editTask(task.id, textSpan.textContent));
      textSpan.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          textSpan.blur();
        }
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'task-delete';
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', () => deleteTask(task.id));

      li.appendChild(checkbox);
      li.appendChild(textSpan);
      li.appendChild(deleteBtn);
      taskList.appendChild(li);
    });
  }

  function isDuplicate(text) {
    return tasks.some(t => t.text.trim().toLowerCase() === text.trim().toLowerCase());
  }

  function addTask() {
    const value = taskInput.value.trim();
    duplicateHint.textContent = '';

    if (!value) return;

    if (isDuplicate(value)) {
      duplicateHint.textContent = 'That task already exists.';
      return;
    }

    tasks.push({
      id: Date.now().toString(),
      text: value,
      done: false
    });

    saveTasks(tasks);
    renderTasks();
    taskInput.value = '';
    taskInput.focus();
  }

  function toggleDone(id) {
    tasks = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
    saveTasks(tasks);
    renderTasks();
  }

  function editTask(id, newText) {
    const trimmed = newText.trim();
    if (!trimmed) {
      deleteTask(id);
      return;
    }
    tasks = tasks.map(t => t.id === id ? { ...t, text: trimmed } : t);
    saveTasks(tasks);
  }

  function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks(tasks);
    renderTasks();
  }

  addTaskBtn.addEventListener('click', addTask);
  taskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTask();
  });
  sortSelect.addEventListener('change', renderTasks);

  renderTasks();

  /* ---------------------------
     5. QUICK LINKS (CRUD + localStorage)
  --------------------------- */
  const linkNameInput = document.getElementById('link-name');
  const linkUrlInput = document.getElementById('link-url');
  const addLinkBtn = document.getElementById('add-link-btn');
  const linksList = document.getElementById('links-list');

  const LINKS_KEY = 'dashboard_links';

  const DEFAULT_LINKS = [
    { id: 'default-google', name: 'Google', url: 'https://www.google.com' },
    { id: 'default-gmail', name: 'Gmail', url: 'https://mail.google.com' },
    { id: 'default-calendar', name: 'Calendar', url: 'https://calendar.google.com' }
  ];

  function loadLinks() {
    try {
      const stored = JSON.parse(localStorage.getItem(LINKS_KEY));
      return stored || DEFAULT_LINKS;
    } catch (e) {
      return DEFAULT_LINKS;
    }
  }

  function saveLinks(links) {
    localStorage.setItem(LINKS_KEY, JSON.stringify(links));
  }

  let links = loadLinks();

  function normalizeUrl(url) {
    if (!/^https?:\/\//i.test(url)) {
      return `https://${url}`;
    }
    return url;
  }

  function renderLinks() {
    linksList.innerHTML = '';
    links.forEach((link) => {
      const chip = document.createElement('a');
      chip.className = 'link-chip';
      chip.href = normalizeUrl(link.url);
      chip.target = '_blank';
      chip.rel = 'noopener noreferrer';

      const label = document.createElement('span');
      label.textContent = link.name;

      const removeBtn = document.createElement('button');
      removeBtn.className = 'link-remove';
      removeBtn.textContent = '×';
      removeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        deleteLink(link.id);
      });

      chip.appendChild(label);
      chip.appendChild(removeBtn);
      linksList.appendChild(chip);
    });
  }

  function addLink() {
    const name = linkNameInput.value.trim();
    const url = linkUrlInput.value.trim();
    if (!name || !url) return;

    links.push({
      id: Date.now().toString(),
      name,
      url
    });

    saveLinks(links);
    renderLinks();
    linkNameInput.value = '';
    linkUrlInput.value = '';
    linkNameInput.focus();
  }

  function deleteLink(id) {
    links = links.filter(l => l.id !== id);
    saveLinks(links);
    renderLinks();
  }

  addLinkBtn.addEventListener('click', addLink);
  linkUrlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addLink();
  });
  linkNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') linkUrlInput.focus();
  });

  renderLinks();

});