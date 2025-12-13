# Finance Tracker - Multi-Page Application

## 🎉 Successfully Created!

Your finance tracker has been restructured into a clean, organized **multi-page application** with proper navigation.

---

## 📂 Project Structure

```
finance_ui/src/
├── components/
│   ├── NavBar.jsx       # Navigation bar with routing
│   └── Toast.jsx        # Toast notification system
├── pages/
│   ├── OverviewPage.jsx      # Dashboard with budgets & summaries
│   ├── TransactionsPage.jsx  # Transaction CRUD & filtering
│   ├── ReportsPage.jsx       # Charts & analytics
│   └── InsightsPage.jsx      # AI-like insights
├── utils/
│   ├── constants.js     # API URL, colors, status metadata
│   └── helpers.js       # Utility functions (formatting, date handling)
├── App.jsx              # Main router & app shell
└── main.jsx             # Entry point
```

---

## 🚀 How to Run

### Backend (Already Running)
```bash
cd finance-tracker
node server.js
```
**Running on:** `http://localhost:3000`

### Frontend (Already Running)
```bash
cd finance-tracker/finance_ui
npm run dev
```
**Running on:** `http://localhost:5174`

---

## 📱 Pages Overview

### 1. **Overview Page** (`/`)
- **Budget Dashboard**: Create, edit, delete monthly budgets
- **Budget Status**: Visual progress bars with color-coded status
- **Monthly Summary**: Total spent, overspent categories, savings, improvements
- **Alerts**: System alerts displayed at the top

### 2. **Transactions Page** (`/transactions`)
- **Add/Update Transactions**: Full CRUD functionality
- **Advanced Filtering**: Filter by month, type, category
- **Transaction Table**: Sortable, editable transaction list
- **Real-time Counts**: Shows number of filtered results

### 3. **Reports Page** (`/reports`)
- **Monthly Report**: Overspent categories, savings, improvements
- **Pie Chart**: Expense breakdown by category
- **Bar Chart**: Month-over-month spending trends
- **Category Totals**: All-time spending by category

### 4. **Insights Page** (`/insights`)
- **Top Spending Categories**: Your biggest expense areas
- **Savings Opportunities**: Categories with unused budget
- **Unusual Expenses**: Spending spikes detection
- **Consistent Spenders**: Recurring expense patterns
- **Average Monthly Spend**: Overall spending average
- **AI Recommendations**: Personalized suggestions

---

## 🎨 Key Features

✅ **Clean Navigation**: Fixed navbar with active state highlighting  
✅ **Modular Architecture**: Separated components, pages, and utilities  
✅ **Shared State**: Month selection and toast notifications across pages  
✅ **Responsive Design**: Mobile-friendly layouts with grid systems  
✅ **Real-time Updates**: Data fetched from backend API  
✅ **Visual Feedback**: Toast notifications for all actions  
✅ **Professional Styling**: Modern, clean UI with shadows and borders  

---

## 📦 Dependencies Installed

- ✅ `react-router-dom` v6 - Client-side routing
- ✅ `dayjs` - Date handling and formatting
- ✅ `recharts` - Charts and visualizations
- ✅ `axios` - HTTP requests

---

## 🔗 Navigation

The app includes 4 main routes:

1. `/` - Overview (Budget dashboard)
2. `/transactions` - Transactions management
3. `/reports` - Visual reports & analytics
4. `/insights` - Smart insights & recommendations

---

## 🎯 Next Steps

1. **Open the app**: Visit `http://localhost:5174` in your browser
2. **Add some transactions**: Go to the Transactions page
3. **Set budgets**: Create monthly budgets on the Overview page
4. **View insights**: Check the Insights page for recommendations
5. **Analyze spending**: View charts and reports on the Reports page

---

## 🛠️ Technical Notes

- **Backend API**: All pages communicate with Express server at `localhost:3000`
- **State Management**: Shared state (selectedMonth, toast) passed via props
- **Styling**: Inline styles for simplicity, can be converted to CSS modules
- **Error Handling**: All API calls include error handling with toast notifications
- **Loading States**: Loading indicators for async operations

---

## 🎨 Color Scheme

- **Primary**: `#0f172a` (Dark slate)
- **Success**: `#06a77d` (Green)
- **Warning**: `#f08c00` (Orange)
- **Danger**: `#e84a5f` (Red)
- **Background**: `#f8fafc` (Light gray)

---

**Enjoy your new organized finance tracker! 🚀💰**
