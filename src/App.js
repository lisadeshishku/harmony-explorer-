import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './styles/App.css';

// Lazy load components
const Homepage = lazy(() => import('./components/Homepage'));
const TrackChordVisualization = lazy(() => import('./components/TrackChordVisualizations/index.js'));
const Navbar = lazy(() => import('./components/Navbar'));

function App() {
    return (
        <Router>
            <div className="App">
                <header>
                    <Suspense fallback={<div>Loading Navbar...</div>}>
                        <Navbar />
                    </Suspense>
                </header>

                <main>
                    <Routes>
                        <Route path="/" element={
                            <Suspense fallback={<div>Loading Home...</div>}>
                                <Homepage />
                            </Suspense>
                        } />
                        <Route path="/visualizations/track" element={
                            <Suspense fallback={<div>Loading Track Visualization...</div>}>
                                <TrackChordVisualization />
                            </Suspense>
                        } />
                        <Route path="/visualizations/compare" element={
                            <Suspense fallback={<div>Loading Comparison Visualization...</div>}>
                                <TrackChordVisualization />
                            </Suspense>
                        } />
                        <Route path="/visualizations/aggregate" element={
                            <Suspense fallback={<div>Loading Aggregated Visualization...</div>}>
                                <TrackChordVisualization />
                            </Suspense>
                        } />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default React.memo(App);
