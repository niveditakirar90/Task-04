/* ================= COMMON NAVIGATION ================= */
const navButtons = document.querySelectorAll(".nav-btn");
const appViews = document.querySelectorAll(".app-view");
const toast = document.getElementById("appToast");
let toastTimer;

function showToast(message) {
    toast.textContent = message;
    toast.style.display = "block";
    toast.classList.remove("visible");
    void toast.offsetWidth;
    toast.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.style.display = "none";
        toast.classList.remove("visible");
    }, 2600);
}
function showView(viewId, updateHistory = true) {
    if (!document.getElementById(viewId)?.classList.contains("app-view")) return;
    appViews.forEach(view => view.classList.toggle("active", view.id === viewId));
    navButtons.forEach(btn => {
        const isActive = btn.dataset.view === viewId;
        btn.classList.toggle("active", isActive);
        if (isActive) btn.setAttribute("aria-current", "page");
        else btn.removeAttribute("aria-current");
    });
    if (updateHistory && window.location.hash !== "#" + viewId) {
        window.history.pushState({ viewId }, "", "#" + viewId);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    syncPortfolioScrollEffects();
}
navButtons.forEach(btn => btn.addEventListener("click", () => showView(btn.dataset.view)));
window.addEventListener("popstate", () => {
    const viewId = window.location.hash.slice(1);
    if (viewId) showView(viewId, false);
    else showView("portfolioView", false);
});
const initialView = window.location.hash.slice(1);
if (initialView) showView(initialView);
document.getElementById("brandHome").addEventListener("click", e => {
    e.preventDefault();
    showView("productsView");
});

/* ================= PORTFOLIO JAVASCRIPT ================= */
document.getElementById("projectsJump").addEventListener("click", () => {
    document.getElementById("portfolioProjects").scrollIntoView({ behavior: "smooth" });
});
const portfolio = document.getElementById("portfolioView");
const portfolioSubnav = document.querySelector(".portfolio-subnav");
const portfolioMenuToggle = document.getElementById("portfolioMenuToggle");
const portfolioSubnavLinks = document.querySelectorAll(".portfolio-subnav a");
function setPortfolioMenuOpen(isOpen) {
    portfolioSubnav.setAttribute("aria-expanded", String(isOpen));
    portfolioMenuToggle.setAttribute("aria-expanded", String(isOpen));
    portfolioMenuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close portfolio menu" : "Open portfolio menu"
    );
    portfolioMenuToggle.textContent = isOpen ? "×" : "☰";
}
portfolioMenuToggle.addEventListener("click", () => {
    setPortfolioMenuOpen(portfolioSubnav.getAttribute("aria-expanded") !== "true");
});
portfolioSubnavLinks.forEach(link => {
    link.addEventListener("click", event => {
        const target = document.querySelector(link.getAttribute("href"));
        if (!target) return;
        event.preventDefault();
        setPortfolioMenuOpen(false);
        target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
});
document.addEventListener("keydown", event => {
    if (event.key === "Escape" && portfolioSubnav.getAttribute("aria-expanded") === "true") {
        setPortfolioMenuOpen(false);
        portfolioMenuToggle.focus();
    }
});
const portfolioScrollProgress = document.getElementById("portfolioScrollProgress");
const backToTop = document.getElementById("backToTop");
function syncPortfolioScrollEffects() {
    const isPortfolioActive = portfolio.classList.contains("active");
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = isPortfolioActive && scrollableHeight > 0
        ? Math.min(100, Math.max(0, window.scrollY / scrollableHeight * 100))
        : 0;
    portfolioScrollProgress.style.width = progress + "%";
    backToTop.classList.toggle("visible", isPortfolioActive && window.scrollY > 550);
}
window.addEventListener("scroll", syncPortfolioScrollEffects, { passive: true });
window.addEventListener("resize", syncPortfolioScrollEffects);
backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
syncPortfolioScrollEffects();
if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("revealed");
            revealObserver.unobserve(entry.target);
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
    document.querySelectorAll(
        "#portfolioView .port-section, #portfolioView .port-card, " +
        "#portfolioView .education-card, #portfolioView .skill-category, " +
        "#portfolioView .contact-card"
    ).forEach(element => {
        element.classList.add("reveal-ready");
        revealObserver.observe(element);
    });
}
if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            portfolioSubnavLinks.forEach(link =>
                link.classList.toggle("active", link.hash === "#" + entry.target.id)
            );
        });
    }, { rootMargin: "-25% 0px -65% 0px" });
    document.querySelectorAll("#portfolioView #aboutSection, #educationSection, #skillsSection, " +
        "#portfolioProjects, #contactSection").forEach(section => sectionObserver.observe(section));
}
let titleBeforeResumePrint = document.title;
const resumeDocument = document.getElementById("resumeDocument");
const resumeOpenButton = document.getElementById("downloadResumeButton");
const closeResumeButton = document.getElementById("closeResumeButton");
const openResumePreview = () => {
    resumeDocument.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    closeResumeButton.focus();
};
const closeResumePreview = () => {
    resumeDocument.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    resumeOpenButton.focus();
};
resumeOpenButton.addEventListener("click", openResumePreview);
closeResumeButton.addEventListener("click", closeResumePreview);
document.getElementById("printResumeButton").addEventListener("click", () => {
    titleBeforeResumePrint = document.title;
    document.title = "Nivedita-Kirar-Resume";
    document.body.classList.add("print-resume");
    window.setTimeout(() => window.print(), 80);
});
resumeDocument.addEventListener("keydown", event => {
    if (event.key === "Escape") closeResumePreview();
});
window.addEventListener("afterprint", () => {
    document.body.classList.remove("print-resume");
    document.title = titleBeforeResumePrint;
});
const portfolioThemes = ["space", "aurora", "light"];
try {
    const savedTheme = localStorage.getItem("nivedita-portfolio-theme");
    if (portfolioThemes.includes(savedTheme) && savedTheme !== "space") {
        portfolio.dataset.theme = savedTheme;
    }
} catch (error) {
    console.error("Unable to restore portfolio theme:", error);
}
function syncThemeButton() {
    const theme = portfolio.dataset.theme || "space";
    const button = document.getElementById("spaceThemeButton");
    button.textContent = theme === "space" ? "☾" : theme === "aurora" ? "✦" : "☀";
    button.setAttribute("aria-label", "Current theme: " + theme + ". Activate to change theme.");
    button.title = "Current theme: " + theme + " · click to cycle";
}
syncThemeButton();
function setupDarkThemeToggle(element, button, storageKey, name, onThemeChange) {
    let isDark = false;
    try {
        isDark = localStorage.getItem(storageKey) === "dark";
    } catch (error) {
        console.error("Unable to restore " + name + " theme:", error);
    }
    function applyTheme() {
        if (isDark) element.dataset.theme = "dark";
        else delete element.dataset.theme;
        button.textContent = (isDark ? "☀ Light" : "◐ Dark") + " theme";
        button.setAttribute("aria-pressed", String(isDark));
        if (onThemeChange) onThemeChange(isDark);
    }
    applyTheme();
    button.addEventListener("click", () => {
        isDark = !isDark;
        applyTheme();
        try {
            localStorage.setItem(storageKey, isDark ? "dark" : "light");
            showToast(name + " theme updated");
        } catch (error) {
            console.error("Unable to save " + name + " theme:", error);
            showToast(name + " theme changed but could not be saved.");
        }
    });
}
setupDarkThemeToggle(
    document.getElementById("tasksView"),
    document.getElementById("taskThemeToggle"),
    "dayflow-theme",
    "Task workspace"
);
setupDarkThemeToggle(
    document.getElementById("productsView"),
    document.getElementById("shopThemeToggle"),
    "shopsphere-theme",
    "Storefront",
    isDark => {
        if (isDark) document.body.dataset.shopTheme = "dark";
        else delete document.body.dataset.shopTheme;
    }
);
document.getElementById("spaceThemeButton").addEventListener("click", () => {
    const currentTheme = portfolio.dataset.theme || "space";
    const theme = portfolioThemes[(portfolioThemes.indexOf(currentTheme) + 1) % portfolioThemes.length];
    if (theme === "space") delete portfolio.dataset.theme;
    else portfolio.dataset.theme = theme;
    let themeSaved = true;
    try {
        localStorage.setItem("nivedita-portfolio-theme", theme);
    } catch (error) {
        console.error("Unable to save portfolio theme:", error);
        themeSaved = false;
    }
    syncThemeButton();
    showToast(themeSaved ? "Portfolio theme: " + theme : "Theme changed, but could not be saved in this browser.");
});
document.addEventListener("mousemove", e => {
    const planet = document.querySelector("#portfolioView.active .planet");
    if (!planet) return;
    const x = (e.clientX / window.innerWidth - .5) * 12;
    const y = (e.clientY / window.innerHeight - .5) * 12;
    planet.style.marginLeft = x + "px";
    planet.style.marginTop = y + "px";
});
const projectSearch = document.getElementById("projectSearch");
const projectCategory = document.getElementById("projectCategory");
function filterProjects() {
    const query = projectSearch.value.trim().toLowerCase();
    const category = projectCategory.value;
    let count = 0;
    document.querySelectorAll("#portfolioProjects .port-card").forEach(card => {
        const matches = (category === "all" || card.dataset.projectCategory === category) &&
            card.textContent.toLowerCase().includes(query);
        card.classList.toggle("project-card-hidden", !matches);
        count += Number(matches);
    });
    document.getElementById("projectCount").textContent =
        count + " project" + (count === 1 ? "" : "s");
}
projectSearch.addEventListener("input", filterProjects);
projectCategory.addEventListener("change", filterProjects);
filterProjects();
const heroWords = ["Building.", "Creating.", "Exploring."];
let heroWordIndex = 0;
const heroWord = document.getElementById("heroRotatingWord");
window.setInterval(() => {
    if (document.hidden) return;
    heroWord.classList.add("word-changing");
    window.setTimeout(() => {
        heroWordIndex = (heroWordIndex + 1) % heroWords.length;
        heroWord.textContent = heroWords[heroWordIndex];
        heroWord.classList.remove("word-changing");
    }, 180);
}, 3200);

