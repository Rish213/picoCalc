import React from 'react';
import { Info } from 'lucide-react';

export const InputGroup = ({ title, children }) => (
    <div className="input-group">
        <div className="group-header">
            <h3>{title}</h3>
        </div>
        <div className="group-content">
            {children}
        </div>
    </div>
);

export const NumberInput = ({ label, value, onChange, unit, step = "1", min = "0", tooltip }) => (
    <div className="input-field">
        <label>
            {label}
            {tooltip && <span className="tooltip-icon" title={tooltip}><Info size={12} /></span>}
        </label>
        <div className="input-wrapper">
            <input
                type="number"
                value={value === 0 && onChange.toString().includes('parseFloat') ? value : value} // Allow 0, but usually we want to show empty if null
                // Actually, the issue is controlled input. 
                // If value is 0, it shows "0". If user backspaces, it sends "", which becomes 0, so it stays "0".
                // We need to allow the parent to hold a string or handle empty.
                // Let's assume parent handles string or number.
                onChange={(e) => onChange(e.target.value)}
                step={step}
                min={min}
            />
            {unit && <span className="unit">{unit}</span>}
        </div>
    </div>
);

export const SelectInput = ({ label, value, onChange, options }) => (
    <div className="input-field">
        <label>{label}</label>
        <div className="input-wrapper">
            <select value={value} onChange={(e) => onChange(e.target.value)}>
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    </div>
);
