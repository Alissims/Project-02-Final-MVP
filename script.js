// PageTrail — books live in localStorage; Google Books is used for search only.
let books = JSON.parse(localStorage.getItem("pagetrail-books")) || [];
let filter = { text: "", genre: "" };

const SHELVES = [
  { key: "want", label: "Want to read", empty: "Nothing here yet. The first entry is up to you." },
  { key: "reading", label: "Reading", empty: "Nothing in progress right now." },
  { key: "read", label: "Read", empty: "Finished books will collect here, rating included." }
];

const $ = (id) => document.getElementById(id);
function save() { localStorage.setItem("pagetrail-books", JSON.stringify(books)); }

// Small DOM helper: builds elements with textContent so titles can't inject HTML.
function el(tag, props, ...kids) {
  const node = Object.assign(document.createElement(tag), props || {});
  kids.forEach((k) => node.append(k));
  return node;
}

function placeholder(book) {
  const tone = [...book.title].reduce((n, c) => n + c.charCodeAt(0), 0) % 6;
  const ph = el("div", { className: "cover placeholder tone-" + tone, role: "img", ariaLabel: "No cover for " + book.title });
  ph.append(el("span", { textContent: book.title }));
  return ph;
}

// Tries the main cover, then a backup cover, then a designed placeholder.
function cover(book) {
  if (!book.cover) return placeholder(book);
  const img = el("img", { className: "cover", src: book.cover, alt: "Cover of " + book.title, loading: "lazy" });
  img.addEventListener("error", () => {
    if (book.cover2 && img.src !== book.cover2) img.src = book.cover2;
    else img.replaceWith(placeholder(book));
  });
  return img;
}

// Reading progress for books on the Reading shelf.
function progressBlock(book) {
  const box = el("div", { className: "progress" });
  if (!book.pages) {
    const t = el("input", { type: "number", min: 1, placeholder: "Total pages", ariaLabel: "Total pages for " + book.title });
    t.addEventListener("change", () => {
      const n = parseInt(t.value, 10);
      if (n > 0) { book.pages = n; save(); render(); }
    });
    box.append(t);
    return box;
  }
  const done = Math.min(book.page || 0, book.pages);
  const pct = Math.round((done / book.pages) * 100);
  const fill = el("span");
  fill.style.width = pct + "%";
  const bar = el("div", { className: "bar", role: "progressbar", ariaLabel: "Reading progress" }, fill);
  bar.setAttribute("aria-valuenow", pct);
  bar.setAttribute("aria-valuemin", 0);
  bar.setAttribute("aria-valuemax", 100);
  const input = el("input", { type: "number", min: 0, max: book.pages, value: done, ariaLabel: "Current page of " + book.title });
  input.addEventListener("change", () => {
    book.page = Math.max(0, Math.min(book.pages, parseInt(input.value, 10) || 0));
    save(); render();
  });
  box.append(bar, el("label", {}, "Page ", input, " of " + book.pages + " (" + pct + "%)"));
  return box;
}

function card(book) {
  const li = el("li", { className: "book" });
  li.style.setProperty("--status-color", "var(--" + book.status + ")");

  const select = el("select", { ariaLabel: "Move " + book.title + " to another shelf" });
  SHELVES.forEach((s) => select.append(el("option", { value: s.key, textContent: s.label, selected: s.key === book.status })));
  select.addEventListener("change", () => moveBook(book.id, select.value));

  const controls = el("div", { className: "controls" }, select);

  if (book.status === "read") {
    const stars = el("div", { className: "stars", role: "group", ariaLabel: "Rating" });
    for (let i = 1; i <= 5; i++) {
      const b = el("button", {
        type: "button", textContent: i <= book.rating ? "★" : "☆",
        className: i <= book.rating ? "filled" : "", ariaLabel: i + " star" + (i > 1 ? "s" : "")
      });
      b.addEventListener("click", () => rateBook(book.id, i));
      stars.append(b);
    }
    controls.append(stars);
  }

  const remove = el("button", { type: "button", className: "delete-btn", textContent: "Remove" });
  remove.addEventListener("click", () => deleteBook(book.id, book.title));
  controls.append(remove);

  const meta = [book.genre, book.pages ? book.pages + " pages" : ""].filter(Boolean).join(" · ");
  li.append(
    cover(book),
    el("div", { className: "book-title", textContent: book.title }),
    el("div", { className: "book-author", textContent: book.author }),
    meta ? el("div", { className: "book-meta", textContent: meta }) : "",
    book.status === "reading" ? progressBlock(book) : "",
    controls
  );
  return li;
}

