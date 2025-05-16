import React, { useState } from 'react';

const MenuItemForm = ({ initialData = {}, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        name: initialData.name || '',
        description: initialData.description || '',
        price: initialData.price || 0,
        category: initialData.category || '',
    });
    const [imageFile, setImageFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'price' ? parseFloat(value) : value,
        });
    };

    const handleImageChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            // Create FormData for multipart request
            const formDataToSend = new FormData();
            formDataToSend.append('menuItem', JSON.stringify(formData));
            if (imageFile) {
                formDataToSend.append('imageFile', imageFile);
            }

            // Call the onSubmit handler with FormData
            await onSubmit(formDataToSend);
        } catch (err) {
            setError(err.message || 'Failed to save menu item');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-medium mb-3">{initialData.id ? 'Edit' : 'Add'} Menu Item</h3>

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-gray-700 mb-1">Name*</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded"
                        required
                    />
                </div>
                <div>
                    <label className="block text-gray-700 mb-1">Price*</label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
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
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded"
                    rows="3"
                />
            </div>

            <div className="mb-4">
                <label className="block text-gray-700 mb-1">Category</label>
                <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded"
                />
            </div>

            <div className="mb-4">
                <label className="block text-gray-700 mb-1">
                    {initialData.imageUrl ? 'Change Image' : 'Upload Image'}
                </label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border rounded"
                />
                {imageFile && (
                    <div className="mt-2">
                        <img
                            src={URL.createObjectURL(imageFile)}
                            alt="Preview"
                            className="h-32 object-cover rounded"
                        />
                    </div>
                )}
                {initialData.imageUrl && !imageFile && (
                    <div className="mt-2">
                        <p className="text-sm text-gray-500">Current Image:</p>
                        <img
                            src={initialData.imageUrl}
                            alt="Current"
                            className="h-32 object-cover rounded"
                        />
                    </div>
                )}
            </div>

            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={onCancel}
                    className="mr-2 px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
                    disabled={isSubmitting}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className={`px-4 py-2 text-white rounded ${
                        isSubmitting ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {initialData.id ? 'Updating...' : 'Adding...'}
                        </span>
                    ) : (
                        initialData.id ? 'Update Item' : 'Add Item'
                    )}
                </button>
            </div>
        </form>
    );
};

export default MenuItemForm;