
# Finance Tracker

Modern, multi-page finance tracker with a Node/Express backend and a React (Vite) frontend.

## Features

- Multi-page UI with navigation: Transactions (home), Overview, Reports, Insights
- Transactions CRUD with filters (month, type, category)
- Summary cards: Income, Expense, Net Balance on the Transactions page
- Budgets and monthly progress (Overview)
- Reports: monthly summary, category pie chart, month-over-month bar chart, income/expense/net totals
- Insights: anomalies, recurring payments, category suggestions, monthly explanations
- Error-only notifications (success/info toasts suppressed)

## Tech Stack

- Backend: Node.js, Express, MongoDB (Mongoose models)
- Frontend: React, Vite, React Router
- Charts: Recharts
- Dates: dayjs
- HTTP: axios

## Project Structure

```
finance-tracker/
	server.js
	models/
	routes/
	services/
	utils/
	finance_ui/
		src/
			components/
			pages/
			utils/
```

Key files:
- `server.js`: Express app entry
- `routes/transactions.js`, `routes/budgets.js`, `routes/reports.js`, `routes/insights.js`: API routes
- `services/analyticsService.js`, `services/insightService.js`: reporting and insights logic
- `finance_ui/src/App.jsx`: router and global layout
- `finance_ui/src/pages/*`: page components

## Getting Started

1) Start the backend (Express)

```bash
node server.js
```

2) Start the frontend (Vite)

```bash
cd finance_ui
npm install
npm run dev
```

Open the app at the printed localhost URL (typically `http://localhost:5173`).

## Environment

Backend expects a MongoDB connection. Configure your connection string in `server.js` or environment variables as needed.

## Usage Tips

- Transactions page is the home route (`/`). Add or edit transactions and use filters to view by month/type/category.
- Overview shows budgets (create/update) and monthly progress.
- Reports pulls real data from the database via `/api/reports/monthly`:
	- Monthly total spent, overspent categories or top categories fallback
	- Savings from budgets or month-over-month reductions fallback
	- Income/Expense/Net totals
	- Category breakdown (pie) and MoM spending (bar)
- Insights pulls from `/api/insights` and shows anomalies, recurring, suggestions, and explanations. Recommendation card is removed.

## Notifications

Only error toasts are shown. Success/info toasts are suppressed to reduce noise.

## Troubleshooting

- If you see a blank screen, check the browser console for the first red error and file/line.
- Ensure the backend is running and MongoDB is reachable.
- Vite may auto-switch ports if `5173` is occupied; follow the terminal output.

## License

This project is for personal use. Adapt as needed.

> ⚠️ "Rent is more than 50% of your income!"

I built this application after learning React during summer 2025 to practice full-stack development .
---

### 🔧 Tech Stack

- **Frontend**: React + Axios  
- **Backend**: Node.js + Express  
- **Database**: MongoDB Atlas (via Mongoose)  
- **Optional**: Chart.js, Tailwind CSS

---

### ✅ Features

- Add transactions (income/expense)
- View all transactions
- Smart alerts based on spending habits
- Clean and simple UI
- Connects to MongoDB cloud

---

### 🚀 Getting Started

#### 1. Clone the repository

```bash
git clone https://github.com/your-username/finance-tracker.git
cd finance-tracker
```

---

#### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
MONGO_URL=mongodb+srv://your-user:your-password@cluster.mongodb.net/finance-tracker?retryWrites=true&w=majority
```

Run the backend:
```bash
node index.js
```

---

#### 3. Frontend Setup

```bash
cd ../client
npm install
npm start
```

---




---


### 👨‍💻 Author

**Rithwik Yaramaneni**  


---
