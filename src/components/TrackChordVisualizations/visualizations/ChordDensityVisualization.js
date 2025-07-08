// TrackChordVisualization/visualizations/ChordDensityVisualization.js
import React from 'react';
import { Bubble } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, Title, Tooltip, Filler } from 'chart.js';
import { processChordDensityData } from '../utils/processChordData';
import { COLORS, SEGMENT_DURATION, HEATMAP_OPTIONS } from '../utils/constants';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, Title, Tooltip, Filler);

const ChordDensityVisualization = ({ chordData }) => {
    return (
        <div className="density-visualization">
            <h2>Chord Density Over Time</h2>
            <div className="density-grid">
                {chordData.map((track, index) => {
                    // Process chord density data for the track
                    const densityData = processChordDensityData(track, SEGMENT_DURATION);
                    
                    // Format for Chart.js
                    const heatmapChartData = {
                        datasets: [
                            {
                                label: "Chord Density",
                                data: densityData,
                                backgroundColor: `rgba(${COLORS[index % COLORS.length].replace(/[^\d,]/g, '')}, 0.6)`,
                                borderColor: COLORS[index % COLORS.length],
                                borderWidth: 2,
                            },
                        ],
                    };

                    return (
                        <div key={index} className="track-density">
                            <h3>{track.trackName || `Track ${index + 1}`}</h3>
                            <Bubble data={heatmapChartData} options={HEATMAP_OPTIONS} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default React.memo(ChordDensityVisualization);