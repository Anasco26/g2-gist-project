import dotenv from "dotenv";
dotenv.config();

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://mac@localhost:5432/movie_db?schema=public";

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

const posts = [
  {
    title: "The Weekend Watchlist | Films & Series To Watch This Weekend",
    category: "Lists",
    tag: { name: "netflix", caption: "Netflix picks" },
    content: `<img src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80" alt="Weekend watchlist" />
<p>The weekend is here, and we've curated a blend of action thrillers, comedy, drama, and adventure to keep your weekend fun and entertaining.</p>
<p>Whether you're in the mood for a gripping crime saga or a light-hearted comedy, this week's lineup has something for everyone. From the latest Netflix originals to hidden gems on streaming platforms, we've got you covered.</p>
<p>Our top pick this weekend is the highly anticipated series "Animal Farm" — a modern reimagining that has critics raving. Pair it with the new Mortal Kombat animated feature for a perfect double feature.</p>
<h3>Must-Watch This Weekend</h3>
<ul>
<li>Animal Farm (Netflix) — A bold animated adaptation</li>
<li>Mortal Kombat Legends (HBO Max) — Blood-pumping action</li>
<li>The Lost City (Paramount+) — Adventure comedy</li>
<li>Severance Season 2 (Apple TV+) — Mind-bending thriller</li>
</ul>`,
  },
  {
    title: "AMVCA 2026: Who Will Go Home With the Best Movie Award?",
    category: "Rankings",
    tag: { name: "amvca", caption: "AMVCA Awards" },
    content: `<img src="https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80" alt="AMVCA awards" />
<p>The 2026 AMVCA is two days away. Heavy hitters are nominated in each category — here's our breakdown of the Best Movie Award nominees.</p>
<p>This year's race is one of the tightest in recent memory, with five exceptional films vying for the top prize. From intimate character studies to sweeping epics, the nominees showcase the incredible depth of talent in African cinema.</p>
<h2>The Nominees</h2>
<ul>
<li><strong>"Lagos Nights"</strong> — A gripping crime drama set in the heart of Lagos</li>
<li><strong>"The Last Queen"</strong> — A historical epic about a forgotten African ruler</li>
<li><strong>"Echoes of Tomorrow"</strong> — A thought-provoking sci-fi from Nigeria</li>
<li><strong>"Where the Road Ends"</strong> — A touching family drama</li>
<li><strong>"Rhythm of the Savannah"</strong> — A vibrant musical celebration</li>
</ul>`,
  },
  {
    title: "A Billion Dollars Just Entered the African Film Ecosystem",
    category: "Deep Dive",
    tag: { name: "industry", caption: "Film Industry" },
    content: `<img src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80" alt="Film industry investment" />
<p>The African Film Fund has just announced its biggest commitment yet, promising to reshape production budgets across the continent.</p>
<p>In a landmark announcement, the African Film Fund revealed a $1 billion commitment to film production across the continent over the next five years. This represents the single largest investment in African cinema history.</p>
<p>The fund will support projects in 15 countries, with a focus on nurturing local talent, building infrastructure, and creating sustainable production ecosystems. Industry insiders are calling it a watershed moment for African storytelling.</p>
<h2>What This Means for Filmmakers</h2>
<p>The fund will provide grants for pre-production, production, and post-production, as well as financing for distribution and marketing. This comprehensive approach aims to address the long-standing challenge African filmmakers face in getting their work seen by global audiences.</p>`,
  },
  {
    title: "Inside The Heineken House: Where Film Meets Festival Vibes",
    category: "Cover Story",
    tag: { name: "events", caption: "Events & Festivals" },
    content: `<img src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80" alt="Heineken House event" />
<p>We went behind the scenes at this year's Heineken House — a space where premieres, parties, and the loudest film conversations collided.</p>
<p>The Heineken House has become one of the most anticipated experiences during film festival season. Combining the energy of a music festival with the glamour of a film premiere, it's where industry power players and film lovers converge.</p>
<p>This year's edition featured exclusive screenings of unreleased films, live podcast recordings with top directors, and surprise musical performances that kept the crowd buzzing well into the night.</p>`,
  },
  {
    title: "Top 5 Nollywood Performances of the Year (So Far)",
    category: "Rankings",
    tag: { name: "nollywood", caption: "Nollywood" },
    content: `<img src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80" alt="Nollywood performances" />
<p>From breakout newcomers to established stars going experimental — these are the performances we cannot stop talking about.</p>
<p>Nollywood has delivered some truly remarkable performances in 2026. Our critics have watched hundreds of films to bring you the five performances that have defined the year so far.</p>
<ol>
<li><strong>Chioma Akpotha</strong> in "The Silent Echo" — A career-defining turn</li>
<li><strong>Richard Mofe-Damijo</strong> in "Lagos Nights" — The veteran shows why he's still king</li>
<li><strong>Sharon Ooja</strong> in "Brave New World" — A breakout performance</li>
<li><strong>Blossom Chukwujekwu</strong> in "The Last Bridge" — Raw and vulnerable</li>
<li><strong>Osas Ighodaro</strong> in "Queen of the South" — Commanding and powerful</li>
</ol>`,
  },
  {
    title: "Why the Streaming Wars Are Reshaping African Cinema",
    category: "Deep Dive",
    tag: { name: "streaming", caption: "Streaming" },
    content: `<img src="https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=800&q=80" alt="Streaming platforms" />
<p>Netflix, Showmax, and Prime are battling for African audiences — and creators are the ones rewriting the rules of distribution.</p>
<p>The streaming revolution has fundamentally altered the landscape of African cinema. With global platforms competing for market share, African filmmakers have unprecedented access to international audiences.</p>
<p>Netflix's investment in Nigerian content has grown by 200% since 2023, while Showmax continues to dominate the local market with exclusive Nollywood releases. Meanwhile, Amazon Prime Video is quietly building a slate of original African productions that could shake up the status quo.</p>
<h2>The Creator's Perspective</h2>
<p>For African filmmakers, the streaming war means more opportunities, bigger budgets, and greater creative freedom. But it also raises important questions about ownership, representation, and the long-term sustainability of a platform-driven ecosystem.</p>`,
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  await prisma.blogFavorite.deleteMany();
  await prisma.blogLike.deleteMany();
  await prisma.blogComment.deleteMany();
  await prisma.blog.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  const hash = await bcrypt.hash("password123", 10);

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@g2gist.com",
      username: "admin",
      name: "Admin",
      password: hash,
      role: Role.ADMIN,
      isEmailVerified: true,
    },
  });
  console.log(`  ✓ Created admin: ${adminUser.email}`);

  const author = await prisma.user.create({
    data: {
      email: "writer@g2gist.com",
      username: "writer",
      name: "Staff Writer",
      password: hash,
      isEmailVerified: true,
    },
  });
  console.log(`  ✓ Created author: ${author.email}`);

  const commenter = await prisma.user.create({
    data: {
      email: "filmfan@example.com",
      username: "filmfan",
      name: "Film Fan",
      password: hash,
    },
  });
  console.log(`  ✓ Created commenter: ${commenter.email}`);

  for (const postData of posts) {
    const category = await prisma.category.upsert({
      where: { name: postData.category },
      create: { name: postData.category },
      update: {},
    });

    const tag = await prisma.tag.upsert({
      where: { name: postData.tag.name },
      create: postData.tag,
      update: {},
    });

    const slug = postData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const blog = await prisma.blog.create({
      data: {
        title: postData.title,
        content: postData.content,
        slug,
        published: true,
        publishedAt: new Date(),
        likeCount: Math.floor(Math.random() * 15) + 3,
        favoriteCount: Math.floor(Math.random() * 8) + 1,
        authorId: author.id,
        categoryId: category.id,
        tagId: tag.id,
      },
    });

    if (postData === posts[0]) {
      await prisma.blogComment.create({
        data: {
          content: "Great list! I'd add 'The Responder' to the watchlist too.",
          blogId: blog.id,
          authorId: commenter.id,
        },
      });
    }

    console.log(`  ✅ Created post: ${postData.title}`);
  }

  // Create draft/pending posts for admin review
  const drafts = [
    {
      title: "Is Nollywood Ready for a Virtual Production Revolution?",
      category: "Deep Dive",
      tag: { name: "technology", caption: "Film Technology" },
      content: `<p>Virtual production is transforming filmmaking worldwide, but can Nollywood afford to adopt it? We explore the challenges and opportunities.</p><p>With the success of The Mandalorian's LED wall technology, studios around the world are racing to adopt virtual production workflows. But for Nollywood, where budgets are tight and infrastructure is still catching up, the question remains: is it worth the investment?</p>`,
    },
    {
      title: "Afrobeats Soundtracks Are Taking Over Film — Here's Why",
      category: "Lists",
      tag: { name: "music", caption: "Music in Film" },
      content: `<p>From Black Panther to international blockbusters, Afrobeats is becoming the go-to genre for film soundtracks. Here are the tracks making waves.</p><p>The global rise of Afrobeats has not gone unnoticed by music supervisors. In 2026 alone, over 30 major film releases featured Afrobeats tracks, up from just 8 in 2020.</p>`,
    },
  ];

  for (const draftData of drafts) {
    const cat = await prisma.category.upsert({
      where: { name: draftData.category },
      create: { name: draftData.category },
      update: {},
    });
    const tag = await prisma.tag.upsert({
      where: { name: draftData.tag.name },
      create: draftData.tag,
      update: {},
    });
    const slug = draftData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    await prisma.blog.create({
      data: {
        title: draftData.title,
        content: draftData.content,
        slug,
        published: false,
        publishedAt: null,
        likeCount: 0,
        favoriteCount: 0,
        authorId: author.id,
        categoryId: cat.id,
        tagId: tag.id,
      },
    });
    console.log(`  ⏳ Created draft: ${draftData.title}`);
  }

  console.log("🌱 Seeding complete!");
  console.log(`\n📧 Demo accounts:`);
  console.log(`   Admin:   admin@g2gist.com / password123`);
  console.log(`   Writer:  writer@g2gist.com / password123`);
  console.log(`   Fan:     filmfan@example.com / password123`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());