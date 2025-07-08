// TrackChordVisualization/TabNavigation.js
import React from 'react';

// TabNavigation component for switching between different chord visualizations
const TabNavigation = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { id: "chordProgression", label: "Chord Progression" },
        { id: "chordDistribution", label: "Chord Distribution" },
        { id: "chordDensity", label: "Chord Density" },
        { id: "chordSimilarity", label: "Chord Similarity" }
    ];

    return (
        <div className="tab-container">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    className={activeTab === tab.id ? "active" : ""}
                    onClick={() => setActiveTab(tab.id)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

export default React.memo(TabNavigation);