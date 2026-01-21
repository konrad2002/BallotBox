# BallotBox - User Flows

## Manager Flow: Create a Vote

```
Entry Page (/‌(voting))
    ↓ Click "Create a Vote"
Manage Page (/manage)
    ↓ Click "New Vote"
Create Vote Form
    ├─ Enter vote title
    ├─ Add options (repeatable)
    └─ Click "Create Vote"
    ↓
Vote Created! 
    ├─ Gets auto-generated label (e.g., A7K2M9)
    ├─ Shows in vote list
    └─ Can be opened/closed/deleted
    
Manager can:
    • Share label with participants
    • Toggle vote open/closed status
    • View all options
    • Delete vote when done
```

## Participant Flow: Vote

```
Entry Page (/(voting))
    ↓ Click "Participate in Vote"
Vote Finder (/vote)
    ├─ Enter vote label (6 chars)
    └─ Click "Continue"
    ↓
Voting Page (/vote/[label])
    
STEP 1: SELECT OPTIONS
    ├─ See all available options
    ├─ Click to select (can select multiple)
    ├─ Selected options show ranking badge
    └─ Click "Order Selection"
    ↓
STEP 2: ORDER OPTIONS
    ├─ See selected options in order
    ├─ #1 is your top choice
    ├─ Use ↑/↓ buttons to reorder
    └─ Click "Submit Vote" or "Edit Selection"
    ↓
Success Page (/vote/success)
    ├─ Confirmation message
    └─ Options to vote again or go home
```

## UI States

### Entry Page
```
┌─────────────────────────────┐
│       BALLOT BOX            │
│  Simple & Elegant Voting    │
│                             │
│  ┌───────────────────────┐  │
│  │  Create a Vote        │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ Participate in Vote   │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

### Manage Page - Vote List
```
┌─────────────────────────────────┐
│ Manage Votes           [+ New]   │
├─────────────────────────────────┤
│                                 │
│ Best Programming Language       │
│ 📌 A7K2M9  ◻ 5 options         │
│                                 │
│ • TypeScript                    │
│ • Python                        │
│ • Rust                          │
│                                 │
│ [Close]  [Delete]  [Vote Link]  │
│                                 │
└─────────────────────────────────┘
```

### Voting Page - Selection Step
```
┌─────────────────────────────────┐
│ Best Programming Language       │
│ Label: A7K2M9                   │
├─────────────────────────────────┤
│ ℹ️ Select options to vote       │
│                                 │
│ ☑ TypeScript                #1  │
│ ☐ Python                       │
│ ☑ Rust                     #2   │
│ ☐ Go                           │
│                                 │
│  [Order Selection (2)]          │
└─────────────────────────────────┘
```

### Voting Page - Ranking Step
```
┌─────────────────────────────────┐
│ Best Programming Language       │
├─────────────────────────────────┤
│ ℹ️ Rank your choices            │
│                                 │
│ #1  ⋮ TypeScript       [↑] [↓]  │
│ #2  ⋮ Rust             [↑] [↓]  │
│                                 │
│ [Submit Vote]                   │
│ [Edit Selection]                │
└─────────────────────────────────┘
```

### Success Page
```
┌─────────────────────────────────┐
│              ✓                  │
│                                 │
│  Vote Submitted!                │
│  Your ranked vote recorded.     │
│                                 │
│  [Vote Again]                   │
│  [Back to Home]                 │
└─────────────────────────────────┘
```

## Key Features

### Vote Creation
- ✅ Auto-generated 6-character labels
- ✅ Support for unlimited options
- ✅ Easy option management (add/remove)
- ✅ Open/close vote status
- ✅ Delete votes

### Voting
- ✅ Select one or more options
- ✅ Rank selected options
- ✅ Partial voting allowed
- ✅ Clear visual feedback
- ✅ Two-step process

### Design
- ✅ Mobile-first responsive
- ✅ Accessibility focused
- ✅ Consistent component usage
- ✅ Smooth transitions
- ✅ Intuitive navigation

## Demo Data

Pre-configured votes for testing:

| Label | Title | Options |
|-------|-------|---------|
| ABC123 | Best Programming Language | TypeScript, Python, Rust, Go, Java |
| XYZ789 | Favorite Frontend Framework | React, Vue, Svelte, Angular |

Just enter the label when prompted to test the voting flow!
