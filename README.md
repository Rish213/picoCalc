# picoCalc

**picoCalc** is a drone performance calculator designed to help drone builders estimate flight characteristics based on their component choices.

## Features

- **Comprehensive Configuration**: Input detailed parameters for:
    - **Frame**: Weight, size, motor count (Tricopter to Octocopter).
    - **Environment**: Elevation, temperature, pressure.
    - **Battery**: Cell count, capacity, C-rating, resistance.
    - **Controller (ESC)**: Current limits, resistance.
    - **Motor**: KV, no-load current, power limits, resistance.
    - **Propeller**: Diameter, pitch, blade count.
- **Real-time Calculations**: Instantly see estimated performance metrics as you adjust parameters.
- **Flight Time Estimation**: Calculate hover and mixed flight times.
- **Thrust & Power Analysis**: View thrust-to-weight ratios, power consumption, and efficiency.
- **Modern UI**: A clean, dark-themed interface with high-contrast neon accents for easy readability.

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) installed on your machine.

### Installation
1. Clone the repository (if you haven't already).
2. Open a terminal in the project folder.
3. Run `npm install` to install dependencies.

### Running the App
- **Option 1 (Recommended)**: Double-click the `start_app.bat` file in the project root.
- **Option 2 (Manual)**: Run `npm run dev` in your terminal and open the displayed localhost URL.

## Development
This project is built with [Vite](https://vitejs.dev/) and [React](https://reactjs.org/).
- `npm run dev`: Start development server.
- `npm run build`: Build for production.
- `npm run preview`: Preview production build.
