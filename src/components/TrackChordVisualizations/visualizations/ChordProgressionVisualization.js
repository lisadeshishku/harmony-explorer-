// TrackChordVisualization/visualizations/ChordProgressionVisualization.js
import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { extractUniqueChords, processChordProgressionData } from '../utils/processChordData';
import { COLORS } from '../utils/constants';

const ChordProgressionVisualization = ({ chordData }) => {
    // Get all unique chords from all tracks and sort them alphabetically
    const allUniqueChords = extractUniqueChords(chordData);
    
    // Process the chord data for visualization
    const { processedTrackData, findChordAtTime } = processChordProgressionData(chordData);

    // Custom tooltip component
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const time = label; // x-axis value (time)
            
            return (
                <div style={{
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    padding: '10px',
                    borderRadius: '5px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: 8 }}>
                        Time: {time.toFixed(2)} seconds
                    </p>
                    
                    {/* For each track, find the actual chord at this time */}
                    {Object.keys(processedTrackData).map((trackName, idx) => {
                        const color = COLORS[idx % COLORS.length];
                        const chord = findChordAtTime(trackName, time);
                        
                        // Only show tracks that have a chord at this time
                        if (!chord) return null;
                        
                        return (
                            <div key={trackName} style={{ 
                                display: 'flex',
                                alignItems: 'center',
                                margin: '4px 0'
                            }}>
                                <div style={{
                                    width: '12px',
                                    height: '12px',
                                    backgroundColor: color,
                                    marginRight: '8px'
                                }} />
                                <span>
                                    {trackName}: <span style={{ fontWeight: 'bold' }}>{chord}</span>
                                </span>
                            </div>
                        );
                    })}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="global-visualization">
            <h2>Chord Progression Over Time</h2>
            <ResponsiveContainer width="100%" height={500}>
                <LineChart
                    margin={{ top: 20, right: 30, left: 50, bottom: 50 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        type="number"
                        dataKey="timeStart"
                        label={{ value: "Time (seconds)", position: "insideBottom", offset: -20 }}
                        domain={[0, 'dataMax']}
                    />
                    <YAxis 
                        type="category"
                        dataKey="chord"
                        domain={allUniqueChords}
                        width={80}
                        label={{ value: "Chords", angle: -90, position: "insideLeft" }}
                    />
                    
                    <Tooltip content={<CustomTooltip />} />
                    
                    <Legend verticalAlign="top" align="center" wrapperStyle={{ marginBottom: 20 }} />

                    {/* Create a Line for each track */}
                    {Object.entries(processedTrackData).map(([name, data], index) => (
                        <Line
                            key={name}
                            name={name}
                            data={data}
                            type="stepAfter"
                            dataKey="chord"
                            stroke={COLORS[index % COLORS.length]}
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            isAnimationActive={false}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default React.memo(ChordProgressionVisualization);