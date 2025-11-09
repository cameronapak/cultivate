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

- [ ] 0.0 Preparation and branch verification
- [ ] 1.0 Phase 1: Update to Wasp v0.17
- [ ] 2.0 Phase 2: Update to Wasp v0.18
- [ ] 3.0 Testing and validation
- [ ] 4.0 Deployment and monitoring
