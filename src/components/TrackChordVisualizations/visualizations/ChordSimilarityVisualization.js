// TrackChordVisualization/visualizations/ChordSimilarityVisualization.js
import React from 'react';
import { COLORS } from '../utils/constants';

const ChordSimilarityVisualization = ({ chordData, similarityData }) => {
    // Check if there is enough data for comparison
    if (!similarityData || !similarityData.chordSequences || typeof similarityData.chordSequences !== 'object') {
        return (
            <div className="similarity-container">
                <h2>Chord Similarity Between Tracks</h2>
                <p>No similarity data available or not enough tracks for comparison.</p>
            </div>
        );
    }

    // Check if there are at least 2 tracks for comparison
    if (!chordData || chordData.length < 2) {
        return (
            <div className="similarity-container">
                <h2>Chord Similarity Between Tracks</h2>
                <p>Not enough tracks available for comparison (need at least 2 tracks).</p>
            </div>
        );
    }

    // Get the track count from similarity data
    const trackCount = similarityData.trackIds?.length || 0;
    
    return (
        <div className="similarity-container">
            <h2>Chord Similarity Between {trackCount} Tracks</h2>
            
            {renderOverallSimilarity()}
            
            {renderSimilarityHeatmap()}
            
            {renderSimilarityScores()}
            
            {renderSideByChordComparison()}
        </div>
    );
    
    // Render overall similarity score for multiple tracks
    function renderOverallSimilarity() {
        if (!similarityData.overallSimilarity) {
            return null;
        }

        return (
            <div className="overall-similarity">
                <h3>Overall Similarity Score</h3>
                <div className="similarity-gauge">
                    <div className="gauge-value" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                        {similarityData.overallSimilarity.score}%
                    </div>
                    <div className="gauge-label">
                        Average similarity across {similarityData.overallSimilarity.comparisons} comparisons
                    </div>
                </div>
            </div>
        );
    }

    // Render similarity scores (handles pairwise comparisons for multiple tracks)
    function renderSimilarityScores() {
        if (!similarityData.pairwiseComparisons || !Array.isArray(similarityData.pairwiseComparisons)) {
            return null;
        }
    
        return (
            <div className="similarity-matrix">
                <h3>Pairwise Similarity Scores</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Track 1</th>
                            <th>Track 2</th>
                            <th>Similarity</th>
                            <th>Overlapping Chords</th>
                        </tr>
                    </thead>
                    <tbody>
                        {similarityData.pairwiseComparisons.map((comparison, idx) => {
                            const score = typeof comparison.similarityScore === 'number' 
                                ? comparison.similarityScore 
                                : parseFloat(comparison.similarityScore || 0);
                            const formattedScore = Number.isFinite(score) 
                                ? `${score.toFixed(2)}%` 
                                : 'N/A';
                                
                            return (
                                <tr key={idx}>
                                    <td>{comparison.track1Name || `Track ${comparison.track1Id || idx + 1}`}</td>
                                    <td>{comparison.track2Name || `Track ${comparison.track2Id || idx + 2}`}</td>
                                    <td>{formattedScore}</td>
                                    <td>{comparison.overlappingChords || 'N/A'}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    }

    // Render matrix table for track similarity
    function renderSimilarityHeatmap() {
        if (!similarityData.similarityMatrix) {
            return <p>No similarity matrix data available for heatmap visualization.</p>;
        }

        const { tracks, matrix } = similarityData.similarityMatrix;
        if (!tracks || !matrix || !Array.isArray(tracks) || !Array.isArray(matrix)) {
            return <p>Invalid similarity matrix data format.</p>;
        }

        // Generate a custom matrix table 
        return (
            <div className="similarity-heatmap">
                <h3>Track Similarity Matrix</h3>
                <div className="heatmap-container">
                    <div className="heatmap-grid" style={{ 
                        display: 'grid', 
                        gridTemplateColumns: `auto ${tracks.map(() => '1fr').join(' ')}`,
                        gap: '2px'
                    }}>
                        {/* Empty top-left cell */}
                        <div className="heatmap-header-cell"></div>
                        
                        {/* Column headers */}
                        {tracks.map((track, idx) => (
                            <div key={`col-${idx}`} className="heatmap-header-cell">
                                {track.name || `Track ${idx + 1}`}
                            </div>
                        ))}
                        
                        {/* Rows with row headers */}
                        {tracks.map((track, rowIdx) => (
                            <React.Fragment key={`row-${rowIdx}`}>
                                {/* Row header */}
                                <div className="heatmap-header-cell">
                                    {track.name || `Track ${rowIdx + 1}`}
                                </div>
                                
                                {/* Cells */}
                                {matrix[rowIdx].map((value, colIdx) => {
                                    // Calculate color intensity based on similarity value
                                    const intensity = Math.max(0, Math.min(100, value)) / 100;
                                    let bgColor;
                                    
                                    if (rowIdx === colIdx) {
                                        // Self-comparison cells (diagonal)
                                        bgColor = 'rgba(0, 128, 0, 0.9)'; // Green
                                    } else {
                                        // Interpolate between red (0%) and blue (100%)
                                        const r = Math.floor(255 * (1 - intensity));
                                        const b = Math.floor(255 * intensity);
                                        bgColor = `rgba(${r}, 100, ${b}, 0.8)`;
                                    }
                                    
                                    return (
                                        <div 
                                            key={`cell-${rowIdx}-${colIdx}`}
                                            className="heatmap-cell"
                                            style={{ 
                                                backgroundColor: bgColor,
                                                padding: '10px',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                color: intensity > 0.5 ? 'white' : 'black',
                                                fontWeight: 'bold'
                                            }}
                                            title={`${tracks[rowIdx].name} vs ${tracks[colIdx].name}: ${value.toFixed(1)}% similar`}
                                        >
                                            {value.toFixed(1)}%
                                        </div>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Side-by-side Chord Comparison
    function renderSideByChordComparison() {
        // Get the track IDs from the similarity data
        const trackIds = similarityData.trackIds || Object.keys(similarityData.chordSequences || {});
        const numTracks = Math.min(trackIds.length, chordData.length, 3); // Compare up to 3 tracks
        
        // Prepare data for visualization 
        const comparisonData = trackIds.slice(0, numTracks).map((trackId, index) => {
            const sequence = similarityData.chordSequences[trackId] || [];
            return {
                track: chordData[index]?.trackName || `Track ${index + 1}`,
                chords: Array.isArray(sequence) ? sequence : [],
                color: COLORS[index % COLORS.length]
            };
        });

        return (
            <div className="chord-sequence-comparison">
                <h3>Chord Sequences:</h3>
                <div className="sequence-container">
                    {comparisonData.map(track => (
                        <div key={track.track} className="sequence">
                            <h4>{track.track}</h4>
                            <div className="chord-sequence">
                                {track.chords.map((chord, index) => {
                                    // Find all other tracks for comparison
                                    const otherTracks = comparisonData.filter(t => t.track !== track.track);
                                    // Check if this chord matches any other track at this position
                                    const isMatch = otherTracks.some(otherTrack => 
                                        chord === (otherTrack?.chords[index] || '')
                                    );
                                    return (
                                        <span
                                            key={`${track.track}-${index}`}
                                            className={`chord ${isMatch ? 'match' : 'no-match'}`}
                                            title={`Position: ${index}\nChord: ${chord}`}
                                        >
                                            {chord}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
};

export default React.memo(ChordSimilarityVisualization);