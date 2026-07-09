const API_BASE = "http://localhost:3000/api/v1";

const TOAST_DURATION = 3000;

// ============ API Client ============
const api = {
  async request(path, options = {}) {
    const { method = "GET", body, params } = options;
    let url = `${API_BASE}${path}`;
    if (params) {
      const qs = new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== "")
      );
      const qstr = qs.toString();
      if (qstr) url += `?${qstr}`;
    }
    const headers = { "Content-Type": "application/json" };
    const token = getAccessToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(url, {
      method,
      headers,
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 204) return null;
    const data = await res.json();
    if (!res.ok) {
      const msg =
        data.message || data.error || `Request failed with status ${res.status}`;
      throw new Error(msg);
    }
    return data;
  },

  get(path, opts) {
    return this.get(path, { ...opts, method: "GET" });
  },
  post(path, body) {
    return this.get(path, { method: "POST", body });
  },
  patch(path, body) {
    return this.get(path, { method: "PATCH", body });
  },
  delete(path) {
    return this.get(path, { method: "DELETE" });
  },
};

["get", "post", "patch", "delete"].forEach((method) => {
  const orig = api[method];
  api[method] = async (path, body) => {
    const opts = { method: method.toUpperCase() };
    if (body) opts.body = body;
    return api.get(path, opts);
  };
});

// ============ Auth / Token ============
function getAccessToken() {
  return localStorage.getItem("accessToken");
}

function setAccessToken(token) {
  if (token) localStorage.setItem("access_token", token);
  else localStorage.removeItem("access_token");
}

function getUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setUser(user) {
  if (user) localStorage.setItem("user", JSON.stringify(user));
  else localStorage.removeItem("user");
}

async function refreshAccessToken() {
  try {
    const data = await api.get("/auth/refresh", { method: "POST" });
    if (data?.data?.accessToken) {
      setAccessToken(data.data.accessToken);
      setUser(data.data.user);
      return data.data.accessToken;
    }
  } catch {
    return null;
  }
  return null;
}

async function fetchMe() {
  try {
    const data = await api.get("/auth/me");
    if (data?.data?.user) {
      setUser(data.data.user);
      return data.data.user;
    }
  } catch {
    return null;
  }
  return null;
}

async function logoutUser() {
  try {
    await api.get("/auth/logout", { method: "POST" });
  } catch {
  }
  setAccessToken(null);
  setUser(null);
  window.location.href = "index.html";
}

// ============ Toast Notifications ============
let toastContainer;

function ensureToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.className = "toast-container";
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

function showToast(message, type = "info") {
  const container = ensureToastContainer();
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s";
    setTimeout(() => toast.remove(), 300);
  }, TOAST_DURATION);
}

// ============ Header / Auth UI ============
function renderHeader() {
  const headerControls = document.querySelector(".header-controls");
  if (!headerControls) return;
  const user = getUser();
  const token = getAccessToken();
  const authHtml = token && user
    ? `
    <div class="user-menu">
      <button class="user-btn-trigger" id="userBtnTrigger">
        <span>${user.name || user.username || user.email}</span>
      </button>
      <div class="user-dropdown" id="userDropdown">
        <div class="dropdown-header">
          <strong>${user.name || "User"}</strong>
          <span>${user.email}</span>
        </div>
        <div class="dropdown-divider"></div>
        <a href="index.html">Home</a>
        <button id="logoutBtn">Log Out</button>
      </div>
    </div>`
    : `<button class="auth-btn" onclick="window.location.href='auth.html'">Log In</button>`;
  const searchHtml = headerControls.querySelector(".search-btn")
    ? ""
    : `<button id="searchBtn" class="search-btn" aria-label="Search"><span class="search-icon">&#x1F50D;</span></button>`;
  headerControls.innerHTML = searchHtml + authBtn;
  bindSearchBtn();
  bindUserDropdown();
  bindLogout();
}

function bindSearchBtn() {
  const btn = document.getElementById("searchBtn");
  if (btn) {
    btn.addEventListener("click", openSearch);
  }
}

function bindUserDropdown() {
  const trigger = document.getElementById("userBtnTrigger");
  const dropdown = document.getElementById("userDropdown");
  if (trigger && dropdown) {
    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.classList.toggle("open");
    });
    document.addEventListener("click", () => dropdown.classList.remove("open"));
  }
}

function bindLogout() {
  const btn = document.getElementById("logoutBtn");
  if (btn) btn.addEventListener("click", logoutUser);
}