function visible(book) {
  const t = filter.text.toLowerCase();
  const textOk = !t || (book.title + " " + book.author).toLowerCase().includes(t);
  return textOk && (!filter.genre || book.genre === filter.genre);
}

function renderChips() {
  const genres = [...new Set(books.map((b) => b.genre).filter(Boolean))].sort();
  const box = $("genre-chips");
  box.innerHTML = "";
  if (!genres.length) return;
  ["", ...genres].forEach((g) => {
    const chip = el("button", {
      type: "button", textContent: g || "All genres",
      className: "chip" + (filter.genre === g ? " active" : ""), ariaPressed: String(filter.genre === g)
    });
    chip.addEventListener("click", () => { filter.genre = g; render(); });
    box.append(chip);
  });
}

// Popular right now: titles seen on NYT best-seller lists, October 2026.
const POPULAR = [
  { title: "Theo of Golden", author: "Allen Levi", genre: "Novel", pages: 400, isbn: "9781668236512", tag: "Book club pick" },
  { title: "Actually, Nevermind", author: "Taylor Tomlinson", genre: "Essays", pages: 304, isbn: "9781668097236", tag: "Funny dinner-table reading" },
  { title: "Double Tap", author: "Vince Flynn and Don Bentley", genre: "Thriller", pages: 416, isbn: "9781668045916", tag: "Cozy-night page-turner" },
  { title: "Happy Snacking, Don't Die!", author: "Alexis Nikole Nelson", genre: "Cookbook", pages: 272, isbn: "9781668002544", tag: "Great for party snacks" },
  { title: "The Glass Castle", author: "Jeannette Walls", genre: "Memoir", pages: 304, isbn: "9780743247542", tag: "Lots to discuss" },
  { title: "Better Than the Movies", author: "Lynn Painter", genre: "Romance", pages: 384, isbn: "9781534467637", tag: "Fall rom-com" },
  { title: "Protocols", author: "Andrew D. Huberman", genre: "Health", pages: 688, isbn: "9781668032145", tag: "New-year-reset chat" },
  { title: "Dungeon Crawler Carl, Vol. 1", author: "Matt Dinniman", genre: "Graphic novel", pages: 320, isbn: "9781638493655", tag: "Gift for gamers" },
  { title: "The Courage to Be Disliked", author: "Ichiro Kishimi and Fumitake Koga", genre: "Self-help", pages: 288, isbn: "9781668065969", tag: "Great conversation starter" },
  { title: "Long Way Down", author: "Jason Reynolds", genre: "Novel in verse", pages: 336, isbn: "9781481438261", tag: "Quick, powerful read" }
];
// Cover images by ISBN: Open Library first, Google Books as backup.
POPULAR.forEach((p) => {
  p.cover = "https://covers.openlibrary.org/b/isbn/" + p.isbn + "-M.jpg?default=false";
  p.cover2 = "https://books.google.com/books/content?vid=ISBN" + p.isbn + "&printsec=frontcover&img=1&zoom=1";
});

function renderPopular() {
  const list = $("popular-list");
  list.innerHTML = "";
  POPULAR.forEach((p) => {
    const li = el("li", { className: "book" });
    li.style.setProperty("--status-color", "var(--reading)");
    const onShelf = books.some((b) => b.title === p.title);
    const btn = el("button", { type: "button", className: "btn small", textContent: onShelf ? "On your shelf ✓" : "Want to read", disabled: onShelf });
    btn.addEventListener("click", () => addBook({ title: p.title, author: p.author, genre: p.genre, pages: p.pages, cover: p.cover, cover2: p.cover2, status: "want" }));
    li.append(
      cover(p),
      el("div", { className: "book-title", textContent: p.title }),
      el("div", { className: "book-author", textContent: p.author }),
      el("div", { className: "book-meta", textContent: p.genre + " · " + p.tag }),
      el("div", { className: "controls" }, btn)
    );
    list.append(li);
  });
}

function render() {
  const root = $("shelves");
  root.innerHTML = "";
  SHELVES.forEach((s) => {
    const items = books.filter((b) => b.status === s.key && visible(b));
    const section = el("section", { className: "shelf" });
    section.append(el("h2", {}, s.label + " ", el("span", { className: "count", textContent: items.length })));
    if (items.length) {
      const ul = el("ul", { className: "book-grid" });
      items.forEach((b) => ul.append(card(b)));
      section.append(ul);
    } else {
      const filtering = filter.text || filter.genre;
      section.append(el("p", { className: "empty", textContent: filtering ? "No matches on this shelf." : s.empty }));
    }
    root.append(section);
  });
  renderChips();
  renderStats();
  renderPopular();
}

