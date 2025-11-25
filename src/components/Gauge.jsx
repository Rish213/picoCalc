import React from 'react';

export const Gauge = ({ value, max, label, unit, color = "#3b82f6" }) => {
    // Clamp value
    const clampedValue = Math.min(Math.max(value, 0), max);
    const percentage = clampedValue / max;

    // SVG Geometry
    const radius = 70; // Increased radius further
    const stroke = 12; // Slightly thicker stroke
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    // Semi-circle
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (percentage * circumference) / 2; // Only show half

    return (
        <div className="gauge-container">
            <div className="gauge-chart">
                <svg height={radius} width={radius * 2} viewBox={`0 0 ${radius * 2} ${radius}`}>
                    {/* Background Track */}
                    <circle
                        stroke="#374151"
                        strokeWidth={stroke}
                        fill="transparent"
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                        style={{
                            strokeDasharray: circumference,
                            strokeDashoffset: circumference / 2,
                            transform: 'rotate(180deg)',
                            transformOrigin: '50% 100%'
                        }}
                    />
                    {/* Value Arc */}
                    <circle
                        stroke={color}
                        strokeWidth={stroke}
                        strokeDasharray={strokeDasharray}
                        style={{
                            strokeDashoffset,
                            transition: 'stroke-dashoffset 0.5s ease',
                            transform: 'rotate(180deg)',
                            transformOrigin: '50% 100%'
                        }}
                        strokeLinecap="round"
                        fill="transparent"
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />

                    {/* Centered Text - Adjusted position and size */}
                    <text x="50%" y="70%" textAnchor="middle" fill="#f3f4f6" fontSize="22" fontWeight="bold">
                        {value.toFixed(1)}
                    </text>
                    <text x="50%" y="90%" textAnchor="middle" fill="#9ca3af" fontSize="14">
                        {unit}
                    </text>
                </svg>
            </div>
            <div className="gauge-label">{label}</div>
        </div>
    );
};
