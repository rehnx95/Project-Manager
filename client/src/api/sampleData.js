import { authApi, decodeToken, request } from "./client.js";

const accountSpecs = [
  { name: "Riley Chen", slug: "riley", bio: "Product lead keeping the launch focused and moving." },
  { name: "Morgan Diaz", slug: "morgan", bio: "Designer turning research into clear, useful experiences." },
  { name: "Avery Patel", slug: "avery", bio: "Engineer building reliable tools for the team." },
];

const taskSpecs = [
  { title: "Write the project brief", priority: "high", days: 2, assignee: 0, tag: 0 },
  { title: "Map the first-run experience", priority: "high", days: 3, assignee: 1, tag: 1 },
  { title: "Review interview notes", priority: "medium", days: 4, assignee: 1, tag: 0 },
  { title: "Finalize the data model", priority: "high", days: 4, assignee: 2, tag: 2 },
  { title: "Build the sign-in flow", priority: "high", days: 5, assignee: 2, tag: 2 },
  { title: "Create the project overview", priority: "medium", days: 6, assignee: 0, tag: 1 },
  { title: "Set up the CI pipeline", priority: "medium", days: 6, assignee: 2, tag: 2 },
  { title: "Add task filters", priority: "low", days: 8, assignee: 0, tag: 1 },
  { title: "Check keyboard navigation", priority: "high", days: 8, assignee: 1, tag: 1 },
  { title: "Write the API guide", priority: "low", days: 9, assignee: 2, tag: 2 },
  { title: "Invite the pilot team", priority: "medium", days: 11, assignee: 0, tag: 3 },
  { title: "Review launch metrics", priority: "medium", days: 14, assignee: 0, tag: 3 },
];

const tags = ["Planning", "Design", "Engineering", "Launch"];

function randomPassword() {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return btoa(String.fromCharCode(...bytes)).replace(/[+/=]/g, "").slice(0, 24);
}

function publicAccounts(accounts) {
  return accounts.map(({ name, email, password }) => ({ name, email, password }));
}

function authorizedRequest(token, path, options = {}) {
  return request(path, {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${token}` },
  });
}

export async function createLinkedSampleData(onProgress = () => {}, onAccounts = () => {}) {
  const batch = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  const accounts = [];
  let projectCreated = false;
  try {
    onProgress("Creating three sample accounts…");
    for (const spec of accountSpecs) {
      const email = `${spec.slug}.${batch}@example.test`;
      const password = randomPassword();
      await authApi.signup({ email, password });
      const account = {
        ...spec,
        email,
        password,
        id: null,
        token: null,
        username: `${spec.slug}-${batch}`,
      };
      accounts.push(account);
      onAccounts(publicAccounts(accounts));
      const login = await authApi.login({ email, password });
      const user = decodeToken(login.token);
      if (!user?.id) throw new Error("The server returned an invalid account token.");
      account.id = user.id;
      account.token = login.token;
      await authorizedRequest(account.token, "/users/profile", {
        method: "POST",
        body: { name: account.name, bio: account.bio, username: account.username },
      });
    }

    const [owner, designer, engineer] = accounts;
    onProgress("Connecting the accounts to a shared project…");
    const project = await authorizedRequest(owner.token, "/projects", {
      method: "POST",
      body: {
        name: "Depot product launch",
        description: "A shared workspace for research, design, engineering, and launch readiness.",
        status: "active",
      },
    });
    projectCreated = true;
    const projectId = project.id;
    await authorizedRequest(owner.token, `/projects/${projectId}/users/${designer.id}`, {
      method: "POST",
      body: { role: "member" },
    });
    await authorizedRequest(owner.token, `/projects/${projectId}/users/${engineer.id}`, {
      method: "POST",
      body: { role: "member" },
    });

    onProgress("Adding tasks, tags, comments, and notes…");
    const projectTags = [];
    for (const tagName of tags) {
      const tag = await authorizedRequest(owner.token, `/projects/${projectId}/tags`, {
        method: "POST",
        body: { tag_name: tagName },
      });
      projectTags.push(tag);
    }

    const taskAccounts = [owner, designer, engineer];
    const createdTasks = [];
    for (let index = 0; index < taskSpecs.length; index += 1) {
      const spec = taskSpecs[index];
      const dueDate = new Date(Date.now() + spec.days * 86400000).toISOString().slice(0, 10);
      const task = await authorizedRequest(owner.token, `/projects/${projectId}/tasks`, {
        method: "POST",
        body: { title: spec.title, priority: spec.priority, due_date: dueDate },
      });
      createdTasks.push(task);
      const assignee = taskAccounts[spec.assignee];
      await authorizedRequest(owner.token, `/tasks/${task.id}/assignees/${assignee.id}`, { method: "POST" });
      await authorizedRequest(owner.token, `/tasks/${task.id}/tags/${projectTags[spec.tag].id}`, { method: "POST" });
      const commenter = taskAccounts[index % taskAccounts.length];
      await authorizedRequest(commenter.token, `/tasks/${task.id}/comments`, {
        method: "POST",
        body: { new_body: `I’ve reviewed “${spec.title}” and added it to our shared launch plan.` },
      });
    }

    for (const index of [0, 1, 2]) {
      await authorizedRequest(owner.token, `/tasks/${createdTasks[index].id}/complete`, { method: "PATCH" });
    }
    for (const account of accounts) {
      await authorizedRequest(account.token, "/users/notes", {
        method: "POST",
        body: {
          title: `${account.name.split(" ")[0]}’s launch notes`,
          body: "Keep decisions in the shared project, capture open questions here, and check the next due date before stand-up.",
        },
      });
    }

    onProgress("Sample workspace created.");
    return { accounts: publicAccounts(accounts), projectName: project.project_name || "Depot product launch", taskCount: createdTasks.length };
  } catch (reason) {
    const error = new Error(`${reason.message} The setup stopped early${projectCreated ? "; some project data may already exist" : "; some accounts may already exist"}.`);
    error.accounts = publicAccounts(accounts);
    throw error;
  }
}
