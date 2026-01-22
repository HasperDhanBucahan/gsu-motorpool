export default function DashboardCard({ title, value, icon, color, link }) {
    return (
        <a
            href={link}
            className={`flex items-center justify-between p-5 rounded-lg shadow text-white ${color} hover:brightness-110 transition`}
        >
            <div>
                <h4 className="text-lg font-semibold">{title}</h4>
                <p className="text-2xl font-bold mt-1">{value}</p>
            </div>
            <div className="opacity-70">{icon}</div>
        </a>
    );
}