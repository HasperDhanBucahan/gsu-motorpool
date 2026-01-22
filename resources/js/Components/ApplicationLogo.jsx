export default function ApplicationLogo({ className = '' }) {
    return (
        <img
            src="/img/QSU-logo.png"
            alt="Motor Pool Logo"
            className={`h-12 w-auto ${className}`}
        />
    );
}
