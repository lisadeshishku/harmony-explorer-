// TrackChordVisualization/modals/ArtistModal.js
import React from 'react';

// Modal to display artist details
const ArtistModal = ({ artist, onClose }) => {
    if (!artist) return null;

    return (
        <div className="artist-modal">
            <div className="artist-modal-content">
                <button className="close-button" onClick={onClose}>X</button>
                <h2>{artist.name || "Unknown Artist"}</h2>
                
                {artist.image && (
                    <img 
                        src={artist.image} 
                        alt={artist.name} 
                        className="artist-image" 
                        onError={(e) => e.target.style.display='none'} 
                    />
                )}
                
                <p>
                    <strong>Bio:</strong> {artist.bio || "No biography available."}
                </p>
                
                <p>
                    <strong>Genres:</strong> {artist.genres && artist.genres.length > 0 
                        ? artist.genres.join(', ') 
                        : "No genres available"}
                </p>
                
                <p>
                    <strong>Joined Jamendo:</strong> {artist.joindate || "Unknown"}
                </p>
                
                <p>
                    <strong>More Info:</strong>
                    {artist.shorturl && (
                        <a 
                            href={artist.shorturl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                        >
                            Jamendo Profile
                        </a>
                    )}
                    
                    {artist.website && (
                        <>
                            {artist.shorturl ? " | " : ""}
                            <a 
                                href={artist.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                            >
                                Official Website
                            </a>
                        </>
                    )}
                    
                    {!artist.shorturl && !artist.website && " None available"}
                </p>
            </div>
        </div>
    );
};

export default React.memo(ArtistModal);