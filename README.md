# Finance Tracker

A full-stack finance tracking application designed to help users manage transactions, budgets, and view financial insights. Built with Node.js, Express, MongoDB, and React.

## Features

- **Dashboard**: View transaction summaries, income vs. expense, and net balance.
- **Transactions Management**: Create, read, update, and delete transactions with filtering capabilities (month, type, category).
- **Analytics & Reports**: Visual reports including monthly averages, category breakdowns, and spending trends using Recharts.
- **Smart Insights**: Automated financial insights detecting anomalies, recurring payments, and providing category suggestions.
- **Budgeting**: Set and track monthly budgets to monitor global spending.

## Tech Stack

- **Frontend**: React (Vite), React Router, Axios, Day.js, Recharts
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)

## Project Structure

```text
finance-tracker/
├── server.js           # Backend entry point
├── models/             # Mongoose database models
├── routes/             # API routes (transactions, budgets, reports, insights)
├── services/           # Business logic and helper services
├── utils/              # Utility functions
└── finance_ui/         # Frontend React application (Vite)
    └── src/            # Frontend source code
```

## Getting Started

### Prerequisites

- Node.js (v14+ recommended)
- MongoDB (running locally or cloud instance)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository_url>
   cd finance-tracker
   ```

2. **Backend Setup**

   Navigate to the root directory to install backend dependencies.

   ```bash
   npm install
   ```

   Create a `.env` file in the root directory with the following variables:

   ```env
   MONGO_URI=your_mongodb_connection_string
   PORT=5000
   ```

   Start the backend server:

   ```bash
   node server.js
   ```

3. **Frontend Setup**

   Open a new terminal and navigate to the `finance_ui` directory.

   ```bash
   cd finance_ui
   npm install
   ```

   Start the development server:

   ```bash
   npm run dev
   ```

   Access the application at the URL provided in the terminal (typically `http://localhost:5173`).

## License

This project is open source and available for personal use and modification.
