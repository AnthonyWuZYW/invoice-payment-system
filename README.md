# 📑 Setup Guide — Invoice & Payments Portal

This application is a full-stack solution for managing customer invoices and tracking partial or full payments. It features a **Go (Golang)** backend with a relational database and a **React (TypeScript)** frontend.

---

## 🚀 Quick Start

### 1. Prerequisites
* **Go** (1.20 or higher)
* **Node.js** (v18+) & **npm**
* **SQLite3** (The default database used for this exercise)

### 2. Backend Setup (Go)
The backend manages the core business logic, including payment validation and concurrency control.

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```
2.  **Install dependencies:**
    ```bash
    go mod tidy
    ```
3.  **Run the server:**
    ```bash
    go run .
    ```
    *The API will be available at `http://localhost:8080`.*

### 3. Frontend Setup (React + Vite)
The frontend provides a dashboard for creating invoices, recording payments, and looking up customer portfolios.

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Start the development server:**
    ```bash
    npm run dev
    ```
    *The UI will be available at `http://localhost:5173`.*

---

## 🛠 Features Implemented

### Functional Requirements
* **Invoice Management:** Create new invoices and view detailed breakdowns (including payment history).
* **Payment Processing:** Record partial or full payments via `/api/invoices/{id}/payments`.
* **Automatic Transitions:** Invoices automatically move from `PENDING` to `PAID` once the balance reaches zero.
* **Customer Portfolio:** Dedicated search to list all invoices associated with a specific Customer ID.
* **Advanced Filtering:** The lookup and portfolio endpoints support query parameters to filter results by **Status** (`DRAFT`, `PENDING`, `PAID`, `VOID`) and **Date Range** (`from` / `to` issued dates).

### Business Rules & Data Integrity
* **No Overpayment:** The system calculates the remaining balance and rejects any payment that would exceed the total invoice amount.
* **Positive Validation:** Only positive payment amounts are accepted.
* **Status Locking:** Payments are strictly blocked for invoices marked as `PAID` or `VOID`.
* **Concurrency & Double-Counting:** To prevent race conditions where two payments might arrive at the exact same millisecond, the system utilizes **SQL Transactions (`BEGIN/COMMIT`)** with row-level locking. By calculating the current sum of payments inside the transaction, we ensure that the second payment "sees" the first one already recorded, effectively preventing overpayment and double-counting in high-traffic scenarios.

---

## 🧪 Testing the API
You can verify the business rules and filtering using `curl`:

**Record a Valid Payment:**
```bash
curl -X POST http://localhost:8080/api/invoices/1/payments \
     -H "Content-Type: application/json" \
     -d '{"amount": 50.00}'