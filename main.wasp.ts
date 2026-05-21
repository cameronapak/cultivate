import { App } from "wasp-config";

const app = new App("shapeUp", {
  title: "Cultivate - A Calm PKM Tool",
  wasp: {
    version: "^0.23.0",
  },
  head: [
    '<meta name="description" content="Imagine if Notion & Basecamp had a baby. Cultivate is a PKM tool where you can calmly brain dump, write, manage projects, and get things done." />',
    '<link rel="icon" type="image/x-icon" href="/favicon.ico" />',
    '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />',
    '<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />',
    '<link rel="apple-touch-icon" href="/apple-touch-icon.png" />',
    '<link rel="manifest" href="/site.webmanifest" />',
    '<meta property="og:url" content="https://cultivate.so" />',
    '<meta property="og:type" content="website" />',
    '<meta property="og:title" content="Cultivate" />',
    '<meta property="og:description" content="" />',
    '<meta property="og:image" content="/og-image.png" />',
    '<meta name="twitter:card" content="summary_large_image" />',
    '<meta property="twitter:domain" content="cultivate.so" />',
    '<meta property="twitter:url" content="https://cultivate.so" />',
    '<meta name="twitter:title" content="Cultivate" />',
    '<meta name="twitter:description" content="" />',
    '<meta name="twitter:image" content="/og-image.png" />',
  ],
});

app.client({
  setupFn: { import: "setupClient", from: "@src/client/setup" },
});

app.db({
  seeds: [
    { import: "seedDevInviteCode", from: "@src/server/scripts/seedDevData.js" },
  ],
});

app.auth({
  userEntity: "User",
  methods: {
    usernameAndPassword: {},
  },
  onAuthFailedRedirectTo: "/login",
});

const MainPage = app.page("MainPage", {
  authRequired: true,
  component: { import: "ProjectsPage", from: "@src/pages/ProjectsPage" },
});
app.route("RootRoute", { path: "/", to: MainPage });

const SignUpPage = app.page("SignUpPage", {
  component: { import: "SignUpPage", from: "@src/pages/SignUpPage" },
});
app.route("SignUpRoute", { path: "/signup", to: SignUpPage });

const LoginPage = app.page("LoginPage", {
  component: { import: "LoginPage", from: "@src/pages/LoginPage" },
});
app.route("LoginRoute", { path: "/login", to: LoginPage });

const CanvasesPage = app.page("CanvasesPage", {
  authRequired: true,
  component: { import: "CanvasesPage", from: "@src/client/pages/CanvasesPage" },
});
app.route("CanvasesRoute", { path: "/canvases", to: CanvasesPage });

const CanvasPage = app.page("CanvasPage", {
  authRequired: true,
  component: { import: "CanvasPage", from: "@src/client/pages/CanvasPage" },
});
app.route("CanvasRoute", { path: "/canvas/:id", to: CanvasPage });

const ProjectPage = app.page("ProjectPage", {
  authRequired: true,
  component: { import: "ProjectPage", from: "@src/pages/ProjectPage" },
});
app.route("ProjectRoute", { path: "/projects/:projectId", to: ProjectPage });

const InboxPage = app.page("InboxPage", {
  authRequired: true,
  component: { import: "InboxPage", from: "@src/pages/InboxPage" },
});
app.route("InboxRoute", { path: "/inbox", to: InboxPage });

const DocumentsPage = app.page("DocumentsPage", {
  authRequired: true,
  component: { import: "DocumentsPage", from: "@src/pages/DocumentsPage" },
});
app.route("DocumentsRoute", { path: "/documents", to: DocumentsPage });

const DocumentPage = app.page("DocumentPage", {
  authRequired: true,
  component: { import: "DocumentPage", from: "@src/pages/DocumentPage" },
});
app.route("DocumentRoute", {
  path: "/documents/:documentId",
  to: DocumentPage,
});

const CreateDocumentPage = app.page("CreateDocumentPage", {
  authRequired: true,
  component: {
    import: "CreateDocumentPage",
    from: "@src/pages/CreateDocumentPage",
  },
});
app.route("CreateDocumentRoute", {
  path: "/documents/new",
  to: CreateDocumentPage,
});

const SharedDocumentPage = app.page("SharedDocumentPage", {
  component: {
    import: "SharedDocumentPage",
    from: "@src/pages/SharedDocumentPage",
  },
});
app.route("SharedDocumentRoute", {
  path: "/shared/:documentId",
  to: SharedDocumentPage,
});

