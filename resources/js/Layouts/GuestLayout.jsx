export default function GuestLayout({ children, showLogo = true }) {
    return (
        <div className="relative min-h-screen flex items-center justify-center bg-cover bg-center px-4 py-12"
            style={{ backgroundImage: "url('/img/qsu_bg.jpg')" }}
        >
            <div className="absolute inset-0 bg-black opacity-20 z-0" />

            <div className="relative z-10 w-full max-w-md bg-white bg-opacity-95 rounded-lg shadow-lg p-8">
                {/* Show logo only if showLogo is true */}
                {showLogo && (
                    <div className="flex justify-center mb-6">
                        <img src="/img/QSU-logo.png" alt="QSU Logo" className="h-12" />
                    </div>
                )}
                {children}
            </div>
        </div>
    );
}
