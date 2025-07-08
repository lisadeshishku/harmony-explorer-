// TrackChordVisualization/modals/ArtistTracksModal.js
import React from 'react';

// Modal to display all tracks by a specific artist
const ArtistTracksModal = ({ artistName, tracks, onClose }) => {
    if (!artistName || !tracks) return null;

    return (
        <div className="artist-tracks-modal">
            <div className="artist-tracks-modal-content">
                <button className="close-button" onClick={onClose}>X</button>
                <h2>All Songs by {artistName}</h2>
                
                {tracks.length === 0 ? (
                    <p>No tracks found for this artist.</p>
                ) : (
                    <div className="tracks-grid">
                        {tracks.map((track, index) => (
                            <div key={index} className="track-card">
                                {track.image && (
                                    <img
                                        src={track.image}
                                        alt={track.name}
                                        className="track-image"
                                        onError={(e) => (e.target.style.display = "none")}
                                    />
                                )}
                                <div className="track-details">
                                    <h3>{track.name || "Unknown Track"}</h3>
                                    <p>Album: {track.album_name || "Unknown Album"}</p>
                                    <p>Release Year: {track.release_year || "Unknown Year"}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default React.memo(ArtistTracksModal);