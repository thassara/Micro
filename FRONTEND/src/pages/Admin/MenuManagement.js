import React, { useState, useEffect } from 'react';
import { getMenuItems, addMenuItem, updateMenuItem, deleteMenuItem } from '../../apiRestaurant/menuApi';

const MenuManagement = ({ restaurantId }) => {
    const [menuItems, setMenuItems] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState({
        name: '',
        description: '',
        price: 0,
        category: '',
    });

    useEffect(() => {
        const fetchMenuItems = async () => {
            const data = await getMenuItems(restaurantId);
            setMenuItems(data);
        };
        fetchMenuItems();
    }, [restaurantId]);

    const handleAddItem = async (e) => {
        e.preventDefault();
        const createdItem = await addMenuItem(restaurantId, newItem);
        setMenuItems([...menuItems, createdItem]);
        setIsAdding(false);
        setNewItem({ name: '', description: '', price: 0, category: '' });
    };

    const handleDeleteItem = async (itemId) => {
        await deleteMenuItem(restaurantId, itemId);
        setMenuItems(menuItems.filter(item => item.id !== itemId));
    };

    return (
        <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Menu Items</h2>
                <button
                    onClick={() => setIsAdding(true)}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
                >
                    Add Item
                </button>
            </div>

            {isAdding && (
                <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                    <h3 className="text-lg font-medium mb-3">Add New Menu Item</h3>
                    <form onSubmit={handleAddItem}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={newItem.name}
                                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                    className="w-full px-3 py-2 border rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-1">Price</label>
                                <input
                                    type="number"
                                    value={newItem.price}
                                    onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
                                    className="w-full px-3 py-2 border rounded"
                                    required
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-1">Description</label>
                            <textarea
                                value={newItem.description}
                                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                className="w-full px-3 py-2 border rounded"
                                rows="3"
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="mr-2 px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                            >
                                Add Item
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {menuItems.map((item) => (
                        <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap">{item.name}</td>
                            <td className="px-6 py-4">{item.description}</td>
                            <td className="px-6 py-4 whitespace-nowrap">${item.price.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <button className="text-blue-500 hover:text-blue-700 mr-3">Edit</button>
                                <button
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MenuManagement;