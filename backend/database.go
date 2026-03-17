package main

import (
	"database/sql"
	"log"

	_ "github.com/mattn/go-sqlite3"
)

var db *sql.DB

// Initialze Database
func initDB() *sql.DB {
	db, err := sql.Open("sqlite3", "./ecapital.db")
	if err != nil {
		log.Fatal(err)
	}

	// Create the table schema
	statement := `
    CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_id INTEGER,
        amount REAL,
        status TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`

	_, err = db.Exec(statement)
	if err != nil {
		log.Fatal("Table creation failed:", err)
	}
	return db
}
