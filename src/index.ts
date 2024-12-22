import { PrismaClient } from "@prisma/client";
import express, { Request, Response, NextFunction } from "express";
import createError from "http-errors";

const prisma = new PrismaClient();
const app = express();

// Middleware
app.use(express.json());

// Routes
// Feed routes
app.get("/feed", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const posts = await prisma.post.findMany({
      include: { author: true },
    });
    res.json(posts);
  } catch (error) {
    next(error);
  }
});

// Post routes
app.post("/post", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { content, authorEmail } = req.body;
    const result = await prisma.post.create({
      data: {
        content,
        author: { connect: { email: authorEmail } },
      },
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.get(
  "/post/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const post = await prisma.post.findUnique({
        where: { id: Number(id) },
      });
      if (!post) {
        return next(createError(404, "Post not found"));
      }
      res.json(post);
    } catch (error) {
      next(error);
    }
  }
);

app.put(
  "/post/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const post = await prisma.post.update({
        where: { id: Number(id) },
        data: { ...req.body },
      });
      res.json(post);
    } catch (error) {
      next(error);
    }
  }
);

app.delete(
  "/post/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const post = await prisma.post.delete({
        where: { id: Number(id) },
      });
      res.json(post);
    } catch (error) {
      next(error);
    }
  }
);

// User routes
app.post("/user", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await prisma.user.create({
      data: { ...req.body },
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.get(
  "/user/:username",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username } = req.params;
      const user = await prisma.user.findUnique({
        where: { username: String(username) },
      });
      if (!user) {
        return next(createError(404, "User not found"));
      }
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
);

// Error handling middleware (should be after all routes)
app.use((req: Request, res: Response, next: NextFunction) => {
  next(createError(404));
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message,
      status: err.status,
    },
  });
});

app.listen(3000, () =>
  console.log(`⚡️[server]: Server is running at http://localhost:3000`)
);
