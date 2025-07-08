// TrackChordVisualization/visualizations/ChordDistributionVisualization.js
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { processChordDistributionData } from '../utils/processChordData';
import { COLORS } from '../utils/constants';

const ChordDistributionVisualization = ({ chordData }) => {
    // Custom label for pie chart
    const renderCustomizedLabel = ({ name, percent }) => 
        `${name} (${(percent * 100).toFixed(1)}%)`;

    // Custom tooltip formatter
    const tooltipFormatter = (value, name) => 
        [`${name}: ${value.toFixed(2)} sec`];

    return (
        <div className="distribution-visualization">
            <h2>Chord Distribution</h2>
            <div className="distribution-grid">
                {chordData.map((track, index) => {
                    // Process chord distribution data for each track
                    const distributionData = processChordDistributionData(track);

                    return (
                        <div key={index} className="track-distribution">
                            <h3>{track.trackName || `Track ${index + 1}`}</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie 
                                        data={distributionData} 
                                        dataKey="duration" 
                                        nameKey="chord" 
                                        cx="50%" 
                                        cy="50%" 
                                        innerRadius={60} 
                                        outerRadius={80} 
                                        labelLine={false} 
                                        label={renderCustomizedLabel}
                                    >
                                        {distributionData.map((_, idx) => (
                                            <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={tooltipFormatter} />
                                    <Legend align="center" verticalAlign="bottom" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default React.memo(ChordDistributionVisualization);