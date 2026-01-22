export default function InputError({ message, className = '', ...props }) {
    if (!message) return null;

    return (
        <p className={`text-sm text-red-600 mt-1 ${className}`} {...props}>
            {message}
        </p>
    );
}
