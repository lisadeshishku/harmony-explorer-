// TrackChordVisualization/utils/processChordData.js
import { COLORS } from './constants';

// Extract all unique chords from tracks

export const extractUniqueChords = (chordData) => {
    return Array.from(new Set(
        chordData.flatMap(track => track.chords.map(ch => ch.chord))
    )).sort((a, b) => a.localeCompare(b));
};

// Process chord data for chord progression visualization

export const processChordProgressionData = (chordData) => {
    // Prepare data for visualization
    const processedTrackData = {};
    
    chordData.forEach((track, index) => {
        const trackName = track.trackName || `Track ${index + 1}`;
        const trackColor = COLORS[index % COLORS.length];
        
        // Create the data with specific timestamps and chords
        let trackChordData = track.chords.map((chord, idx) => {
            // For each chord, create a data point with the chord's start time and value
            return {
                timeStart: chord.timeStart,
                timeEnd: chord.timeEnd || (idx < track.chords.length - 1 ? 
                    track.chords[idx + 1].timeStart : chord.timeStart + 2),
                chord: chord.chord,
                trackName: trackName,
                trackColor: trackColor,
                trackIndex: index
            };
        });
        
        processedTrackData[trackName] = trackChordData;
    });
    
    // Function to find the chord value at a specific time for a track
    const findChordAtTime = (trackName, time) => {
        const trackData = processedTrackData[trackName] || [];
        for (const item of trackData) {
            if (time >= item.timeStart && (!item.timeEnd || time < item.timeEnd)) {
                return item.chord;
            }
        }
        return null; // No chord at this time
    };
    
    return { processedTrackData, findChordAtTime };
};

// Process chord data for distribution visualization

export const processChordDistributionData = (track) => {
    const chordCounts = {};
    
    track.chords.forEach(({ chord, timeStart }, i) => {
        const duration = i < track.chords.length - 1 ? 
            track.chords[i + 1].timeStart - timeStart : 2;
            
        if (duration > 0) {
            chordCounts[chord] = (chordCounts[chord] || 0) + duration;
        }
    });

    const totalDuration = Object.values(chordCounts).reduce((sum, d) => sum + d, 0);
    
    return Object.entries(chordCounts)
        .map(([chord, duration]) => ({
            chord,
            duration,
            percentage: ((duration / totalDuration) * 100).toFixed(2),
        }))
        .filter(item => parseFloat(item.percentage) >= 1);
};

// Process chord data for density visualization

export const processChordDensityData = (track, segmentDuration) => {
    let segmentData = {};
    
    track.chords.forEach(({ timeStart }) => {
        const segment = Math.floor(timeStart / segmentDuration);
        segmentData[segment] = (segmentData[segment] || 0) + 1;
    });
    
    return Object.entries(segmentData).map(([segment, changes]) => ({
        x: parseInt(segment) * segmentDuration,
        y: changes,
        r: Math.sqrt(changes) * 8,
    }));
};