app.query("getProjects", {
  fn: { import: "getProjects", from: "@src/queries" },
  entities: ["Project", "Task", "Pitch", "Resource"],
});
app.query("getProject", {
  fn: { import: "getProject", from: "@src/queries" },
  entities: ["Project", "Task", "Pitch", "Resource"],
});
app.query("getProjectTasks", {
  fn: { import: "getProjectTasks", from: "@src/queries" },
  entities: ["Project", "Task"],
});
app.query("getProjectPitches", {
  fn: { import: "getProjectPitches", from: "@src/queries" },
  entities: ["Project", "Pitch"],
});
app.query("getProjectResources", {
  fn: { import: "getProjectResources", from: "@src/queries" },
  entities: ["Project", "Resource"],
});
app.query("getInboxTasks", {
  fn: { import: "getInboxTasks", from: "@src/queries" },
  entities: ["Task"],
});
app.query("getInboxResources", {
  fn: { import: "getInboxResources", from: "@src/queries" },
  entities: ["Resource"],
});
app.query("getInboxThoughts", {
  fn: { import: "getInboxThoughts", from: "@src/queries" },
  entities: ["Thought"],
});
app.query("getDocument", {
  fn: { import: "getDocument", from: "@src/queries" },
  entities: ["Document"],
});
app.query("getPublicDocument", {
  fn: { import: "getPublicDocument", from: "@src/queries" },
  entities: ["Document"],
});
app.query("getDocuments", {
  fn: { import: "getDocuments", from: "@src/queries" },
  entities: ["Document"],
});
app.query("globalSearch", {
  fn: { import: "globalSearch", from: "@src/queries" },
  entities: ["Task", "Resource", "Thought"],
});

app.action("createProject", {
  fn: { import: "createProject", from: "@src/queries" },
  entities: ["Project"],
});
app.action("updateProject", {
  fn: { import: "updateProject", from: "@src/queries" },
  entities: ["Project"],
});
app.action("pinProject", {
  fn: { import: "pinProject", from: "@src/queries" },
  entities: ["Project"],
});
app.action("deleteProject", {
  fn: { import: "deleteProject", from: "@src/queries" },
  entities: ["Project"],
});
app.action("createPitch", {
  fn: { import: "createPitch", from: "@src/queries" },
  entities: ["Project", "Pitch"],
});
app.action("updatePitch", {
  fn: { import: "updatePitch", from: "@src/queries" },
  entities: ["Pitch"],
});
app.action("deletePitch", {
  fn: { import: "deletePitch", from: "@src/queries" },
  entities: ["Pitch"],
});
app.action("createTask", {
  fn: { import: "createTask", from: "@src/queries" },
  entities: ["Project", "Task"],
});
app.action("updateTask", {
  fn: { import: "updateTask", from: "@src/queries" },
  entities: ["Task"],
});
app.action("updateTaskStatus", {
  fn: { import: "updateTaskStatus", from: "@src/queries" },
  entities: ["Task"],
});
app.action("deleteTask", {
  fn: { import: "deleteTask", from: "@src/queries" },
  entities: ["Task"],
});
app.action("createResource", {
  fn: { import: "createResource", from: "@src/queries" },
  entities: ["Project", "Resource"],
});
app.action("updateResource", {
  fn: { import: "updateResource", from: "@src/queries" },
  entities: ["Resource"],
});
app.action("deleteResource", {
  fn: { import: "deleteResource", from: "@src/queries" },
  entities: ["Resource"],
});
app.action("moveTask", {
  fn: { import: "moveTask", from: "@src/queries" },
  entities: ["Task", "Project"],
});
app.action("moveResource", {
  fn: { import: "moveResource", from: "@src/queries" },
  entities: ["Resource", "Project"],
});
app.action("createDocument", {
  fn: { import: "createDocument", from: "@src/queries" },
  entities: ["Document"],
});
app.action("updateDocument", {
  fn: { import: "updateDocument", from: "@src/queries" },
  entities: ["Document"],
});
app.action("deleteDocument", {
  fn: { import: "deleteDocument", from: "@src/queries" },
  entities: ["Document"],
});

app.action("saveCanvas", {
  fn: { import: "saveCanvas", from: "@src/queries" },
  entities: ["Canvas"],
});
app.query("loadCanvas", {
  fn: { import: "loadCanvas", from: "@src/queries" },
  entities: ["Canvas"],
});
app.query("getCanvases", {
  fn: { import: "getCanvases", from: "@src/queries" },
  entities: ["Canvas"],
});
app.action("createCanvas", {
  fn: { import: "createCanvas", from: "@src/queries" },
  entities: ["Canvas"],
});
app.action("deleteCanvas", {
  fn: { import: "deleteCanvas", from: "@src/queries" },
  entities: ["Canvas"],
});

