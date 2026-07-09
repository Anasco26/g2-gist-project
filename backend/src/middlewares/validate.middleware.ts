import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";
import AppError from "../utils/app-error";

type SchemaSet = {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
};

type ValidationIssue = {
  field: string;
  message: string;
};

function formatIssues(
  issues: { path: PropertyKey[]; message: string }[],
  scope: "body" | "params" | "query",
) {
  return issues.map((issue) => ({
    field: [scope, ...issue.path.map((part) => String(part))]
      .filter(Boolean)
      .join("."),
    message: issue.message,
  }));
}

export default function validateRequest({ body, params, query }: SchemaSet) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const mutableReq = req as Request & {
      body: unknown;
      params: Record<string, string>;
      query: Record<string, string | string[] | undefined>;
    };
    const issues: ValidationIssue[] = [];

    if (body) {
      if (req.body === undefined || req.body === null) {
        issues.push({ field: "body", message: "Request body is required" });
      } else {
        const result = body.safeParse(req.body);
        if (!result.success) {
          issues.push(...formatIssues(result.error.issues, "body"));
        } else {
          mutableReq.body = result.data;
        }
      }
    }

    if (params) {
      const result = params.safeParse(req.params);
      if (!result.success) {
        issues.push(...formatIssues(result.error.issues, "params"));
      } else {
        mutableReq.params = result.data as Record<string, string>;
      }
    }

    if (query) {
      const result = query.safeParse(req.query);
      if (!result.success) {
        issues.push(...formatIssues(result.error.issues, "query"));
      } else {
        mutableReq.query = result.data as Record<
          string,
          string | string[] | undefined
        >;
      }
    }

    if (issues.length > 0) {
      return next(new AppError("Validation failed", 400, issues));
    }

    return next();
  };
}
