import { calculatePerformance } from './src/utils/physics.js';

// Helper to check range
const inRange = (val, min, max) => val >= min && val <= max;

// Helper to calculate error
const calcError = (val, min, max) => {
    if (val < min) return ((min - val) / min) * 100;
    if (val > max) return ((val - max) / max) * 100;
    return 0;
};

const testCases = [
    {
        name: "1. Standard 5\" Freestyle (4S)",
        inputs: {
            frame: { weight: 350, numMotors: 4 },
            battery: { cells: 4, capacity: 1500, resistance: 0.005, weight: 180 },
            esc: { resistance: 0.005, weight: 10 },
            motor: { kv: 2400, noLoadCurrent: 1.0, resistance: 0.05, weight: 30 },
            prop: { diameter: 5, pitch: 4.5, blades: 3, pConst: 1.1, tConst: 1.0 },
            environment: { temp: 25, elevation: 0 }
        },
        checks: { hoverCurrent: [15, 25], hoverTime: [3, 6], mixedTime: [4, 8] }
    },
    {
        name: "2. 5\" Racing (6S High KV)",
        inputs: {
            frame: { weight: 320, numMotors: 4 },
            battery: { cells: 6, capacity: 1300, resistance: 0.004, weight: 220 },
            esc: { resistance: 0.003, weight: 10 },
            motor: { kv: 1950, noLoadCurrent: 1.5, resistance: 0.04, weight: 35 },
            prop: { diameter: 5.1, pitch: 4.8, blades: 3, pConst: 1.1, tConst: 1.0 },
            environment: { temp: 25, elevation: 0 }
        },
        checks: { hoverCurrent: [10, 20], hoverTime: [3, 7], maxSpeed: [120, 200] }
    },
    {
        name: "3. 3\" Cinewhoop (4S)",
        inputs: {
            frame: { weight: 250, numMotors: 4 }, // Heavy ducts
            battery: { cells: 4, capacity: 850, resistance: 0.01, weight: 100 },
            esc: { resistance: 0.005, weight: 5 },
            motor: { kv: 3600, noLoadCurrent: 0.8, resistance: 0.1, weight: 15 },
            prop: { diameter: 3, pitch: 3, blades: 5, pConst: 1.2, tConst: 1.0 },
            environment: { temp: 25, elevation: 0 }
        },
        checks: { hoverCurrent: [10, 20], hoverTime: [2, 5] }
    },
    {
        name: "4. 7\" Long Range (LiIon 6S)",
        inputs: {
            frame: { weight: 500, numMotors: 4 },
            battery: { cells: 6, capacity: 3000, resistance: 0.03, weight: 300 }, // LiIon high res
            esc: { resistance: 0.005, weight: 10 },
            motor: { kv: 1300, noLoadCurrent: 0.8, resistance: 0.06, weight: 40 },
            prop: { diameter: 7, pitch: 4, blades: 2, pConst: 1.1, tConst: 1.0 },
            environment: { temp: 25, elevation: 0 }
        },
        checks: { hoverCurrent: [5, 12], hoverTime: [15, 30], mixedTime: [18, 35] }
    },
    {
        name: "5. 10\" Macro Efficiency",
        inputs: {
            frame: { weight: 900, numMotors: 4 },
            battery: { cells: 4, capacity: 5000, resistance: 0.005, weight: 500 },
            esc: { resistance: 0.005, weight: 20 },
            motor: { kv: 800, noLoadCurrent: 0.6, resistance: 0.08, weight: 80 },
            prop: { diameter: 10, pitch: 4.5, blades: 2, pConst: 1.1, tConst: 1.0 },
            environment: { temp: 25, elevation: 0 }
        },
        checks: { hoverCurrent: [10, 20], hoverTime: [12, 25] }
    },
    {
        name: "6. Micro Whoop 65mm (1S)",
        inputs: {
            frame: { weight: 22, numMotors: 4 },
            battery: { cells: 1, capacity: 300, resistance: 0.05, weight: 8 },
            esc: { resistance: 0.01, weight: 1 },
            motor: { kv: 19000, noLoadCurrent: 0.2, resistance: 0.3, weight: 2 },
            prop: { diameter: 1.2, pitch: 1, blades: 4, pConst: 1.1, tConst: 1.0 },
            environment: { temp: 25, elevation: 0 }
        },
        checks: { hoverCurrent: [2, 5], hoverTime: [2, 5] }
    },
    {
        name: "7. Heavy Lift X8 (12S)",
        inputs: {
            frame: { weight: 4000, numMotors: 8 },
            battery: { cells: 12, capacity: 16000, resistance: 0.002, weight: 4000 },
            esc: { resistance: 0.002, weight: 50 },
            motor: { kv: 180, noLoadCurrent: 0.8, resistance: 0.15, weight: 200 },
            prop: { diameter: 22, pitch: 8, blades: 2, pConst: 1.1, tConst: 1.0 },
            environment: { temp: 25, elevation: 0 }
        },
        checks: { hoverCurrent: [30, 60], hoverTime: [15, 40], twr: [1.5, 3.0] }
    },
    {
        name: "8. Endurance 15\" (6S)",
        inputs: {
            frame: { weight: 1200, numMotors: 4 },
            battery: { cells: 6, capacity: 22000, resistance: 0.002, weight: 2500 }, // Huge battery
            esc: { resistance: 0.005, weight: 20 },
            motor: { kv: 380, noLoadCurrent: 0.4, resistance: 0.12, weight: 100 },
            prop: { diameter: 15, pitch: 5, blades: 2, pConst: 1.0, tConst: 1.0 },
            environment: { temp: 25, elevation: 0 }
        },
        checks: { hoverCurrent: [10, 25], hoverTime: [40, 90] } // Should fly for an hour+
    },
    {
        name: "9. High Altitude 5\" (3000m)",
        inputs: {
            frame: { weight: 350, numMotors: 4 },
            battery: { cells: 4, capacity: 1500, resistance: 0.005, weight: 180 },
            esc: { resistance: 0.005, weight: 10 },
            motor: { kv: 2400, noLoadCurrent: 1.0, resistance: 0.05, weight: 30 },
            prop: { diameter: 5, pitch: 4.5, blades: 3, pConst: 1.1, tConst: 1.0 },
            environment: { temp: 10, elevation: 3000 }
        },
        checks: { hoverCurrent: [18, 30], hoverTime: [2, 5] } // Higher current than sea level
    },
    {
        name: "10. Speed Demon (8S)",
        inputs: {
            frame: { weight: 400, numMotors: 4 },
            battery: { cells: 8, capacity: 1100, resistance: 0.005, weight: 250 },
            esc: { resistance: 0.003, weight: 15 },
            motor: { kv: 1300, noLoadCurrent: 1.2, resistance: 0.04, weight: 40 },
            prop: { diameter: 7, pitch: 5, blades: 2, pConst: 1.1, tConst: 1.0 },
            environment: { temp: 25, elevation: 0 }
        },
        checks: { maxSpeed: [150, 300], twr: [5, 15] }
    }
];

