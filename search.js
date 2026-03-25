// const searchData = [
//     { keyword: "home", url: "index.html" },
//     { keyword: "about", url: "about.html" },
//     { keyword: "services", url: "services.html" },
//     { keyword: "contact", url: "contact.html" },
//     { keyword: "web development", url: "services.html#web" },
//     { keyword: "graphic design", url: "services.html#graphic" }
// ];


// document.getElementById("searchForm").addEventListener("submit", function (e) {
//     e.preventDefault();

//     let query = document.getElementById("searchInput").value.trim().toLowerCase();

//     if (query === "") return;

//     let result = searchData.find(item =>
//         item.keyword.includes(query)
//     );

//     if (result) {
//         window.location.href = result.url;
//     } else {
//         window.location.href = "search-not-found.html";
//     }
// });




// const searchData = [
//     { keyword: "home", url: "index.html" },
//     { keyword: "about", url: "about.html" },
//     { keyword: "services", url: "services.html" },
//     { keyword: "contact", url: "contact.html" },
//     { keyword: "web development", url: "services.html#web" },
//     { keyword: "graphic design", url: "services.html#graphic" }
// ];

// const searchInput = document.getElementById("searchInput");
// const suggestionsBox = document.getElementById("suggestions");
// const searchForm = document.getElementById("searchForm");

// /* 🔹 Live Search Suggestions */
// searchInput.addEventListener("input", () => {
//     let query = searchInput.value.toLowerCase().trim();
//     suggestionsBox.innerHTML = "";

//     if (query === "") {
//         suggestionsBox.style.display = "none";
//         return;
//     }

//     let matches = searchData.filter(item =>
//         item.keyword.toLowerCase().includes(query)
//     );

//     if (matches.length === 0) {
//         suggestionsBox.style.display = "none";
//         return;
//     }

//     matches.forEach(item => {
//         let li = document.createElement("li");
//         li.textContent = item.keyword;
//         li.onclick = () => {
//             window.location.href = item.url;
//         };
//         suggestionsBox.appendChild(li);
//     });

//     suggestionsBox.style.display = "block";
// });

// /* 🔹 Enter Key + Search Icon */
// searchForm.addEventListener("submit", function (e) {
//     e.preventDefault();

//     let query = searchInput.value.toLowerCase().trim();

//     let result = searchData.find(item =>
//         item.keyword.toLowerCase().includes(query)
//     );

//     if (result) {
//         window.location.href = result.url;
//     } else {
//         window.location.href = "search-not-found.html";
//     }
// });

// /* 🔹 Click Outside Close */
// document.addEventListener("click", (e) => {
//     if (!searchForm.contains(e.target)) {
//         suggestionsBox.style.display = "none";
//     }
// });


















/* ===============================
   ELEMENTS
   =============================== */
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const suggestionsBox = document.getElementById("suggestions");
const notFoundBox = document.getElementById("searchNotFound");
const clearHistoryBtn = document.getElementById("clearHistory");

const MAX_HISTORY = 5;
let activeIndex = -1;

/* ===============================
   SEARCH IN CURRENT PAGE ONLY
   =============================== */
