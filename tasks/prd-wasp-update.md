# PRD: Wasp Framework Update (0.16.2 → 0.18.2)

## Introduction/Overview

This PRD outlines the migration of the Cultivate application from Wasp v0.16.2 to v0.18.2 (latest stable release). The update is necessary to maintain security and stability by staying current with the Wasp framework. This is a maintenance upgrade that will address breaking changes across two major version increments (0.16 → 0.17 → 0.18) while minimizing disruption to the application.

**Problem:** The application is currently running on Wasp v0.16.2, which is several versions behind the latest stable release. Running outdated framework versions poses security risks and may limit future development capabilities.

**Goal:** Successfully upgrade to Wasp v0.18.2 while maintaining all existing functionality and minimizing downtime.

## Goals

1. **Security & Stability:** Update to latest stable Wasp version (0.18.2) to ensure security patches and framework improvements are applied
2. **Code Compatibility:** Address all breaking changes from v0.17 and v0.18 to ensure the application builds and runs correctly
3. **Minimal Disruption:** Complete the update with minimal testing overhead while ensuring core functionality works
4. **Fast Execution:** Complete within 1 week timeline (urgent priority)

## User Stories

**As a developer:**
- I want the application to run on the latest stable Wasp version so that we benefit from security updates and framework improvements
- I want clear documentation of all changes made during the migration so that future developers understand what was updated
- I want the migration to be completed quickly so that we can continue feature development

**As a product owner:**
- I want minimal downtime during the update so that users can continue accessing the application
- I want confidence that the core user flows (auth, projects, documents) still work after the update

## Functional Requirements

### Phase 1: Update to Wasp v0.17.x

**FR1.1:** Update `main.wasp` version field from `^0.16.2` to `^0.17.0`

**FR1.2:** Update authentication API call in `src/pages/LoginPage.tsx`
- Current: `await login(username, password)`
- Required: `await login({ username, password })`

**FR1.3:** Update TypeScript configuration in `tsconfig.json`
- Add `"moduleDetection": "force"` to `compilerOptions`
- Add `"isolatedModules": true` to `compilerOptions`
- Remove `"typeRoots"` array (lines 36-46)

**FR1.4:** Review custom API middleware for Express 5 compatibility
- Review: `src/server/apis/urlMetadata.ts`
- Verify: `urlMetadataNamespaceMiddlewareFn` works with Express 5

**FR1.5:** Verify the application builds successfully with `wasp build`

**FR1.6:** Test core authentication flows (login/signup work)

### Phase 2: Update to Wasp v0.18.x

**FR2.1:** Update `main.wasp` version field from `^0.17.0` to `^0.18.2`

**FR2.2:** Convert Tailwind configuration from CommonJS to ESM
- Rename: `tailwind.config.cjs` → `tailwind.config.js`
- Convert: `const { resolveProjectPath } = require("wasp/dev")` → `import { resolveProjectPath } from "wasp/dev"`
- Convert: `module.exports = {...}` → `export default {...}`
- Convert: `require("tailwindcss-animate")` → `import tailwindcssAnimate from "tailwindcss-animate"`
- Convert: `require('tailwindcss/plugin')` → `import plugin from "tailwindcss/plugin"`

**FR2.3:** Update Vite dependency in `package.json`
- Update from `^4.3.9` to version compatible with Wasp 0.18 (likely Vite 7.x)
- Note: Wasp may handle this automatically via its SDK

**FR2.4:** Verify the application builds successfully with `wasp build`

**FR2.5:** Test production build locally using new `wasp build start` command

**FR2.6:** Test core application flows (login, navigation, viewing projects/documents)

### Deployment

**FR3.1:** Commit all changes with clear commit message documenting the Wasp version update

**FR3.2:** Push to the designated branch: `claude/plan-wasp-update-011CUxnEaf4x9yCLC4vbf9eq`

**FR3.3:** Deploy to production environment

**FR3.4:** Monitor for errors post-deployment

## Non-Goals (Out of Scope)

1. **Feature Adoption:** We will NOT implement new features available in 0.17/0.18 (Railway deployment, Decimal types, etc.) unless absolutely necessary for the migration
2. **Comprehensive Testing:** We will NOT perform extensive testing beyond verifying build success and core functionality
3. **Database Schema Changes:** No database migrations are expected or in scope
4. **Dependency Audit:** We will NOT update other dependencies beyond what's required for Wasp compatibility
5. **Performance Optimization:** This is a compatibility update only, not a performance improvement effort
6. **Custom Vite Configuration:** We will NOT create custom Vite configs unless required for build success

