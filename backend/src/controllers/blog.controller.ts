import type { Request, Response } from "express";
import asyncHandler from "../utils/async-handler";
import AppError from "../utils/app-error";
import {
  addBlogComment,
  createBlog,
  deleteBlogBySlug,
  deleteBlogComment,
  findBlogById,
  getBlogBySlug,
  listBlogComments,
  listBlogs,
  toggleBlogFavorite,
  toggleBlogLike,
  updateBlogBySlug,
  updateBlogComment,
} from "../services/blog.service";

function requireUser(req: Request) {
  if (!req.user) {
    throw new AppError("You are not logged in", 401);
  }

  return req.user;
}

function getParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function requireParam(value: string | string[] | undefined, name: string) {
  const param = getParam(value);
  if (!param) {
    throw new AppError(`Missing ${name}`, 400);
  }

  return param;
}

function getAccess(user: NonNullable<Request["user"]>) {
  return {
    userId: user.id,
    role: user.role,
  };
}

export const createBlogHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const user = requireUser(req);
    const blog = await createBlog(user.id, req.body);

    res.status(201).json({
      status: "success",
      data: { blog },
    });
  },
);

export const getBlogsHandler = asyncHandler(
  async (_req: Request, res: Response) => {
    const blogs = await listBlogs();

    res.status(200).json({
      status: "success",
      results: blogs.length,
      data: { blogs },
    });
  },
);

export const getBlogBySlugHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const blog = await getBlogBySlug(requireParam(req.params.slug, "slug"));

    res.status(200).json({
      status: "success",
      data: { blog },
    });
  },
);

export const updateBlogHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const user = requireUser(req);
    const blog = await updateBlogBySlug(
      requireParam(req.params.slug, "slug"),
      getAccess(user),
      req.body,
    );

    res.status(200).json({
      status: "success",
      data: { blog },
    });
  },
);

export const deleteBlogHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const user = requireUser(req);
    await deleteBlogBySlug(requireParam(req.params.slug, "slug"), getAccess(user));

    res.status(204).send();
  },
);

export const toggleBlogLikeHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const user = requireUser(req);
    const result = await toggleBlogLike(
      requireParam(req.params.slug, "slug"),
      user.id,
    );

    res.status(200).json({
      status: "success",
      message: result.liked ? "Blog liked successfully" : "Blog unliked successfully",
      data: { blog: result.blog, liked: result.liked },
    });
  },
);

export const toggleBlogFavoriteHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const user = requireUser(req);
    const result = await toggleBlogFavorite(
      requireParam(req.params.slug, "slug"),
      user.id,
    );

    res.status(200).json({
      status: "success",
      message: result.favorited
        ? "Blog added to favorites successfully"
        : "Blog removed from favorites successfully",
      data: { blog: result.blog, favorited: result.favorited },
    });
  },
);

export const getBlogCommentsHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const comments = await listBlogComments(requireParam(req.params.slug, "slug"));

    res.status(200).json({
      status: "success",
      results: comments.length,
      data: { comments },
    });
  },
);

export const addBlogCommentHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const user = requireUser(req);
    const comment = await addBlogComment(
      requireParam(req.params.slug, "slug"),
      user.id,
      req.body,
    );

    res.status(201).json({
      status: "success",
      data: { comment },
    });
  },
);

export const updateBlogCommentHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const user = requireUser(req);
    const commentId = requireParam(req.params.commentId, "commentId");
    const comment = await updateBlogComment(
      commentId,
      getAccess(user),
      req.body.content,
    );

    res.status(200).json({
      status: "success",
      data: { comment },
    });
  },
);

export const deleteBlogCommentHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const user = requireUser(req);
    await deleteBlogComment(
      requireParam(req.params.commentId, "commentId"),
      getAccess(user),
    );

    res.status(204).send();
  },
);

export const getBlogByIdHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const blog = await findBlogById(requireParam(req.params.blogId, "blogId"));

    res.status(200).json({
      status: "success",
      data: { blog },
    });
  },
);
