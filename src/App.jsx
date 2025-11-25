import React, { useState } from 'react';
import { NumberInput, SelectInput } from './components/InputComponents';
import { ResultsPanel } from './components/ResultsPanel';
import { calculatePerformance } from './utils/physics';
import './App.css';

function App() {
  // State now holds strings for inputs to allow clearing (empty string)
  const [config, setConfig] = useState({
    frame: {
      weight: 1900,
      numMotors: 4,
      size: 300,
      tiltLimit: 0,
      miscWeight: 0,
      miscCurrent: 0
    },
    environment: {
      elevation: 500,
      temp: 25,
      pressure: 1013
    },
    battery: {
      cells: 4,
      parallel: 1,
      capacity: 6000,
      cRating: 25,
      cRatingMax: 35,
      resistance: 0.0035,
      voltage: 3.7,
      weight: 148,
      chargeState: 'normal'
    },
    esc: {
      currentCont: 50,
      currentMax: 50,
      resistance: 0.005,
      weight: 65
    },
    motor: {
      kv: 1300,
      noLoadCurrent: 0.95,
      noLoadVoltage: 10,
      limitPower: 1050,
      resistance: 0.076,
      length: 19.7,
      poles: 14,
      weight: 47
    },
    prop: {
      diameter: 7,
      pitch: 3.5,
      blades: 2,
      pConst: 1.09,
      tConst: 1.0,
      gearRatio: 1
    }
  });

  const [results, setResults] = useState(null);

  const handleCalculate = () => {
    // Parse all inputs to floats before calculating
    const parseSection = (section) => {
      const parsed = {};
      for (const key in section) {
        parsed[key] = parseFloat(section[key]) || 0;
      }
      return parsed;
    };

    const cleanConfig = {
      frame: parseSection(config.frame),
      environment: parseSection(config.environment),
      battery: parseSection(config.battery),
      esc: parseSection(config.esc),
      motor: parseSection(config.motor),
      prop: parseSection(config.prop)
    };

    const res = calculatePerformance(cleanConfig);
    setResults(res);
  };

  const updateConfig = (section, key, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  return (
    <div className="app-container-full">
      <header className="app-header-compact">
        <h1>picoCalc</h1>
      </header>

      <main className="main-content-full">
        {/* Input Section - Dense Grid */}
        <div className="input-section">

          {/* Row 1: General */}
          <div className="input-row">
            <div className="row-label">General</div>
            <div className="row-inputs">
              <NumberInput label="Model Weight (g) [excl. drive]" value={config.frame.weight} onChange={(v) => updateConfig('frame', 'weight', v)} unit="g" step={10} />
              <SelectInput label="# Rotors" value={config.frame.numMotors} onChange={(v) => updateConfig('frame', 'numMotors', parseInt(v))}
                options={[
                  { value: 3, label: '3 (Tricopter)' },
                  { value: 4, label: '4 (Quad)' },
                  { value: 6, label: '6 (Hex)' },
                  { value: 8, label: '8 (Oct)' }
                ]}
              />
              <NumberInput label="Frame Size (mm)" value={config.frame.size} onChange={(v) => updateConfig('frame', 'size', v)} unit="mm" />
              <SelectInput label="FCU Tilt Limit" value={config.frame.tiltLimit} onChange={(v) => updateConfig('frame', 'tiltLimit', v)}
                options={[{ value: 0, label: 'No Limit' }, { value: 30, label: '30°' }, { value: 45, label: '45°' }]}
              />
              <NumberInput label="Field Elevation (m)" value={config.environment.elevation} onChange={(v) => updateConfig('environment', 'elevation', v)} unit="m" />
              <NumberInput label="Air Temp (°C)" value={config.environment.temp} onChange={(v) => updateConfig('environment', 'temp', v)} unit="°C" />
              <NumberInput label="Pressure (hPa)" value={config.environment.pressure} onChange={(v) => updateConfig('environment', 'pressure', v)} unit="hPa" />
            </div>
          </div>

          {/* Row 2: Battery */}
          <div className="input-row">
            <div className="row-label">Battery</div>
            <div className="row-inputs">
              <NumberInput label="Cells (S)" value={config.battery.cells} onChange={(v) => updateConfig('battery', 'cells', v)} step="1" />
              <NumberInput label="Parallel (P)" value={config.battery.parallel} onChange={(v) => updateConfig('battery', 'parallel', v)} step="1" />
              <NumberInput label="Capacity (mAh)" value={config.battery.capacity} onChange={(v) => updateConfig('battery', 'capacity', v)} unit="mAh" step="100" />
              <NumberInput label="Resistance (Ω)" value={config.battery.resistance} onChange={(v) => updateConfig('battery', 'resistance', v)} unit="Ω" step="0.001" />
              <NumberInput label="Voltage (V)" value={config.battery.voltage} onChange={(v) => updateConfig('battery', 'voltage', v)} unit="V" step="0.1" />
              <NumberInput label="C-Rate (Cont)" value={config.battery.cRating} onChange={(v) => updateConfig('battery', 'cRating', v)} unit="C" />
              <NumberInput label="Weight (g)" value={config.battery.weight} onChange={(v) => updateConfig('battery', 'weight', v)} unit="g" />
            </div>
          </div>

          {/* Row 3: Controller */}
          <div className="input-row">
            <div className="row-label">Controller</div>
            <div className="row-inputs">
              <NumberInput label="Current (Cont)" value={config.esc.currentCont} onChange={(v) => updateConfig('esc', 'currentCont', v)} unit="A" />
              <NumberInput label="Current (Max)" value={config.esc.currentMax} onChange={(v) => updateConfig('esc', 'currentMax', v)} unit="A" />
              <NumberInput label="Resistance (Ω)" value={config.esc.resistance} onChange={(v) => updateConfig('esc', 'resistance', v)} unit="Ω" step="0.001" />
              <NumberInput label="Weight (g)" value={config.esc.weight} onChange={(v) => updateConfig('esc', 'weight', v)} unit="g" />
            </div>
          </div>

          {/* Row 4: Motor */}
          <div className="input-row">
            <div className="row-label">Motor</div>
            <div className="row-inputs">
              <NumberInput label="KV (rpm/V)" value={config.motor.kv} onChange={(v) => updateConfig('motor', 'kv', v)} unit="KV" step="10" />
              <NumberInput label="No-load (A)" value={config.motor.noLoadCurrent} onChange={(v) => updateConfig('motor', 'noLoadCurrent', v)} unit="A" step="0.01" />
              <NumberInput label="Limit (W)" value={config.motor.limitPower} onChange={(v) => updateConfig('motor', 'limitPower', v)} unit="W" />
              <NumberInput label="Resistance (Ω)" value={config.motor.resistance} onChange={(v) => updateConfig('motor', 'resistance', v)} unit="Ω" step="0.001" />
              <NumberInput label="Length (mm)" value={config.motor.length} onChange={(v) => updateConfig('motor', 'length', v)} unit="mm" />
              <NumberInput label="Poles" value={config.motor.poles} onChange={(v) => updateConfig('motor', 'poles', v)} step="2" />
              <NumberInput label="Weight (g)" value={config.motor.weight} onChange={(v) => updateConfig('motor', 'weight', v)} unit="g" />
            </div>
          </div>

          {/* Row 5: Propeller */}
          <div className="input-row">
            <div className="row-label">Propeller</div>
            <div className="row-inputs">
              <NumberInput label="Diameter (in)" value={config.prop.diameter} onChange={(v) => updateConfig('prop', 'diameter', v)} unit="in" step="0.1" />
              <NumberInput label="Pitch (in)" value={config.prop.pitch} onChange={(v) => updateConfig('prop', 'pitch', v)} unit="in" step="0.1" />
              <NumberInput label="Blades" value={config.prop.blades} onChange={(v) => updateConfig('prop', 'blades', v)} step="1" />
              <NumberInput label="PConst" value={config.prop.pConst} onChange={(v) => updateConfig('prop', 'pConst', v)} step="0.01" />
              <NumberInput label="TConst" value={config.prop.tConst} onChange={(v) => updateConfig('prop', 'tConst', v)} step="0.01" />
              <NumberInput label="Gear Ratio" value={config.prop.gearRatio} onChange={(v) => updateConfig('prop', 'gearRatio', v)} step="0.1" />

              <button className="calculate-btn" onClick={handleCalculate}>Calculate</button>
            </div>
          </div>

        </div>

        <div className="results-column">
          <ResultsPanel results={results} />
        </div>
      </main>
    </div>
  );
}

export default App;
