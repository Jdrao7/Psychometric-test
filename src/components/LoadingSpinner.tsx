/**
 * Reusable loading spinner component
 */

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
    fullScreen?: boolean;
}

const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
};

export default function LoadingSpinner({
    size = 'md',
    text,
    fullScreen = false
}: LoadingSpinnerProps) {
    const spinner = (
        <div className="flex items-center gap-3">
            <div
                className={`
                    animate-spin rounded-full 
                    border-2 border-[var(--brand-primary)] border-t-transparent
                    ${sizeClasses[size]}
                `}
            />
            {text && (
                <span className="text-[var(--text-muted)]">{text}</span>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="min-h-screen surface-gradient flex items-center justify-center">
                {spinner}
            </div>
        );
    }

    return spinner;
}