const projectData = {
    chess: {
        title: "Chess Game with AI Integration",
        description: "An interactive web-based chess game with rule-based game logic, an AI opponent, timers, move history and a responsive interface.",
        technologies: ["HTML", "CSS", "JavaScript"]
    },
    network: {
        title: "Network Topologies Visualizer",
        description: "An interactive visualizer for Bus, Star, Ring, Mesh, Tree and Hybrid network topologies, featuring animated data flow.",
        technologies: ["HTML", "CSS", "JavaScript", "Networking"]
    },
    nirabot: {
        title: "NiRaBot-X — Humanoid AI Robot",
        description: "A humanoid AI robot combining a Gemini API integration built with Python, ESP32, IoT, voice interaction, surveillance and expressive robotic movement.",
        technologies: ["Python", "Gemini API", "ESP32", "Embedded C/C++", "Blynk IoT", "ESP32-CAM"]
    },
    calculator: {
        title: "Calculator",
        description: "A simple and responsive calculator with a clean, interactive interface.",
        technologies: ["HTML", "CSS", "JavaScript"]
    },
    waitly: {
        title: "WAITLY — Smart Queue Management System",
        description: "A queue management project with customer registration, digital tokens, queue tracking and an admin dashboard.",
        technologies: ["HTML", "CSS", "JavaScript", "Responsive UI"]
    },
    skycast: {
        title: "SkyCast — Weather Dashboard",
        description: "A responsive weather dashboard featuring weather information cards and a dark/light mode interface.",
        technologies: ["HTML", "CSS", "JavaScript", "Weather API"]
    },
    portfolio: {
        title: "Personal Portfolio",
        description: "A space-inspired personal portfolio showcasing projects, skills, education and a development journey.",
        technologies: ["HTML", "CSS", "JavaScript"]
    }
};

