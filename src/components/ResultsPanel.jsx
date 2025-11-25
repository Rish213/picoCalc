import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Gauge } from './Gauge';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export const ResultsPanel = ({ results }) => {
    if (!results) return <div className="results-placeholder">Enter data and click Calculate</div>;

    const { hover, max, opt, stats, graphs, mixed } = results;

    // --- Graph 1: Range Estimator ---
    const rangeOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: { position: 'top', labels: { color: '#9ca3af', boxWidth: 10, font: { size: 11 } } },
            title: { display: true, text: 'Range Estimator', color: '#e5e7eb' },
        },
        scales: {
            x: {
                title: { display: true, text: 'Air Speed (km/h)', color: '#9ca3af' },
                grid: { color: '#374151' },
                ticks: { color: '#9ca3af' }
            },
            y: {
                type: 'linear', display: true, position: 'left',
                title: { display: true, text: 'Time (min) / Range (km)', color: '#9ca3af' },
                grid: { color: '#374151' },
                ticks: { color: '#9ca3af' }
            }
        },
    };

    const rangeData = {
        labels: graphs.range.map(d => d.speed.toFixed(0)),
        datasets: [
            {
                label: 'Flight Time (no drag)',
                data: graphs.range.map(d => d.flightTimeNoDrag),
                borderColor: '#FDE047', // Yellow-300
                backgroundColor: '#FDE047',
                borderDash: [5, 5],
                borderWidth: 2,
                pointRadius: 0,
            },
            {
                label: 'Range (no drag)',
                data: graphs.range.map(d => d.rangeNoDrag),
                borderColor: '#FB923C', // Orange-400
                backgroundColor: '#FB923C',
                borderDash: [5, 5],
                borderWidth: 2,
                pointRadius: 0,
            },
            {
                label: 'Range incl. std. Drag',
                data: graphs.range.map(d => d.rangeInclDrag),
                borderColor: '#22D3EE', // Cyan-400
                backgroundColor: '#22D3EE',
                borderWidth: 2,
                pointRadius: 0,
            },
            {
                label: 'Flight Time incl. std. Drag',
                data: graphs.range.map(d => d.flightTimeInclDrag),
                borderColor: '#A5F3FC', // Cyan-200
                backgroundColor: '#A5F3FC',
                borderWidth: 2,
                pointRadius: 0,
            },
        ],
    };

    // --- Graph 2: Motor Characteristics ---
    const motorOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: { position: 'top', labels: { color: '#9ca3af', boxWidth: 10, font: { size: 11 } } },
            title: { display: true, text: 'Motor Characteristics (at full load)', color: '#e5e7eb' },
        },
        scales: {
            x: {
                title: { display: true, text: 'Current (A)', color: '#9ca3af' },
                grid: { color: '#374151' },
                ticks: { color: '#9ca3af' }
            },
            y: {
                type: 'linear', display: true, position: 'left',
                grid: { color: '#374151' },
                ticks: { color: '#9ca3af' }
            }
        },
    };

    const motorData = {
        labels: graphs.motor.map(d => d.current.toFixed(1)),
        datasets: [
            {
                label: 'el. Power [in 1W]',
                data: graphs.motor.map(d => d.power),
                borderColor: '#FBBF24', // Amber-400
                backgroundColor: '#FBBF24',
                borderWidth: 2,
                pointRadius: 0,
            },
            {
                label: 'Efficiency [%]',
                data: graphs.motor.map(d => d.efficiency),
                borderColor: '#38BDF8', // Sky-400
                backgroundColor: '#38BDF8',
                borderWidth: 2,
                pointRadius: 0,
            },
            {
                label: 'max. Revolutions [in 100rpm]',
                data: graphs.motor.map(d => d.rpm),
                borderColor: '#C084FC', // Purple-400
                backgroundColor: '#C084FC',
                borderWidth: 2,
                pointRadius: 0,
            },
            {
                label: 'waste Power [in 1W]',
                data: graphs.motor.map(d => d.wastePower),
                borderColor: '#FB7185', // Rose-400
                backgroundColor: '#FB7185',
                borderWidth: 2,
                pointRadius: 0,
            },
            {
                label: 'Motor Case Temp. [°C]',
                data: graphs.motor.map(d => d.temp),
                borderColor: '#4ADE80', // Green-400
                backgroundColor: '#4ADE80',
                borderWidth: 2,
                pointRadius: 0,
            },
            {
                label: 'Motor Case Temp. overlimit [°C]',
                data: graphs.motor.map(d => d.tempOverlimit),
                borderColor: '#EF4444', // Red-500
                backgroundColor: '#EF4444',
                borderWidth: 2,
                pointRadius: 0,
                fill: true
            },
        ],
    };

    const RemarkRow = ({ label, value, unit }) => (
        <div className="remark-row">
            <span className="remark-label">{label}:</span>
            <span className="remark-value">{value} {unit}</span>
        </div>
    );

    return (
        <div className="results-panel-compact">
            {/* Gauges Row */}
            <div className="gauges-row">
                <Gauge value={stats.twr} max={8} label="Thrust:Weight" unit=":1" color="#10b981" />
                <Gauge value={hover.flightTime} max={40} label="Hover Time" unit="min" color="#3b82f6" />
                <Gauge value={hover.powerElec} max={2000} label="Hover Power" unit="W" color="#f59e0b" />
                <Gauge value={max.current} max={200} label="Max Current" unit="A" color="#ef4444" />
                <Gauge value={stats.twr > 0 ? (stats.weight * 1000 / hover.powerElec) : 0} max={15} label="Spec. Thrust" unit="g/W" color="#8b5cf6" />
            </div>

            {/* Remarks Section */}
            <div className="remarks-section">
                <h3 className="remarks-title">Remarks:</h3>
                <div className="remarks-grid">
                    {/* Battery */}
                    <div className="remark-col">
                        <h4>Battery</h4>
                        <RemarkRow label="Load" value={stats.batteryLoad.toFixed(2)} unit="C" />
                        <RemarkRow label="Voltage" value={hover.voltage.toFixed(2)} unit="V" />
                        <RemarkRow label="Energy" value={stats.batteryEnergy.toFixed(1)} unit="Wh" />
                        <RemarkRow label="Mixed Flight Time" value={mixed.flightTime.toFixed(1)} unit="min" />
                        <RemarkRow label="Hover Flight Time" value={hover.flightTime.toFixed(1)} unit="min" />
                    </div>

                    {/* Motor @ Opt */}
                    <div className="remark-col">
                        <h4>Motor @ Optimum Eff.</h4>
                        <RemarkRow label="Current" value={opt.currentMotor.toFixed(2)} unit="A" />
                        <RemarkRow label="Voltage" value={opt.voltage.toFixed(2)} unit="V" />
                        <RemarkRow label="Revolutions" value={opt.rpm.toFixed(0)} unit="rpm" />
                        <RemarkRow label="Electric Power" value={(opt.powerElec / 4).toFixed(1)} unit="W" />
                        <RemarkRow label="Mech. Power" value={(opt.powerMech / 4).toFixed(1)} unit="W" />
                        <RemarkRow label="Efficiency" value={opt.efficiency.toFixed(1)} unit="%" />
                    </div>

                    {/* Motor @ Max */}
                    <div className="remark-col">
                        <h4>Motor @ Maximum</h4>
                        <RemarkRow label="Current" value={(max.current / 4).toFixed(2)} unit="A" />
                        <RemarkRow label="Voltage" value={max.voltage.toFixed(2)} unit="V" />
                        <RemarkRow label="Revolutions" value={max.rpm.toFixed(0)} unit="rpm" />
                        <RemarkRow label="Electric Power" value={(max.powerElec / 4).toFixed(1)} unit="W" />
                        <RemarkRow label="Mech. Power" value={(max.powerMech / 4).toFixed(1)} unit="W" />
                        <RemarkRow label="Est. Temp" value={max.temp.toFixed(0)} unit="°C" />
                    </div>

                    {/* Motor @ Hover */}
                    <div className="remark-col">
                        <h4>Motor @ Hover</h4>
                        <RemarkRow label="Current" value={(hover.current / 4).toFixed(2)} unit="A" />
                        <RemarkRow label="Voltage" value={hover.voltage.toFixed(2)} unit="V" />
                        <RemarkRow label="Revolutions" value={hover.rpm.toFixed(0)} unit="rpm" />
                        <RemarkRow label="Throttle" value={hover.throttle.toFixed(0)} unit="%" />
                        <RemarkRow label="Electric Power" value={(hover.powerElec / 4).toFixed(1)} unit="W" />
                        <RemarkRow label="Mech. Power" value={(hover.powerMech / 4).toFixed(1)} unit="W" />
                        <RemarkRow label="Spec. Thrust" value={hover.specificThrust.toFixed(2)} unit="g/W" />
                    </div>

                    {/* Total Drive */}
                    <div className="remark-col">
                        <h4>Total Drive</h4>
                        <RemarkRow label="Drive Weight" value={(stats.driveWeight * 1000).toFixed(0)} unit="g" />
                        <RemarkRow label="Thrust-Weight" value={stats.twr.toFixed(1)} unit=": 1" />
                        <RemarkRow label="Current @ Hover" value={hover.current.toFixed(2)} unit="A" />
                        <RemarkRow label="P(in) @ Hover" value={hover.powerElec.toFixed(1)} unit="W" />
                        <RemarkRow label="Current @ Max" value={max.current.toFixed(2)} unit="A" />
                        <RemarkRow label="P(in) @ Max" value={max.powerElec.toFixed(1)} unit="W" />
                    </div>

                    {/* Multicopter */}
                    <div className="remark-col">
                        <h4>Multicopter</h4>
                        <RemarkRow label="All-up Weight" value={(stats.weight * 1000).toFixed(0)} unit="g" />
                        <RemarkRow label="Add. Payload" value={(stats.payload * 1000).toFixed(0)} unit="g" />
                        <RemarkRow label="Max Tilt" value={stats.maxTilt.toFixed(0)} unit="°" />
                        <RemarkRow label="Max Speed" value={stats.maxSpeed.toFixed(0)} unit="km/h" />
                        <RemarkRow label="Rate of Climb" value={stats.rateOfClimb.toFixed(1)} unit="m/s" />
                        <RemarkRow label="Total Disc Area" value={stats.discArea.toFixed(2)} unit="dm²" />
                    </div>
                </div>
            </div>

            {/* Graphs Section */}
            <div className="graphs-container">
                <div className="results-graph-container full-width">
                    <Line options={rangeOptions} data={rangeData} />
                </div>
                <div className="results-graph-container full-width" style={{ marginTop: '2rem' }}>
                    <Line options={motorOptions} data={motorData} />
                </div>
            </div>
        </div>
    );
};
