import React from 'react';

const MenuItemCard = ({ item }) => {
    return (
        <div className={`bg-white rounded-lg shadow flex p-3 mb-3 hover:shadow-md transition-shadow relative ${
            !item.available ? 'opacity-70' : ''
        }`}>
            {/* Unavailable overlay */}
            {!item.available && (
                <div className="absolute inset-0 bg-gray-100 bg-opacity-50 rounded-lg flex items-center justify-center">
                    <span className="bg-white px-2 py-1 rounded text-xs font-medium text-gray-700 shadow-sm">
                        This item is unavailable
                    </span>
                </div>
            )}

            {/* Image - Smaller and square */}
            {item.imageUrl && (
                <div className="w-20 h-20 min-w-[80px] overflow-hidden rounded-md mr-3">
                    <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                </div>
            )}

            {/* Content - More compact layout */}
            <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-start">
                    <div className="mr-2 overflow-hidden">
                        <h4 className={`font-semibold text-md truncate ${
                            !item.available ? 'text-gray-500' : ''
                        }`}>
                            {item.name}
                        </h4>
                        <p className={`text-xs mt-1 line-clamp-2 ${
                            !item.available ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                            {item.description}
                        </p>
                    </div>
                    <div className="text-right whitespace-nowrap">
                        <span className={`font-bold text-md ${
                            !item.available ? 'text-gray-400' : ''
                        }`}>
                            Rs {item.price.toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MenuItemCard;