console.log("Running Comprehensive Physics Verification (10 Cases)...\n");

let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
    const res = calculatePerformance(test.inputs);
    const { hover, mixed, stats, graphs, opt } = res;

    console.log(`Test ${index + 1}: ${test.name}`);
    let casePass = true;

    // 1. Check Hover Current
    if (test.checks.hoverCurrent) {
        const val = hover.current;
        const [min, max] = test.checks.hoverCurrent;
        if (!inRange(val, min, max)) {
            const err = calcError(val, min, max);
            console.log(`  [FAIL] Hover Current: ${val.toFixed(2)} A (Expected ${min}-${max}, Error: ${err.toFixed(1)}%)`);
            casePass = false;
        } else {
            console.log(`  [PASS] Hover Current: ${val.toFixed(2)} A`);
        }
    }

    // 2. Check Hover Time
    if (test.checks.hoverTime) {
        const val = hover.flightTime;
        const [min, max] = test.checks.hoverTime;
        if (!inRange(val, min, max)) {
            const err = calcError(val, min, max);
            console.log(`  [FAIL] Hover Time: ${val.toFixed(1)} min (Expected ${min}-${max}, Error: ${err.toFixed(1)}%)`);
            casePass = false;
        } else {
            console.log(`  [PASS] Hover Time: ${val.toFixed(1)} min`);
        }
    }

    // 3. Check Mixed Time Logic (Mixed > Hover)
    if (mixed.flightTime <= hover.flightTime) {
        console.log(`  [FAIL] Mixed Time (${mixed.flightTime.toFixed(1)}) should be > Hover Time (${hover.flightTime.toFixed(1)})`);
        casePass = false;
    } else {
        console.log(`  [PASS] Mixed Time Logic OK (${mixed.flightTime.toFixed(1)} > ${hover.flightTime.toFixed(1)})`);
    }

    // 4. Check Graph Data Generation
    if (graphs.range.length === 0 || graphs.motor.length === 0) {
        console.log(`  [FAIL] Graph data empty`);
        casePass = false;
    } else {
        // Check Range Graph Logic: Range Incl Drag < Range No Drag (at high speed)
        const lastPt = graphs.range[graphs.range.length - 1];
        if (lastPt.rangeInclDrag >= lastPt.rangeNoDrag && lastPt.speed > 10) {
            console.log(`  [FAIL] Drag Physics: Range with drag (${lastPt.rangeInclDrag.toFixed(1)}) >= No drag (${lastPt.rangeNoDrag.toFixed(1)}) at ${lastPt.speed.toFixed(0)} km/h`);
            casePass = false;
        } else {
            console.log(`  [PASS] Graph Data & Drag Physics OK`);
        }
    }

    // 5. Check Optimum Efficiency
    if (!opt || opt.efficiency <= 0 || opt.efficiency > 100) {
        console.log(`  [FAIL] Invalid Optimum Efficiency: ${opt?.efficiency}`);
        casePass = false;
    } else {
        console.log(`  [PASS] Opt Efficiency: ${opt.efficiency.toFixed(1)}% @ ${opt.rpm.toFixed(0)} RPM`);
    }

    if (casePass) passed++; else failed++;
    console.log("-----------------------------------");
});

console.log(`\nSummary: ${passed} Passed, ${failed} Failed`);