const projectModal = document.getElementById("projectModal");
const quickViewModal = document.getElementById("quickViewModal");
document.querySelectorAll(".project-detail").forEach(button => {
    button.addEventListener("click", () => {
        const project = projectData[button.dataset.project];
        if (!project) return;
        document.getElementById("modalTitle").textContent = project.title;
        document.getElementById("modalDescription").textContent = project.description;
        const tags = document.getElementById("modalTechnologies");
        tags.replaceChildren();
        project.technologies.forEach(tech => {
            const span = document.createElement("span");
            span.className = "tag";
            span.textContent = tech;
            tags.appendChild(span);
        });
        projectModal.style.display = "grid";
        projectModal.setAttribute("aria-hidden", "false");
    });
});
function closeProjectModal() {
    projectModal.style.display = "none";
    projectModal.setAttribute("aria-hidden", "true");
}
document.getElementById("closeProjectModal").addEventListener("click", closeProjectModal);
projectModal.addEventListener("click", e => { if (e.target === projectModal) closeProjectModal(); });
document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
        closeProjectModal();
        cartModal.style.display = "none";
        cartModal.setAttribute("aria-hidden", "true");
        closeQuickView();
    }
    if (e.key === "/" && !e.ctrlKey && !e.metaKey &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
        e.preventDefault();
        const activeView = document.querySelector(".app-view.active");
        const search = activeView.querySelector(
            activeView.id === "portfolioView" ? "#projectSearch" :
                activeView.id === "tasksView" ? "#taskSearch" : "#productSearch"
        );
        search.focus();
    }
    if (e.key.toLowerCase() === "n" && !e.ctrlKey && !e.metaKey &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName) &&
        document.getElementById("tasksView").classList.contains("active")) {
        e.preventDefault();
        taskInput.focus();
    }
});

document.getElementById("contactForm").addEventListener("submit", e => {
    e.preventDefault();
    const name = e.target.elements.name.value.trim();
    const email = e.target.elements.email.value.trim();
    const message = e.target.elements.message.value.trim();
    const subject = encodeURIComponent("Portfolio contact from " + name);
    const body = encodeURIComponent("Name: " + name + "\nEmail: " + email + "\n\n" + message);
    window.location.href = "mailto:niveditakirar4@gmail.com?subject=" + subject + "&body=" + body;
});

/* ================= TASKS + NOTES STORAGE ================= */
const TASK_KEY = "dayflow-tasks-v2";
const NOTE_KEY = "dayflow-notes-v2";
function loadStored(key) {
    try {
        const stored = localStorage.getItem(key);
        if (stored === null) return [];
        const value = JSON.parse(stored);
        if (!Array.isArray(value)) throw new TypeError("Stored workspace data is not a list.");
        return value;
    } catch (error) {
        console.error("Unable to load saved workspace data:", error);
        showToast("Saved data could not be read. Check this browser's storage settings.");
        return [];
    }
}
function saveStored(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error("Unable to save workspace data:", error);
        showToast("Could not save data in this browser.");
        return false;
    }
}
function makeId() {
    return window.crypto && crypto.randomUUID
        ? crypto.randomUUID()
        : String(Date.now()) + Math.random().toString(16).slice(2);
}
let tasks = loadStored(TASK_KEY);
let notes = loadStored(NOTE_KEY);
let currentTaskFilter = "all";
let editingTaskId = null;
let editingNoteId = null;

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskPriority = document.getElementById("taskPriority");
const taskDueDate = document.getElementById("taskDueDate");
const taskSearch = document.getElementById("taskSearch");
const taskSort = document.getElementById("taskSort");
const taskList = document.getElementById("taskList");
const focusClock = document.getElementById("focusClock");
const focusStatus = document.getElementById("focusStatus");
const focusStart = document.getElementById("focusStart");
let focusRemainingSeconds = 25 * 60;
let focusEndsAt = 0;
let focusInterval = null;

function renderFocusClock() {
    const minutes = Math.floor(focusRemainingSeconds / 60);
    const seconds = focusRemainingSeconds % 60;
    focusClock.textContent = String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0");
    document.title = focusInterval
        ? focusClock.textContent + " · Focus | Nivedita"
        : "Nivedita | Digital Workspace";
}
function stopFocusTimer(message) {
    window.clearInterval(focusInterval);
    focusInterval = null;
    focusEndsAt = 0;
    focusStart.textContent = "Start focus";
    focusStatus.textContent = message;
    renderFocusClock();
}
function tickFocusTimer() {
    focusRemainingSeconds = Math.max(0, Math.ceil((focusEndsAt - Date.now()) / 1000));
    renderFocusClock();
    if (focusRemainingSeconds === 0) {
        stopFocusTimer("Focus session complete. Take a short break.");
        showToast("Focus session complete — great work!");
    }
}
focusStart.addEventListener("click", () => {
    if (focusInterval) {
        focusRemainingSeconds = Math.max(0, Math.ceil((focusEndsAt - Date.now()) / 1000));
        stopFocusTimer("Timer paused. Pick up when you are ready.");
        return;
    }
    focusEndsAt = Date.now() + focusRemainingSeconds * 1000;
    focusInterval = window.setInterval(tickFocusTimer, 250);
    focusStart.textContent = "Pause";
    focusStatus.textContent = "You’ve got this. Stay with one thing.";
    tickFocusTimer();
});
document.getElementById("focusReset").addEventListener("click", () => {
    focusRemainingSeconds = 25 * 60;
    stopFocusTimer("Fresh start. One focused session at a time.");
});
document.getElementById("focusAddTime").addEventListener("click", () => {
    focusRemainingSeconds += 5 * 60;
    if (focusInterval) focusEndsAt += 5 * 60 * 1000;
    renderFocusClock();
    focusStatus.textContent = "Five minutes added to your focus session.";
});
renderFocusClock();

