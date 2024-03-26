import React from 'react';
import './Toast.css';
import { Check } from 'lucide-react';

function Toast({ show, message, fadeOut }) {
    if (!show) {
      return null;
    }
  
    const toastClassNames = `toast ${fadeOut ? 'toast-fade-out' : ''}`;
  
    return (
      <div className={toastClassNames}>
        <Check className="toast-icon" size={24} color="#4CAF50" /> {/* Checkmark icon */}
        <span className="toast-message">{message}</span>
        {/* <button className="toast-view-button">View</button> */}
      </div>
    );
  }
  
  export default Toast;