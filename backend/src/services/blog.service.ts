import { Prisma, Role } from "@prisma/client";
import prisma from "../db/prisma";
import AppError from "../utils/app-error";
import { publicUserSelect, type PublicUser } from "./user.service";

export const publicBlogTagSelect = {
  id: true,
  name: true,
  caption: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type PublicBlogTag = Prisma.TagGetPayload<{
  select: typeof publicBlogTagSelect;
}>;

export const publicBlogSelect = {
  id: true,
  title: true,
  content: true,
  slug: true,
  featured: true,
  published: true,
  publishedAt: true,
  viewCount: true,
  likeCount: true,
  favoriteCount: true,
  createdAt: true,
  updatedAt: true,
  author: {
    select: publicUserSelect,
  },
  category: true,
  tag: {
    select: publicBlogTagSelect,
  },
  _count: {
    select: {
      comments: true,
      likes: true,
      favorites: true,
    },
  },
} as const;

export type PublicBlog = Prisma.BlogGetPayload<{
  select: typeof publicBlogSelect;
}>;

export type PublicBlogComment = {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  blogId: string;
  authorId: string;
  parentId: string | null;
  author: PublicUser;
  replies: PublicBlogComment[];
};

type BlogAuthorAccess = {
  userId: string;
  role: Role;
};

type BlogInput = {
  title: string;
  content: string;
  slug?: string;
  category: {
    categoryId?: string;
    categoryName?: string;
  };
  tag?: {
    name: string;
    caption: string;
  } | null;
};

type BlogUpdateInput = Partial<Omit<BlogInput, "category">> & {
  category?: {
    categoryId?: string;
    categoryName?: string;
  };
  featured?: boolean;
  published?: boolean;
};

type CommentInput = {
  content: string;
  parentId?: string | null;
};

function slugify(value: string) {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "blog";
}

async function uniqueSlug(baseSlug: string, blogId?: string) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const candidate = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
    const existing = await prisma.blog.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing || existing.id === blogId) {
      return candidate;
    }
  }

  throw new AppError("Unable to generate a unique slug", 409);
}

async function resolveTag(tag: BlogInput["tag"]) {
  if (!tag) {
    return undefined;
  }

  return prisma.tag.upsert({
    where: { name: tag.name },
    create: tag,
    update: {
      caption: tag.caption,
    },
    select: publicBlogTagSelect,
  });
}

async function resolveCategory(category: BlogInput["category"]) {
  if (category.categoryId) {
    const existing = await prisma.category.findUnique({
      where: { id: category.categoryId },
      select: { id: true },
    });

    if (!existing) {
      throw new AppError("Category not found", 404);
    }

    return existing;
  }

  const name = category.categoryName?.trim();
  if (!name) {
    throw new AppError("Category is required", 400);
  }

  return prisma.category.upsert({
    where: { name },
    create: { name },
    update: {},
    select: { id: true },
  });
}

