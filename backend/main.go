package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

type PaymentRequest struct {
	InvoiceID int     `json:"invoice_id"`
	Amount    float64 `json:"amount"`
}

type APIResponse struct {
	Status  string      `json:"status"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// Middleware Handling CORS unblocking response
func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func sendJSONResponse(w http.ResponseWriter, code int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(payload)
}

func sendJSONError(w http.ResponseWriter, message string, code int) {
	sendJSONResponse(w, code, APIResponse{Status: "error", Message: message})
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

func main() {
	// Set the port
	mux := http.NewServeMux()
	mux.HandleFunc("/api/payments", paymentHandler)

	// Server Configuration
	server := &http.Server{
		Addr:         ":8080",
		Handler:      enableCORS(mux), // Wrap with CORS middleware
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	fmt.Println("Server listening on http://localhost:8080")

	// Start Server
	err := server.ListenAndServe()
	if err != nil {
		log.Fatal("Server failed: ", err)
	}

}
