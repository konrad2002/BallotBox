# BallotBox - Development Guide

## Getting Started

### Prerequisites
- Node.js 18+ (or 20+ recommended for Next.js 16)
- npm or yarn

### Installation

```bash
# Navigate to project directory
cd /Users/konrad/WebstormProjects/BallotBox

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

## Development Scripts

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint checks
```

## Project Layout

```
src/
├── app/                    # Next.js app directory
│   └── (voting)/          # Feature group for voting
├── components/ui/          # Reusable UI components
├── lib/                    # Utilities and helpers
└── styles/                 # Global CSS
```

## Adding a New Component

1. Create file in `src/components/ui/component-name.tsx`
2. Use shadcn/ui as reference
3. Export from component file
4. Import where needed

Example:
```tsx
// src/components/ui/my-component.tsx
"use client"

import { cn } from "@/lib/utils"

export function MyComponent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("base-styles", className)} {...props} />
}
```

## Adding a New Page

1. Create file in `src/app/(voting)/[route]/page.tsx`
2. Use existing pages as template
3. Add "use client" for interactive components
4. Import needed components

Example:
```tsx
// src/app/(voting)/my-page/page.tsx
"use client"

import { Button } from "@/components/ui/button"

export default function MyPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">My Page</h1>
      <Button>Click me</Button>
    </div>
  )
}
```

## Styling Guide

### Tailwind Classes
We use Tailwind CSS with these breakpoints:
- `sm:` - 640px
- `md:` - 768px
- `lg:` - 1024px
- `xl:` - 1280px

### Color Palette
- Primary: Blue (from shadcn defaults)
- Neutral: Gray/Neutral (from shadcn)
- Accent: Various based on context

### Common Patterns

```tsx
// Container
<div className="max-w-4xl mx-auto px-4 py-8">

// Card Layout
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

// Form
<form onSubmit={handleSubmit} className="space-y-4">
  <div>
    <label className="block text-sm font-medium mb-2">Label</label>
    <Input placeholder="..." />
  </div>
</form>

// Button Group
<div className="flex gap-2">
  <Button>Action 1</Button>
  <Button variant="outline">Action 2</Button>
</div>
```

## State Management

Currently using React hooks. For a voting app:

```tsx
// Vote state
const [votes, setVotes] = useState<Vote[]>([])

// Form state
const [formData, setFormData] = useState({
  title: "",
  options: []
})

// UI state
const [step, setStep] = useState<"select" | "order">("select")
```

## Routing Structure

All voting routes are grouped under `(voting)`:

- `/(voting)` - Entry page
- `/(voting)/manage` - Vote management
- `/(voting)/vote` - Vote finder
- `/(voting)/vote/[label]` - Specific vote
- `/(voting)/vote/success` - Success page

Route groups (parentheses) don't appear in URL but organize code.

## Database Integration (Future)

When ready to add backend:

```tsx
// Example API call
const response = await fetch("/api/votes", {
  method: "POST",
  body: JSON.stringify({ title, options })
})

const vote = await response.json()
```

## Type Definitions

Keep types near where they're used:

```tsx
interface Vote {
  label: string
  title: string
  options: Option[]
  isOpen: boolean
  createdAt: Date
}

interface Option {
  id: string
  label: string
}
```

## Accessibility

✓ Semantic HTML (use proper elements)
✓ ARIA labels where needed
✓ Keyboard navigation support
✓ Color contrast compliance
✓ Focus management

## Performance Tips

1. Use `"use client"` only when needed
2. Keep components small and focused
3. Avoid unnecessary re-renders
4. Use React.memo for expensive components
5. Lazy load heavy components if needed

## Debugging

```tsx
// Log state changes
useEffect(() => {
  console.log("Step changed to:", step)
}, [step])

// Log form data
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  console.log("Input changed:", e.target.value)
  setInput(e.target.value)
}
```

## Common Issues

### Components Not Showing
- Check import paths (use `@/components/...`)
- Verify "use client" is added
- Check className syntax

### Styling Not Applied
- Rebuild Tailwind cache: `npm run build`
- Check class names are correct
- Verify tailwind.config includes src/

### Navigation Issues
- Use `<Link>` for internal navigation
- Use `useRouter()` for programmatic navigation
- Check route structure in `app/` directory

## Testing Flow

### Create Vote
1. Go to `/manage`
2. Click "New Vote"
3. Fill in title and options
4. Click "Create Vote"
5. Note the generated label

### Participate
1. Go to `/vote`
2. Enter the vote label from previous step
3. Select options
4. Order options
5. Submit

## Code Quality

- All files are TypeScript (.tsx/.ts)
- ESLint configuration enforces standards
- No console warnings or errors
- Proper error boundaries
- Type-safe throughout

## Next Developer Notes

- See ARCHITECTURE.md for design decisions
- See USER_FLOWS.md for flow diagrams
- See IMPLEMENTATION_SUMMARY.md for details
- Components are production-ready for enhancement

## Useful Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [TypeScript](https://www.typescriptlang.org/docs)
- [React Documentation](https://react.dev)
