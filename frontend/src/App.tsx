import { useState } from 'react';
import './App.css';

function App() {

  // State for the Modal and Form Data
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);


  const [invoiceFormData, setInvoiceForm] = useState({ invoiceId: '', amount: '' })
  const [paymentFormData, setPaymentForm] = useState({ paymentId: '', amount: '' })


  {/* Send Payment Logic */}
  const handlePaymentConfirm = async () => {
    if (!paymentFormData.paymentId || !paymentFormData.amount) {
      alert("Please enter both an ID and an Amount");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice_id: Number(paymentFormData.paymentId),
          amount: Number(paymentFormData.amount),
        }),
      });

      if (response.ok) {
        alert("Payment Recorded!");
        setPaymentModal(false);
        setPaymentForm({ paymentId: '', amount: '' });
      }
    } catch (error) {
      alert("Network Error: Failed to record payment.");
    }

    setPaymentModal(false);
  };

  
  return (
    <div className="container">
      <h1>eCapital</h1>
      
      {/* Action Buttons for creating invoices and recording payments */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button onClick={() => setInvoiceModal(true)}>Create Invoice</button>
        <button onClick={() => setPaymentModal(true)}>Record Payment</button>
      </div>

      {/* Create Invoice Window */}
      {invoiceModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Send New Invoice</h2>
            
            <input 
              type="number" 
              placeholder="Invoice ID" 
              onChange={(e) => setInvoiceForm({...invoiceFormData, invoiceId: e.target.value})}
            />
            <br />
            <input 
              type="number" 
              placeholder="Amount" 
              onChange={(e) => setInvoiceForm({...invoiceFormData, amount: e.target.value})}
            />

            <div style={{ marginTop: '20px' }}>
              <button  style={{ background: 'var(--accent)', color: 'white' }}>Confirm</button>
              <button onClick={() => setInvoiceModal(false)} style={{ marginLeft: '10px' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Window */}
      {paymentModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Record New Payment</h2>
            
            <input 
              type="number" 
              placeholder="Invoice ID" 
              onChange={(e) => setPaymentForm({...paymentFormData, paymentId: e.target.value})}
            />
            <br />
            <input 
              type="number" 
              placeholder="Amount" 
              onChange={(e) => setPaymentForm({...paymentFormData, amount: e.target.value})}
            />

            <div style={{ marginTop: '20px' }}>
              <button onClick={handlePaymentConfirm} style={{ background: 'var(--accent)', color: 'white' }}>Confirm</button>
              <button onClick={() => setPaymentModal(false)} style={{ marginLeft: '10px' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// 5. Export 
export default App;