## Design Considerations

**N/A** - This is a framework update with no UI/UX changes expected. All existing designs should remain unchanged.

## Technical Considerations

### Environment
- **Node.js:** v22.21.1 (already compatible with v0.18 requirement of >=v22.12) ✅
- **Database:** PostgreSQL (no schema changes expected)
- **Current Wasp:** v0.16.2
- **Target Wasp:** v0.18.2

### Dependencies
- Current Vite: v4.3.9 → May auto-update via Wasp SDK
- Current TypeScript: v5.1.0 → Likely compatible
- Current Prisma: v5.19.1 → Likely compatible

### Migration Strategy
- **Two-phase approach:** Increment through v0.17 first, then v0.18
- **No database migrations expected:** Migration guides indicate no schema changes required
- **Git-based rollback:** If issues arise, use `git revert` and redeploy previous version

### Files to Modify

**Phase 1 (v0.17):**
1. `main.wasp`
2. `src/pages/LoginPage.tsx`
3. `tsconfig.json`

**Phase 2 (v0.18):**
1. `main.wasp`
2. `tailwind.config.cjs` → `tailwind.config.js`
3. `package.json` (if manual Vite update needed)

### Known Risks

**Medium Risk:**
- Express 5 upgrade may affect `urlMetadata` API endpoint
- Vite 7 upgrade may cause build issues
- TypeScript config changes could surface type errors

**Low Risk:**
- Favicons already exist in `/public` ✅
- Node.js version already compatible ✅
- No database migrations needed ✅

**Mitigation:**
- Test build after each phase
- Use `wasp build start` to test production build locally before deploy
- Monitor application logs immediately after deployment
- Git revert available as quick rollback

## Success Metrics

### Build Success
- ✅ Application builds without errors using `wasp build`
- ✅ No TypeScript compilation errors
- ✅ Production build runs locally via `wasp build start`

### Functional Success
- ✅ Users can log in successfully
- ✅ Users can sign up for new accounts
- ✅ Application loads and navigates between pages
- ✅ Projects/tasks/resources/documents are viewable

### Deployment Success
- ✅ Changes committed and pushed to correct branch
- ✅ Application deploys without errors
- ✅ No critical errors in production logs within 24 hours of deployment

## Timeline

**Target Completion:** 1 week (urgent priority)

- **Day 1-2:** Phase 1 implementation and testing (v0.17 update)
- **Day 3-4:** Phase 2 implementation and testing (v0.18 update)
- **Day 5:** Final validation and deployment preparation
- **Day 6:** Deploy to production
- **Day 7:** Monitor and address any issues

## Rollback Strategy

**If issues are discovered post-deployment:**
1. Immediately `git revert` the update commit(s)
2. Redeploy previous stable version
3. Investigate issues in development environment
4. Fix and retry deployment when ready

**Rollback trigger conditions:**
- Authentication failures preventing user login
- Application failing to build or start
- Critical errors in production logs
- Database connection issues

## Open Questions

1. ✅ **Resolved:** No custom Vite configurations to review
2. ✅ **Resolved:** No custom Express middleware concerns beyond standard review
3. ✅ **Resolved:** Will not adopt new features unless absolutely necessary
4. **Remaining:** Does the Wasp CLI need to be updated on the deployment server, or only in the project configuration?
5. **Remaining:** Are there any CI/CD pipeline updates needed to support the new Wasp version?

## Appendix: Breaking Changes Reference

### v0.16 → v0.17
- Authentication API signature change
- TypeScript config requirements
- Express 5 upgrade
- Favicon handling (already compliant)

### v0.17 → v0.18
- Node.js >=v22.12 required (already met)
- Tailwind config: CommonJS → ESM
- Vite 7 upgrade
- Railway CLI requirement (not applicable)

## Notes for Developer

- Follow the two-phase approach strictly - don't skip v0.17
- Test build after each phase before proceeding
- The minimal testing approach means: if it builds and auth works, proceed
- Keep commits atomic (separate commits for v0.17 and v0.18)
- Document any unexpected issues or additional changes needed in commit messages
