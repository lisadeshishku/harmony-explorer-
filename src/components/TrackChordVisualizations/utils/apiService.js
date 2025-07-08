// TrackChordVisualization/utils/apiService.js

const API_BASE_URL = 'http://localhost:5000';  // Base URL for API calls

//Fetch track data for one or more tracks

export const fetchTrackData = async (trackIds) => {
    if (!trackIds || trackIds.length === 0) {
        throw new Error('No track IDs provided');
    }

    try {
        if (trackIds.length === 1) {
            // Fetch chords for a single track
            const response = await fetch(`${API_BASE_URL}/chords?trackId=${trackIds[0]}`);
            
            if (!response.ok) {
                throw new Error(`Chord API failed: ${response.status}`);
            }
            
            const data = await response.json();
            return data.chords ? [data] : [];
            
        } else {
            // Fetch comparison data for multiple tracks
            const response = await fetch(`${API_BASE_URL}/compare-tracks?trackIds=${trackIds.join(',')}`);
            
            if (!response.ok) {
                throw new Error(`Comparison API failed: ${response.status}`);
            }
            
            return await response.json();
        }
    } catch (error) {
        console.error('Error fetching track data:', error);
        throw error;
    }
};

// Fetch similarity score between multiple tracks
 
 
export const fetchSimilarityData = async (trackIds) => {
    if (!trackIds || trackIds.length < 2) {
        throw new Error('At least two track IDs are required for similarity comparison');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/compare-chord-similarity?trackIds=${trackIds.join(',')}`);
        
        if (!response.ok) {
            throw new Error(`Similarity API failed: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching similarity data:', error);
        throw error;
    }
};

// Fetch all tracks by artist

export const fetchArtistTracks = async (artistName) => {
    if (!artistName) {
        return [];
    }

    try {
        const response = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(artistName)}`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch artist tracks: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching artist tracks:', error);
        throw error;
    }
};