// ============ Search ============
function openSearch() {
  const existing = document.querySelector(".search-overlay");
  if (existing) {
    existing.classList.add("open");
    existing.querySelector("input")?.focus();
    return;
  }
  const overlay = document.createElement("div");
  overlay.className = "search-overlay open";
  overlay.innerHTML = `
    <div class="search-modal">
      <input type="text" id="searchInput" placeholder="Search posts..." autofocus />
      <div class="search-results" id="searchResults"></div>
    </div>
  `;
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.classList.remove("open");
  });
  document.body.appendChild(overlay);
  const input = overlay.querySelector("#searchInput");
  const results = overlay.querySelector("#searchResults");
  let debounceTimer;
  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    const q = input.value.trim();
    if (q.length < 2) {
      results.innerHTML = "";
      return;
    }
    debounceTimer = setTimeout(async () => {
      results.innerHTML = '<div class="loading">Searching...</div>';
      try {
        const data = await api.get("/blogs");
        const blogs = data?.data?.blogs || [];
        const matches = blogs.filter(
          (b) =>
            b.title.toLowerCase().includes(q.toLowerCase()) ||
            (b.content || "").toLowerCase().includes(q.toLowerCase()) ||
            (b.category?.name || "").toLowerCase().includes(q.toLowerCase())
        );
        if (matches.length === 0) {
          results.innerHTML = '<div class="no-results">No posts found.</div>';
        } else {
          results.innerHTML = matches
            .slice(0, 8)
            .map(
              (b) => `
            <a class="search-result-item" href="post.html?slug=${b.slug}">
              <div class="result-title">${b.title}</div>
              <div class="result-category">${b.category?.name || ""}</div>
            </a>
          `
            )
            .join("");
        }
      } catch {
        results.innerHTML = '<div class="no-results">Search failed.</div>';
      }
    }, 300);
  });
  document.addEventListener("keydown", function escKey(e) {
    if (e.key === "Escape") {
      overlay.classList.remove("open");
      document.removeEventListener("keydown", escKey);
    }
  });
}

// ============ Blog Rendering ============
function renderBlogCard(blog) {
  const date = blog.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";
  return `
    <article class="card">
      <div class="body">
        <div class="date">${date}</div>
        <h2><a href="post.html?slug=${blog.slug}">${blog.title}</a></h2>
        <p>${stripHtml(blog.content).slice(0, 150)}...</p>
        <a href="post.html?slug=${blog.slug}" class="read-more">Read More →</a>
        <div class="meta">
          <span class="cat">${blog.category?.name || "Uncategorized"}</span>
          <span class="comment-count">💬 ${blog._count?.comments || 0}</span>
          <span class="like-count">❤️ ${blog.likeCount || 0}</span>
        </div>
      </div>
    </article>
  `;
}

function renderRecentPosts(recent) {
  const ul = document.getElementById("recent");
  if (!ul) return;
  if (!recent || recent.length === 0) {
    ul.innerHTML = "<li style='padding: 14px; color: var(--muted);'>No posts yet.</li>";
    return;
  }
  ul.innerHTML = recent
    .slice(0, 5)
    .map(
      (b) => `
    <li>
      <a href="post.html?slug=${b.slug}">${b.title}</a>
    </li>
  `
    )
    .join("");
}

function renderAllCategories(categories) {
  const container = document.getElementById("categoryTags");
  if (!container) return;
  if (!categories || categories.length === 0) return;
  container.innerHTML = categories
    .map(
      (c) => `<span class="tag" data-category="${c.name}">${c.name}</span>`
    )
    .join("");
  container.querySelectorAll(".tag").forEach((tag) => {
    tag.addEventListener("click", () => {
      const current = window.location.pathname.split("/").pop();
      if (current === "index.html" || current === "") {
        filterByCategory(tag.dataset.category);
      }
    });
  });
}

function filterByCategory(category) {
  const tags = document.querySelectorAll("#categoryTags .tag");
  tags.forEach((t) => t.classList.remove("active"));
  const target = document.querySelector(`#categoryTags .tag[data-category="${category}"]`);
  if (target) target.classList.add("active");
  const cards = document.querySelectorAll(".card");
  cards.forEach((card) => {
    const cat = card.querySelector(".cat")?.textContent || "";
    card.style.display =
      cat.toLowerCase() === category.toLowerCase() ? "" : "none";
  });
}

