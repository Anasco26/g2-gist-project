const posts = [
  {
    title: "The Weekend Watchlist | Films & Series To Watch This Weekend",
    date: "May 8, 2026",
    category: "The Film Blog",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80",
    excerpt: "The weekend is here, and we've curated a blend of action thrillers, comedy, drama, and adventure to keep your weekend fun and entertaining.",
    tags: ["Animal Farm", "Mortal Kombat", "Netflix"]
  },
  {
    title: "AMVCA 2026: Who Will Go Home With the Best Movie Award?",
    date: "May 8, 2026",
    category: "Awards",
    image: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=800&q=80",
    excerpt: "The 2026 AMVCA is two days away. Heavy hitters are nominated in each category — here's our breakdown of the Best Movie Award nominees.",
    tags: ["AMVCA", "Best Movie", "Nollywood"]
  },
  {
    title: "A Billion Dollars Just Entered the African Film Ecosystem",
    date: "May 7, 2026",
    category: "Industry",
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80",
    excerpt: "The African Film Fund has just announced its biggest commitment yet, promising to reshape production budgets across the continent.",
    tags: ["Africa", "Film Fund", "Industry"]
  },
  {
    title: "Inside The Heineken House: Where Film Meets Festival Vibes",
    date: "May 6, 2026",
    category: "Cover Story",
    image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&q=80",
    excerpt: "We went behind the scenes at this year's Heineken House — a space where premieres, parties, and the loudest film conversations collided.",
    tags: ["Events", "Festival", "Premieres"]
  },
  {
    title: "Top 5 Nollywood Performances of the Year (So Far)",
    date: "May 5, 2026",
    category: "Rankings",
    image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80",
    excerpt: "From breakout newcomers to established stars going experimental — these are the performances we cannot stop talking about.",
    tags: ["Nollywood", "Acting", "Rankings"]
  },
  {
    title: "Why the Streaming Wars Are Reshaping African Cinema",
    date: "May 4, 2026",
    category: "Deep Dive",
    image: "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=800&q=80",
    excerpt: "Netflix, Showmax, and Prime are battling for African audiences — and creators are the ones rewriting the rules of distribution.",
    tags: ["Streaming", "Netflix", "Showmax"]
  }
];

const recent = [
  { title: "The AMVCA Red Carpet Is Where Nollywood Shines", img: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=200&q=80" },
  { title: "Weekend Recap: Stories You May Have Missed", img: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200&q=80" },
  { title: "Top 5 Stories Of The Day | Lagos Shuts Studios", img: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&q=80" },
  { title: "7 Afrobeats Songs That Were Bigger Than Movies Abroad", img: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&q=80" },
  { title: "8 Lagos Neighborhoods And Their Cinema Personalities", img: "https://images.unsplash.com/photo-1547721064-da6cfb341d50?w=200&q=80" }
];

function renderPosts() {
  const grid = document.getElementById('posts');
  grid.innerHTML = posts.map(p => `
    <article class="card">
      <img class="thumb" src="${p.image}" alt="${p.title}" loading="lazy" />
      <div class="body">
        <div class="date">${p.date}</div>
        <h2><a href="#">${p.title}</a></h2>
        <p>${p.excerpt}</p>
        <a href="#" class="read-more">Read More →</a>
        <div class="meta">
          <span class="cat">${p.category}</span>
          &nbsp;·&nbsp; ${p.tags.join(', ')}
        </div>
      </div>
    </article>
  `).join('');
}

function renderRecent() {
  const ul = document.getElementById('recent');
  ul.innerHTML = recent.map(r => `
    <li>
      <img src="${r.img}" alt="" />
      <a href="#">${r.title}</a>
    </li>
  `).join('');
}

document.getElementById('searchBtn').addEventListener('click', () => {
  const q = prompt('Search the Film Blog:');
  if (!q) return;
  const match = posts.filter(p =>
    p.title.toLowerCase().includes(q.toLowerCase()) ||
    p.excerpt.toLowerCase().includes(q.toLowerCase())
  );
  alert(match.length ? `Found ${match.length} post(s):\n\n` + match.map(m => '• ' + m.title).join('\n') : 'No posts found.');
});

// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.getElementById('navMenu');
const menuLinks = navMenu.querySelectorAll('a');

mobileMenuBtn.addEventListener('click', () => {
  mobileMenuBtn.classList.toggle('active');
  navMenu.classList.toggle('active');
  mobileMenuBtn.setAttribute('aria-expanded', mobileMenuBtn.classList.contains('active'));
});

// Close menu when a link is clicked
menuLinks.forEach(link => {
  link.addEventListener('click', () => {
    mobileMenuBtn.classList.remove('active');
    navMenu.classList.remove('active');
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
  });
});

renderPosts();
renderRecent();

// Set the current year in the footer
document.getElementById('currentYear').textContent = new Date().getFullYear();
