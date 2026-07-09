import { Router } from "express";
import { Role } from "@prisma/client";
import {
  addBlogCommentHandler,
  createBlogHandler,
  deleteBlogCommentHandler,
  deleteBlogHandler,
  getAdminBlogsHandler,
  getBlogBySlugHandler,
  getBlogCommentsHandler,
  getBlogsHandler,
  toggleBlogFavoriteHandler,
  toggleBlogLikeHandler,
  updateBlogCommentHandler,
  updateBlogHandler,
} from "../controllers/blog.controller";
import { protect, authorizeRoles } from "../middlewares/auth.middleware";
import validateRequest from "../middlewares/validate.middleware";
import {
  blogCommentBodySchema,
  blogCommentIdParamsSchema,
  blogSlugParamsSchema,
  createBlogSchema,
  updateBlogCommentSchema,
  updateBlogSchema,
} from "../validations/blog.validation";

const router = Router();

router.get("/", getBlogsHandler);
router.get(
  "/admin",
  protect,
  authorizeRoles(Role.ADMIN, Role.MODERATOR),
  getAdminBlogsHandler,
);
router.post(
  "/",
  protect,
  validateRequest({ body: createBlogSchema }),
  createBlogHandler,
);
router.get(
  "/:slug",
  validateRequest({ params: blogSlugParamsSchema }),
  getBlogBySlugHandler,
);
router.patch(
  "/:slug",
  protect,
  validateRequest({ params: blogSlugParamsSchema, body: updateBlogSchema }),
  updateBlogHandler,
);
router.delete(
  "/:slug",
  protect,
  validateRequest({ params: blogSlugParamsSchema }),
  deleteBlogHandler,
);
router.post(
  "/:slug/likes",
  protect,
  validateRequest({ params: blogSlugParamsSchema }),
  toggleBlogLikeHandler,
);
router.post(
  "/:slug/favorites",
  protect,
  validateRequest({ params: blogSlugParamsSchema }),
  toggleBlogFavoriteHandler,
);
router.get(
  "/:slug/comments",
  validateRequest({ params: blogSlugParamsSchema }),
  getBlogCommentsHandler,
);
router.post(
  "/:slug/comments",
  protect,
  validateRequest({
    params: blogSlugParamsSchema,
    body: blogCommentBodySchema,
  }),
  addBlogCommentHandler,
);
router.patch(
  "/comments/:commentId",
  protect,
  validateRequest({
    params: blogCommentIdParamsSchema,
    body: updateBlogCommentSchema,
  }),
  updateBlogCommentHandler,
);
router.delete(
  "/comments/:commentId",
  protect,
  validateRequest({ params: blogCommentIdParamsSchema }),
  deleteBlogCommentHandler,
);

export default router;
