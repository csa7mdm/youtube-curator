/**
 * YouTube Curator - Main App Component
 */

import { useState, useEffect } from 'react';
import { createMessageListener, sendToBackground, sendAndReceive } from '../lib/common/messaging';
import type { ExtensionState } from '../lib/common/types';
import { ScanButton } from './components/ScanButton';
import { AnalysisResult } from './components/AnalysisResult';
import { SettingsPage } from './components/SettingsPage';
import { ProgressIndicator } from './components/ProgressIndicator';
import './styles.css';

type Tab = 'scan' | 'results' | 'settings';

export default function App() {
    const [activeTab, setActiveTab] = useState<Tab>('scan');
    const [state, setState] = useState<ExtensionState>({
        status: 'idle',
        progress: null,
        videos: [],
        analysis: null,
        error: null,
        lastScanAt: null,
    });

    // Load initial state
    useEffect(() => {
        sendAndReceive<'GET_STATE', ExtensionState>('GET_STATE', {})
            .then((response) => {
                // Only update state if we got a valid response
                if (response && response.status) {
                    setState(response);
                }
            })
            .catch(console.error);
    }, []);

    // Listen for state updates from background
    useEffect(() => {
        const listener = createMessageListener({
            'STATE_UPDATE': (newState) => {
                setState(newState);
                // Auto-switch to results when analysis is complete
                if (newState.status === 'complete' && newState.analysis) {
                    setActiveTab('results');
                }
            },
            'SCAN_PROGRESS': () => {
                // Progress is part of STATE_UPDATE
            },
            'ANALYSIS_COMPLETE': () => {
                setActiveTab('results');
            },
            'ERROR': (payload) => {
                console.error('[App] Error:', payload);
            },
        });

        listener.start();
        return () => listener.stop();
    }, []);

    const handleStartScan = async () => {
        try {
            // Get current active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab?.id) {
                throw new Error('No active tab found');
            }

            // Check if we're on YouTube
            if (!tab.url?.includes('youtube.com')) {
                setState(prev => ({
                    ...prev,
                    status: 'error',
                    error: 'Please navigate to a YouTube playlist page first.',
                }));
                return;
            }

            await sendToBackground('START_SCAN', { tabId: tab.id });
        } catch (error) {
            console.error('[App] Start scan error:', error);
        }
    };

    const handleClearResults = async () => {
        await sendToBackground('CLEAR_RESULTS', {});
        setActiveTab('scan');
    };

    const isScanning = ['scrolling', 'parsing', 'analyzing'].includes(state.status);

    return (
        <div className="app">
            {/* Header */}
            <header className="header">
                <div className="header__logo">
                    <div className="header__logo-icon">📺</div>
                    <h1 className="header__title">YouTube Curator</h1>
                </div>
            </header>

            {/* Navigation */}
            <nav className="nav-tabs">
                <button
                    className={`nav-tab ${activeTab === 'scan' ? 'nav-tab--active' : ''}`}
                    onClick={() => setActiveTab('scan')}
                >
                    Scan
                </button>
                <button
                    className={`nav-tab ${activeTab === 'results' ? 'nav-tab--active' : ''}`}
                    onClick={() => setActiveTab('results')}
                    disabled={!state.analysis}
                >
                    Results {state.analysis && '✓'}
                </button>
                <button
                    className={`nav-tab ${activeTab === 'settings' ? 'nav-tab--active' : ''}`}
                    onClick={() => setActiveTab('settings')}
                >
                    Settings
                </button>
            </nav>

            {/* Main Content */}
            <main className="main-content">
                {activeTab === 'scan' && (
                    <div className="scan-section">
                        <h2 className="scan-section__title">Analyze Your Playlist</h2>
                        <p className="scan-section__description">
                            Navigate to a YouTube playlist page, then click the button below
                            to scan and analyze the videos with AI.
                        </p>

                        <ScanButton
                            onClick={handleStartScan}
                            isLoading={isScanning}
                            disabled={isScanning}
                        />

                        {state.progress && (
                            <ProgressIndicator progress={state.progress} />
                        )}

                        {state.error && (
                            <div className="error" style={{ marginTop: '16px' }}>
                                {state.error}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'results' && (
                    state.analysis ? (
                        <AnalysisResult
                            analysis={state.analysis}
                            videoCount={state.videos.length}
                            onClear={handleClearResults}
                        />
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state__icon">📊</div>
                            <p className="empty-state__text">
                                No analysis results yet. Scan a playlist first!
                            </p>
                        </div>
                    )
                )}

                {activeTab === 'settings' && (
                    <SettingsPage />
                )}
            </main>
        </div>
    );
}
