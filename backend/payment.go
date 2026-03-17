package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type PaymentRequest struct {
	InvoiceID int     `json:"invoice_id"`
	Amount    float64 `json:"amount"`
}

func paymentHandler(w http.ResponseWriter, r *http.Request) {
	// Allow Post
	if r.Method != http.MethodPost {
		sendJSONError(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req PaymentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sendJSONError(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Reveived Payment
	fmt.Printf("Success: Received %f for Invoice %d\n", req.Amount, req.InvoiceID)

	// Send Success response
	sendJSONResponse(w, http.StatusCreated, APIResponse{
		Status:  "success",
		Message: "Payment processed successfully",
		Data:    req,
	})
}