function searchCurrentPage(keyword) {
    const container = document.querySelector(".page-content");
    if (!container) return false;

    const walker = document.createTreeWalker(
        container,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    keyword = keyword.toLowerCase();

    while (walker.nextNode()) {
        const node = walker.currentNode;

        if (node.nodeValue.toLowerCase().includes(keyword)) {
            node.parentElement.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
            return true;
        }
    }
    return false;
}

/* ===============================
   SEARCH HISTORY (LOCALSTORAGE)
   =============================== */
function getHistory() {
    return JSON.parse(localStorage.getItem("searchHistory")) || [];
}

function saveToHistory(term) {
    let history = getHistory();
    history = history.filter(item => item.toLowerCase() !== term.toLowerCase());
    history.unshift(term);
    history = history.slice(0, MAX_HISTORY);
    localStorage.setItem("searchHistory", JSON.stringify(history));
}

/* ===============================
   CLEAR HISTORY
   =============================== */
clearHistoryBtn.addEventListener("click", e => {
    e.stopPropagation(); // prevent closing suggestions
    localStorage.removeItem("searchHistory");
    suggestionsBox.innerHTML = "";
    clearHistoryBtn.style.display = "none";
});


/* ===============================
   MAIN SEARCH
   =============================== */
function performSearch() {
    const query = searchInput.value.trim();
    if (!query) return;

    saveToHistory(query);

    const found = searchCurrentPage(query);

    if (!found) {
        notFoundBox.style.display = "block";
        setTimeout(() => {
            notFoundBox.style.display = "none";
        }, 3000); // auto hide after 3 sec
    } else {
        notFoundBox.style.display = "none";
    }

    suggestionsBox.style.display = "none";
    activeIndex = -1;
}


/* ===============================
   ENTER KEY
   =============================== */
searchInput.addEventListener("keydown", e => {
    if (e.key === "Enter" && activeIndex === -1) {
        e.preventDefault();
        performSearch();
    }
});

/* ===============================
   SEARCH ICON CLICK
   =============================== */
searchBtn.addEventListener("click", performSearch);

/* ===============================
   LIVE SUGGESTIONS (CURRENT PAGE)
   =============================== */
searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase().trim();
    suggestionsBox.innerHTML = "";
    notFoundBox.style.display = "none";
    activeIndex = -1;

    if (!query) {
        suggestionsBox.style.display = "none";
        clearHistoryBtn.style.display = "none";
        return;
    }

    const elements = document.querySelectorAll(
        ".page-content h1, .page-content h2, .page-content h3, .page-content p, .page-content li"
    );

    let matches = [];

    elements.forEach(el => {
        if (el.innerText.toLowerCase().includes(query)) {
            matches.push(el.innerText.substring(0, 40) + "...");
        }
    });

    if (matches.length === 0) {
        suggestionsBox.style.display = "none";
        return;
    }

    matches.slice(0, 5).forEach(text => {
        const li = document.createElement("li");
        li.textContent = text;
        li.onclick = () => {
            searchInput.value = query;
            performSearch();
        };
        suggestionsBox.appendChild(li);
    });

    suggestionsBox.style.display = "block";
});

/* ===============================
   SHOW PREVIOUS SEARCHES ON FOCUS
   =============================== */
searchInput.addEventListener("focus", () => {
    const history = getHistory();
    suggestionsBox.innerHTML = "";
    activeIndex = -1;

    if (history.length === 0) {
        clearHistoryBtn.style.display = "none";
        return;
    }

    history.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        li.onclick = () => {
            searchInput.value = item;
            performSearch();
        };
        suggestionsBox.appendChild(li);
    });

    suggestionsBox.style.display = "block";
    clearHistoryBtn.style.display = "block";
});

/* ===============================
   KEYBOARD ↑ ↓ NAVIGATION
   =============================== */
searchInput.addEventListener("keydown", e => {
    const items = suggestionsBox.querySelectorAll("li");
    if (!items.length) return;

    if (e.key === "ArrowDown") {
        e.preventDefault();
        activeIndex = (activeIndex + 1) % items.length;
    }

    if (e.key === "ArrowUp") {
        e.preventDefault();
        activeIndex = (activeIndex - 1 + items.length) % items.length;
    }

    if (e.key === "Enter" && activeIndex > -1) {
        e.preventDefault();
        items[activeIndex].click();
        return;
    }

    items.forEach((item, i) => {
        item.classList.toggle("active", i === activeIndex);
    });
});

/* ===============================
   CLOSE SUGGESTIONS ON OUTSIDE CLICK
   =============================== */
document.addEventListener("click", e => {
    if (!e.target.closest("#searchForm")) {
        suggestionsBox.style.display = "none";
        clearHistoryBtn.style.display = "none";
        activeIndex = -1;
    }
});
