// TrackChordVisualization/TrackInfoCards.js
import React from 'react';

//Component to display track information cards including artist details and audio players
const TrackInfoCards = ({ 
    chordData, 
    layoutColumns, 
    audioUrls, 
    onViewArtist,
    onViewArtistTracks 
}) => {
    return (
        <div className={`track-info-grid ${layoutColumns === 1 ? 'single-column' : 'multi-column'}`}>
            {chordData.map((track, index) => {
                const trackInfo = {
                    trackName: track.trackName || "Unknown Track",
                    artist: track.artist || { name: "Unknown Artist" },
                    image: track.image || ""
                };

                return (
                    <div key={index} className="track-info-card">
                        <div className="track-info">
                            {trackInfo.image && (
                                <img 
                                    src={trackInfo.image} 
                                    alt={trackInfo.trackName} 
                                    className="track-image" 
                                    onError={(e) => e.target.style.display='none'} 
                                />
                            )}
                            <div className="track-details">
                                <h2>{trackInfo.trackName}</h2>
                                <p>Artist: {trackInfo.artist?.name || "Unknown Artist"}</p>
                                <button onClick={() => onViewArtist(index)}>
                                    Learn More About {trackInfo.artist?.name || "this artist"}
                                </button>
                                <button onClick={() => onViewArtistTracks(trackInfo.artist?.name)}>
                                    View All Songs by {trackInfo.artist?.name || "this artist"}
                                </button>

                                {audioUrls && audioUrls[index] && (
                                    <div className="audio-player">
                                        <h3>Listen to {trackInfo.trackName}:</h3>
                                        <audio controls>
                                            <source src={audioUrls[index]} type="audio/mpeg" />
                                            Your browser does not support the audio element.
                                        </audio>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default React.memo(TrackInfoCards);