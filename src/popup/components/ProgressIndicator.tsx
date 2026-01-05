/**
 * ProgressIndicator Component
 * 
 * Shows scan progress with a progress bar and status message.
 */

import type { ScanProgress } from '../../lib/common/types';

interface ProgressIndicatorProps {
    progress: ScanProgress;
}

export function ProgressIndicator({ progress }: ProgressIndicatorProps) {
    const percentage = progress.total > 0
        ? Math.round((progress.current / progress.total) * 100)
        : 0;

    const phaseLabels: Record<ScanProgress['phase'], string> = {
        scrolling: 'Scrolling through playlist...',
        parsing: 'Extracting video data...',
        analyzing: 'AI is analyzing videos...',
    };

    return (
        <div className="progress">
            <div className="progress__label">
                {phaseLabels[progress.phase]}
            </div>
            <div className="progress__bar">
                <div
                    className="progress__fill"
                    style={{ width: `${Math.max(percentage, 5)}%` }}
                />
            </div>
            <div className="progress__message">
                {progress.message}
                {progress.total > 0 && ` (${progress.current}/${progress.total})`}
            </div>
        </div>
    );
}
