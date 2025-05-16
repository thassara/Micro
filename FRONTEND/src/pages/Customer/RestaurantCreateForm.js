import React, { useState, useCallback } from 'react';
import { LoadScript, GoogleMap, Marker, Autocomplete } from '@react-google-maps/api';

const libraries = ['places'];

const RestaurantCreateForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        formattedAddress: '',
        latitude: 0,
        longitude: 0,
        contactNumber: '',
        cuisineType: '',
        openingTime: '09:00',
        closingTime: '21:00',
        email: '',
        restaurantPassword: '',
        description: ''
    });
    const [coverImage, setCoverImage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [autocomplete, setAutocomplete] = useState(null);
    const [mapCenter, setMapCenter] = useState({
        lat: 6.9271,
        lng: 79.8612
    });
    const [scriptLoaded, setScriptLoaded] = useState(false);

    const handlePlaceSelect = useCallback(() => {
        if (autocomplete) {
            const place = autocomplete.getPlace();
            if (!place.geometry) {
                console.log("No geometry for this place");
                return;
            }

            setFormData(prev => ({
                ...prev,
                formattedAddress: place.formatted_address,
                latitude: place.geometry.location.lat(),
                longitude: place.geometry.location.lng()
            }));

            setMapCenter({
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
            });
        }
    }, [autocomplete]);

    const onLoad = useCallback((autocomplete) => {
        setAutocomplete(autocomplete);
    }, []);

    const onMapClick = useCallback((e) => {
        setFormData(prev => ({
            ...prev,
            latitude: e.latLng.lat(),
            longitude: e.latLng.lng()
        }));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        setCoverImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setSuccess(false);

        try {
            // Validate required fields
            if (!formData.name || !formData.formattedAddress || !formData.contactNumber ||
                !formData.cuisineType || !formData.email || !formData.restaurantPassword) {
                throw new Error('All required fields must be filled');
            }

            if (formData.latitude === 0 || formData.longitude === 0) {
                throw new Error('Please select a valid location on the map');
            }

            const formDataToSend = new FormData();
            const restaurantData = {
                name: formData.name,
                formattedAddress: formData.formattedAddress,
                latitude: formData.latitude,
                longitude: formData.longitude,
                contactNumber: formData.contactNumber,
                cuisineType: formData.cuisineType,
                openingTime: formData.openingTime,
                closingTime: formData.closingTime,
                email: formData.email,
                restaurantPassword: formData.restaurantPassword,
                description: formData.description || ''
            };

            const restaurantBlob = new Blob([JSON.stringify(restaurantData)], {
                type: 'application/json'
            });
            formDataToSend.append('restaurant', restaurantBlob);
            if (coverImage) {
                formDataToSend.append('coverImage', coverImage);
            }

            const response = await fetch('http://localhost:8088/api/public/restaurants/create', {
                method: 'POST',
                body: formDataToSend,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create restaurant');
            }

            setSuccess(true);
            setFormData({
                name: '',
                formattedAddress: '',
                latitude: 0,
                longitude: 0,
                contactNumber: '',
                cuisineType: '',
                openingTime: '09:00',
                closingTime: '21:00',
                email: '',
                restaurantPassword: '',
                description: ''
            });
            setCoverImage(null);
        } catch (err) {
            setError(err.message || 'Failed to create restaurant');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                    <div className="p-8">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Restaurant</h1>
                            <p className="text-gray-600">Register your restaurant to start receiving orders</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {success && (
                            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded-lg">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-green-700">
                                            Restaurant account created successfully! Admin needs to approve your restaurant.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name*</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Location*</label>
                                        <LoadScript
                                            googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
                                            libraries={libraries}
                                            loadingElement={<div className="h-10 bg-gray-100 rounded-lg animate-pulse"></div>}
                                            onLoad={() => setScriptLoaded(true)}
                                        >
                                            <Autocomplete
                                                onLoad={onLoad}
                                                onPlaceChanged={handlePlaceSelect}
                                            >
                                                <input
                                                    type="text"
                                                    name="formattedAddress"
                                                    value={formData.formattedAddress}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                                    placeholder="Search for a location"
                                                    required
                                                />
                                            </Autocomplete>
                                        </LoadScript>

                                        <div className="mt-4 h-64 rounded-lg overflow-hidden border border-gray-200">
                                            {scriptLoaded ? (
                                                <GoogleMap
                                                    mapContainerStyle={{ width: '100%', height: '100%' }}
                                                    center={mapCenter}
                                                    zoom={15}
                                                    onClick={onMapClick}
                                                    options={{
                                                        streetViewControl: false,
                                                        mapTypeControl: false,
                                                        fullscreenControl: false
                                                    }}
                                                >
                                                    {(formData.latitude && formData.longitude) && (
                                                        <Marker
                                                            position={{
                                                                lat: formData.latitude,
                                                                lng: formData.longitude
                                                            }}
                                                        />
                                                    )}
                                                </GoogleMap>
                                            ) : (
                                                <div className="h-full flex items-center justify-center bg-gray-100">
                                                    <div className="animate-pulse text-gray-500">Loading map...</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number*</label>
                                        <input
                                            type="tel"
                                            name="contactNumber"
                                            value={formData.contactNumber}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine Type*</label>
                                        <select
                                            name="cuisineType"
                                            value={formData.cuisineType}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                            required
                                        >
                                            <option value="">Select cuisine</option>
                                            <option value="Italian">Italian</option>
                                            <option value="Chinese">Chinese</option>
                                            <option value="Indian">Indian</option>
                                            <option value="Mexican">Mexican</option>
                                            <option value="American">American</option>
                                            <option value="Japanese">Japanese</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Opening Time*</label>
                                            <input
                                                type="time"
                                                name="openingTime"
                                                value={formData.openingTime}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Closing Time*</label>
                                            <input
                                                type="time"
                                                name="closingTime"
                                                value={formData.closingTime}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Password*</label>
                                        <input
                                            type="password"
                                            name="restaurantPassword"
                                            value={formData.restaurantPassword}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                            required
                                            minLength="8"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Full Width Fields */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    rows="3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                                <div className="mt-1 flex items-center">
                                    <label className="cursor-pointer">
                                        <span className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                            Choose File
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="sr-only"
                                        />
                                    </label>
                                    <span className="ml-2 text-sm text-gray-500">
                                        {coverImage ? coverImage.name : 'No file chosen'}
                                    </span>
                                </div>
                                {coverImage && (
                                    <div className="mt-2">
                                        <img
                                            src={URL.createObjectURL(coverImage)}
                                            alt="Preview"
                                            className="h-32 object-cover rounded-lg border border-gray-200"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full py-3 px-4 rounded-lg text-white font-medium shadow-md transition ${isSubmitting
                                        ? 'bg-blue-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600'}`}
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Creating...
                                        </span>
                                    ) : 'Create Restaurant'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RestaurantCreateForm;