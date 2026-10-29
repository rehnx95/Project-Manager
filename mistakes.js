/**
 * MISTAKES.JS — Personal bug/mistake reference log
 * ---------------------------------------------------
 * Purpose: catalogue of every mistake pattern I've made while building
 * my backend project (Express + PostgreSQL + Zod). Reviewed before
 * writing new code, and after finishing a feature, as a self-check.
 *
 * Format: each category has a short "rule to remember" + the actual
 * mistakes I made under it.
 */

const mistakes = {

  // 1. MISSING `await` ON ASYNC CALLS ---------------------------------
  missingAwait: {
    rule: "Every DB call and every service call that returns a Promise MUST be awaited. If a function uses async work, check every call site.",
    examples: [
      `pool.query(...) called without await in updateProject / completeTask / updateTask`,
      `getMembership(...) called without await in tasksService.deleteTask and projectsService.updateProject`,
    ],
  },

  // 2. SCHEMA / COLUMN NAME DRIFT (JS <-> SQL mismatch) ----------------
  schemaColumnDrift: {
    rule: "Column names in SQL and property names in JS must match EXACTLY. Keep the schema file open while writing queries — don't type from memory.",
    examples: [
      `project_name vs name mismatch in project service payload mapping`,
      `tags column referenced as tag_name / tag_id / tags_id inconsistently`,
      `profile vs profiles table name mismatch`,
      `task.project used instead of task.project_id`,
      `COALESCE($2, project_id) should have been COALESCE($2, project_name)`,
      `Missing $5 placeholder for a 5-column INSERT`,
    ],
  },

  // 3. EXPORT / IMPORT / CALL NAME MISMATCHES --------------------------
  nameMismatches: {
    rule: "Use editor autocomplete / go-to-definition instead of typing function names from memory. Casing counts (getOneTask !== getoneTask).",
    examples: [
      `getoneProject called vs exported getOneProject`,
      `getoneTask called vs exported getOneTask`,
      `commentsDatabse (typo import) vs commentsDatabase (used but never declared)`,
      `userRepository.getall() called when module was imported as usersDatabase`,
      `tagsDatabase.getOneTag called vs exported getoneTag`,
      `taskService.getTask called — doesn't exist; real name is getTaskByUser`,
    ],
  },

  // 4. UNDECLARED / UNDEFINED VARIABLE REFERENCES ----------------------
  undefinedVariables: {
    rule: "Before using a variable, confirm it's actually a parameter or was declared/fetched earlier in that scope.",
    examples: [
      `user_id used in getCommentByTask without being a function parameter`,
      `role / new_role referenced in changeMemberRole with no such parameter declared`,
      `const countOwner = await countOwner(...) — self-referential temporal dead zone`,
      `targetMembership used without ever being fetched`,
      `email logged instead of actual param newEmail`,
      `task logged instead of actual variable outcome`,
      `Missing require("zod") for z before use`,
    ],
  },

  // 5. SYNTAX ERRORS (parser-level crashes) ----------------------------
  syntaxErrors: {
    rule: "Read error messages top to bottom — syntax errors crash the whole process, not just one function. Watch for trailing commas, missing quotes, malformed requires.",
    examples: [
      `Trailing comma in DDL: role user_role NOT NULL DEFAULT 'user',`,
      `const { success } = require("zod") — invalid/illegal destructure`,
      `require(../db) missing quotes`,
      `Unquoted strings inside console.log(...)`,
      `Double space in "INSERT INTO  profile"`,
    ],
  },

  // 6. MISSING NODE/DB DEPENDENCIES ------------------------------------
  missingDependencies: {
    rule: "If using a built-in or extension function, confirm it's imported/enabled before calling it.",
    examples: [
      `crypto.randomUUID() used without require("crypto")`,
      `uuid_generate_v4() used without CREATE EXTENSION "uuid-ossp"`,
    ],
  },

  // 7. TRUTHY EMPTY-ARRAY MISCONCEPTION ---------------------------------
  truthyEmptyArray: {
    rule: "[] is truthy in JS. Never use if (!result) to check 'not found' on a DB query result — check result.length === 0 or result.rows.length === 0 instead.",
    examples: [
      `if (!result) / if (!project) used to detect "not found" — fails because [] is truthy`,
      `Recurred in: findByEmail checks, comment fetch checks, project fetch checks`,
    ],
  },

  // 8. OPERATOR LOGIC / PRECEDENCE BUGS ----------------------------------
  operatorLogicBugs: {
    rule: "Parenthesize comparisons explicitly when combining ! and !==. Don't trust operator precedence from memory.",
    examples: [
      `!membership.role !== "owner" — precedence bug, always evaluated true, blocked deletion permanently`,
      `Backwards role check in createTask — blocked members instead of allowing them`,
    ],
  },

  // 9. AUTHORIZATION / PERMISSION LOGIC FLAWS ----------------------------
  authorizationFlaws: {
    rule: "Always ask: 'whose identity should this check?' — the REQUESTER's, not the target's. Keep authorization rules consistent across sibling functions.",
    examples: [
      `Checked target user's membership instead of requester's (removeMemberFromProject)`,
      `Checked task assignee (task.user_id) instead of project ownership (deleteAllCommentFromTask)`,
      `"Last owner" guard ran on every call regardless of whether target was an owner`,
      `Inconsistent rules across sibling functions (assignee vs member vs owner) with no stated reason`,
      `Missing authorization entirely in early updateTask/getOneTask`,
      `Lost ownership checks in createComment/getCommentByTask while deleteAllCommentFromTask kept one`,
    ],
  },

  // 10. CHECK-ORDER BUGS ---------------------------------------------------
  checkOrderBugs: {
    rule: "Always check existence (if (!record)) BEFORE accessing any of its properties.",
    examples: [
      `Accessed project.user_id before checking if (!project), crashing on nonexistent records`,
    ],
  },

  // 11. VALIDATION HANDLING ERRORS (Zod) -----------------------------------
  validationErrors: {
    rule: "safeParse() always returns a truthy object — check .success explicitly. Use result.data (validated), never raw req.body, after validating.",
    examples: [
      `if (!result) used on safeParse() — always truthy, invalid data passed through`,
      `result.error.issue (doesn't exist) vs correct result.error.issues / .errors`,
      `Validated data computed (result.data) but raw req.body used anyway`,
      `result.success never checked before using result.data`,
      `Converted value (Number(requested_id)) computed but original string passed on`,
      `z.date() used against JSON body (can never contain a real Date instance)`,
      `Create schema reused for update, forcing irrelevant required fields`,
    ],
  },

  // 12. MISSING RETURN STATEMENTS ------------------------------------------
  missingReturns: {
    rule: "After a DB query executes, confirm you're returning the row(s), not just running the query.",
    examples: [
      `completeTask repo method never returned result.rows[0]`,
      `getProfile (first version) never returned result.rows[0]`,
    ],
  },

  // 13. RETURN-VALUE TRUNCATION --------------------------------------------
  returnValueTruncation: {
    rule: "result.rows[0] is for single-row results only. For multi-row operations (bulk delete/update), return result.rows (the full array).",
    examples: [
      `result.rows[0] used on multi-row operations (e.g. deleteAllCommentFromTask), dropping all but one record`,
    ],
  },

  // 14. HTTP RESPONSE HANDLING ERRORS --------------------------------------
  httpResponseErrors: {
    rule: "204 responses must have NO body. Always check outcome.success (matching the actual field name) before deciding the HTTP status.",
    examples: [
      `res.status(204).json({}) instead of .send()`,
      `Failure branch never checked before responding success (deleteTask)`,
      `Wrong field checked on outcome (outcome.status checked, but service returns success)`,
      `success: true sent alongside an error message in the same payload`,
      `outcome.total_pages read when service returned totalPages`,
    ],
  },

  // 15. MISSING EARLY RETURN (double-response risk) ------------------------
  missingEarlyReturn: {
    rule: "After any guard clause that might send a response (e.g. parseIdParam failing), always `return` immediately — never let code fall through.",
    examples: [
      `parseIdParam called twice with no return after the first failure — risk of two res.json() calls per request`,
    ],
  },

  // 16. FALSE-SUCCESS ON NO-OP WRITES --------------------------------------
  falseSuccessNoOpWrites: {
    rule: "Before UPDATE/DELETE, confirm a matching row exists first, or check rowCount after the query — don't assume success just because no error was thrown.",
    examples: [
      `UPDATE/DELETE run without confirming the target was actually a member first — zero-row match still returned success: true`,
    ],
  },

  // 17. EMPTY RESULT MISCLASSIFIED AS ERROR --------------------------------
  emptyResultMisclassified: {
    rule: "An empty list is a valid, successful result — not a failure. Don't conflate 'no rows' with 'query failed'.",
    examples: [
      `Legitimately empty list responses (getCommentByTask/getCommentByUser) returned success: false`,
    ],
  },

  // 18. INCONSISTENT "NOT FOUND" SIGNALING ---------------------------------
  inconsistentNotFoundSignaling: {
    rule: "Pick ONE shape for 'not found' responses across the whole codebase (e.g. always { success: false, error }) and use it everywhere.",
    examples: [
      `getMembership returned { success: true, value: undefined } instead of { success: false, error }`,
    ],
  },

  // 19. ROUTE REGISTRATION BUGS (Express) ----------------------------------
  routeRegistrationBugs: {
    rule: "Register specific/literal routes BEFORE wildcard/param routes (e.g. /users/profile before /users/:id). Double-check every controller has a matching route.",
    examples: [
      `Wildcard /:name or /:requested_id registered before specific literal routes, shadowing them`,
      `Controllers written (addTagToTask, getTaskTags, removeTagFromTask) with no route ever registered`,
    ],
  },

  // 20. BROKEN REQUIRE PATHS -------------------------------------------------
  brokenRequirePaths: {
    rule: "Relative requires need './' for same-level and correct '/' between folder segments. Let the editor autocomplete the path.",
    examples: [
      `require("controller/UserController") missing ./`,
      `require("..repository/UserRepo") missing /`,
    ],
  },

  // 21. DEAD / UNUSED IMPORTS -------------------------------------------------
  deadUnusedImports: {
    rule: "If an import isn't used, delete it. If it's destructured from a module, confirm that property actually exists as a named export.",
    examples: [
      `const { success } = require("zod") — not a real export, unused, repeated across multiple files`,
      `projectRepository imported into comment service but never used`,
    ],
  },

  // 22. SECURITY GAPS -----------------------------------------------------
  securityGaps: {
    rule: "Every mutating/protected route needs auth middleware AND resource-level authorization (not just 'is logged in', but 'is allowed to touch THIS resource').",
    examples: [
      `Missing authenticateToken on project creation route`,
      `Missing project-level authorization (any authenticated user could act on any project)`,
      `Stale JWT accepted for a deleted user (no DB existence check)`,
      `Timing side-channel reopened by reusing signupSchema (min-length check) on login`,
    ],
  },

  // 23. NAMING / DESIGN CONVENTION ISSUES (non-breaking) ----------------------
  namingDesignIssues: {
    rule: "Keep route plurality, controller names, and REST conventions consistent. Avoid redundant endpoints for auto-created resources.",
    examples: [
      `Plural route (/tasks) mapped to singular controller name (getTaskByProject)`,
      `Redundant POST /users/profile alongside auto-created profile flow`,
      `Repetitive if (id === null) return; boilerplate instead of middleware`,
    ],
  },

  // 24. MISC EARLY-STAGE BUGS ------------------------------------------------
  miscEarlyStageBugs: {
    rule: "Slow down on basics: correct status codes, correct console method, careful copy-paste during rewrites.",
    examples: [
      `Hardcoded statusCode = 200 on a 404 route`,
      `console.timeLog used instead of console.log`,
      `Duplicate-email check placed in /login instead of /signup, and real user lookup deleted in the same rewrite, crashing every login`,
    ],
  },

};

// -------------------------------------------------------------------------
// META PATTERN — the single highest-leverage thing to fix:
// Most of the bugs above (esp. categories 2, 3, 4, 11) come from writing a
// variable/column/function name from memory or assumption instead of
// checking the actual declared name. Lean on editor autocomplete and
// go-to-definition instead of typing names freehand.
// -------------------------------------------------------------------------
