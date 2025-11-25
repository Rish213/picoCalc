/**
 * picoCalc Physics Engine
 * 
 * Advanced multirotor performance calculator.
 * Uses Aerodynamic Coefficients (Ct, Cp) model.
 */

const GRAVITY = 9.81; // m/s^2

export function calculatePerformance(inputs) {
  const {
    frame,
    battery,
    esc,
    motor,
    prop,
    environment
  } = inputs;

  // --- 1. Environmental Adjustments ---
  const T_kelvin = (environment.temp || 25) + 273.15;
  const elevation = environment.elevation || 0;
  const rho = 1.225 * Math.pow(1 - (0.0065 * elevation) / 288.15, 4.25) * (288.15 / T_kelvin);

  // --- 2. Weight & Power Setup ---
  const numMotors = frame.numMotors || 4;
  const motorWeightTotal = (motor.weight || 0) * numMotors;
  const escWeightTotal = (esc.weight || 0) * numMotors;
  const battWeight = battery.weight || 0;
  const frameWeight = frame.weight || 0;
  const driveWeight = motorWeightTotal + escWeightTotal + battWeight;
  const totalWeightKg = (frameWeight + driveWeight + (frame.miscWeight || 0)) / 1000;

  // Battery
  const cellVoltage = 3.7;
  const batteryVoltageNominal = battery.cells * cellVoltage;
  const batteryResistance = (battery.resistance || 0.005) * battery.cells / (battery.parallel || 1);
  const batteryEnergyWh = (battery.capacity / 1000) * batteryVoltageNominal * (battery.parallel || 1);
  const capacityAh = (battery.capacity / 1000) * (battery.parallel || 1);

  // --- 3. Propeller Model (Ct/Cp) ---
  const diamM = prop.diameter * 0.0254;
  const discArea = Math.PI * Math.pow(diamM / 2, 2) * numMotors;
  const ratioPD = prop.pitch / prop.diameter;

  const userTConst = prop.tConst || 1.0;
  const userPConst = prop.pConst || 1.0;

  const baseCt = 0.08 + (0.12 * ratioPD);
  const Ct = baseCt * userTConst * Math.pow(prop.blades / 2, 0.7);

  const baseCp = baseCt * ratioPD * 0.40;
  const Cp = baseCp * userPConst * Math.pow(prop.blades / 2, 0.9);

  const kThrust = Ct * rho * Math.pow(diamM, 4);
  const kPower = Cp * rho * Math.pow(diamM, 5);

  // --- Helper: Calculate State at specific RPM ---
  const calculateState = (rpm) => {
    const rps = rpm / 60;
    const pMech = kPower * Math.pow(rps, 3);
    const torque = pMech / (rps * 2 * Math.PI);
    const kv = motor.kv;
    const kt = 9.55 / kv;

    const iMotor = (torque / kt) + motor.noLoadCurrent;
    const iTotal = iMotor * numMotors + (frame.miscCurrent || 0);

    const vSag = iTotal * batteryResistance;
    const vLoaded = Math.max(3.0 * battery.cells, batteryVoltageNominal - vSag);

    const pElec = vLoaded * iTotal;
    const efficiency = pElec > 0 ? (pMech * numMotors) / pElec : 0;

    const tN = kThrust * Math.pow(rps, 2);
    const tTotalKg = (tN * numMotors) / GRAVITY;

    return {
      rpm,
      current: iTotal,
      currentMotor: iMotor,
      voltage: vLoaded,
      powerElec: pElec,
      powerMech: pMech * numMotors,
      thrust: tTotalKg,
      efficiency,
      torque
    };
  };

  // --- 4. Hover Calculations ---
  const hoverThrustPerMotorN = (totalWeightKg * GRAVITY) / numMotors;
  const hoverRps = Math.sqrt(hoverThrustPerMotorN / kThrust);
  const hoverRpm = hoverRps * 60;
  const hoverState = calculateState(hoverRpm);
  const hoverTimeMin = hoverState.current > 0 ? (capacityAh * 0.80 / hoverState.current) * 60 : 0;

  const cruiseFactor = 0.85;
  const cruiseCurrentTotalA = hoverState.current * cruiseFactor;
  const cruiseTimeMin = cruiseCurrentTotalA > 0 ? (capacityAh * 0.80 / cruiseCurrentTotalA) * 60 : 0;
  const mixedFlightTimeMin = (hoverTimeMin * 0.25) + (cruiseTimeMin * 0.75);

  // --- 5. Max Throttle Calculations ---
  let actualMaxRpm = motor.kv * batteryVoltageNominal;
  for (let i = 0; i < 5; i++) {
    const state = calculateState(actualMaxRpm);
    const iLimit = Math.min(state.currentMotor, motor.limitPower ? motor.limitPower / state.voltage : 999, esc.currentMax || 999);
    if (iLimit < state.currentMotor) {
      actualMaxRpm = actualMaxRpm * (iLimit / state.currentMotor);
    }
    const newMaxRpm = motor.kv * state.voltage * 0.80;
    actualMaxRpm = (actualMaxRpm + newMaxRpm) / 2;
  }
  const maxState = calculateState(actualMaxRpm);
  const minFlightTimeMin = maxState.current > 0 ? (capacityAh * 0.80 / maxState.current) * 60 : 0;

  // --- 6. Optimum Efficiency ---
  let optState = maxState;
  let maxEff = 0;
  for (let r = actualMaxRpm * 0.1; r < actualMaxRpm; r += actualMaxRpm / 20) {
    const s = calculateState(r);
    const motEff = (s.powerMech / numMotors) / (s.voltage * s.currentMotor);
    if (motEff > maxEff) {
      maxEff = motEff;
      optState = s;
    }
  }

  // --- 7. Extra Metrics ---
  const twr = maxState.thrust / totalWeightKg;
  const maxTilt = twr > 1 ? Math.acos(1 / twr) * (180 / Math.PI) : 0;
  const CdA = 0.02 * totalWeightKg;
  const maxThrustHorizontal = maxState.thrust * GRAVITY * Math.sin(maxTilt * Math.PI / 180);
  const maxSpeed = Math.sqrt(maxThrustHorizontal / (0.5 * rho * CdA)) * 3.6;
  const excessPower = maxState.powerMech - hoverState.powerMech;
  const rateOfClimb = excessPower / (totalWeightKg * GRAVITY);

  // --- 8. Graph 1: Range Estimator (vs Air Speed) ---
  const rangeGraphData = [];
  const speedStep = maxSpeed / 20; // 20 points

  for (let v = 0; v <= maxSpeed * 1.1; v += speedStep) {
    // Drag Force
    const vMs = v / 3.6;
    const dragN = 0.5 * rho * CdA * Math.pow(vMs, 2);

    // Total Thrust Required (simplified level flight)
    // T = sqrt(W^2 + D^2)
    const weightN = totalWeightKg * GRAVITY;
    const thrustReqN = Math.sqrt(Math.pow(weightN, 2) + Math.pow(dragN, 2));
    const thrustReqKg = thrustReqN / GRAVITY;

    // Find RPM for this thrust
    // T = kThrust * rps^2 -> rps = sqrt(T / kThrust)
    // Note: This ignores inflow changes due to forward flight (ETL), which reduces power.
    // We need a simple ETL model to make "Range incl Drag" realistic.
    // ETL factor: Power reduces by ~20-30% at cruise.
    // Simple model: P_induced = P_hover_induced / (1 + (v/v_h)^2)^0.5

    const thrustPerMotorN = thrustReqN / numMotors;
    const rpsReq = Math.sqrt(thrustPerMotorN / kThrust);
    const rpmReq = rpsReq * 60;

    if (rpmReq > actualMaxRpm * 1.1) break; // Cannot fly this fast

    const s = calculateState(rpmReq);

    // Apply ETL to Power/Current
    // Induced velocity at hover v_h = sqrt(T / (2 rho A))
    const v_h = Math.sqrt(thrustPerMotorN / (2 * rho * (discArea / numMotors)));
    const etlFactor = 1 / Math.sqrt(1 + Math.pow(vMs / v_h, 2));

    // Total Power = P_induced + P_profile + P_parasite
    // Our calculateState gives total P_mech (roughly induced + profile).
    // We scale P_mech by ETL? 
    // Let's just scale the current by a mix of ETL and Drag increase.
    // Actually, calculateState calculates power based on static thrust.
    // In forward flight, Rotor Power decreases (ETL) but Parasite Power increases (Drag).
    // Our ThrustReq ALREADY includes Drag. So calculateState(rpmReq) accounts for Drag power.
    // BUT it assumes static efficiency. Forward flight improves rotor efficiency (ETL).
    // So we should reduce the calculated current by the ETL factor.

    const currentWithETL = s.current * (0.6 + 0.4 * etlFactor); // Heuristic mix

    const fTimeNoDrag = hoverTimeMin; // Constant? No, eCalc shows it varying.
    // "Flight Time (no drag)" implies just hovering? Or moving without air resistance?
    // Usually means Hover Time (constant).

    const fTimeInclDrag = currentWithETL > 0 ? (capacityAh * 0.80 / currentWithETL) * 60 : 0;

    const rangeNoDrag = (v * fTimeNoDrag / 60); // km
    const rangeInclDrag = (v * fTimeInclDrag / 60); // km

    rangeGraphData.push({
      speed: v,
      flightTimeNoDrag: hoverTimeMin,
      rangeNoDrag: rangeNoDrag, // This is linear
      rangeInclDrag: rangeInclDrag,
      flightTimeInclDrag: fTimeInclDrag
    });
  }

  // --- 9. Graph 2: Motor Characteristics (vs Current) ---
  const motorGraphData = [];
  const maxCurrent = maxState.currentMotor * 1.2; // Go a bit beyond max
  const currentStep = maxCurrent / 20;

  for (let i = 0.5; i <= maxCurrent; i += currentStep) {
    // Motor Model
    // V = V_batt - I_total * R_batt (approx voltage at this current)
    // Assume single motor test, but voltage sag affects it.
    const iTotal = i * numMotors; // Total system current
    const vSag = iTotal * batteryResistance;
    const v = Math.max(3.0 * battery.cells, batteryVoltageNominal - vSag);

    const pIn = v * i;
    const pWaste = (Math.pow(i, 2) * motor.resistance) + (motor.noLoadCurrent * v);
    const pOut = Math.max(0, pIn - pWaste);
    const eff = pIn > 0 ? (pOut / pIn) * 100 : 0;

    // RPM = KV * (V - I*R)
    const rpm = motor.kv * (v - i * motor.resistance);

    // Temp
    const tempRise = pWaste * 0.3; // Heuristic °C/W
    const temp = (environment.temp || 25) + tempRise;
    const tempOverlimit = Math.max(0, temp - 80); // Assume 80C limit

    motorGraphData.push({
      current: i,
      power: pIn,
      efficiency: eff,
      rpm: rpm / 100, // 100rpm
      wastePower: pWaste,
      temp: temp,
      tempOverlimit: tempOverlimit
    });
  }

  return {
    hover: {
      ...hoverState,
      flightTime: hoverTimeMin,
      throttle: (hoverRpm / actualMaxRpm) * 100,
      specificThrust: hoverState.powerElec > 0 ? (hoverState.thrust * 1000) / hoverState.powerElec : 0,
      temp: (environment.temp || 25) + (hoverState.powerElec * 0.05)
    },
    max: {
      ...maxState,
      flightTime: minFlightTimeMin,
      specificThrust: maxState.powerElec > 0 ? (maxState.thrust * 1000) / maxState.powerElec : 0,
      temp: (environment.temp || 25) + (maxState.powerElec * 0.1)
    },
    opt: {
      ...optState,
      efficiency: maxEff * 100
    },
    mixed: {
      flightTime: mixedFlightTimeMin
    },
    stats: {
      weight: totalWeightKg,
      driveWeight: driveWeight / 1000,
      twr: twr,
      payload: Math.max(0, maxState.thrust - totalWeightKg),
      maxTilt,
      maxSpeed,
      rateOfClimb,
      discArea: discArea * 100,
      batteryEnergy: batteryEnergyWh,
      batteryLoad: hoverState.current / capacityAh
    },
    graphs: {
      range: rangeGraphData,
      motor: motorGraphData
    }
  };
}
