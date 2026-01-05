/**
 * ScanButton Component
 * 
 * A prominent call-to-action button to start the playlist scan.
 */

interface ScanButtonProps {
    onClick: () => void;
    isLoading: boolean;
    disabled: boolean;
}

export function ScanButton({ onClick, isLoading, disabled }: ScanButtonProps) {
    return (
        <button
            className="scan-button"
            onClick={onClick}
            disabled={disabled}
        >
            {isLoading ? (
                <>
                    <span className="spinner"></span>
                    Scanning...
                </>
            ) : (
                <>
                    <span className="scan-button__icon">🔍</span>
                    Start Scan
                </>
            )}
        </button>
    );
}
