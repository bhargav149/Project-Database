import React from 'react';
import './Toast.css';
import { Check } from 'lucide-react';

function Toast({ show, message }) {
    if (!show) {
      return null;
    }
  
    return (
      <div className="toast">
        <Check className="toast-icon" size={24} color="#4CAF50" /> {/* Checkmark icon */}
        <span className="toast-message">{message}</span>
        <button className="toast-view-button">View</button> {/* View as a button */}
      </div>
    );
  }
  
  export default Toast;