function renderTasks() {
    const completedCount = tasks.filter(t => t.completed).length;
    const pendingCount = tasks.length - completedCount;
    const completion = tasks.length ? Math.round(completedCount / tasks.length * 100) : 0;
    document.getElementById("totalTasks").textContent = tasks.length;
    document.getElementById("completedTasks").textContent = completedCount;
    document.getElementById("pendingTasks").textContent = pendingCount;
    document.querySelector(".task-progress-track").setAttribute("aria-valuenow", completion);
    document.getElementById("taskProgressFill").style.width = completion + "%";
    document.getElementById("taskProgressLabel").textContent = completion + "% complete";
    taskList.replaceChildren();

    const query = taskSearch.value.trim().toLowerCase();
    const visible = tasks.filter(t =>
        (currentTaskFilter === "all" ||
            (currentTaskFilter === "completed" && t.completed) ||
            (currentTaskFilter === "pending" && !t.completed)) &&
        (!query || t.title.toLowerCase().includes(query))
    );
    const priorityOrder = { High: 0, Medium: 1, Low: 2 };
    if (taskSort.value === "priority") {
        visible.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    } else if (taskSort.value === "due") {
        visible.sort((a, b) => (a.dueDate || "9999-12-31").localeCompare(b.dueDate || "9999-12-31"));
    } else {
        visible.sort((a, b) => b.createdAt - a.createdAt);
    }

    if (!visible.length) {
        const empty = document.createElement("div");
        empty.className = "empty";
        empty.textContent = tasks.length
            ? (query ? "No tasks match your search." : "No tasks in this filter.")
            : "Your task list is clear. Add your first task above.";
        taskList.appendChild(empty);
        return;
    }

    visible.forEach(task => {
        const row = document.createElement("article");
        row.className = "task-item" + (task.completed ? " done" : "");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = !!task.completed;
        checkbox.setAttribute("aria-label", "Mark task complete");
        checkbox.addEventListener("change", () => {
            tasks = tasks.map(t => t.id === task.id ? { ...t, completed: checkbox.checked } : t);
            saveStored(TASK_KEY, tasks);
            renderTasks();
        });

        const content = document.createElement("div");
        content.className = "task-content";
        const title = document.createElement("strong");
        title.textContent = task.title;
        const date = document.createElement("small");
        date.textContent = "Created " + new Date(task.createdAt).toLocaleDateString();
        const priority = document.createElement("span");
        priority.className = "priority " + task.priority;
        priority.textContent = task.priority + " priority";
        content.append(title, date, priority);
        if (task.dueDate) {
            const due = document.createElement("span");
            const today = new Date();
            const localToday = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, "0"),
            String(today.getDate()).padStart(2, "0")].join("-");
            due.className = "task-due" + (!task.completed && task.dueDate < localToday
                ? " overdue" : task.dueDate === localToday ? " today" : "");
            due.textContent = (task.dueDate < localToday && !task.completed ? "Overdue · " : "Due · ") +
                new Date(task.dueDate + "T00:00:00").toLocaleDateString();
            content.appendChild(due);
        }

        const actions = document.createElement("div");
        actions.className = "item-actions";
        const edit = document.createElement("button");
        edit.textContent = "Edit";
        edit.addEventListener("click", () => {
            editingTaskId = task.id;
            taskInput.value = task.title;
            taskPriority.value = task.priority;
            taskDueDate.value = task.dueDate || "";
            taskForm.querySelector('button[type="submit"]').textContent = "Update";
            taskInput.focus();
        });
        const remove = document.createElement("button");
        remove.textContent = "Delete";
        remove.addEventListener("click", () => {
            if (!confirm("Delete this task?")) return;
            tasks = tasks.filter(t => t.id !== task.id);
            if (editingTaskId === task.id) resetTaskForm();
            saveStored(TASK_KEY, tasks);
            renderTasks();
        });
        actions.append(edit, remove);
        row.append(checkbox, content, actions);
        taskList.appendChild(row);
    });
}
function resetTaskForm() {
    editingTaskId = null;
    taskForm.reset();
    taskForm.querySelector('button[type="submit"]').textContent = "Add Task";
}
taskForm.addEventListener("submit", e => {
    e.preventDefault();
    const title = taskInput.value.trim();
    if (!title) return;
    const wasEditing = !!editingTaskId;
    if (editingTaskId) {
        tasks = tasks.map(t => t.id === editingTaskId
            ? { ...t, title, priority: taskPriority.value, dueDate: taskDueDate.value }
            : t);
    } else {
        tasks.unshift({
            id: makeId(), title, priority: taskPriority.value,
            dueDate: taskDueDate.value, completed: false, createdAt: Date.now()
        });
    }
    const saved = saveStored(TASK_KEY, tasks);
    resetTaskForm();
    renderTasks();
    if (saved) showToast(wasEditing ? "Task updated" : "Task added");
});
taskSearch.addEventListener("input", renderTasks);
taskSort.addEventListener("change", renderTasks);
document.querySelectorAll("[data-task-filter]").forEach(btn => {
    btn.addEventListener("click", () => {
        currentTaskFilter = btn.dataset.taskFilter;
        document.querySelectorAll("[data-task-filter]").forEach(b => b.classList.toggle("active", b === btn));
        renderTasks();
    });
});
document.getElementById("clearCompleted").addEventListener("click", () => {
    const count = tasks.filter(t => t.completed).length;
    if (!count) { showToast("No completed tasks to clear."); return; }
    if (!confirm("Remove all completed tasks?")) return;
    tasks = tasks.filter(t => !t.completed);
    saveStored(TASK_KEY, tasks);
    renderTasks();
    showToast("Completed tasks cleared");
});

