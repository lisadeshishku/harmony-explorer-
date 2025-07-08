const express = require('express');
const { connectToDatabase } = require('./db');
const axios = require('axios');
const compression = require('compression');
const cors = require('cors');
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 120 }); // Cache for 1 hour

const app = express();
const port = process.env.PORT || 5000;

// Environment variables for Jamendo credentials
const JAMENDO_CLIENT_ID = process.env.JAMENDO_CLIENT_ID || '';
const JAMENDO_API_BASE_URL = '';

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(compression());

const corsOptions = {
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization'
};
app.use(cors(corsOptions));

//Helper function for API requests with retry logic
const fetchWithRetry = async (url, options = {}, retries = 3, delay = 2000) => {
    try {
        const response = await axios.get(url, { params: options });
        return response.data;
    } catch (error) {
        if (error.response?.status === 429 && retries > 0) {
            console.warn(`Rate limited! Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchWithRetry(url, options, retries - 1, delay * 2);
        }
        console.error(`API request failed: ${error.message}`);
        throw error;
    }
};



// Delay function for rate limiting
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
let db;
(async () => {
    db = await connectToDatabase();
})();


// chord endpoint
app.get('/chords', async (req, res) => {
    const trackId = req.query.trackId;

    if (!trackId) {
        console.log("Missing trackId parameter");
        return res.status(400).json({ message: "Missing trackId parameter" });
    }

    try {
        const collection = db.collection('descriptors');

        // Fetch chord data from MongoDB
        const trackData = await collection.findOne({ _id: `jamendo-tracks:${trackId}` });

        if (!trackData || !trackData.chords || !trackData.chords.chordSequence) {
            return res.status(404).json({ message: "No chord sequence available for this track" });
        }

        // Fetch track metadata from Jamendo API
        const jamendoResponse = await fetchWithRetry(`${JAMENDO_API_BASE_URL}/tracks`, {
            client_id: JAMENDO_CLIENT_ID,
            format: 'json',
            id: trackId
        });

        if (!jamendoResponse.results.length) {
            throw new Error("Track not found on Jamendo");
        }
        const jamendoTrack = jamendoResponse.results[0];

        // Fetch artist details from Jamendo API
        let artistData = {};
        try {
            const artistResponse = await fetchWithRetry(`${JAMENDO_API_BASE_URL}/artists`, {
                client_id: JAMENDO_CLIENT_ID,
                format: 'json',
                name: jamendoTrack.artist_name,
                limit: 1
            });

            if (artistResponse.results.length > 0) {
                artistData = artistResponse.results[0];
            }
        } catch (error) {
            console.error(`Error fetching artist data from Jamendo: ${error.message}`);
        }

        // Extract additional data for display
        const genres = artistData?.musicinfo?.tags?.genres || [];
        const instruments = artistData?.musicinfo?.tags?.instruments || [];
        const moods = artistData?.musicinfo?.tags?.moods || [];

        res.json({
            trackId,
            trackName: jamendoTrack?.name || "Unknown Track",
            artist: {
                name: artistData?.name || jamendoTrack?.artist_name || "Unknown Artist",
                bio: artistData?.bio || "No biography available.",
                genres,
                instruments,
                moods,
                image: artistData?.image || jamendoTrack.artist_image || "https://via.placeholder.com/150",
                shorturl: artistData?.id ? `https://www.jamendo.com/artist/${artistData.id}` : "",
                website: artistData?.website || "",
                joindate: artistData?.joindate || "Unknown"
            },
            image: jamendoTrack?.image || "",
            audio: jamendoTrack?.audio || jamendoTrack?.audiodownload || null,
            chords: trackData.chords.chordSequence.map(chord => ({
                timeStart: chord.start,
                timeEnd: chord.end,
                chord: chord.label
            }))
        });
    } catch (error) {
        console.error("Server error:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// search endpoint
app.get('/search', async (req, res) => {
    const query = req.query.query;
    const genre = req.query.genre;

    if (!query || query.trim() === "") {
        return res.json([]);
    }

    try {
        let filteredTracks = [];
        let offset = 0;
        const limit = 50; 
        const desiredResults = 20;
        const delayBetweenRequests = 1000; // Delay between requests

        const db = await connectToDatabase();
        const collection = db.collection('descriptors');

        while (filteredTracks.length < desiredResults) {
            await delay(delayBetweenRequests);

            const jamendoParams = {
                client_id: JAMENDO_CLIENT_ID,
                search: query,
                format: 'json',
                limit,
                offset
            };

            if (genre) {
                jamendoParams.tags = genre;
            }

            const jamendoResponse = await fetchWithRetry(`${JAMENDO_API_BASE_URL}/tracks`, jamendoParams);
            const jamendoTracks = jamendoResponse.results;

            if (jamendoTracks.length === 0) break;

            const trackIds = jamendoTracks.map(track => `jamendo-tracks:${track.id}`);
            const existingTracks = await collection.find({ _id: { $in: trackIds } }).toArray();
            const existingTrackIds = new Set(existingTracks.map(track => track._id));

            const newFilteredTracks = jamendoTracks
                .filter(track => existingTrackIds.has(`jamendo-tracks:${track.id}`))
                .map(track => ({
                    id: track.id,
                    name: track.name || "Unknown Track",
                    artist_name: track.artist_name || "Unknown Artist",
                    album_name: track.album_name || "Unknown Album",
                    image: track.image,
                    genre: track.tags?.split('|')[0] || "Unknown Genre",
                    release_year: new Date(track.releasedate).getFullYear() || "Unknown Year"
                }));

            filteredTracks.push(...newFilteredTracks);
            offset += limit;
            if (filteredTracks.length >= desiredResults) break;
        }

        filteredTracks = filteredTracks.slice(0, desiredResults);
        res.json(filteredTracks);
    } catch (error) {
        console.error("Error fetching search results:", error.message);
        res.status(500).json({ message: "Error fetching search results", error: error.message });
    }
});

//compare endpoint

app.get('/compare-tracks', async (req, res) => {
    const trackIds = req.query.trackIds.split(',');

    if (!trackIds || trackIds.length < 2) {
        return res.status(400).json({ message: "At least two trackIds are required for comparison" });
    }

    const cacheKey = `compare-tracks-${trackIds.join(',')}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
        return res.json(cachedData);
    }

    try {
        const collection = db.collection('descriptors');
        const trackDataResults = [];

        for (const trackId of trackIds) {
            const trackData = await collection.findOne({ _id: `jamendo-tracks:${trackId}` });

            if (!trackData || !trackData.chords?.chordSequence) {
                console.warn(`No chord sequence found for track ${trackId}`);
                continue;
            }

            let jamendoTrack = cache.get(`jamendo-track-${trackId}`);
            if (!jamendoTrack) {
                try {
                    const jamendoResponse = await fetchWithRetry(`${JAMENDO_API_BASE_URL}/tracks`, {
                        client_id: JAMENDO_CLIENT_ID,
                        format: 'json',
                        id: trackId
                    });

                    if (jamendoResponse.results.length) {
                        jamendoTrack = jamendoResponse.results[0];
                        cache.set(`jamendo-track-${trackId}`, jamendoTrack, 3600);
                    }
                } catch (error) {
                    console.error(`Error fetching track metadata for ${trackId}: ${error.message}`);
                    continue;
                }
            }

            let artistData = cache.get(`jamendo-artist-${jamendoTrack.artist_name}`);
            if (!artistData) {
                try {
                    const artistResponse = await fetchWithRetry(`${JAMENDO_API_BASE_URL}/artists`, {
                        client_id: JAMENDO_CLIENT_ID,
                        format: 'json',
                        name: jamendoTrack.artist_name,
                        limit: 1
                    });

                    if (artistResponse.results.length) {
                        artistData = artistResponse.results[0];
                        cache.set(`jamendo-artist-${jamendoTrack.artist_name}`, artistData, 3600);
                    }
                } catch (error) {
                    console.error(`Error fetching artist data for ${jamendoTrack.artist_name}: ${error.message}`);
                }
            }

            trackDataResults.push({
                trackId,
                trackName: jamendoTrack?.name || "Unknown Track",
                artist: {
                    name: artistData?.name || jamendoTrack?.artist_name || "Unknown Artist",
                    bio: artistData?.bio || "No biography available.",
                    genres: artistData?.musicinfo?.tags?.genres || [],
                    instruments: artistData?.musicinfo?.tags?.instruments || [],
                    moods: artistData?.musicinfo?.tags?.moods || [],
                    image: artistData?.image || jamendoTrack.artist_image || "https://via.placeholder.com/150",
                    shorturl: artistData?.id ? `https://www.jamendo.com/artist/${artistData.id}` : "",
                    website: artistData?.website || "",
                    joindate: artistData?.joindate || "Unknown"
                },
                image: jamendoTrack?.image || "",
                audio: jamendoTrack?.audio || jamendoTrack?.audiodownload || null,
                chords: trackData.chords.chordSequence.map(chord => ({
                    timeStart: chord.start,
                    timeEnd: chord.end,
                    chord: chord.label
                }))
            });
        }

        cache.set(cacheKey, trackDataResults, 3600); // Cache for 1 hour
        res.json(trackDataResults);
    } catch (error) {
        console.error("Server error:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

//compare chord similarity endpoint

app.get('/compare-chord-similarity', async (req, res) => {
    const trackIds = req.query.trackIds.split(',');

    if (!trackIds || trackIds.length < 2 || trackIds.length > 3) {
        return res.status(400).json({ message: "Between two and three trackIds are required for comparison" });
    }

    const cacheKey = `chord-similarity-${trackIds.join(',')}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
        return res.json(cachedData);
    }

    try {
        const collection = db.collection('descriptors');

        // Fetch chord data for all tracks
        const trackDataPromises = trackIds.map(async (trackId) => {
            const trackData = await collection.findOne({ _id: `jamendo-tracks:${trackId}` });
            
            // Get track name from Jamendo API
            let trackName = "Unknown Track";
            try {
                const jamendoResponse = await fetchWithRetry(`${JAMENDO_API_BASE_URL}/tracks`, {
                    client_id: JAMENDO_CLIENT_ID,
                    format: 'json',
                    id: trackId
                });
                
                if (jamendoResponse.results.length > 0) {
                    trackName = jamendoResponse.results[0].name;
                }
            } catch (error) {
                console.error(`Error fetching track name for ${trackId}: ${error.message}`);
            }
            
            return {
                trackId,
                trackName,
                chords: trackData?.chords?.chordSequence?.map(chord => chord.label) || []
            };
        });

        const tracks = await Promise.all(trackDataPromises);
        
        // Check if any track is missing chord data
        if (tracks.some(track => track.chords.length === 0)) {
            return res.status(404).json({ message: "One or more tracks do not have chord data" });
        }

        // Calculate pairwise similarities
        const pairwiseComparisons = [];
        
        // Compare all possible pairs
        for (let i = 0; i < tracks.length; i++) {
            for (let j = i + 1; j < tracks.length; j++) {
                const comparison = calculateChordSimilarity(tracks[i].chords, tracks[j].chords);
                pairwiseComparisons.push({
                    track1Id: tracks[i].trackId,
                    track2Id: tracks[j].trackId,
                    track1Name: tracks[i].trackName,
                    track2Name: tracks[j].trackName,
                    similarityScore: parseFloat(comparison.score), // Ensure it's a number
                    overlappingChords: comparison.overlappingChords
                });
            }
        }

        // Generate a similarity matrix for table
        const similarityMatrix = {
            tracks: tracks.map(t => ({ id: t.trackId, name: t.trackName })),
            matrix: Array(tracks.length).fill().map(() => Array(tracks.length).fill(0))
        };
        
        // Fill the diagonal with 100% similarity (each track with itself)
        for (let i = 0; i < tracks.length; i++) {
            similarityMatrix.matrix[i][i] = 100;
        }
        
        // Fill in pairwise similarities
        pairwiseComparisons.forEach(comp => {
            const idx1 = tracks.findIndex(t => t.trackId === comp.track1Id);
            const idx2 = tracks.findIndex(t => t.trackId === comp.track2Id);
            if (idx1 >= 0 && idx2 >= 0) {
                similarityMatrix.matrix[idx1][idx2] = comp.similarityScore;
                similarityMatrix.matrix[idx2][idx1] = comp.similarityScore; 
            }
        });

        // Prepare chord sequences
        const chordSequences = {};
        tracks.forEach(track => {
            chordSequences[track.trackId] = track.chords;
        });

        const result = {
            trackIds,
            chordSequences,
            pairwiseComparisons,
            similarityMatrix,
            overallSimilarity: tracks.length > 1 ? {
                score: parseFloat((pairwiseComparisons.reduce((sum, comp) => sum + comp.similarityScore, 0) / pairwiseComparisons.length).toFixed(2)),
                comparisons: pairwiseComparisons.length
            } : null
        };
        
        cache.set(cacheKey, result, 3600); // Cache for 1 hour
        res.json(result);
    } catch (error) {
        console.error("Error comparing chord similarity:", error.message);
        res.status(500).json({ message: "Error comparing chord similarity", error: error.message });
    }
});


function calculateChordSimilarity(chords1, chords2) {
    const minLength = Math.min(chords1.length, chords2.length);
    if (minLength === 0) return { score: 0, overlappingChords: 0 };

    let overlappingChords = 0;

    for (let i = 0; i < minLength; i++) {
        if (chords1[i] === chords2[i]) {
            overlappingChords++;
        }
    }

    const score = ((overlappingChords / minLength) * 100).toFixed(2);

    return {
        score,
        overlappingChords
    };
}

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}).on("error", (err) => {
    console.error("Server encountered an error:", err.message);
});

// Catch unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Catch uncaught exceptions
process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err.message);
});
