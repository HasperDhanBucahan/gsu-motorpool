import React from 'react';

const StatusBadge = ({ status, size = 'md' }) => {
    const statusConfig = {
        pending: {
            label: 'Pending',
            classes: 'bg-amber-100 text-amber-700 border-amber-200',
            dotColor: 'bg-amber-500',
        },
        assigned: {
            label: 'Assigned',
            classes: 'bg-blue-100 text-blue-700 border-blue-200',
            dotColor: 'bg-blue-500',
        },
        approved: {
            label: 'Approved',
            classes: 'bg-green-100 text-green-700 border-green-200',
            dotColor: 'bg-green-500',
        },
        declined: {
            label: 'Declined',
            classes: 'bg-red-100 text-red-700 border-red-200',
            dotColor: 'bg-red-500',
        },
        completed: {
            label: 'Completed',
            classes: 'bg-purple-100 text-purple-700 border-purple-200',
            dotColor: 'bg-purple-500',
        },
    };

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base',
    };

    const dotSizeClasses = {
        sm: 'w-1.5 h-1.5',
        md: 'w-2 h-2',
        lg: 'w-2.5 h-2.5',
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
        <span
            className={`
                inline-flex items-center gap-1.5 font-medium rounded-full border
                ${config.classes}
                ${sizeClasses[size]}
                transition-all duration-200
            `}
        >
            <span className={`${config.dotColor} ${dotSizeClasses[size]} rounded-full animate-pulse`}></span>
            {config.label}
        </span>
    );
};

export default StatusBadge;