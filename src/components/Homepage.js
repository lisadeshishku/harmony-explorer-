//Homepage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Homepage.css';

const Homepage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [genreFilter, setGenreFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedTracks, setSelectedTracks] = useState([]);
    const [randomGenre, setRandomGenre] = useState('');
    const [randomCount, setRandomCount] = useState(2);
    const [showSelected, setShowSelected] = useState(false);
    const [randomLoading, setRandomLoading] = useState(false);

    // Maximum track limit constants
    const MAX_SELECTED_TRACKS = 3;
    const MAX_RANDOM_TRACKS = 3;

    // Debounce Input to Avoid Excess API Calls
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    // Fetch Search Data Whenever Filters Change
    useEffect(() => {
        const fetchData = async () => {
            if (!debouncedQuery.trim()) {
                setSearchResults([]);
                return;
            }

            setSearchLoading(true);
            try {
                const url = new URL(`http://localhost:5000/search`);
                url.searchParams.append('query', debouncedQuery);
                if (genreFilter) url.searchParams.append('genre', genreFilter);

                const response = await fetch(url);
                if (!response.ok) throw new Error("Error fetching data from server");

                const data = await response.json();
                
                const uniqueTracks = data.reduce((acc, track) => {
                    if (!acc.some(t => t.id === track.id)) {
                        acc.push(track);
                    }
                    return acc;
                }, []);
                
                setSearchResults(uniqueTracks);
            } catch (error) {
                console.error("Error fetching search results:", error);
            } finally {
                setSearchLoading(false);
            }
        };

        fetchData();
    }, [debouncedQuery, genreFilter]); 

    const handleSelectTrack = (trackId) => {
        setSelectedTracks(prev => {
            if (prev.includes(trackId)) {
                return prev.filter(id => id !== trackId);
            } else {
                if (prev.length >= MAX_SELECTED_TRACKS) {
                    alert(`You can only compare up to ${MAX_SELECTED_TRACKS} tracks.`);
                    return prev;
                }
                return [...prev, trackId];
            }
        });
    };

    const getSelectedTrackInfo = () => {
        return selectedTracks.map(trackId => {
            const fromResults = searchResults.find(t => t.id === trackId);
            if (fromResults) return fromResults;
            
            return {
                id: trackId,
                name: "Track not in current search",
                artist_name: "Unknown Artist",
                release_year: "Unknown Year"
            };
        });
    };

    const applyFilters = () => {
        setShowModal(false);
    };

    const handleCompareTracks = () => {
        if (selectedTracks.length > 1) {
            window.location.href = `/visualizations/compare?trackIds=${selectedTracks.join(',')}`;
        } else {
            alert("Select at least two tracks to compare.");
        }
    };

    // Random Compare logic 
    const handleRandomCompare = async () => {
        if (randomLoading) return;
        setRandomLoading(true);
    
        try {
            const url = new URL(`http://localhost:5000/search`);
            url.searchParams.append('query', 't');
    
            if (randomGenre) {
                url.searchParams.append('genre', randomGenre);
            }
    
            url.searchParams.append('limit', 50);
    
            const response = await fetch(url);
            if (!response.ok) throw new Error("Error fetching random tracks");
    
            let data = await response.json();
    
            if (data.length === 0) {
                alert("No tracks available for the selected filters.");
                setRandomLoading(false);
                return;
            }
    
            // Add slight delay to show loading state
            setTimeout(() => {
                const numTracks = Math.min(randomCount, data.length, MAX_RANDOM_TRACKS);
                if (numTracks < 2) {
                    alert(`Not enough tracks available (${data.length}) to compare.`);
                    setRandomLoading(false);
                    return;
                }
    
                // Shuffle the array for randomness
                for (let i = data.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [data[i], data[j]] = [data[j], data[i]];
                }
    
                const selected = data.slice(0, numTracks).map(track => track.id);
                setRandomLoading(false);
                window.location.href = `/visualizations/compare?trackIds=${selected.join(',')}`;
            }, 500);
    
        } catch (error) {
            console.error("Error fetching random tracks:", error);
            alert("An error occurred while fetching random tracks.");
            setRandomLoading(false);
        }
    };
    
    return (
        <div className="homepage">
            <h2>Welcome to Harmony Explorer</h2>
            <p>Explore musical data visualizations and gain insights into chord progressions and trends.</p>

            {/* Search Bar */}
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search for tracks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="filter-button" onClick={() => setShowModal(true)}>
                    Filters
                </button>
                <button 
                    className="show-selected-button" 
                    onClick={() => setShowSelected(!showSelected)}
                    disabled={selectedTracks.length === 0}
                >
                    {showSelected ? 'Hide Selected' : `Selected (${selectedTracks.length})`}
                </button>
            </div>

            {/* Modal for Filters  */}
            {showModal && (
                <div className="modal-overlay" onClick={(e) => {
                    // Close modal when clicking outside
                    if (e.target.className === 'modal-overlay') {
                        setShowModal(false);
                    }
                }}>
                    <div className="modal">
                        <h3>Filter Search Results</h3>
                        <button className="close-button" onClick={() => setShowModal(false)} aria-label="Close"></button>

                        
                        <label htmlFor="genre-filter">Genre</label>
                        <select 
                            id="genre-filter"
                            value={genreFilter} 
                            onChange={(e) => setGenreFilter(e.target.value)}
                        >
                            <option value="">All Genres</option>
                            <option value="rock">Rock</option>
                            <option value="pop">Pop</option>
                            <option value="jazz">Jazz</option>
                            <option value="classical">Classical</option>
                            <option value="hip-hop">Hip-Hop</option>
                            <option value="electronic">Electronic</option>
                        </select>

                        <div className="modal-buttons">
                            <button className="apply-button" onClick={applyFilters}>Apply Filters</button>
                            <button className="cancel-button" onClick={() => setShowModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Selected Tracks Section */}
            {showSelected && selectedTracks.length > 0 && (
                <div className="selected-tracks-section">
                    <h3>Selected Tracks ({selectedTracks.length}/{MAX_SELECTED_TRACKS})</h3>
                    <ul>
                        {getSelectedTrackInfo().map((track) => (
                            <li key={`selected-${track.id}`} className="track-item selected">
                                <input 
                                    type="checkbox" 
                                    checked={true}
                                    onChange={() => handleSelectTrack(track.id)} 
                                />
                                {track.image && (
                                    <img src={track.image} alt={track.name} className="track-image" />
                                )}
                                <div className="track-info">
                                    <span className="track-link">
                                        <strong>{track.name}</strong> - {track.artist_name}
                                    </span>
                                </div>
                                <button 
                                    className="remove-button"
                                    onClick={() => handleSelectTrack(track.id)}
                                    aria-label="Remove track"
                                >
                                    ×
                                </button>
                            </li>
                        ))}
                    </ul>
                    
                    {/* Compare button within selected tracks section */}
                    <div className="compare-section">
                        <button 
                            onClick={handleCompareTracks}
                            disabled={selectedTracks.length < 2}
                        >
                            Compare Selected Tracks
                        </button>
                    </div>
                </div>
            )}

            {/* Search Results */}
            <div className="search-results">
                {searchLoading && <p className="loading-text">Loading search results...</p>}
                {!searchLoading && debouncedQuery && searchResults.length === 0 && (
                    <p>No tracks found. Try adjusting your search or filters.</p>
                )}
                {!searchLoading && searchResults.length > 0 && (
                    <>
                        <h3>Search Results ({searchResults.length})</h3>
                        <ul>
                            {searchResults.map((track) => (
                                <li 
                                    key={`result-${track.id}`} 
                                    className={`track-item ${selectedTracks.includes(track.id) ? 'selected' : ''}`}
                                >
                                    <input 
                                        type="checkbox" 
                                        checked={selectedTracks.includes(track.id)}
                                        onChange={() => handleSelectTrack(track.id)} 
                                        id={`track-${track.id}`}
                                    />
                                    {track.image ? (
                                        <img src={track.image} alt={track.name} className="track-image" />
                                    ) : (
                                        <div className="track-image" style={{backgroundColor: '#e5e7eb'}}></div>
                                    )}
                                    <div className="track-info">
                                        <Link 
                                            to={`/visualizations/track?trackId=${track.id}&trackName=${encodeURIComponent(track.name || 'Unknown')}&artist=${encodeURIComponent(track.artist_name || 'Unknown')}&image=${encodeURIComponent(track.image || '')}`} 
                                            className="track-link"
                                        >
                                            <strong>{track.name || 'Unknown Track'}</strong> - {track.artist_name || 'Unknown Artist'}
                                        </Link>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </div>

            {/* Compare Section outside Selected Tracks (only show if selected not visible) */}
            {selectedTracks.length > 0 && !showSelected && (
                <div className="compare-section">
                    <button 
                        onClick={handleCompareTracks}
                        disabled={selectedTracks.length < 2}
                    >
                        Compare Selected Tracks ({selectedTracks.length})
                    </button>
                </div>
            )}

            {/* Random Compare Tracks Section */}
            <div className="random-compare-container">
                <h3>Random Compare</h3>
                <p>Instantly compare random tracks from our database.</p>
                
                <label htmlFor="random-count">Number of Tracks:</label>
                <input 
                    id="random-count"
                    type="number" 
                    min="2" 
                    max={MAX_RANDOM_TRACKS} 
                    value={randomCount} 
                    onChange={(e) => setRandomCount(Math.min(MAX_RANDOM_TRACKS, Math.max(2, parseInt(e.target.value) || 2)))}
                />
                <small className="input-hint">Maximum {MAX_RANDOM_TRACKS} tracks</small>
                
                <label htmlFor="random-genre">Genre (Optional):</label>
                <select 
                    id="random-genre"
                    value={randomGenre} 
                    onChange={(e) => setRandomGenre(e.target.value)}
                >
                    <option value="">Any Genre</option>
                    <option value="rock">Rock</option>
                    <option value="pop">Pop</option>
                    <option value="jazz">Jazz</option>
                    <option value="classical">Classical</option>
                    <option value="hip-hop">Hip-Hop</option>
                    <option value="electronic">Electronic</option>
                </select>
                
                <button 
                    onClick={handleRandomCompare}
                    disabled={randomLoading}
                >
                    {randomLoading ? 'Fetching Tracks...' : 'Go Random!'}
                </button>
                
                {randomLoading && <p className="loading-text">Finding interesting tracks to compare...</p>}
            </div>
        </div>
    );
};

export default Homepage;