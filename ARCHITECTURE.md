# BallotBox - Ranked Voting UI

A modern, clean ranked voting application built with Next.js, Tailwind CSS, and shadcn/ui components.

## Project Structure

```
src/
├── app/
│   ├── page.tsx                          # Root page (redirects to voting entry)
│   └── (voting)/                         # Voting feature group
│       ├── page.tsx                      # Entry page (create/participate options)
│       ├── manage/
│       │   └── page.tsx                  # Manage votes (create, edit, control votes)
│       └── vote/
│           ├── page.tsx                  # Generic vote page (enter vote label)
│           ├── [label]/
│           │   └── page.tsx              # Specific vote page (select & rank options)
│           └── success/
│               └── page.tsx              # Success confirmation page
├── components/
│   └── ui/                               # shadcn/ui components
│       ├── button.tsx                    # Button with variants
│       ├── input.tsx                     # Text input field
│       ├── card.tsx                      # Card container
│       ├── badge.tsx                     # Badge component
│       └── checkbox.tsx                  # Checkbox with Radix UI
└── lib/
    └── utils.ts                          # Utility functions (cn, generateVoteLabel)
```

## Pages

### 1. Entry Page (/)
- Landing page with two main actions
- "Create a Vote" → goes to `/manage`
- "Participate in Vote" → goes to `/vote`

### 2. Manage Page (/manage)
- Create new votes with:
  - Vote title
  - Multiple options (add/remove)
  - Auto-generated 6-character vote label
- Manage existing votes:
  - View all votes with details
  - Open/Close votes (toggle status)
  - Delete votes
  - See voting link for sharing

### 3. Generic Vote Page (/vote)
- Input field to enter vote label (6 characters)
- Automatically converts to uppercase
- Navigates to specific vote page

### 4. Specific Vote Page (/vote/[label])
- **Selection Step**: Choose one or more options
  - Shows all available options
  - Selected options get ranked badges
  - Can select less than all options
- **Ordering Step**: Rank selected options
  - Move options up/down
  - See current ranking
  - Edit selection or submit
- Mock data included for demo (ABC123, XYZ789)

### 5. Success Page (/vote/success)
- Confirmation that vote was submitted
- Links to vote again or return home

## Features

- **Clean UI**: Uses Tailwind CSS for styling
- **shadcn Components**: Professional, accessible components
- **State Management**: React hooks for managing form state
- **Navigation**: Next.js App Router with proper grouping
- **Utility Functions**: 
  - `cn()`: Merge CSS classes safely
  - `generateVoteLabel()`: Create 6-char vote labels
- **Responsive Design**: Mobile-friendly layouts
- **Icons**: Lucide React for consistent iconography

## Key Design Decisions

1. **Folder Structure**: Used route grouping `(voting)` to keep voting features organized
2. **Component Simplicity**: Focused on UI without backend integration (ready for API)
3. **State in Page**: Local state management in page components for demo purposes
4. **Mock Data**: Test voting sessions pre-configured for demo
5. **Progressive Flow**: Clear step-by-step voting process (select → order → submit)

## Getting Started

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

Access the application at `http://localhost:3000`

## Next Steps

To make this production-ready:

1. Add backend API routes for vote storage
2. Connect to database (Prisma + PostgreSQL recommended)
3. Add vote persistence
4. Implement real vote result calculations
5. Add authentication for vote managers
6. Email notifications for vote invitations
7. Results visualization page
