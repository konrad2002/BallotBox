# BallotBox UI - Quick Start Guide

## What's Been Built

A complete ranked voting UI with 5 pages, all styled with Tailwind CSS and shadcn/ui components.

### Routes

| Route | Purpose |
|-------|---------|
| `/` | Entry point (redirects to `/(voting)`) |
| `/(voting)` | Landing page - choose "Create" or "Participate" |
| `/(voting)/manage` | Vote manager - create & manage votes |
| `/(voting)/vote` | Vote finder - enter vote label |
| `/(voting)/vote/[label]` | Vote page - select & rank options |
| `/(voting)/vote/success` | Success confirmation |

## Demo Votes (Pre-loaded)

Try these vote labels to test the UI:
- **ABC123** - "Best Programming Language" (TypeScript, Python, Rust, Go, Java)
- **XYZ789** - "Favorite Frontend Framework" (React, Vue, Svelte, Angular)

## UI Components Created

All shadcn/ui components are ready to use:
- `Button` - with variants (default, outline, ghost, destructive, secondary, link)
- `Input` - text input field
- `Card` - container (with Header, Title, Description, Content, Footer)
- `Badge` - labels and tags
- `Checkbox` - selection boxes

## Key Features

✅ Entry page with clear navigation
✅ Vote creation with dynamic options
✅ 6-character alphanumeric vote labels (auto-generated)
✅ Two-step voting process (select → order)
✅ Ranking with up/down buttons
✅ Partial selection allowed
✅ Vote management (open/close/delete)
✅ Responsive mobile-friendly design
✅ Clean, modern UI with good UX

## File Changes Made

**Created:**
- `src/app/(voting)/page.tsx` - Entry page
- `src/app/(voting)/manage/page.tsx` - Vote management
- `src/app/(voting)/vote/page.tsx` - Vote finder
- `src/app/(voting)/vote/[label]/page.tsx` - Specific vote
- `src/app/(voting)/vote/success/page.tsx` - Success page
- `src/components/ui/input.tsx` - Input component
- `src/components/ui/card.tsx` - Card component
- `src/components/ui/badge.tsx` - Badge component
- `src/components/ui/checkbox.tsx` - Checkbox component

**Modified:**
- `src/app/page.tsx` - Redirects to voting
- `src/lib/utils.ts` - Added `generateVoteLabel()` utility
- `package.json` - Added `@radix-ui/react-checkbox`

## How to Test

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Visit:** http://localhost:3000

3. **Test flow:**
   - Click "Create a Vote" → Create vote with options → Get shareable label
   - Click "Participate in Vote" → Enter ABC123 → Select options → Rank them → Submit

## Notes

- Currently uses local React state (no backend)
- Mock vote data is hardcoded
- Ready for backend integration (API routes, database)
- All components are styled and fully functional
- No overengineering - clean, minimal code
