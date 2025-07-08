// TrackChordVisualization/index.js
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import debounce from 'lodash/debounce';

import '../../styles/TrackChordVisualization.css';
import TabNavigation from './TabNavigation';
import TrackInfoCards from './TrackInfoCards';
import ChordProgressionVisualization from './visualizations/ChordProgressionVisualization';
import ChordDistributionVisualization from './visualizations/ChordDistributionVisualization';
import ChordDensityVisualization from './visualizations/ChordDensityVisualization';
import ChordSimilarityVisualization from './visualizations/ChordSimilarityVisualization';
import ArtistModal from './modals/ArtistModal';
import ArtistTracksModal from './modals/ArtistTracksModal';
import { fetchTrackData, fetchSimilarityData, fetchArtistTracks } from './utils/apiService';

const TrackChordVisualization = () => {
    const [searchParams] = useSearchParams();
    const trackId = searchParams.get("trackId");
    const trackIds = searchParams.get("trackIds")?.split(','); // For comparing multiple tracks
    const [chordData, setChordData] = useState([]);
    const [layoutColumns, setLayoutColumns] = useState(1);
    const [loading, setLoading] = useState(true);
    const [activeArtistModal, setActiveArtistModal] = useState(null); // Track which artist modal is active by index
    const [activeTab, setActiveTab] = useState("chordProgression"); // Default tab
    const [audioUrls, setAudioUrls] = useState(null);
    const [artistData, setArtistData] = useState(null);
    const [similarityData, setSimilarityData] = useState(null);
    const [fetchedTrackIds, setFetchedTrackIds] = useState(new Set());
    const [artistTracks, setArtistTracks] = useState([]);
    const [showArtistTracksModal, setShowArtistTracksModal] = useState({});

    // Fetch track data with debounce
    const fetchData = useCallback(
        debounce(async () => {
            if ((!trackId && (!trackIds || trackIds.length === 0)) || fetchedTrackIds.has(trackId)) return;
    
            try {
                setLoading(true);
    
                if (trackIds?.length > 1) {
                    if (!trackIds.every(id => fetchedTrackIds.has(id))) { // Fetch only if not already fetched
                        const data = await fetchTrackData(trackIds);
                        setChordData(data);
                        setFetchedTrackIds(new Set([...fetchedTrackIds, ...trackIds]));
    
                        // Store audio URLs
                        const audioList = data.map(track => track.audio?.startsWith('http') ? track.audio : null);
                        setAudioUrls(audioList);
    
                        // Store artist details
                        const artistDetails = data.map(track => track.artist || { name: "Unknown Artist", bio: "No biography available.", genres: [], image: "" });
                        setArtistData(artistDetails);
    
                        setLayoutColumns(data.length);
                    }
    
                    // Fetch similarity only if not already fetched
                    if (trackIds.length >= 2 && !similarityData) {
                        const similarity = await fetchSimilarityData(trackIds);
                        setSimilarityData(similarity);
                    }
                } else if (trackId && !fetchedTrackIds.has(trackId)) {
                    const data = await fetchTrackData([trackId]);
                    setChordData(data);
                    setFetchedTrackIds(new Set([...fetchedTrackIds, trackId]));
    
                    // Store audio URL
                    const audioList = [data[0]?.audio?.startsWith('http') ? data[0].audio : null];
                    setAudioUrls(audioList);
    
                    // Store artist details
                    const artistDetails = [data[0]?.artist || { name: "Unknown Artist", bio: "No biography available.", genres: [], image: "" }];
                    setArtistData(artistDetails);
    
                    setLayoutColumns(1);
                }
            } catch (error) {
                console.error("Error fetching track chord data:", error);
                setChordData([]);
            } finally {
                setLoading(false);
            } 
        }, 500), // Debounce delay of 500ms
        [trackId, trackIds, fetchedTrackIds, similarityData] 
    );
    
    // Fetch track data only once
    useEffect(() => {
        fetchData();
        return () => fetchData.cancel(); // Cleanup debounce
    }, [fetchData]);

    // Handler for fetching artist tracks
    const handleFetchArtistTracks = async (artistName) => {
        if (!artistName) return;
        
        try {
            const tracks = await fetchArtistTracks(artistName);
            
            // Update tracks for the specific artist
            setArtistTracks((prev) => ({
                ...prev,
                [artistName]: tracks,
            }));
            
            // Show modal for the specific artist
            setShowArtistTracksModal((prev) => ({
                ...prev,
                [artistName]: true,
            }));
        } catch (error) {
            console.error("Error fetching artist tracks:", error);
        }
    };
    
    if (loading) return <div className="loading">Loading...</div>;
    if (!chordData.length) return <div className="no-data">No chord data available.</div>;

    return (
        <div className="visualization-container">
            <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
            
            <TrackInfoCards 
                chordData={chordData} 
                layoutColumns={layoutColumns} 
                audioUrls={audioUrls} 
                onViewArtist={setActiveArtistModal}
                onViewArtistTracks={handleFetchArtistTracks}
            />
            
            <div className="visualization-content">
                {activeTab === "chordProgression" && (
                    <ChordProgressionVisualization chordData={chordData} />
                )}
                
                {activeTab === "chordDistribution" && (
                    <ChordDistributionVisualization chordData={chordData} />
                )}
                
                {activeTab === "chordDensity" && (
                    <ChordDensityVisualization chordData={chordData} />
                )}
                
                {activeTab === "chordSimilarity" && (
                    <ChordSimilarityVisualization 
                        chordData={chordData} 
                        similarityData={similarityData} 
                    />
                )}
            </div>
            
            {/* Artist Modal */}
            {activeArtistModal !== null && artistData && artistData[activeArtistModal] && (
                <ArtistModal 
                    artist={artistData[activeArtistModal]} 
                    onClose={() => setActiveArtistModal(null)} 
                />
            )}
            
            {/* Artist Tracks Modal */}
            {Object.keys(showArtistTracksModal).map((artistName) => (
                showArtistTracksModal[artistName] && (
                    <ArtistTracksModal
                        key={artistName}
                        artistName={artistName}
                        tracks={artistTracks[artistName] || []}
                        onClose={() => setShowArtistTracksModal((prev) => ({ 
                            ...prev, 
                            [artistName]: false 
                        }))}
                    />
                )
            ))}
        </div>
    );
};

export default TrackChordVisualization;