const noteForm = document.getElementById("noteForm");
const noteTitle = document.getElementById("noteTitle");
const noteBody = document.getElementById("noteBody");
const noteSearch = document.getElementById("noteSearch");
const noteCharacterCount = document.getElementById("noteCharacterCount");
noteBody.addEventListener("input", () => {
    noteCharacterCount.textContent = noteBody.value.length + " / " + noteBody.maxLength;
});
function renderNotes() {
    const list = document.getElementById("notesList");
    list.replaceChildren();
    const query = noteSearch.value.trim().toLowerCase();
    const visibleNotes = notes
        .filter(note => (note.title + " " + note.body).toLowerCase().includes(query))
        .sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) ||
            (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt));
    if (!visibleNotes.length) {
        const empty = document.createElement("div");
        empty.className = "empty";
        empty.textContent = notes.length ? "No notes match your search." : "Your saved notes will appear here.";
        list.appendChild(empty);
        return;
    }
    visibleNotes.forEach(note => {
        const card = document.createElement("article");
        card.className = "note-item";
        const pin = document.createElement("button");
        pin.className = "note-pin";
        pin.type = "button";
        pin.textContent = note.pinned ? "★ Pinned" : "☆ Pin";
        pin.setAttribute("aria-pressed", String(!!note.pinned));
        pin.setAttribute("aria-label", (note.pinned ? "Unpin " : "Pin ") + note.title);
        pin.addEventListener("click", () => {
            notes = notes.map(item => item.id === note.id ? { ...item, pinned: !item.pinned } : item);
            if (saveStored(NOTE_KEY, notes)) renderNotes();
        });
        const title = document.createElement("h3");
        title.textContent = note.title;
        const body = document.createElement("p");
        body.textContent = note.body;
        const date = document.createElement("small");
        date.style.cssText = "display:block;color:#8a91a3;margin-bottom:12px";
        date.textContent = new Date(note.updatedAt || note.createdAt).toLocaleString();
        const actions = document.createElement("div");
        actions.className = "item-actions";
        const edit = document.createElement("button");
        edit.textContent = "Edit";
        edit.addEventListener("click", () => {
            editingNoteId = note.id;
            noteTitle.value = note.title;
            noteBody.value = note.body;
            noteCharacterCount.textContent = noteBody.value.length + " / " + noteBody.maxLength;
            document.getElementById("saveNoteButton").textContent = "Update Note";
            document.getElementById("cancelNoteEdit").hidden = false;
            noteTitle.focus();
        });
        const remove = document.createElement("button");
        remove.textContent = "Delete";
        remove.addEventListener("click", () => {
            if (!confirm("Delete this note?")) return;
            notes = notes.filter(n => n.id !== note.id);
            if (editingNoteId === note.id) resetNoteForm();
            saveStored(NOTE_KEY, notes);
            renderNotes();
        });
        actions.append(edit, remove);
        card.append(pin, title, body, date, actions);
        list.appendChild(card);
    });
}
function resetNoteForm() {
    editingNoteId = null;
    noteForm.reset();
    document.getElementById("saveNoteButton").textContent = "Save Note";
    document.getElementById("cancelNoteEdit").hidden = true;
    noteCharacterCount.textContent = "0 / " + noteBody.maxLength;
}
noteForm.addEventListener("submit", e => {
    e.preventDefault();
    const title = noteTitle.value.trim();
    const body = noteBody.value.trim();
    if (!title || !body) return;
    if (editingNoteId) {
        notes = notes.map(n => n.id === editingNoteId
            ? { ...n, title, body, updatedAt: Date.now() }
            : n);
    } else {
        notes.unshift({ id: makeId(), title, body, createdAt: Date.now() });
    }
    const saved = saveStored(NOTE_KEY, notes);
    resetNoteForm();
    renderNotes();
    if (saved) showToast("Note saved");
});
noteSearch.addEventListener("input", renderNotes);
document.getElementById("cancelNoteEdit").addEventListener("click", resetNoteForm);

/* ================= SHOPSPHERE PRODUCT CATALOG =================
   Prices/ratings are demonstration data, not live offers.
=============================================================== */
const products = [
    { id: 1, name: "Rockerz 450 Wireless Headphones", brand: "boAt", category: "Audio", price: 1699, mrp: 3990, rating: 4.3, badge: "Popular", desc: "Wireless audio · Cushioned ear cups", imageId: "photo-1505740420928-5e560c06d30e" },
    { id: 2, name: "Tune 520BT Wireless Headphones", brand: "JBL", category: "Audio", price: 3499, mrp: 4999, rating: 4.4, badge: "Bestseller", desc: "Wireless headphones · Pure Bass sound", imageId: "photo-1546435770-a3e426bf472b" },
    { id: 3, name: "G102 LIGHTSYNC Gaming Mouse", brand: "Logitech G", category: "Accessories", price: 1195, mrp: 1595, rating: 4.5, badge: "Gaming", desc: "Wired gaming mouse · RGB lighting", imageId: "photo-1527814050087-3793815479db" },
    { id: 4, name: "Amazfit Bip 5 Smart Watch", brand: "Amazfit", category: "Wearables", price: 4499, mrp: 7999, rating: 4.2, badge: "Deal", desc: "Smart watch · Fitness tracking", imageId: "photo-1523275335684-37898b6baf30" },
    { id: 5, name: "WH-CH520 Wireless Headphones", brand: "Sony", category: "Audio", price: 3990, mrp: 4990, rating: 4.4, badge: "Top rated", desc: "Wireless headphones · Lightweight design", imageId: "photo-1590658268037-6bf12165a8df" },
    { id: 6, name: "Redmi 13C Smartphone", brand: "Xiaomi", category: "Mobiles", price: 7999, mrp: 11999, rating: 4.1, badge: "Value pick", desc: "Budget smartphone · Large display", imageId: "photo-1511707171634-5f897ff02aa9" },
    { id: 7, name: "Portable Bluetooth Speaker", brand: "JBL", category: "Audio", price: 2499, mrp: 3999, rating: 4.2, badge: "Deal", desc: "Compact portable speaker", imageId: "photo-1608043152269-423dbba4e7e1" },
    { id: 8, name: "Wireless Keyboard and Mouse", brand: "Logitech", category: "Accessories", price: 1799, mrp: 2495, rating: 4.3, badge: "Popular", desc: "Wireless desktop combo", imageId: "photo-1587829741301-dc798b83add3" },
    { id: 9, name: "Fitness Smart Band", brand: "Amazfit", category: "Wearables", price: 2299, mrp: 3999, rating: 4.0, badge: "Fitness", desc: "Daily activity and sleep tracking", imageId: "photo-1524592094714-0f0654e20314" },
    { id: 10, name: "Over-Ear Studio Headphones", brand: "Sony", category: "Audio", price: 5999, mrp: 7990, rating: 4.5, badge: "Top rated", desc: "Comfort-focused over-ear design", imageId: "photo-1583394838336-acd977736f90" },
    { id: 11, name: "USB-C Fast Charging Cable", brand: "boAt", category: "Accessories", price: 299, mrp: 599, rating: 4.0, badge: "Value pick", desc: "Everyday fast-charging accessory", imageId: "photo-1583863788434-e58a36330cf0" },
    { id: 12, name: "Android Smartphone", brand: "Xiaomi", category: "Mobiles", price: 10999, mrp: 14999, rating: 4.2, badge: "Deal", desc: "Everyday smartphone experience", imageId: "photo-1510557880182-3d4d3cba35a5" },
    { id: 13, name: "AirBeat Pro Wireless Earbuds", brand: "Soundcore", category: "Audio", price: 2799, mrp: 4499, rating: 4.4, badge: "New", desc: "Compact earbuds · Charging case included", imageId: "photo-1606220945770-b5b6c2c55bf1" },
    { id: 14, name: "Studio USB Condenser Microphone", brand: "Fifine", category: "Audio", price: 3299, mrp: 4999, rating: 4.3, badge: "Creator pick", desc: "Clear voice capture for calls and streams", imageId: "photo-1590602847861-f357a9332bbc" },
    { id: 15, name: "Slim 65W USB-C Charger", brand: "Anker", category: "Accessories", price: 1899, mrp: 2999, rating: 4.6, badge: "Fast charge", desc: "Compact multi-device wall charger", imageId: "photo-1585386959984-a4155224a1ad" },
    { id: 16, name: "MagSafe-Style Phone Stand", brand: "Portronics", category: "Accessories", price: 799, mrp: 1299, rating: 4.1, badge: "Desk essential", desc: "Adjustable stand for hands-free viewing", imageId: "photo-1524678606370-a47ad25cb82a" },
    { id: 17, name: "14-inch Everyday Laptop", brand: "ASUS", category: "Computing", price: 48990, mrp: 59990, rating: 4.4, badge: "Popular", desc: "Lightweight laptop for study and work", imageId: "photo-1496181133206-80ce9b88a853" },
    { id: 18, name: "1080p Full HD Monitor", brand: "Acer", category: "Computing", price: 8999, mrp: 12999, rating: 4.3, badge: "Work setup", desc: "Clear full-HD display for your desk", imageId: "photo-1527443224154-c4a3942d3acf" },
    { id: 19, name: "Mechanical RGB Gaming Keyboard", brand: "Redragon", category: "Gaming", price: 3499, mrp: 4999, rating: 4.5, badge: "Gamer favourite", desc: "Tactile keys with customizable RGB lighting", imageId: "photo-1541140532154-b024d705b90a" },
    { id: 20, name: "Wireless Gaming Controller", brand: "PowerA", category: "Gaming", price: 2299, mrp: 3499, rating: 4.2, badge: "Bestseller", desc: "Comfortable wireless controller for game nights", imageId: "photo-1606144042614-b2417e99c4e3" },
    { id: 21, name: "Smart LED Desk Lamp", brand: "Wipro", category: "Home", price: 1499, mrp: 2299, rating: 4.1, badge: "Smart home", desc: "Dimmable desk lighting with warm and cool modes", imageId: "photo-1507473885765-e6ed057f782c" },
    { id: 22, name: "Compact Bluetooth Projector", brand: "Egate", category: "Home", price: 7999, mrp: 11999, rating: 4.0, badge: "Movie night", desc: "Portable projector for a big-screen experience", imageId: "photo-1478720568477-152d9b164e26" },
    { id: 23, name: "10,000 mAh Power Bank", brand: "Ambrane", category: "Accessories", price: 999, mrp: 1699, rating: 4.3, badge: "Travel essential", desc: "Pocket-sized backup power with dual outputs", imageId: "photo-1583863788434-e58a36330cf0" },
    { id: 24, name: "Action Camera Mini", brand: "SJCAM", category: "Computing", price: 6999, mrp: 9999, rating: 4.2, badge: "Adventure", desc: "Compact camera for travel and outdoor memories", imageId: "photo-1516035069371-29a1b244cc32" }
];

