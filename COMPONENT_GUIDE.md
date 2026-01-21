# BallotBox - Visual Component Guide

## UI Component Gallery

### Button Component
```
<Button>Primary Action</Button>
<Button variant="outline">Secondary Action</Button>
<Button variant="ghost">Tertiary Action</Button>
<Button variant="destructive">Delete Action</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button disabled>Disabled</Button>
```

### Input Component
```
<Input placeholder="Enter text..." />
<Input type="email" placeholder="Email..." />
<Input disabled value="Disabled input" />
<Input className="text-center text-2xl font-mono" />
```

### Card Components
```
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card Description</CardDescription>
  </CardHeader>
  <CardContent>
    Main content goes here
  </CardContent>
  <CardFooter>
    Footer content
  </CardFooter>
</Card>
```

### Badge Component
```
<Badge>Default Badge</Badge>
<Badge variant="secondary">Secondary Badge</Badge>
<Badge variant="destructive">Destructive Badge</Badge>
<Badge variant="outline">Outline Badge</Badge>
```

### Checkbox Component
```
<Checkbox />
<Checkbox checked />
<Checkbox disabled />
<Checkbox checked disabled />
```

---

## Page Layouts

### Entry Page Layout
```
┌─────────────────────────────────┐
│         BALLOT BOX              │
│  Simple & Elegant Voting        │
│                                 │
│   ┌─────────────────────────┐   │
│   │  Create a Vote          │   │
│   └─────────────────────────┘   │
│                                 │
│   ┌─────────────────────────┐   │
│   │  Participate in Vote    │   │
│   └─────────────────────────┘   │
└─────────────────────────────────┘
```

### Manage Page Layout
```
┌─────────────────────────────────────┐
│ Manage Votes          [+ New Vote]   │
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Best Programming Language       │ │
│ │ Label: A7K2M9  Options: 5       │ │
│ │                                 │ │
│ │ • TypeScript                    │ │
│ │ • Python                        │ │
│ │ • Rust                          │ │
│ │                                 │ │
│ │ [Close] [Delete] [Vote Link]    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Framework Ranking               │ │
│ │ Label: XYZ789  Options: 4       │ │
│ │ ...                             │ │
│ └─────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

### Vote Finder Layout
```
┌─────────────────────────────┐
│  [← Back]                   │
├─────────────────────────────┤
│                             │
│  Enter Vote Label           │
│                             │
│  ┌───────────────────────┐  │
│  │    ABC123             │  │
│  │  (Enter label...)     │  │
│  └───────────────────────┘  │
│  6 characters, A-Z 0-9      │
│                             │
│  ┌───────────────────────┐  │
│  │     Continue →        │  │
│  └───────────────────────┘  │
│                             │
└─────────────────────────────┘
```

### Voting Page - Select Step
```
┌──────────────────────────────────┐
│  [← Back]                        │
├──────────────────────────────────┤
│  Best Programming Language       │
│  Label: ABC123                   │
├──────────────────────────────────┤
│  ℹ️ Select options to vote       │
│                                  │
│  ┌────────────────────────────┐  │
│  │ ☑ TypeScript          #1   │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │ ☐ Python                  │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │ ☑ Rust                #2   │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │ ☐ Go                       │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌──────────────────────────────┐│
│  │  Order Selection (2)         ││
│  └──────────────────────────────┘│
└──────────────────────────────────┘
```

### Voting Page - Rank Step
```
┌──────────────────────────────────┐
│  [← Back]                        │
├──────────────────────────────────┤
│  Best Programming Language       │
│  Label: ABC123                   │
├──────────────────────────────────┤
│  ℹ️ Rank your choices            │
│                                  │
│  ┌────────────────────────────┐  │
│  │ #1  ⋮ TypeScript  [↑] [↓]  │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │ #2  ⋮ Rust        [↑] [↓]  │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌──────────────────────────────┐│
│  │  Submit Vote                 ││
│  └──────────────────────────────┘│
│  ┌──────────────────────────────┐│
│  │  Edit Selection              ││
│  └──────────────────────────────┘│
└──────────────────────────────────┘
```

### Success Page Layout
```
┌──────────────────────────────┐
│                              │
│            ✓                 │
│                              │
│    Vote Submitted!           │
│                              │
│  Your ranked vote recorded.  │
│                              │
│  ┌────────────────────────┐  │
│  │    Vote Again          │  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │   Back to Home         │  │
│  └────────────────────────┘  │
│                              │
└──────────────────────────────┘
```

---

## Color Palette

### Semantic Colors
- **Primary** (Blue): Main actions, links
- **Secondary** (Gray): Alternative actions
- **Destructive** (Red): Delete, danger
- **Success** (Green): Confirmation
- **Warning** (Amber): Cautions
- **Info** (Blue): Information

### Neutral Scale
- `neutral-50` - Very light backgrounds
- `neutral-100` - Light backgrounds
- `neutral-200` - Borders
- `neutral-600` - Secondary text
- `neutral-900` - Primary text

---

## Typography Hierarchy

```
H1: 36px / 2.25rem  - Page titles
H2: 30px / 1.875rem - Section headers
H3: 24px / 1.5rem   - Card titles
Body: 16px / 1rem   - Main text
Small: 14px / 0.875rem - Secondary text
Tiny: 12px / 0.75rem   - Labels, captions
```

---

## Spacing System

Using Tailwind's default spacing (4px base unit):
- `p-2` = 8px padding
- `p-4` = 16px padding
- `p-6` = 24px padding
- `p-8` = 32px padding

Grid gaps:
- `gap-2` = 8px gap
- `gap-3` = 12px gap
- `gap-4` = 16px gap

---

## Common Component Patterns

### Form Group
```tsx
<div className="space-y-4">
  <div>
    <label className="block text-sm font-medium text-neutral-700 mb-2">
      Label
    </label>
    <Input placeholder="..." />
  </div>
</div>
```

### Button Group
```tsx
<div className="flex gap-2">
  <Button className="flex-1">Primary</Button>
  <Button variant="outline" className="flex-1">
    Secondary
  </Button>
</div>
```

### Section Container
```tsx
<Card>
  <CardHeader>
    <CardTitle>Section Title</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Content */}
  </CardContent>
</Card>
```

### List Item
```tsx
<div className="flex items-center justify-between p-4 bg-neutral-100 rounded-lg">
  <span>Item Label</span>
  <Button size="sm" variant="ghost">
    Action
  </Button>
</div>
```

---

## Responsive Design

### Breakpoints
- `sm:` - ≥640px
- `md:` - ≥768px
- `lg:` - ≥1024px
- `xl:` - ≥1280px

### Mobile-First Approach
```tsx
<div className="max-w-md md:max-w-2xl lg:max-w-4xl">
  {/* Content */}
</div>
```

---

## Icons (Lucide React)

Used throughout the app:
- `Plus` - Add action
- `Trash2` - Delete action
- `Lock` - Close vote
- `Unlock` - Open vote
- `Check` - Success
- `ArrowLeft` - Navigation
- `GripVertical` - Drag handle

---

This guide should help developers maintain consistency when extending the UI!
