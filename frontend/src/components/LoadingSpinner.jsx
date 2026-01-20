export default function LoadingSpinner({ size = "md", message = "The ghost is thinking..." }) {
    const sizeClasses = {
        sm: "w-6 h-6",
        md: "w-10 h-10",
        lg: "w-16 h-16",
    };

    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className={`ghost-spinner ${sizeClasses[size]} relative`}>
                <div className="absolute inset-0 rounded-full border-2 border-ghost opacity-30" />
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary" />
                <div className="absolute inset-2 rounded-full bg-ghost-glow blur-sm" />
            </div>
            {message && (
                <p className="text-secondary text-sm italic font-serif">{message}</p>
            )}
        </div>
    );
}