const FAVORITE_KEY = "shopsphere-demo-favorites-v1";
let selectedCategory = "All";
let showFavoritesOnly = false;
let favorites = loadStored(FAVORITE_KEY).filter(id => products.some(product => product.id === id));
let comparisonIds = [];
let quickViewProductId = null;
let cart = loadStored("shopsphere-demo-cart-v1").filter(item =>
    item && products.some(product => product.id === item.id) &&
    Number.isInteger(item.qty) && item.qty > 0
);

const productGrid = document.getElementById("productGrid");
const productSearch = document.getElementById("productSearch");
const categoryFilter = document.getElementById("categoryFilter");
const minPrice = document.getElementById("minPrice");
const maxPrice = document.getElementById("maxPrice");
const ratingFilter = document.getElementById("ratingFilter");
const productSort = document.getElementById("productSort");

function money(amount) {
    return "₹" + Number(amount).toLocaleString("en-IN");
}
function productImage(product) {
    return "https://images.unsplash.com/" + product.imageId +
        "?auto=format&fit=crop&w=520&q=78";
}
function setProductImageFallback(image, product) {
    image.onerror = () => {
        image.onerror = null;
        const fallbackByCategory = {
            Audio: "photo-1505740420928-5e560c06d30e",
            Accessories: "photo-1527814050087-3793815479db",
            Wearables: "photo-1523275335684-37898b6baf30",
            Mobiles: "photo-1511707171634-5f897ff02aa9",
            Computing: "photo-1496181133206-80ce9b88a853",
            Gaming: "photo-1606144042614-b2417e99c4e3",
            Home: "photo-1507473885765-e6ed057f782c"
        };
        const fallbackId = fallbackByCategory[product.category];
        if (image.src !== "https://images.unsplash.com/" + fallbackId + "?auto=format&fit=crop&w=520&q=78") {
            image.src = "https://images.unsplash.com/" + fallbackId +
                "?auto=format&fit=crop&w=520&q=78";
        }
    };
}
function discount(product) {
    return Math.max(0, Math.round((1 - product.price / product.mrp) * 100));
}
function renderComparison() {
    const panel = document.getElementById("comparePanel");
    const grid = document.getElementById("compareGrid");
    const toggle = document.getElementById("compareToggle");
    toggle.textContent = "Compare (" + comparisonIds.length + "/3)";
    toggle.setAttribute("aria-pressed", String(comparisonIds.length > 0));
    panel.hidden = comparisonIds.length === 0;
    grid.replaceChildren();
    comparisonIds.forEach(id => {
        const product = products.find(item => item.id === id);
        if (!product) return;
        const card = document.createElement("article");
        card.className = "compare-item";
        const name = document.createElement("h4");
        name.textContent = product.name;
        const brand = document.createElement("p");
        brand.textContent = product.brand + " · " + product.category;
        const price = document.createElement("p");
        price.textContent = "Price: " + money(product.price);
        const rating = document.createElement("p");
        rating.textContent = "Rating: ★ " + product.rating;
        const saving = document.createElement("p");
        saving.textContent = "Discount: " + discount(product) + "%";
        card.append(name, brand, price, rating, saving);
        grid.appendChild(card);
    });
    document.querySelectorAll("[data-compare-product]").forEach(button => {
        const isSelected = comparisonIds.includes(Number(button.dataset.compareProduct));
        button.classList.toggle("compare-toggle", true);
        button.classList.toggle("selected", isSelected);
        button.textContent = isSelected ? "✓ Added to compare" : "⇄ Compare";
        button.setAttribute("aria-pressed", String(isSelected));
    });
}
function renderProducts() {
    const query = productSearch.value.trim().toLowerCase();
    const min = minPrice.value === "" ? 0 : Number(minPrice.value);
    const max = maxPrice.value === "" ? Infinity : Number(maxPrice.value);
    const rating = Number(ratingFilter.value);

    let result = products.filter(p => {
        const matchesText = [p.name, p.brand, p.category, p.desc].join(" ").toLowerCase().includes(query);
        return matchesText &&
            (selectedCategory === "All" || p.category === selectedCategory) &&
            p.price >= min && p.price <= max && p.rating >= rating &&
            (!showFavoritesOnly || favorites.includes(p.id));
    });

    if (productSort.value === "price-low") result.sort((a, b) => a.price - b.price);
    if (productSort.value === "price-high") result.sort((a, b) => b.price - a.price);
    if (productSort.value === "rating") result.sort((a, b) => b.rating - a.rating);
    if (productSort.value === "discount") result.sort((a, b) => discount(b) - discount(a));

    document.getElementById("productCount").textContent =
        "Showing " + result.length + " of " + products.length + " products";
    document.getElementById("activeFilterText").textContent =
        "Category: " + selectedCategory +
        (query ? " · Search: " + query : "") +
        (minPrice.value ? " · Min: " + money(min) : "") +
        (maxPrice.value ? " · Max: " + money(max) : "") +
        (rating ? " · Rating: " + rating + "+★" : "") +
        (showFavoritesOnly ? " · Saved products" : "");
    const favoritesToggle = document.getElementById("favoritesToggle");
    favoritesToggle.textContent = (showFavoritesOnly ? "♥" : "♡") + " Saved (" + favorites.length + ")";
    favoritesToggle.classList.toggle("active", showFavoritesOnly);
    favoritesToggle.setAttribute("aria-pressed", String(showFavoritesOnly));

    productGrid.replaceChildren();
    document.getElementById("emptyProducts").hidden = result.length !== 0;
    document.getElementById("emptyResetButton").hidden = result.length !== 0;

    result.forEach(product => {
        const card = document.createElement("article");
        card.className = "product-card";

        const favorite = document.createElement("button");
        favorite.className = "favorite-button" + (favorites.includes(product.id) ? " active" : "");
        favorite.type = "button";
        favorite.textContent = favorites.includes(product.id) ? "♥" : "♡";
        favorite.setAttribute("aria-label",
            (favorites.includes(product.id) ? "Remove " : "Save ") + product.name);
        favorite.setAttribute("aria-pressed", String(favorites.includes(product.id)));
        favorite.addEventListener("click", () => {
            favorites = favorites.includes(product.id)
                ? favorites.filter(id => id !== product.id)
                : [...favorites, product.id];
            if (saveStored(FAVORITE_KEY, favorites)) {
                showToast(favorites.includes(product.id) ? "Added to saved products" : "Removed from saved products");
            }
            renderProducts();
        });

        const imageWrap = document.createElement("div");
        imageWrap.className = "product-image";
        const img = document.createElement("img");
        img.src = productImage(product);
        img.alt = product.name;
        img.loading = "eager";
        setProductImageFallback(img, product);
        imageWrap.appendChild(img);

        const badge = document.createElement("span");
        badge.className = "product-badge";
        badge.textContent = product.badge;

        const brand = document.createElement("div");
        brand.className = "product-brand";
        brand.textContent = product.brand + " · " + product.category;

        const title = document.createElement("h3");
        title.textContent = product.name;

        const ratingTag = document.createElement("span");
        ratingTag.className = "rating";
        ratingTag.textContent = "★ " + product.rating;

        const price = document.createElement("div");
        price.className = "product-price";
        price.textContent = money(product.price);
        const mrp = document.createElement("span");
        mrp.className = "product-mrp";
        mrp.textContent = money(product.mrp);
        price.appendChild(mrp);

        const sale = document.createElement("div");
        sale.className = "discount";
        sale.textContent = discount(product) + "% off";

        const desc = document.createElement("p");
        desc.className = "product-desc";
        desc.textContent = product.desc;

        const add = document.createElement("button");
        add.className = "add-cart";
        add.textContent = "🛒 ADD TO CART";
        add.addEventListener("click", () => addToCart(product.id));

        const quickView = document.createElement("button");
        quickView.className = "product-quick-view";
        quickView.type = "button";
        quickView.textContent = "Quick view";
        quickView.addEventListener("click", () => openQuickView(product.id));

        const compare = document.createElement("button");
        compare.className = "product-quick-view compare-toggle";
        compare.type = "button";
        compare.dataset.compareProduct = product.id;
        compare.addEventListener("click", () => toggleCompare(product.id));

        card.append(favorite, imageWrap, badge, brand, title, ratingTag, price, sale, desc, quickView, compare, add);
        productGrid.appendChild(card);
    });
    renderComparison();
}

