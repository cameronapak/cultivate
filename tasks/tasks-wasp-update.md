## Relevant Files

- `main.wasp` - Wasp configuration file containing version specification
- `src/pages/LoginPage.tsx` - Login page component that uses the authentication API
- `tsconfig.json` - TypeScript configuration file requiring compiler option updates
- `tailwind.config.cjs` - Tailwind CSS configuration in CommonJS format (to be converted to ESM)
- `tailwind.config.js` - New ESM version of Tailwind configuration (to be created)
- `package.json` - Package dependencies file (may need Vite update)
- `src/server/apis/urlMetadata.ts` - Custom API middleware to review for Express 5 compatibility

### Notes

- This is a framework migration with no unit tests required
- The testing approach is minimal: build success + core functionality verification
- Follow the two-phase approach strictly (v0.17 first, then v0.18)
- Test builds after each phase before proceeding
- Keep commits atomic (separate commits for v0.17 and v0.18)

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:
- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

- [x] 0.0 Preparation and branch verification
  - [x] 0.1 Verify current branch is `claude/plan-wasp-update-011CUxnEaf4x9yCLC4vbf9eq`
  - [x] 0.2 Verify Node.js version is >=v22.12 (run `node --version`)
  - [x] 0.3 Ensure working directory is clean (run `git status`)
  - [x] 0.4 Read current `main.wasp` to confirm current version is 0.16.2

- [ ] 1.0 Phase 1: Update to Wasp v0.17
  - [x] 1.1 Update Wasp version in `main.wasp` from `^0.16.2` to `^0.17.0`
  - [x] 1.2 Read `src/pages/LoginPage.tsx` to locate the login function call
  - [x] 1.3 Update authentication API in `src/pages/LoginPage.tsx`
    - Change `await login(username, password)` to `await login({ username, password })`
  - [x] 1.4 Read current `tsconfig.json` to understand existing configuration
  - [x] 1.5 Update `tsconfig.json` compiler options:
    - Add `"moduleDetection": "force"` to `compilerOptions`
    - Add `"isolatedModules": true` to `compilerOptions`
    - Remove the `"typeRoots"` array (lines 36-46)
  - [x] 1.6 Read `src/server/apis/urlMetadata.ts` to review Express 5 compatibility
  - [x] 1.7 Verify no obvious Express 5 breaking changes in middleware code
  - [x] 1.8 Commit Phase 1 changes with message: "Update to Wasp v0.17"
  - [x] 1.9 Push Phase 1 commit to remote branch

- [ ] 2.0 Phase 2: Update to Wasp v0.18
  - [x] 2.1 Update Wasp version in `main.wasp` from `^0.17.0` to `^0.18.2`
  - [x] 2.2 Read current `tailwind.config.cjs` to understand the full configuration
  - [x] 2.3 Convert Tailwind config from CommonJS to ESM:
    - Change `const { resolveProjectPath } = require("wasp/dev")` to `import { resolveProjectPath } from "wasp/dev"`
    - Change `module.exports = {...}` to `export default {...}`
    - Change `require("tailwindcss-animate")` to `import tailwindcssAnimate from "tailwindcss-animate"`
    - Change `require('tailwindcss/plugin')` to `import plugin from "tailwindcss/plugin"`
    - Update the plugin usage from `require('tailwindcss/plugin')(function...)` to `plugin(function...)`
  - [x] 2.4 Save the converted configuration as `tailwind.config.js`
  - [x] 2.5 Delete the old `tailwind.config.cjs` file
  - [x] 2.6 Read `package.json` to check current Vite version
  - [x] 2.7 Note Vite version (Wasp may auto-update this via SDK, manual update only if needed)
  - [x] 2.8 Commit Phase 2 changes with message: "Update to Wasp v0.18"
  - [x] 2.9 Push Phase 2 commit to remote branch

- [ ] 3.0 Testing and validation
  - [ ] 3.1 Run `wasp build` to verify application builds without errors
  - [ ] 3.2 Check build output for TypeScript compilation errors
  - [ ] 3.3 If build succeeds, test authentication flow:
    - Verify login page loads
    - Verify login with valid credentials works
  - [ ] 3.4 Test basic navigation (projects, inbox, documents pages load)
  - [ ] 3.5 Run `wasp build start` to test production build locally
  - [ ] 3.6 Verify environment variables are validated correctly
  - [ ] 3.7 Document any issues or unexpected behaviors

- [ ] 4.0 Deployment and monitoring
  - [ ] 4.1 Review all changes one final time (git diff)
  - [ ] 4.2 Ensure all commits are pushed to `claude/plan-wasp-update-011CUxnEaf4x9yCLC4vbf9eq`
  - [ ] 4.3 Deploy application to production environment
  - [ ] 4.4 Monitor production logs for errors immediately after deployment
  - [ ] 4.5 Verify production authentication works (login/signup)
  - [ ] 4.6 Monitor for 24 hours and address any critical issues
  - [ ] 4.7 Document deployment completion and any lessons learned
