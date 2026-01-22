export default function TextInput({ className = '', ...props }) {
    return (
        <input
            className={`border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm ${className}`}
            {...props}
        />
    );
}
