import { Link } from '@inertiajs/react';

export default function StatCard({ title, value, icon: Icon, color, link }) {
    const colors = {
        blue: 'bg-blue-50 text-blue-700 ring-blue-700/10',
        yellow: 'bg-yellow-50 text-yellow-700 ring-yellow-700/10',
        green: 'bg-green-50 text-green-700 ring-green-700/10',
        indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-700/10',
        purple: 'bg-purple-50 text-purple-700 ring-purple-700/10',
        red: 'bg-red-50 text-red-700 ring-red-700/10',
    };

    const CardContent = () => (
        <div className={`relative overflow-hidden ${colors[color]} rounded-xl p-6 ring-1 ring-inset transition-all duration-200 hover:scale-[1.02]`}>
            <div className="absolute right-0 top-0 -ml-8 origin-top-right rotate-[-30deg] transform-gpu opacity-20">
                <Icon className="h-32 w-32" />
            </div>
            
            <div className="relative">
                <div className="flex items-center gap-x-2">
                    <Icon className="h-5 w-5" />
                    <h3 className="text-sm font-medium">{title}</h3>
                </div>
                
                <div className="mt-6">
                    <div className="text-3xl font-semibold tracking-tight">
                        {value}
                    </div>
                </div>
            </div>
        </div>
    );

    return link ? (
        <Link href={link} className="block">
            <CardContent />
        </Link>
    ) : (
        <CardContent />
    );
}