function renderStats() {
  const read = books.filter((b) => b.status === "read");
  const year = new Date().getFullYear();
  // Older saved books have no finish date, so fall back to the date they were added (their id).
  const thisYear = read.filter((b) => new Date(b.finished || b.id).getFullYear() === year);
  const rated = read.filter((b) => b.rating > 0);
  const avg = rated.length ? (rated.reduce((n, b) => n + b.rating, 0) / rated.length).toFixed(1) : "–";
  const pages = read.reduce((n, b) => n + (b.pages || 0), 0);
  const data = [
    [thisYear.length, "books read in " + year],
    [avg, "average rating"],
    [pages.toLocaleString(), "pages read"],
    [books.length, "books on your shelves"]
  ];
  $("stats").innerHTML = "";
  data.forEach(([n, label]) => $("stats").append(
    el("div", { className: "stat" }, el("strong", { textContent: String(n) }), el("span", { textContent: label }))
  ));
}

function addBook(b) {
  books.push(Object.assign({ id: Date.now(), rating: 0 }, b, b.status === "read" ? { finished: Date.now() } : {}));
  save(); render();
}
function moveBook(id, status) {
  const b = books.find((x) => x.id === id);
  b.status = status;
  if (status !== "read") b.rating = 0; else b.finished = Date.now();
  if (status === "read" && b.pages) b.page = b.pages;
  if (status === "want") b.page = 0;
  save(); render();
}
function rateBook(id, n) {
  const b = books.find((x) => x.id === id);
  b.rating = b.rating === n ? 0 : n;
  save(); render();
}
function deleteBook(id, title) {
  if (!confirm("Remove “" + title + "” from your shelves?")) return;
  books = books.filter((b) => b.id !== id);
  save(); render();
}

// Manual add (fallback)
$("book-form").addEventListener("submit", (e) => {
  e.preventDefault();
  addBook({ title: $("title").value.trim(), author: $("author").value.trim(), status: $("status").value });
  e.target.reset();
});

// Google Books search
$("search-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const q = $("q").value.trim();
  const msg = $("search-msg"), list = $("results");
  list.innerHTML = "";
  msg.textContent = "Searching…";
  try {
    const res = await fetch("https://www.googleapis.com/books/v1/volumes?maxResults=8&printType=books&q=" + encodeURIComponent(q));
    if (!res.ok) throw new Error(res.status);
    const items = (await res.json()).items || [];
    if (!items.length) { msg.textContent = "No results. Try fewer words, or add the book by hand below."; return; }
    msg.textContent = "Choose a book to add it to your shelf.";
    items.forEach((it) => {
      const v = it.volumeInfo;
      const book = {
        title: v.title || "Untitled",
        author: (v.authors || ["Unknown author"]).join(", "),
        cover: v.imageLinks && v.imageLinks.thumbnail ? v.imageLinks.thumbnail.replace("http://", "https://") : "",
        pages: v.pageCount || 0,
        genre: v.categories ? v.categories[0] : ""
      };
      const btn = el("button", { type: "button", className: "result" },
        cover(book),
        el("span", {}, el("strong", { textContent: book.title }), el("br"), book.author)
      );
      btn.addEventListener("click", () => {
        addBook(Object.assign(book, { status: $("status").value }));
        msg.textContent = "Added “" + book.title + "”.";
        list.innerHTML = "";
      });
      list.append(el("li", {}, btn));
    });
  } catch (err) {
    msg.textContent = "Search isn't available right now. You can still add a book by hand below.";
  }
});

// Shelf filter + views
$("filter-text").addEventListener("input", (e) => { filter.text = e.target.value.trim(); render(); });
document.querySelectorAll(".tab").forEach((t) => t.addEventListener("click", () => {
  document.querySelectorAll(".tab").forEach((x) => { x.classList.toggle("active", x === t); x.toggleAttribute("aria-current", x === t); });
  $("view-shelves").hidden = t.dataset.view !== "shelves";
  $("view-stats").hidden = t.dataset.view !== "stats";
}));

render();

// Welcome book: opens on load, closes on button, Skip, or Escape.
(function () {
  const w = $("welcome");
  function closeWelcome() {
    w.classList.add("hide");
    setTimeout(() => w.remove(), 500);
    document.removeEventListener("keydown", onKey);
  }
  function onKey(e) { if (e.key === "Escape") closeWelcome(); }
  $("welcome-go").addEventListener("click", closeWelcome);
  $("welcome-skip").addEventListener("click", closeWelcome);
  document.addEventListener("keydown", onKey);
  $("welcome-go").focus({ preventScroll: true });
})();
