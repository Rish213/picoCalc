import { calculatePerformance } from './src/utils/physics.js';

// Test Cases
const testCases = [
    {
        name: "Standard 5-inch Quad (4S)",
        inputs: {
            frame: { weight: 450, numMotors: 4, miscWeight: 0, miscCurrent: 0 },
            battery: { cells: 4, capacity: 1500, resistance: 0.005, weight: 180 },
            esc: { resistance: 0.005, weight: 10 },
            motor: { kv: 2400, noLoadCurrent: 1.0, resistance: 0.05, weight: 30 },
            prop: { diameter: 5, pitch: 4.5, blades: 3, pConst: 1.1, tConst: 1.0 },
            environment: { temp: 25, elevation: 0 }
        },
        expected: { hoverCurrent: [5, 20], flightTime: [3, 15] } // Range
    },
    {
        name: "Heavy Lifter Hex (6S)",
        inputs: {
            frame: { weight: 2500, numMotors: 6 },
            battery: { cells: 6, capacity: 10000, resistance: 0.002, weight: 1200 },
            esc: { resistance: 0.002, weight: 40 },
            motor: { kv: 400, noLoadCurrent: 0.5, resistance: 0.1, weight: 150 },
            prop: { diameter: 15, pitch: 5, blades: 2, pConst: 1.1, tConst: 1.0 },
            environment: { temp: 25, elevation: 0 }
        },
        expected: { hoverCurrent: [15, 40], flightTime: [15, 40] }
    },
    {
        name: "Micro Whoop (1S)",
        inputs: {
            frame: { weight: 25, numMotors: 4 },
            battery: { cells: 1, capacity: 300, resistance: 0.05, weight: 8 },
            esc: { resistance: 0.01, weight: 1 },
            motor: { kv: 19000, noLoadCurrent: 0.2, resistance: 0.3, weight: 2 },
            prop: { diameter: 1.2, pitch: 1, blades: 4, pConst: 1.1, tConst: 1.0 },
            environment: { temp: 25, elevation: 0 }
        },
        expected: { hoverCurrent: [2, 6], flightTime: [2, 5] }
    },
    {
        name: "Long Range 7-inch (4S LiIon)",
        inputs: {
            frame: { weight: 600, numMotors: 4 },
            battery: { cells: 4, capacity: 3000, resistance: 0.03, weight: 200 }, // LiIon high res
            esc: { resistance: 0.005, weight: 10 },
            motor: { kv: 1300, noLoadCurrent: 0.8, resistance: 0.06, weight: 40 },
            prop: { diameter: 7, pitch: 4, blades: 2, pConst: 1.1, tConst: 1.0 },
            environment: { temp: 25, elevation: 0 }
        },
        expected: { hoverCurrent: [3, 10], flightTime: [15, 30] }
    },
    {
        name: "Cinewhoop 3-inch (4S)",
        inputs: {
            frame: { weight: 350, numMotors: 4 },
            battery: { cells: 4, capacity: 850, resistance: 0.01, weight: 100 },
            esc: { resistance: 0.005, weight: 5 },
            motor: { kv: 3600, noLoadCurrent: 0.8, resistance: 0.1, weight: 15 },
            prop: { diameter: 3, pitch: 3, blades: 5, pConst: 1.2, tConst: 1.0 }, // 5 blades
            environment: { temp: 25, elevation: 0 }
        },
        expected: { hoverCurrent: [8, 18], flightTime: [2, 6] }
    },
    {
        name: "High Altitude (3000m)",
        inputs: {
            frame: { weight: 450, numMotors: 4 },
            battery: { cells: 4, capacity: 1500, resistance: 0.005, weight: 180 },
            esc: { resistance: 0.005, weight: 10 },
            motor: { kv: 2400, noLoadCurrent: 1.0, resistance: 0.05, weight: 30 },
            prop: { diameter: 5, pitch: 4.5, blades: 3, pConst: 1.1, tConst: 1.0 },
            environment: { temp: 10, elevation: 3000 } // High alt
        },
        expected: { hoverCurrent: [6, 25], flightTime: [2, 14] } // Higher current needed
    },
    {
        name: "Overweight (Fail Case)",
        inputs: {
            frame: { weight: 2000, numMotors: 4 }, // 2kg on 5 inch!
            battery: { cells: 4, capacity: 1500, resistance: 0.005, weight: 180 },
            esc: { resistance: 0.005, weight: 10 },
            motor: { kv: 2400, noLoadCurrent: 1.0, resistance: 0.05, weight: 30 },
            prop: { diameter: 5, pitch: 4.5, blades: 3, pConst: 1.1, tConst: 1.0 },
            environment: { temp: 25, elevation: 0 }
        },
        expected: { hoverCurrent: [50, 999], flightTime: [0, 2] } // Should be very high or fail
    },
    {
        name: "Efficient 10-inch (4S)",
        inputs: {
            frame: { weight: 1200, numMotors: 4 },
            battery: { cells: 4, capacity: 5000, resistance: 0.005, weight: 500 },
            esc: { resistance: 0.005, weight: 20 },
            motor: { kv: 800, noLoadCurrent: 0.6, resistance: 0.08, weight: 80 },
            prop: { diameter: 10, pitch: 4.5, blades: 2, pConst: 1.1, tConst: 1.0 },
            environment: { temp: 25, elevation: 0 }
        },
        expected: { hoverCurrent: [8, 15], flightTime: [15, 30] }
    },
    {
        name: "Racing Quad (6S High KV)",
        inputs: {
            frame: { weight: 500, numMotors: 4 },
            battery: { cells: 6, capacity: 1300, resistance: 0.004, weight: 220 },
            esc: { resistance: 0.003, weight: 10 },
            motor: { kv: 1950, noLoadCurrent: 1.5, resistance: 0.04, weight: 35 },
            prop: { diameter: 5.1, pitch: 4.8, blades: 3, pConst: 1.1, tConst: 1.0 },
            environment: { temp: 25, elevation: 0 }
        },
        expected: { hoverCurrent: [5, 15], flightTime: [2, 8] }
    },
    {
        name: "Octocopter X8 (Heavy)",
        inputs: {
            frame: { weight: 5000, numMotors: 8 },
            battery: { cells: 12, capacity: 16000, resistance: 0.002, weight: 4000 }, // 12S
            esc: { resistance: 0.002, weight: 50 },
            motor: { kv: 180, noLoadCurrent: 0.8, resistance: 0.15, weight: 200 },
            prop: { diameter: 22, pitch: 8, blades: 2, pConst: 1.1, tConst: 1.0 },
            environment: { temp: 25, elevation: 0 }
        },
        expected: { hoverCurrent: [20, 60], flightTime: [15, 45] }
    }
];

console.log("Running Physics Verification...\n");

testCases.forEach((test, index) => {
    const result = calculatePerformance(test.inputs);
    const hoverCurrent = result.hover.current;
    const flightTime = result.hover.flightTime;

    const currentPass = hoverCurrent >= test.expected.hoverCurrent[0] && hoverCurrent <= test.expected.hoverCurrent[1];
    const timePass = flightTime >= test.expected.flightTime[0] && flightTime <= test.expected.flightTime[1];

    console.log(`Test ${index + 1}: ${test.name}`);
    console.log(`  Hover Current: ${hoverCurrent.toFixed(2)} A [Expected: ${test.expected.hoverCurrent.join('-')}] -> ${currentPass ? 'PASS' : 'FAIL'}`);
    console.log(`  Flight Time: ${flightTime.toFixed(1)} min [Expected: ${test.expected.flightTime.join('-')}] -> ${timePass ? 'PASS' : 'FAIL'}`);
    console.log(`  Max Thrust: ${result.max.thrust.toFixed(2)} kg`);
    console.log(`  Efficiency: ${result.hover.efficiency.toFixed(2)} g/W`);
    console.log("-----------------------------------");
});