app.action("updateProjectTaskOrder", {
  fn: { import: "updateProjectTaskOrder", from: "@src/queries" },
  entities: ["Project"],
});
app.action("updateProjectResourceOrder", {
  fn: { import: "updateProjectResourceOrder", from: "@src/queries" },
  entities: ["Project"],
});

app.query("getThoughts", {
  fn: { import: "getThoughts", from: "@src/queries" },
  entities: ["Thought"],
});
app.query("getThought", {
  fn: { import: "getThought", from: "@src/queries" },
  entities: ["Thought"],
});
app.action("createThought", {
  fn: { import: "createThought", from: "@src/queries" },
  entities: ["Project", "Thought"],
});
app.action("updateThought", {
  fn: { import: "updateThought", from: "@src/queries" },
  entities: ["Project", "Thought"],
});
app.action("deleteThought", {
  fn: { import: "deleteThought", from: "@src/queries" },
  entities: ["Project", "Thought"],
});
app.action("moveThought", {
  fn: { import: "moveThought", from: "@src/queries" },
  entities: ["Project", "Thought"],
});

app.api("getUrlMetadata", {
  auth: true,
  fn: { import: "getUrlMetadata", from: "@src/server/apis/urlMetadata" },
  httpRoute: { method: "GET", route: "/api/url-metadata" },
});
app.apiNamespace("urlMetadata", {
  middlewareConfigFn: {
    import: "urlMetadataNamespaceMiddlewareFn",
    from: "@src/server/apis/urlMetadata",
  },
  path: "/api",
});

app.action("checkInviteCode", {
  auth: false,
  fn: { import: "checkInviteCode", from: "@src/queries" },
  entities: ["InviteCode"],
});
app.action("claimInviteCode", {
  auth: true,
  fn: { import: "claimInviteCode", from: "@src/queries" },
  entities: ["InviteCode", "User"],
});
app.action("generateInviteCode", {
  auth: true,
  fn: { import: "generateInviteCode", from: "@src/queries" },
  entities: ["InviteCode", "User"],
});

app.query("getAwayTasks", {
  fn: { import: "getAwayTasks", from: "@src/queries" },
  entities: ["Task"],
});
app.query("getAwayResources", {
  fn: { import: "getAwayResources", from: "@src/queries" },
  entities: ["Resource"],
});
app.query("getAwayThoughts", {
  fn: { import: "getAwayThoughts", from: "@src/queries" },
  entities: ["Thought"],
});
app.query("getAwayTasksByDate", {
  fn: { import: "getAwayTasksByDate", from: "@src/queries" },
  entities: ["Task"],
});
app.query("getAwayResourcesByDate", {
  fn: { import: "getAwayResourcesByDate", from: "@src/queries" },
  entities: ["Resource"],
});
app.query("getAwayThoughtsByDate", {
  fn: { import: "getAwayThoughtsByDate", from: "@src/queries" },
  entities: ["Thought"],
});
app.query("getAwayTasksPaginated", {
  fn: { import: "getAwayTasksPaginated", from: "@src/queries" },
  entities: ["Task"],
});
app.query("getAwayResourcesPaginated", {
  fn: { import: "getAwayResourcesPaginated", from: "@src/queries" },
  entities: ["Resource"],
});
app.query("getAwayThoughtsPaginated", {
  fn: { import: "getAwayThoughtsPaginated", from: "@src/queries" },
  entities: ["Thought"],
});

app.action("sendTaskAway", {
  fn: { import: "sendTaskAway", from: "@src/queries" },
  entities: ["Task"],
});
app.action("returnTaskFromAway", {
  fn: { import: "returnTaskFromAway", from: "@src/queries" },
  entities: ["Task"],
});
app.action("sendResourceAway", {
  fn: { import: "sendResourceAway", from: "@src/queries" },
  entities: ["Resource"],
});
app.action("returnResourceFromAway", {
  fn: { import: "returnResourceFromAway", from: "@src/queries" },
  entities: ["Resource"],
});
app.action("sendThoughtAway", {
  fn: { import: "sendThoughtAway", from: "@src/queries" },
  entities: ["Thought"],
});
app.action("returnThoughtFromAway", {
  fn: { import: "returnThoughtFromAway", from: "@src/queries" },
  entities: ["Thought"],
});
app.query("getOldestAwayDate", {
  fn: { import: "getOldestAwayDate", from: "@src/queries" },
  entities: ["Task", "Resource", "Thought"],
});

export default app;
