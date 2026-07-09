import { z } from "zod";

const slugSchema = z
  .string()
  .trim()
  .min(3)
  .max(120)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug can only contain lowercase letters, numbers, and hyphens",
  );

export const blogSlugParamsSchema = z.object({
  slug: slugSchema,
});

export const blogIdParamsSchema = z.object({
  blogId: z.string().cuid("Invalid blog id"),
});

export const blogCommentIdParamsSchema = z.object({
  commentId: z.string().cuid("Invalid comment id"),
});

export const blogTagSchema = z.object({
  name: z.string().trim().min(2).max(60),
  caption: z.string().trim().min(2).max(160),
});

const blogCategoryInputSchema = z
  .object({
    categoryId: z.string().trim().min(1).max(120).optional(),
    categoryName: z.string().trim().min(2).max(120).optional(),
  })
  .refine((value) => Boolean(value.categoryId || value.categoryName), {
    message: "Provide categoryId or categoryName",
  })
  .refine((value) => !(value.categoryId && value.categoryName), {
    message: "Provide only one of categoryId or categoryName",
  });

const blogBodySchema = z.object({
  title: z.string().trim().min(3).max(200),
  content: z.string().trim().min(10),
  slug: slugSchema.optional(),
  tag: blogTagSchema.optional().nullable(),
  category: blogCategoryInputSchema,
});

export const createBlogSchema = blogBodySchema;

export const updateBlogSchema = z
  .object({
    title: z.string().trim().min(3).max(200).optional(),
    content: z.string().trim().min(10).optional(),
    slug: slugSchema.optional(),
    tag: blogTagSchema.optional().nullable(),
    category: z
      .object({
        categoryId: z.string().trim().min(1).max(120).optional(),
        categoryName: z.string().trim().min(2).max(120).optional(),
      })
      .refine((value) => Boolean(value.categoryId || value.categoryName), {
        message: "Provide categoryId or categoryName",
      })
      .refine((value) => !(value.categoryId && value.categoryName), {
        message: "Provide only one of categoryId or categoryName",
      })
      .optional(),
    featured: z.boolean().optional(),
    published: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export const blogCommentBodySchema = z.object({
  content: z.string().trim().min(1).max(5000),
  parentId: z.string().cuid("Invalid comment id").optional().nullable(),
});

export const updateBlogCommentSchema = z.object({
  content: z.string().trim().min(1).max(5000),
});
