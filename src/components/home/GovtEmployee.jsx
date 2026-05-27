import React, { useState } from 'react';

function GovtEmployee() {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [showLoginMessage, setShowLoginMessage] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (phone.trim() !== '' && name.trim() !== '') {
      // Simulate login process
      setShowLoginMessage(true);
      // In a real app, you would authenticate here
      // For workshop test, we just show a message
      setTimeout(() => {
        setShowLoginMessage(false);
      }, 3000);
    }
  };

  return (
    <div className="govt-employee" style={{
      marginTop: "200px",
      boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
      padding: "20px",
      borderRadius: "10px",
      backgroundColor: "#fff",
      maxWidth: "400px",
      margin: "200px auto"
    }}>
      {showLoginMessage ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <h3>Login Successful!</h3>
          <p>Welcome, {name}</p>
          <p>Redirecting to dashboard...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ textAlign: 'center' }}>
          <h2>Government Employee Login</h2>
          <div style={{ marginBottom: '15px' }}>
            <input 
              type="text" 
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <input 
              type="tel" 
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
              required
              maxLength="10"
            />
          </div>
          <button 
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Login
          </button>
          <p style={{ marginTop: '15px', color: '#666', fontSize: '14px' }}>
            Workshop test: Enter name and phone to simulate login
          </p>
        </form>
      )}
    </div>
  );
}

export default GovtEmployee;