function toggleCompare(id) {
    if (comparisonIds.includes(id)) {
        comparisonIds = comparisonIds.filter(productId => productId !== id);
    } else if (comparisonIds.length >= 3) {
        showToast("Compare up to three products at a time.");
        return;
    } else {
        comparisonIds.push(id);
    }
    renderComparison();
}
function openQuickView(id) {
    const product = products.find(item => item.id === id);
    if (!product) return;
    quickViewProductId = id;
    document.getElementById("quickViewBadge").textContent = product.badge;
    document.getElementById("quickViewBrand").textContent = product.brand + " · " + product.category;
    document.getElementById("quickViewTitle").textContent = product.name;
    document.getElementById("quickViewRating").textContent = "★ " + product.rating + " · Demo rating";
    document.getElementById("quickViewDescription").textContent = product.desc;
    const price = document.getElementById("quickViewPrice");
    price.replaceChildren(document.createTextNode(money(product.price) + " "));
    const mrp = document.createElement("span");
    mrp.className = "product-mrp";
    mrp.textContent = money(product.mrp);
    price.appendChild(mrp);
    const image = document.createElement("img");
    image.src = productImage(product);
    image.alt = product.name;
    image.loading = "eager";
    setProductImageFallback(image, product);
    const imageContainer = document.getElementById("quickViewImage");
    imageContainer.replaceChildren(image);
    quickViewModal.style.display = "grid";
    quickViewModal.setAttribute("aria-hidden", "false");
    document.getElementById("closeQuickView").focus();
}
function closeQuickView() {
    quickViewModal.style.display = "none";
    quickViewModal.setAttribute("aria-hidden", "true");
    quickViewProductId = null;
}
document.getElementById("closeQuickView").addEventListener("click", closeQuickView);
quickViewModal.addEventListener("click", event => {
    if (event.target === quickViewModal) closeQuickView();
});
document.getElementById("quickViewAdd").addEventListener("click", () => {
    if (quickViewProductId !== null) addToCart(quickViewProductId);
    closeQuickView();
});
document.getElementById("compareToggle").addEventListener("click", () => {
    const panel = document.getElementById("comparePanel");
    if (comparisonIds.length) panel.scrollIntoView({ behavior: "smooth", block: "center" });
    else showToast("Choose products with “Compare” to compare their features.");
});
document.getElementById("clearCompare").addEventListener("click", () => {
    comparisonIds = [];
    renderComparison();
});

