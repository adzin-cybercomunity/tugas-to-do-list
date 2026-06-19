// ===========================
// CLOCK & GREETING
// ===========================

const clock = document.getElementById("clock");
const dateElement = document.getElementById("date");
const greeting = document.getElementById("greeting");

function updateClock() {
    const now = new Date();

    const time = now.toLocaleTimeString();
    const date = now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });

    clock.textContent = time;
    dateElement.textContent = date;

    const hour = now.getHours();

    if (hour < 12) {
        greeting.textContent = "Good Morning";
    } else if (hour < 18) {
        greeting.textContent = "Good Afternoon";
    } else {
        greeting.textContent = "Good Evening";
    }
}

setInterval(updateClock, 1000);
updateClock();


// ===========================
// USER NAME
// ===========================

const greetingName =
document.getElementById("greeting-name");

const nameInput =
document.getElementById("name-input");

const nameSave =
document.getElementById("name-save");

function loadUserName() {

    const saved =
    localStorage.getItem("username");

    if(saved){
        greetingName.textContent =
        ", " + saved;

        nameInput.value = saved;
    }
}

nameSave.addEventListener("click", () => {

    const value =
    nameInput.value.trim();

    localStorage.setItem(
        "username",
        value
    );

    greetingName.textContent =
    ", " + value;
});

loadUserName();


// ===========================
// THEME TOGGLE
// ===========================

const themeBtn =
document.getElementById("theme-toggle");

const themeIcon =
document.getElementById("theme-icon");

function setTheme(theme){

    document.body.setAttribute(
        "data-theme",
        theme
    );

    localStorage.setItem(
        "theme",
        theme
    );

    themeIcon.textContent =
        theme === "dark"
        ? "☀️"
        : "🌙";
}

const savedTheme =
localStorage.getItem("theme")
|| "dark";

setTheme(savedTheme);

themeBtn.addEventListener(
"click",
() => {

    const current =
    document.body.getAttribute(
        "data-theme"
    );

    const next =
    current === "dark"
    ? "light"
    : "dark";

    setTheme(next);
});


// ===========================
// POMODORO TIMER
// ===========================

const timerDisplay =
document.getElementById("timer-display");

const timerLength =
document.getElementById("timer-length");

const startBtn =
document.getElementById("start-btn");

const stopBtn =
document.getElementById("stop-btn");

const resetBtn =
document.getElementById("reset-btn");

let timer;
let seconds =
25 * 60;

function renderTimer(){

    const minutes =
    Math.floor(seconds / 60);

    const secs =
    seconds % 60;

    timerDisplay.textContent =
    `${String(minutes).padStart(2,"0")}:${String(secs).padStart(2,"0")}`;
}

startBtn.addEventListener(
"click",
() => {

    if(timer) return;

    timer = setInterval(() => {

        if(seconds > 0){

            seconds--;
            renderTimer();

        } else {

            clearInterval(timer);
            timer = null;

            alert(
            "Focus Session Complete!"
            );
        }

    },1000);
});

stopBtn.addEventListener(
"click",
() => {

    clearInterval(timer);
    timer = null;
});

resetBtn.addEventListener(
"click",
() => {

    clearInterval(timer);
    timer = null;

    seconds =
    parseInt(
        timerLength.value
    ) * 60;

    renderTimer();
});

renderTimer();


// ===========================
// TASK MANAGEMENT
// ===========================

const taskInput =
document.getElementById("task-input");

const addTaskBtn =
document.getElementById("add-task-btn");

const taskList =
document.getElementById("task-list");

const sortSelect =
document.getElementById("sort-select");

let tasks =
JSON.parse(
localStorage.getItem("tasks")
) || [];

function saveTasks(){

    localStorage.setItem(
        "tasks",
        JSON.stringify(tasks)
    );
}

function renderTasks(){

    taskList.innerHTML = "";

    let displayTasks =
    [...tasks];

    if(sortSelect.value === "A → Z"){

        displayTasks.sort(
            (a,b)=>
            a.text.localeCompare(
            b.text)
        );

    }else if(
        sortSelect.value === "Z → A"
    ){

        displayTasks.sort(
            (a,b)=>
            b.text.localeCompare(
            a.text)
        );
    }

    displayTasks.forEach(task => {

        const li =
        document.createElement("li");

        li.className =
        "task-item";

        li.innerHTML = `
        <input type="checkbox"
        ${task.done ? "checked" : ""}>

        <span style="
        text-decoration:
        ${task.done
        ? "line-through"
        : "none"}">
        ${task.text}
        </span>

        <button class="delete-btn">
        ❌
        </button>
        `;

        const checkbox =
        li.querySelector(
        "input"
        );

        checkbox.addEventListener(
        "change",
        () => {

            task.done =
            !task.done;

            saveTasks();
            renderTasks();
        });

        li.querySelector(
        ".delete-btn"
        ).addEventListener(
        "click",
        () => {

            tasks =
            tasks.filter(
            t =>
            t.id !== task.id
            );

            saveTasks();
            renderTasks();
        });

        taskList.appendChild(li);
    });
}

addTaskBtn.addEventListener(
"click",
() => {

    const value =
    taskInput.value.trim();

    if(!value) return;

    tasks.push({
        id: Date.now(),
        text: value,
        done: false
    });

    taskInput.value = "";

    saveTasks();
    renderTasks();
});

sortSelect.addEventListener(
"change",
renderTasks
);

renderTasks();


// ===========================
// QUICK LINKS
// ===========================

const linkName =
document.getElementById("link-name");

const linkUrl =
document.getElementById("link-url");

const addLinkBtn =
document.getElementById("add-link-btn");

const linksList =
document.getElementById("links-list");

let links =
JSON.parse(
localStorage.getItem("links")
) || [];

function saveLinks(){

    localStorage.setItem(
        "links",
        JSON.stringify(links)
    );
}

function renderLinks(){

    linksList.innerHTML = "";

    links.forEach(link => {

        const div =
        document.createElement("div");

        div.className =
        "task-item";

        div.innerHTML = `
        <a href="${link.url}"
        target="_blank">
        ${link.name}
        </a>

        <button>
        ❌
        </button>
        `;

        div.querySelector(
        "button"
        ).addEventListener(
        "click",
        () => {

            links =
            links.filter(
            l =>
            l.id !== link.id
            );

            saveLinks();
            renderLinks();
        });

        linksList.appendChild(div);
    });
}

addLinkBtn.addEventListener(
"click",
() => {

    if(
        !linkName.value ||
        !linkUrl.value
    ) return;

    links.push({
        id: Date.now(),
        name: linkName.value,
        url: linkUrl.value
    });

    linkName.value = "";
    linkUrl.value = "";

    saveLinks();
    renderLinks();
});

renderLinks();