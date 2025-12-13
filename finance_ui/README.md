## Finance Tracker UI

This Vite + React app powers the frontend for the Finance Tracker project. Users can capture transactions, manage category budgets for each month, and review an end-of-month insights report.

### Features

- **Transactions**: Log income/expense entries with category, description, and date. Totals update instantly and alerts warn when rent exceeds 50% of income.
- **Budget Dashboard**:
	- Create/update/delete monthly category budgets (per-month uniqueness enforced case-insensitively).
	- Live progress bars show `spent / budget`, usage %, and status colors (under control, near limit, exceeded).
	- Month picker lets you jump across historical or upcoming months; progress refreshes automatically.
- **End-of-Month Report**:
	- Summaries for total spend, tracked categories, per-category totals, overspent and saved categories.
	- "Where I cut down cost" highlights the category with the largest reduction vs. the previous month.

### Prerequisites

- Node.js 18+
- Running backend API from the repository root (`node server.js` by default on port 3000)

### Local Development

```bash
# from repo root
cd finance_ui
npm install
npm run dev
```

### Production Build

```bash
cd finance_ui
npm run build
```

The build output is emitted to `finance_ui/dist` and can be served by any static file host.

### Budget & Report Tips

- Budgets are stored per `YYYY-MM` month key. Changing the month picker instantly loads matching budgets and reports; new months can be seeded ahead of time.
- Adding or deleting transactions automatically refreshes the relevant budget progress and report stats so the dashboard stays in sync with realtime spending.
- Overspent categories are flagged when spend exceeds the configured budget; saved categories show how much you stayed under budget.