function syncCategory(category) {
    selectedCategory = category;
    categoryFilter.value = category;
    document.querySelectorAll(".category-shortcut").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.category === category);
    });
    renderProducts();
}
document.querySelectorAll(".category-shortcut").forEach(btn => {
    btn.addEventListener("click", () => syncCategory(btn.dataset.category));
});
categoryFilter.addEventListener("change", () => syncCategory(categoryFilter.value));
[productSearch, minPrice, maxPrice, ratingFilter, productSort].forEach(control => {
    control.addEventListener("input", renderProducts);
    control.addEventListener("change", renderProducts);
});
document.getElementById("shopSearchForm").addEventListener("submit", e => {
    e.preventDefault();
    renderProducts();
});
function resetFilters() {
    productSearch.value = "";
    minPrice.value = "";
    maxPrice.value = "";
    ratingFilter.value = "0";
    productSort.value = "featured";
    showFavoritesOnly = false;
    syncCategory("All");
}
document.getElementById("resetFilters").addEventListener("click", resetFilters);
document.getElementById("emptyResetButton").addEventListener("click", resetFilters);
document.getElementById("shopNowButton").addEventListener("click", () => {
    document.getElementById("shopCollection").scrollIntoView({ behavior: "smooth" });
});
document.getElementById("shopAccountButton").addEventListener("click", () => {
    showToast("Demo storefront: login is not connected.");
});
document.getElementById("favoritesToggle").addEventListener("click", () => {
    showFavoritesOnly = !showFavoritesOnly;
    renderProducts();
});

/* ================= CART ================= */
function saveCart() {
    const saved = saveStored("shopsphere-demo-cart-v1", cart);
    renderCartCount();
    renderCart();
    return saved;
}
function addToCart(id) {
    const item = cart.find(p => p.id === id);
    if (item) item.qty += 1;
    else cart.push({ id, qty: 1 });
    if (saveCart()) showToast("Added to cart");
}
function renderCartCount() {
    document.getElementById("cartCount").textContent =
        cart.reduce((sum, item) => sum + item.qty, 0);
}
function renderCart() {
    const container = document.getElementById("cartItems");
    container.replaceChildren();
    let total = 0;

    if (!cart.length) {
        const empty = document.createElement("div");
        empty.className = "empty";
        empty.textContent = "Your cart is empty. Add a product to get started.";
        container.appendChild(empty);
    }

    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (!product) return;
        total += product.price * item.qty;

        const line = document.createElement("div");
        line.className = "cart-line";
        const info = document.createElement("div");
        const title = document.createElement("strong");
        title.textContent = product.name;
        const detail = document.createElement("p");
        detail.textContent = money(product.price) + " each";
        info.append(title, detail);

        const controls = document.createElement("div");
        controls.style.textAlign = "right";
        const qty = document.createElement("div");
        qty.style.fontWeight = "800";
        qty.textContent = "Qty: " + item.qty;

        const minus = document.createElement("button");
        minus.textContent = "−";
        minus.setAttribute("aria-label", "Decrease quantity");
        minus.addEventListener("click", () => changeQuantity(item.id, -1));

        const plus = document.createElement("button");
        plus.textContent = "+";
        plus.setAttribute("aria-label", "Increase quantity");
        plus.addEventListener("click", () => changeQuantity(item.id, 1));

        const remove = document.createElement("button");
        remove.textContent = "Remove";
        remove.addEventListener("click", () => {
            cart = cart.filter(p => p.id !== item.id);
            saveCart();
        });
        controls.append(qty, minus, plus, remove);
        line.append(info, controls);
        container.appendChild(line);
    });

    document.getElementById("cartTotal").textContent = money(total);
}
function changeQuantity(id, delta) {
    const item = cart.find(p => p.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter(p => p.id !== id);
    saveCart();
}
const cartModal = document.getElementById("cartModal");
document.getElementById("openCartButton").addEventListener("click", () => {
    renderCart();
    cartModal.style.display = "flex";
    cartModal.setAttribute("aria-hidden", "false");
});
function closeCart() {
    cartModal.style.display = "none";
    cartModal.setAttribute("aria-hidden", "true");
}
document.getElementById("closeCartButton").addEventListener("click", closeCart);
cartModal.addEventListener("click", e => { if (e.target === cartModal) closeCart(); });
document.getElementById("clearCartButton").addEventListener("click", () => {
    if (!cart.length) { showToast("Your cart is already empty."); return; }
    if (!confirm("Clear all items from your cart?")) return;
    cart = [];
    if (saveCart()) showToast("Cart cleared");
});
document.getElementById("checkoutButton").addEventListener("click", () => {
    if (!cart.length) { showToast("Add a product to your cart first."); return; }
    alert("Demo checkout only!\n\nNo real order or payment has been created.");
});

renderTasks();
renderNotes();
renderProducts();
renderCartCount();
renderCart();
