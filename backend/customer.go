package main

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"
	"strings"
)

type CustomerDetail struct {
	CustomerID int             `json:"customer_id"`
	Name       string          `json:"name"`
	Invoices   []InvoiceRecord `json:"invoices"`
}

// Customer Handler
func CustomerDispatcher(w http.ResponseWriter, r *http.Request) {
	// URL format: /api/customers/{id}/invoices
	path := strings.Trim(r.URL.Path, "/")
	parts := strings.Split(path, "/")

	// Expect exactly 4 parts: ["api", "customers", "{id}", "invoices"]
	if len(parts) != 4 || parts[3] != "invoices" {
		sendJSONError(w, "Invalid customer endpoint", http.StatusNotFound)
		return
	}

	customerID, err := strconv.Atoi(parts[2])
	if err != nil {
		sendJSONError(w, "Invalid Customer ID format", http.StatusBadRequest)
		return
	}

	switch r.Method {
	case http.MethodGet:
		// Read Filter Query Parameters
		status := r.URL.Query().Get("status")
		fromDate := r.URL.Query().Get("from")
		toDate := r.URL.Query().Get("to")

		// Pass filters to the logic function
		detail, err := getCustomerInvoices(customerID, status, fromDate, toDate)
		if err != nil {
			sendJSONError(w, err.Error(), http.StatusNotFound)
			return
		}
		sendJSONResponse(w, http.StatusOK, APIResponse{Status: "success", Data: detail})
	default:
		sendJSONError(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// Insert a new Customer
func createCustomer(name string) (int64, error) {
	var id int64

	// Check if the customer exist
	query := `SELECT id FROM customers WHERE name = ?`
	err := db.QueryRow(query, name).Scan(&id)
	if err == nil {
		return id, nil
	}
	if err != sql.ErrNoRows {
		return 0, err
	}

	// Customer not found create customer
	insertQuery := `INSERT INTO customers (name) VALUES (?)`
	result, err := db.Exec(insertQuery, name)
	if err != nil {
		return 0, err
	}

	return result.LastInsertId()
}

// getCustomerInvoicesFiltered applies the required filters to the customer's portfolio
func getCustomerInvoices(customerID int, status string, from string, to string) (*CustomerDetail, error) {
	var detail CustomerDetail
	detail.CustomerID = customerID
	detail.Invoices = []InvoiceRecord{}

	// Get Customer Name
	err := db.QueryRow("SELECT name FROM customers WHERE id = ?", customerID).Scan(&detail.Name)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("customer not found")
		}
		return nil, err
	}

	// Base Query
	query := `SELECT id, amount, currency, issued_at, due_at, status 
              FROM invoices 
              WHERE customer_id = ?`

	args := []interface{}{customerID}

	// Dynamically Append Filters
	if status != "" {
		query += " AND status = ?"
		args = append(args, status)
	}
	if from != "" {
		query += " AND issued_at >= ?"
		args = append(args, from)
	}
	if to != "" {
		query += " AND issued_at <= ?"
		args = append(args, to)
	}

	query += " ORDER BY issued_at DESC"

	// Execute
	rows, err := db.Query(query, args...)
	if err != nil {
		return &detail, nil
	}
	defer rows.Close()

	for rows.Next() {
		var inv InvoiceRecord
		inv.CustomerID = customerID
		err := rows.Scan(
			&inv.ID,
			&inv.Amount,
			&inv.Currency,
			&inv.IssueDate,
			&inv.DueDate,
			&inv.Status,
		)
		if err == nil {
			detail.Invoices = append(detail.Invoices, inv)
		}
	}

	return &detail, nil
}
