/**
 * AnalysisResult Component
 * 
 * Displays the AI analysis results in a structured format.
 */

import type { AnalysisResult as AnalysisResultType } from '../../lib/common/types';

interface AnalysisResultProps {
    analysis: AnalysisResultType;
    videoCount: number;
    onClear: () => void;
}

export function AnalysisResult({ analysis, videoCount, onClear }: AnalysisResultProps) {
    return (
        <div className="analysis">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '18px', marginBottom: '4px' }}>Analysis Complete</h2>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {videoCount} videos analyzed • {new Date(analysis.analyzedAt).toLocaleString()}
                    </p>
                </div>
                <button className="button button--secondary" onClick={onClear}>
                    Clear
                </button>
            </div>

            {/* Summary */}
            <section className="analysis__section">
                <h3 className="analysis__section-title">📝 Summary</h3>
                <p className="analysis__summary">{analysis.summary}</p>
            </section>

            {/* Themes */}
            {analysis.themes.length > 0 && (
                <section className="analysis__section">
                    <h3 className="analysis__section-title">🎯 Key Themes</h3>
                    <div className="theme-tags">
                        {analysis.themes.map((theme, i) => (
                            <span key={i} className="theme-tag" title={theme.description}>
                                {theme.name} ({theme.videoCount})
                            </span>
                        ))}
                    </div>
                </section>
            )}

            {/* Recommendations */}
            {analysis.recommendations.length > 0 && (
                <section className="analysis__section">
                    <h3 className="analysis__section-title">⭐ Watch First</h3>
                    <div className="recommendations">
                        {analysis.recommendations.slice(0, 5).map((rec, i) => (
                            <div key={i} className="recommendation">
                                <div className={`recommendation__priority recommendation__priority--${rec.priority}`} />
                                <div className="recommendation__content">
                                    <div className="recommendation__title">{rec.videoId}</div>
                                    <div className="recommendation__reason">{rec.reason}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Categories */}
            {analysis.categories.length > 0 && (
                <section className="analysis__section">
                    <h3 className="analysis__section-title">📁 Categories</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {analysis.categories.map((cat, i) => (
                            <div key={i} style={{
                                padding: '8px',
                                background: 'var(--bg-tertiary)',
                                borderRadius: '6px'
                            }}>
                                <div style={{ fontWeight: 500, marginBottom: '4px' }}>
                                    {cat.name} ({cat.videos?.length || 0} videos)
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                    {cat.rationale}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Model Info */}
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
                Analyzed using: {analysis.modelUsed}
            </div>
        </div>
    );
}
