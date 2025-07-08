// TrackChordVisualization/utils/constants.js

// Color palette for visualization
export const COLORS = [
    "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28CFE",
    "#FF6384", "#36A2EB", "#4BC0C0", "#B565A7", "#E57373"
];

// Time segment duration for chord density visualization (in seconds)
export const SEGMENT_DURATION = 10;

// Chart options for heatmap/chord density visualization
export const HEATMAP_OPTIONS = {
    scales: {
        x: { 
            title: { 
                display: true, 
                text: "Time (seconds)", 
                font: { 
                    size: 16, 
                    weight: 'bold' 
                } 
            } 
        },
        y: { 
            title: { 
                display: true, 
                text: "Chord Changes per Segment", 
                font: { 
                    size: 16, 
                    weight: 'bold' 
                } 
            } 
        },
    },
    plugins: {
        legend: { display: false },
        tooltip: {
            callbacks: {
                label: function (context) {
                    let x = context.raw.x;
                    let y = context.raw.y;
                    let intensity = context.raw.r / 8;
                    return `Time: ${x}s | Changes: ${y} | Intensity: ${intensity.toFixed(1)}`;
                },
            },
        },
    },
};