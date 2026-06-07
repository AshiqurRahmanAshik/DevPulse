import type { JwtPayload } from "jsonwebtoken";
import { pool } from "../../db/db";

interface UserPayload {
  id: number;
  name: string;
  role: string;
}

const createIssueService = async (
  payload: {
    title: string;
    description: string;
    type: string;
  },
  user: UserPayload,
) => {
  const { title, description, type } = payload;

  // 1. validation
  if (!title || !description || !type) {
    throw new Error("All fields are required");
  }

  if (description.length < 20) {
    throw new Error("Description must be at least 20 characters");
  }

  if (title.length > 150) {
    throw new Error("Title max 150 characters");
  }

  if (!["bug", "feature_request"].includes(type)) {
    throw new Error("Invalid issue type");
  }

  // 2. insert into DB
  const result = await pool.query(
    `INSERT INTO issues 
    (title, description, type, status, reporter_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,
    [title, description, type, "open", user.id],
  );

  return result.rows[0];
};

const getIssuesService = async (filters: {
  sort?: string;
  type?: string;
  status?: string;
}) => {
  const { sort = "newest", type, status } = filters;

  // 1. base query
  let query = `SELECT * FROM issues`;
  const values: any[] = [];
  const conditions: string[] = [];

  // 2. filtering logic
  if (type) {
    values.push(type);
    conditions.push(`type = $${values.length}`);
  }

  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  if (conditions.length > 0) {
    query += ` WHERE ` + conditions.join(" AND ");
  }

  // 3. sorting logic
  if (sort === "oldest") {
    query += ` ORDER BY created_at ASC`;
  } else {
    query += ` ORDER BY created_at DESC`;
  }

  // 4. get issues
  const result = await pool.query(query, values);

  const issues = result.rows;

  // 5. reporter info manually attach (NO JOIN rule follow)
  const enrichedIssues = [];

  for (const issue of issues) {
    const userResult = await pool.query(
      `SELECT id, name, role FROM users WHERE id = $1`,
      [issue.reporter_id],
    );

    enrichedIssues.push({
      ...issue,
      reporter: userResult.rows[0],
    });
  }

  return enrichedIssues;
};

const getSingleIssueService = async (id: number) => {
  // 1. get issue
  const issueResult = await pool.query(`SELECT * FROM issues WHERE id = $1`, [
    id,
  ]);

  const issue = issueResult.rows[0];

  if (!issue) {
    return null;
  }

  // 2. get reporter info (NO JOIN rule follow)
  const userResult = await pool.query(
    `SELECT id, name, role FROM users WHERE id = $1`,
    [issue.reporter_id],
  );

  const reporter = userResult.rows[0];

  // 3. combine result
  return {
    ...issue,
    reporter,
  };
};

const updateIssueService = async (
  issueId: number,
  payload: any,
  user: JwtPayload,
) => {
  const { title, description, type, status } = payload;

  // 1. issue find
  const issueResult = await pool.query(`SELECT * FROM issues WHERE id = $1`, [
    issueId,
  ]);

  const issue = issueResult.rows[0];

  if (!issue) {
    throw new Error("Issue not found");
  }

  // 2. permission check (VERY IMPORTANT)

  const isOwner = issue.reporter_id === user.id;
  const isMaintainer = user.role === "maintainer";

  // contributor rule
  if (!isMaintainer) {
    if (!isOwner) {
      throw new Error("You cannot update this issue");
    }

    if (issue.status !== "open") {
      throw new Error("You can only update open issues");
    }
  }

  // 3. update query
  const result = await pool.query(
    `UPDATE issues
     SET title = COALESCE($1, title),
         description = COALESCE($2, description),
         type = COALESCE($3, type),
         status = COALESCE($4, status),
         updated_at = NOW()
     WHERE id = $5
     RETURNING *`,
    [title, description, type, status, issueId],
  );

  return result.rows[0];
};

const deleteIssueService = async (issueId: number, user: JwtPayload) => {
  // 1. check issue exists
  const issueResult = await pool.query(`SELECT * FROM issues WHERE id = $1`, [
    issueId,
  ]);

  const issue = issueResult.rows[0];

  if (!issue) {
    throw new Error("Issue not found");
  }

  // 2. ONLY maintainer can delete
  if (user.role !== "maintainer") {
    throw new Error("Only maintainer can delete issues");
  }

  // 3. delete issue
  await pool.query(`DELETE FROM issues WHERE id = $1`, [issueId]);

  return true;
};

export const issueService = {
  createIssueService,
  getIssuesService,
  getSingleIssueService,
  updateIssueService,
  deleteIssueService,
};
