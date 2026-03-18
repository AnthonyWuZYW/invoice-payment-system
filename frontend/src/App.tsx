import { useState } from 'react';
import './App.css';

interface Payment {
  amount: number;
  paid_at: string;
}

interface Invoice {
  id: number;
  name: string;
  amount: number;
  currency: string;
  status: string;
  issued_at: string;
  due_at: string;
}

interface InvoiceDetail {
  id: number;
  name: string;
  amount: number;
  currency: string;
  status: string;
  issued_at: string;
  due_at: string;
  payments: Payment[];
}

interface CustomerDetail {
  id: number;
	name: string  
  invoices: Invoice[];
}



function App() {

  // State for the Modal and Form Data Add Invocie and Payment
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);


  const [invoiceFormData, setInvoiceForm] = useState({ 
    name: '',
    amount: '', 
    currency: 'USD', 
    issueDate: '',
    dueDate: '', 
    status: 'PENDING' 
  });
  
  const [paymentFormData, setPaymentForm] = useState({ 
    invoiceId: '', 
    amount: '' 
  });

  // State for Get Inovice and Payment
  const [searchId, setSearchId] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(false);

  // State for Get Customer invoices
  const [customerSearchId, setCustomerSearchId] = useState('');
  const [customerDetail, setCustomerDetail] = useState<CustomerDetail | null>(null);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [portfolioModal, setPortfolioModal] = useState(false); 


  {/* Send Invoice Logic */}
  const handleInvoiceConfirm = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/invoices/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: invoiceFormData.name,
          amount: Number(invoiceFormData.amount),
          currency: invoiceFormData.currency,
          issued_at: invoiceFormData.issueDate,
          due_at: invoiceFormData.dueDate,
          status: invoiceFormData.status,
        }),
      });

      if (response.ok) {
        alert("Invoice Created!");
        setInvoiceModal(false);
        setInvoiceForm({ name: '', amount: '', currency: 'USD', issueDate: '', dueDate: '', status: 'PENDING' });
      }
    } catch (error) {
      alert("Error connecting to backend");
    }
  };

  {/* Send Payment Logic */}
  const handlePaymentConfirm = async () => {
    if (!paymentFormData.invoiceId || !paymentFormData.amount) {
      alert("Please enter both an Invoice ID and an Amount");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/invoices/${paymentFormData.invoiceId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(paymentFormData.amount),
        }),
      });

      if (response.ok) {
        alert("Payment Recorded!");
        setPaymentModal(false);
        setPaymentForm({ invoiceId: '', amount: '' });
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      alert("Network Error");
    }
  };

  {/* Invoice search Logic */}
  const handleInvoiceSearch = async () => {
    if (!searchId) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/invoices/${searchId}`);
      const result = await response.json();
      
      if (response.ok) {
        setSelectedInvoice(result.data); 
      } else {
        alert("Invoice not found");
        setSelectedInvoice(null);
      }
    } catch (error) {
      alert("Error fetching invoice details");
    } finally {
      setLoading(false);
    }
  };

  {/* Customer search Logic */}
  const handleCustomerSearch = async () => {
    if (!customerSearchId) return;
    setCustomerLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/customers/${customerSearchId}/invoices`);
      const result = await response.json();
      
      if (response.ok) {
        setCustomerDetail(result.data); 
        setPortfolioModal(true); // Open the modal on success
      } else {
        alert("Customer not found or no invoices");
        setCustomerDetail(null);
      }
    } catch (error) {
      alert("Error fetching customer invoices");
    } finally {
      setCustomerLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>eCapital Portal</h1>
      
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button onClick={() => setInvoiceModal(true)}>Create Invoice</button>
        <button onClick={() => setPaymentModal(true)}>Record Payment</button>
      </div>

      {/* Create Invoice Modal */}
      {invoiceModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>New Invoice</h2>
            <label>Name</label>
            <input type="string" onChange={(e) => setInvoiceForm({...invoiceFormData, name: e.target.value})} />
            
            <label>Amount</label>
            <input type="number" onChange={(e) => setInvoiceForm({...invoiceFormData, amount: e.target.value})} />
            
            <label>Currency</label>
            <select onChange={(e) => setInvoiceForm({...invoiceFormData, currency: e.target.value})}>
              <option value="USD">USD</option>
              <option value="CAD">CAD</option>
            </select>

            <label>Issue Date</label>
            <input type="date" onChange={(e) => setInvoiceForm({...invoiceFormData, issueDate: e.target.value})} />

            <label>Due Date</label>
            <input type="date" onChange={(e) => setInvoiceForm({...invoiceFormData, dueDate: e.target.value})} />

            <div style={{ marginTop: '20px' }}>
              <button onClick={handleInvoiceConfirm} style={{ background: 'var(--accent)', color: 'white' }}>Confirm</button>
              <button onClick={() => setInvoiceModal(false)} style={{ marginLeft: '10px' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {paymentModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Record Payment</h2>
            <label>Invoice ID</label>
            <input type="number" value={paymentFormData.invoiceId} onChange={(e) => setPaymentForm({...paymentFormData, invoiceId: e.target.value})} />
            
            <label>Amount</label>
            <input type="number" value={paymentFormData.amount} onChange={(e) => setPaymentForm({...paymentFormData, amount: e.target.value})} />

            <div style={{ marginTop: '20px' }}>
              <button onClick={handlePaymentConfirm} style={{ background: 'var(--accent)', color: 'white' }}>Confirm</button>
              <button onClick={() => setPaymentModal(false)} style={{ marginLeft: '10px' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Search for Invoice Modal */}
      <div className="search-section" style={{ margin: '30px 0', textAlign: 'center' }}>
        <h2 className="search-bar-title">Invoice Lookup</h2>

        <input 
          type="number" 
          placeholder="Enter Invoice ID to view details..." 
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          style={{ padding: '10px', width: '250px', borderRadius: '4px 0 0 4px', border: '1px solid #ccc' }}
        />
        <button 
          onClick={handleInvoiceSearch}
          style={{ padding: '10px 20px', borderRadius: '0 4px 4px 0', cursor: 'pointer' }}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Invoice Search Result Modal */}
      {selectedInvoice && (
      <div className="modal-overlay">
        <div className="modal-content" style={{ textAlign: 'left', minWidth: '400px' }}>
          <h2>Invoice Details</h2>
          <p><strong>ID:</strong> {selectedInvoice.id}</p>
          <p><strong>Customer:</strong> {selectedInvoice.name}</p>
          <p>
            <strong>Total: </strong> 
              {selectedInvoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <strong> </strong> {selectedInvoice.currency}  
          </p>
          <p><strong>Status:</strong> {selectedInvoice.status}</p>

          <hr />
          <h3>Payments</h3>
          {selectedInvoice.payments?.length > 0 ? (
            selectedInvoice.payments.map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{p.paid_at.split('T')[0]}</span>
                <strong>+ {p.amount}</strong>
              </div>
            ))
          ) : (
            <p>No payments recorded.</p>
          )}
          <div style={{ marginTop: '25px', textAlign: 'right' }}>
            <button 
              onClick={() => setSelectedInvoice(null)} 
              style={{ marginTop: '20px', background: 'var(--accent)', padding: '4px 10px' }}
            >
              Close
            </button>
          </div>

          
        </div>
      </div>
      )}

      {/* Search for Customer Modal */}
      <div className="search-section" style={{ margin: '30px 0', textAlign: 'center' }}>
        <h2 className="search-bar-title">Customer Lookup</h2>

        <input 
          type="number" 
          placeholder="Enter Customer ID to view details..." 
          value={customerSearchId}
          onChange={(e) => setCustomerSearchId(e.target.value)}
          style={{ padding: '10px', width: '250px', borderRadius: '4px 0 0 4px', border: '1px solid #ccc' }}
        />
        <button 
          onClick={handleCustomerSearch}
          style={{ padding: '10px 20px', borderRadius: '0 4px 4px 0', cursor: 'pointer' }}
        >
          {customerLoading ? 'Searching...' : 'Search'}
        </button>
      </div>

  
      {/* Portfolio Search Result Modal */}
      {portfolioModal && customerDetail && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ textAlign: 'left', minWidth: '700px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Portfolio: {customerDetail.name}</h2>
              <button onClick={() => setPortfolioModal(false)} style={{ background: 'none', color: '#666', fontSize: '24px', cursor: 'pointer', border: 'none' }}>&times;</button>
            </div>
            
            <hr />

            <table className="portfolio-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #eee', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>ID</th>
                  <th style={{ padding: '10px' }}>Amount</th>
                  <th style={{ padding: '10px' }}>Status</th>
                  <th style={{ padding: '10px' }}>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {customerDetail.invoices && customerDetail.invoices.length > 0 ? (
                  customerDetail.invoices.map((inv) => (
                    <tr key={inv.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                      <td style={{ padding: '10px' }}>#{inv.id}</td>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>
                        {inv.currency} {inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '10px' }}>
                        <span className={`status-badge ${inv.status.toLowerCase()}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px' }}>{inv.due_at.split('T')[0]}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ padding: '20px', textAlign: 'center' }}>No invoices found.</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div style={{ marginTop: '25px', textAlign: 'right' }}>
              <button 
                onClick={() => setPortfolioModal(false)} 
                style={{ background: 'var(--accent)', color: 'white', padding: '10px 20px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    
    </div>

    
  );
}

export default App;