function stripHtml(html) {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

// ============ Main Page Load ============
async function loadHomePage() {
  const grid = document.getElementById("posts");
  if (!grid) return;
  grid.innerHTML = '<div class="loading">Loading posts...</div>';
  try {
    const data = await api.get("/blogs");
    const blogs = data?.data?.blogs || [];
    const section = (window.PAGE_SECTION || "").toLowerCase();
    let filtered = blogs;
    if (section) {
      filtered = blogs.filter((b) => {
        const cat = (b.category?.name || "").toLowerCase();
        const tag = (b.tag?.name || "").toLowerCase();
        return cat.includes(section) || tag.includes(section);
      });
    }
    if (filtered.length === 0) {
      grid.innerHTML = "<p style='padding: 20px; color: var(--muted);'>No posts found.</p>";
    } else {
      grid.innerHTML = filtered.map(renderBlogPosts).join("");
    }
    renderRecentPosts(blogs);
    const cats = [];
    blogs.forEach((b) => {
      if (b.category && !cats.find((c) => c.name === b.category.name)) {
        cats.push(b.category);
      }
    });
    renderAllCategories(cats);
    renderHeader();
    bindMobileMenu();
    const yearEl = document.getElementById("currentYear");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  } catch (err) {
    grid.innerHTML = `<div class="error-state"><p>Failed to load posts: ${err.message}</p><button onclick="loadHomePage()">Retry</button></div>`;
  }
}

// ============ Single Post Page ============
async function loadPostPage() {
  const container = document.getElementById("post");
  if (!container) return;
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  if (!slug) {
    container.innerHTML = "<p>Post not found.</p>";
    return;
  }
  container.innerHTML = '<div class="loading">Loading post...</div>';
  try {
    const data = await api.get(`/blogs/${slug}`);
    const blog = data?.data?.blog;
    if (!blog) throw new Error("Post not found");
    const date = blog.publishedAt
      ? new Date(blog.publishedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "";
    container.innerHTML = `
      <article class="post-detail-hero">
        <div class="post-detail-header">
          <h1>${blog.title}</h1>
          <div class="post-detail-meta">
            <span>${date}</span>
            <strong>${blog.category?.name || "Uncategorized"}</strong>
            ${blog.tag ? `<span>#${blog.tag.name}</span>` : ""}
            <span>By ${blog.author?.name || blog.author?.username || "Unknown"}</span>
          </div>
          <div class="post-detail-stats">
            <button id="likeBtn" class="${blog.isLiked ? "liked" : ""}">
              ❤️ <span id="likeCount">${blog.likeCount || 0}</span>
            </button>
            <button id="favBtn" class="${blog.isFavorited ? "favorited" : ""}">
              ⭐ <span id="favCount">${blog.favoriteCount || 0}</span>
            </button>
            <button class="secondary">💬 <span>${blog._count?.comments || 0}</span></button>
          </div>
        </div>
      </article>
      <div class="post-detail-content">
        ${blog.content}
      </div>
      <div class="comments-section">
        <h3>Comments (${blog._count?.comments || 0})</h3>
        <div id="commentsContainer">${renderComments(blog.comments || [])}</div>
        <div class="comment-form" id="commentFormContainer">
          <div class="reply-indicator" id="replyIndicator" style="display:none;">
            Replying to <strong id="replyToName"></strong>
            <button id="cancelReplyBtn">✕</button>
          </div>
          <textarea id="commentInput" placeholder="Write a comment..." rows="3"></textarea>
          <button id="submitCommentBtn">Post Comment</button>
        </div>
      </div>
    `;
    bindPostActions(slug, blog);
    bindComments(slug);
    renderHeader();
    bindMobileMenu();
    document.getElementById("currentYear").textContent = new Date().getFullYear();
  } catch (err) {
    container.innerHTML = `<div class="error-state"><p>${err.message}</p><a href="index.html" class="read-more">← Back to Home</a></div>`;
  }
}

function renderComments(comments, depth = 0) {
  if (!comments || comments.length === 0) return "";
  return comments
    .map((c) => {
      const date = new Date(c.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      const initial = (c.author?.name || c.author?.username || "A")[0].toUpperCase();
      const repliesHtml = c.replies?.length
        ? `<div class="comment-replies">${renderComments(c.replies, depth + 1)}</div>`
        : "";
      return `
      <div class="comment" data-comment-id="${c.id}">
        <div class="comment-author">
          <div class="comment-avatar">${initial}</div>
          <div>
            <div class="comment-author-name">${c.author?.name || c.author?.username || "Anonymous"}</div>
            <div class="comment-date">${date}</div>
          </div>
        </div>
        <div class="comment-content">${escapeHtml(c.content)}</div>
        ${depth < 2 ? `<button class="comment-reply-btn" data-parent-id="${c.id}" data-author-name="${c.author?.name || c.author?.username || 'Anonymous'}">Reply</button>` : ""}
        ${repliesHtml}
      </div>
    `;
    })
    .join("");
}

function bindComments(slug) {
  let parentId = null;
  const replyIndicator = document.getElementById("replyIndicator");
  const replyToName = document.getElementById("replyToName");
  const cancelReplyBtn = document.getElementById("cancelReplyBtn");
  document.querySelectorAll(".comment-reply-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      parentId = btn.dataset.parentId;
      replyToName.textContent = btn.dataset.authorName;
      replyIndicator.style.display = "flex";
      document.getElementById("commentText").focus();
    });
  });
  if (cancelReplyBtn) {
    cancelReplyBtn.addEventListener("click", () => {
      parentId = null;
      replyIndicator.style.display = "none";
    });
  }
  document.getElementById("submitCommentBtn")?.addEventListener("click", async () => {
    const text = document.getElementById("commentText");
    const content = text.value.trim();
    if (!content) return showToast("Please write a comment.", "error");
    const user = getUser();
    if (!user || !getAccessToken()) {
      showToast("Please log in to comment.", "error");
      return;
    }
    try {
      const body = { content };
      if (parentId) body.parentId = parentId;
      await api.post(`/blogs/${slug}/comments`, body);
      text.value = "";
      parentId = null;
      replyIndicator.style.display = "none";
      showToast("Comment posted!", "success");
      setTimeout(() => loadPostPage(), 500);
    } catch (err) {
      showToast(err.message, "error");
    }
  });
}

function bindPostActions(slug) {
  const likeBtn = document.getElementById("likeBtn");
  const favBtn = document.getElementById("favBtn");
  const user = getUser();
  const token = getAccessToken();
  if (likeBtn && token) {
    likeBtn.addEventListener("click", async () => {
      try {
        const data = await api.post(`/blogs/${slug}/likes`);
        const liked = data?.data?.liked;
        const count = data?.data?.blog?.likeCount;
        likeBtn.classList.toggle("liked", liked);
        document.getElementById("likeCount").textContent = count;
      } catch (err) {
        showToast(err.message, "error");
      }
    });
  }
  if (favBtn && token) {
    favBtn.addEventListener("click", async () => {
      try {
        const data = await api.post(`/blogs/${slug}/favorites`);
        const favorited = data?.data?.favorited;
        const count = data?.data?.blog?.favoriteCount;
        favBtn.classList.toggle("favorited", favorited);
        document.getElementById("favCount").textContent = count;
      } catch (err) {
        showToast(err.message, "error");
      }
    });
  }
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ============ Auth Pages ============
async function handleAuth() {
  const form = document.getElementById("authForm");
  if (!form) return;
  const mode = form.dataset.mode || "login";
  const errorEl = document.getElementById("authError");
  const successEl = document.getElementById("authSuccess");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.classList.remove("show");
    successEl.classList.remove("show");
    const submitBtn = form.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.textContent = "Loading...";
    try {
      let data;
      if (mode === "login") {
        const identifier = document.getElementById("email")?.value || document.getElementById("identifier")?.value;
        const password = document.getElementById("password").value;
        data = await api.post("/auth/login", { identifier, password });
      } else if (mode === "register") {
        const email = document.getElementById("regEmail").value;
        const password = document.getElementById("regPassword").value;
        const confirmPassword = document.getElementById("regConfirmPassword").value;
        const name = document.getElementById("regName")?.value;
        const username = document.getElementById("regUsername")?.value;
        data = await api.post("/auth/register", {
          email,
          password,
          confirmPassword,
          ...(name ? { name } : {}),
          ...(username ? { username } : {}),
        });
      }
      if (data?.data?.accessToken) {
        setAccessToken(data.data.accessToken);
        setUser(data.data.user);
        showToast("Logged in successfully!", "success");
        setTimeout(() => (window.location.href = "index.html"), 500);
      }
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.classList.add("show");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = mode === "login" ? "Log In" : "Create Account";
    }
  });
}

// ============ Mobile Menu ============
function bindMobileMenu() {
  const mobileBtn = document.getElementById("mobileMenuBtn");
  const navMenu = document.getElementById("navMenu");
  if (mobileBtn && navMenu) {
    mobileBtn.addEventListener("click", () => {
      mobileBtn.classList.toggle("active");
      navMenu.classList.toggle("active");
      mobileBtn.setAttribute(
        "aria-expanded",
        mobileBtn.classList.contains("active")
      );
    });
    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileBtn.classList.remove("active");
        navMenu.classList.remove("active");
        mobileBtn.setAttribute("aria-expanded", "false");
      });
    });
  }
}

// ============ Init ============
document.addEventListener("DOMContentLoaded", async () => {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  if (currentPage === "auth.html") {
    await handleAuth();
    renderHeader();
    bindMobileMenu();
  } else if (currentPage === "post.html") {
    await loadPostPage();
  } else if (
    ["reviews.html", "rankings.html", "lists.html", "specials.html"].includes(
      currentPage
    )
  ) {
    await loadHomePage();
  } else {
    await loadHomePage();
  }
});

document.getElementById("currentYear").textContent = new Date().getFullYear();