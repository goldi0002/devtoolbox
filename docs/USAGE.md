# Usage

## Development Commands

```bash
# Start dev server (hot reload)
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview

# Lint source files
npm run lint

# Type check (no emit)
npm run typecheck

# Run tests
npm test
```

The dev server runs on port 3000 by default.

## Share Links

ToolBox4Devs supports compressed share URLs. When a tool produces output, you can generate a share link that encodes the state in the URL hash using `lz-string` compression. This means:

- No server-side storage is needed
- Share links work across browsers and devices
- All data stays client-side

If share links fail to load, check the browser console for decompression errors. This usually means the URL was truncated or corrupted.

## Troubleshooting

**Dev server won't start**

- Ensure no other process is using port 3000: `lsof -i :3000`
- Try a different port: `npm run dev -- --port 4000`

**Build fails**

- Run `npm run typecheck` to find TypeScript errors
- Run `npm run lint` to find linting issues
- Check for missing dependencies: `npm install`

**Tool pages missing after build**

- Verify the tool is registered in both `src/tools/registry.ts` and `src/tools/registry-node.ts`
- Ensure the slug matches in `src/routes.tsx`

**Share links not working**

- Verify `VITE_BASE_URL` is set in your `.env` file
- Check for JavaScript errors in the browser console