function buildCommentTree(comments: PublicBlogComment[]) {
  const commentMap = new Map<string, PublicBlogComment>();
  const roots: PublicBlogComment[] = [];

  comments.forEach((comment) => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  commentMap.forEach((comment) => {
    if (comment.parentId && commentMap.has(comment.parentId)) {
      commentMap.get(comment.parentId)!.replies.push(comment);
      return;
    }

    roots.push(comment);
  });

  return roots;
}

function canModifyBlog(access: BlogAuthorAccess, blogAuthorId: string) {
  return access.userId === blogAuthorId || access.role === Role.ADMIN;
}

function canModifyComment(access: BlogAuthorAccess, commentAuthorId: string) {
  return access.userId === commentAuthorId || access.role === Role.ADMIN;
}

async function assertBlogBySlug(slug: string) {
  const blog = await prisma.blog.findUnique({
    where: { slug },
    select: {
      ...publicBlogSelect,
      authorId: true,
      tagId: true,
      categoryId: true,
    },
  });

  if (!blog) {
    throw new AppError("Blog not found", 404);
  }

  return blog;
}

async function assertBlogById(blogId: string) {
  const blog = await prisma.blog.findUnique({
    where: { id: blogId },
    select: {
      ...publicBlogSelect,
      authorId: true,
      tagId: true,
      categoryId: true,
    },
  });

  if (!blog) {
    throw new AppError("Blog not found", 404);
  }

  return blog;
}

async function assertCommentById(commentId: string) {
  const comment = await prisma.blogComment.findUnique({
    where: { id: commentId },
    select: {
      id: true,
      blogId: true,
      authorId: true,
      parentId: true,
    },
  });

  if (!comment) {
    throw new AppError("Comment not found", 404);
  }

  return comment;
}

export async function createBlog(authorId: string, input: BlogInput) {
  const slugSource = input.slug ?? slugify(input.title);
  const slug = await uniqueSlug(slugSource);
  const category = await resolveCategory(input.category);
  const tag = await resolveTag(input.tag);

  return prisma.blog.create({
    data: {
      title: input.title,
      content: input.content,
      slug,
      author: {
        connect: { id: authorId },
      },
      featured: false,
      published: true,
      publishedAt: new Date(),
      category: {
        connect: { id: category.id },
      },
      tag: tag ? { connect: { id: tag.id } } : undefined,
    },
    select: publicBlogSelect,
  });
}

export async function listBlogs(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [blogs, total] = await Promise.all([
    prisma.blog.findMany({
      where: { published: true },
      select: publicBlogSelect,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.blog.count({ where: { published: true } }),
  ]);
  return { blogs, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function listAllBlogsAdmin(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [blogs, total] = await Promise.all([
    prisma.blog.findMany({
      select: publicBlogSelect,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.blog.count(),
  ]);
  return { blogs, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getBlogBySlug(slug: string) {
  const blog = await assertBlogBySlug(slug);
  const comments = await prisma.blogComment.findMany({
    where: { blogId: blog.id },
    orderBy: { createdAt: "asc" },
    include: {
      author: {
        select: publicUserSelect,
      },
    },
  });

  return {
    ...blog,
    comments: buildCommentTree(
      comments.map((comment) => ({
        ...comment,
        replies: [],
      })),
    ),
  };
}

export async function updateBlogBySlug(
  slug: string,
  access: BlogAuthorAccess,
  input: BlogUpdateInput,
) {
  const blog = await assertBlogBySlug(slug);
  const isOwner = access.userId === blog.authorId;
  const isAdmin = access.role === Role.ADMIN;

  if (!isOwner && !isAdmin) {
    throw new AppError("You do not have permission to edit this blog", 403);
  }

  const nextTitle = input.title ?? blog.title;
  const nextSlug =
    input.slug !== undefined
      ? await uniqueSlug(input.slug, blog.id)
      : input.title
        ? await uniqueSlug(slugify(nextTitle), blog.id)
        : blog.slug;
  const tag = input.tag === undefined ? undefined : await resolveTag(input.tag);
  const category =
    input.category === undefined ? undefined : await resolveCategory(input.category);

  if ((input.featured !== undefined || input.published !== undefined) && !isAdmin) {
    throw new AppError("Only admins can update featured or published status", 403);
  }

  return prisma.blog.update({
    where: { id: blog.id },
    data: {
      title: input.title,
      content: input.content,
      slug: nextSlug,
      category:
        category === undefined
          ? undefined
          : {
              connect: { id: category.id },
            },
      tag:
        input.tag === undefined
          ? undefined
          : tag
            ? { connect: { id: tag.id } }
            : { disconnect: true },
      featured: input.featured,
      published: input.published,
      publishedAt:
        input.published === undefined
          ? undefined
          : input.published
            ? blog.publishedAt ?? new Date()
            : null,
    },
    select: publicBlogSelect,
  });
}

export async function deleteBlogBySlug(slug: string, access: BlogAuthorAccess) {
  const blog = await assertBlogBySlug(slug);
  if (!canModifyBlog(access, blog.authorId)) {
    throw new AppError("You do not have permission to delete this blog", 403);
  }

  await prisma.blog.delete({
    where: { id: blog.id },
  });
}

export async function toggleBlogLike(slug: string, userId: string) {
  const blog = await assertBlogBySlug(slug);
  const existing = await prisma.blogLike.findUnique({
    where: {
      blogId_userId: {
        blogId: blog.id,
        userId,
      },
    },
    select: { id: true },
  });

  if (existing) {
    const [, updatedBlog] = await prisma.$transaction([
      prisma.blogLike.delete({
        where: {
          blogId_userId: {
            blogId: blog.id,
            userId,
          },
        },
      }),
      prisma.blog.update({
        where: { id: blog.id },
        data: {
          likeCount: { decrement: 1 },
        },
        select: publicBlogSelect,
      }),
    ]);

    return { blog: updatedBlog, liked: false };
  }

  const [, updatedBlog] = await prisma.$transaction([
    prisma.blogLike.create({
      data: {
        blogId: blog.id,
        userId,
      },
    }),
    prisma.blog.update({
      where: { id: blog.id },
      data: {
        likeCount: { increment: 1 },
      },
      select: publicBlogSelect,
    }),
  ]);

  return { blog: updatedBlog, liked: true };
}

export async function toggleBlogFavorite(slug: string, userId: string) {
  const blog = await assertBlogBySlug(slug);
  const existing = await prisma.blogFavorite.findUnique({
    where: {
      blogId_userId: {
        blogId: blog.id,
        userId,
      },
    },
    select: { id: true },
  });

  if (existing) {
    const [, updatedBlog] = await prisma.$transaction([
      prisma.blogFavorite.delete({
        where: {
          blogId_userId: {
            blogId: blog.id,
            userId,
          },
        },
      }),
      prisma.blog.update({
        where: { id: blog.id },
        data: {
          favoriteCount: { decrement: 1 },
        },
        select: publicBlogSelect,
      }),
    ]);

    return { blog: updatedBlog, favorited: false };
  }

  const [, updatedBlog] = await prisma.$transaction([
    prisma.blogFavorite.create({
      data: {
        blogId: blog.id,
        userId,
      },
    }),
    prisma.blog.update({
      where: { id: blog.id },
      data: {
        favoriteCount: { increment: 1 },
      },
      select: publicBlogSelect,
    }),
  ]);

  return { blog: updatedBlog, favorited: true };
}

export async function listBlogComments(slug: string) {
  const blog = await prisma.blog.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!blog) {
    return [];
  }

  const comments = await prisma.blogComment.findMany({
    where: { blogId: blog.id },
    orderBy: { createdAt: "asc" },
    include: {
      author: {
        select: publicUserSelect,
      },
    },
  });

  return buildCommentTree(
    comments.map((comment) => ({
      ...comment,
      replies: [],
    })),
  );
}

export async function addBlogComment(
  slug: string,
  authorId: string,
  input: CommentInput,
) {
  const blog = await assertBlogBySlug(slug);

  if (input.parentId) {
    const parentComment = await assertCommentById(input.parentId);
    if (parentComment.blogId !== blog.id) {
      throw new AppError("Parent comment does not belong to this blog", 400);
    }
  }

  return prisma.blogComment.create({
    data: {
      content: input.content,
      blogId: blog.id,
      authorId,
      parentId: input.parentId ?? null,
    },
    include: {
      author: {
        select: publicUserSelect,
      },
    },
  });
}

export async function updateBlogComment(
  commentId: string,
  access: BlogAuthorAccess,
  content: string,
) {
  const comment = await assertCommentById(commentId);
  if (!canModifyComment(access, comment.authorId)) {
    throw new AppError("You do not have permission to edit this comment", 403);
  }

  return prisma.blogComment.update({
    where: { id: comment.id },
    data: { content },
    include: {
      author: {
        select: publicUserSelect,
      },
    },
  });
}

export async function deleteBlogComment(
  commentId: string,
  access: BlogAuthorAccess,
) {
  const comment = await assertCommentById(commentId);
  const blog = await assertBlogById(comment.blogId);

  if (
    !canModifyComment(access, comment.authorId) &&
    !canModifyBlog(access, blog.authorId)
  ) {
    throw new AppError("You do not have permission to delete this comment", 403);
  }

  await prisma.blogComment.delete({
    where: { id: comment.id },
  });
}

export async function incrementViewCount(slug: string) {
  await prisma.blog.update({
    where: { slug },
    data: { viewCount: { increment: 1 } },
  });
}

export async function getRelatedPosts(slug: string, limit = 4) {
  const blog = await prisma.blog.findUnique({
    where: { slug },
    select: { tagId: true, id: true },
  });
  if (!blog || !blog.tagId) return [];

  return prisma.blog.findMany({
    where: {
      published: true,
      tagId: blog.tagId,
      id: { not: blog.id },
    },
    select: publicBlogSelect,
    take: limit,
    orderBy: { publishedAt: "desc" },
  });
}

export async function getPopularPosts(limit = 4) {
  return prisma.blog.findMany({
    where: { published: true },
    select: publicBlogSelect,
    orderBy: [{ viewCount: "desc" }, { likeCount: "desc" }],
    take: limit,
  });
}

export async function findBlogById(blogId: string) {
  return assertBlogById(blogId);
}
