import React, { useState, useCallback } from 'react';
import { LoadScript, GoogleMap, Marker, Autocomplete } from '@react-google-maps/api';

// Define libraries to load
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
        lat: 6.9271,  // Default center (Colombo)
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

            // Validate coordinates
            if (formData.latitude === 0 || formData.longitude === 0) {
                throw new Error('Please select a valid location on the map');
            }

            const formDataToSend = new FormData();

            // Create restaurant JSON object
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

            // Append as JSON blob
            const restaurantBlob = new Blob([JSON.stringify(restaurantData)], {
                type: 'application/json'
            });
            formDataToSend.append('restaurant', restaurantBlob);
            if (coverImage) {
                formDataToSend.append('coverImage', coverImage);
            }

            const response = await fetch('http://localhost:8081/api/public/restaurants/create', {
                method: 'POST',
                body: formDataToSend,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Backend validation errors:', errorData);
                throw new Error(errorData.message || 'Failed to create restaurant');
            }

            const responseData = await response.json();
            setSuccess(true);
            console.log('Restaurant created:', responseData);

            // Reset form
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
            console.error('Error creating restaurant:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">Create New Restaurant</h2>

            {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
                    Restaurant account created successfully!
                    Admin needs to approve your restaurant
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Restaurant Name*</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Location*</label>
                            <LoadScript
                                googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
                                libraries={libraries}
                                loadingElement={<div>Loading...</div>}
                                onLoad={() => setScriptLoaded(true)}
                                onError={(error) => console.error("Google Maps error:", error)}
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
                                        className="w-full p-2 border rounded"
                                        placeholder="Search for a location"

                                    />
                                </Autocomplete>
                            </LoadScript>

                            <div className="mt-4 h-64">
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
                                        Loading map...
                                    </div>
                                )}
                            </div>

                            <input
                                type="hidden"
                                name="latitude"
                                value={formData.latitude}
                            />
                            <input
                                type="hidden"
                                name="longitude"
                                value={formData.longitude}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Contact Number*</label>
                            <input
                                type="tel"
                                name="contactNumber"
                                value={formData.contactNumber}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Cuisine Type*</label>
                            <select
                                name="cuisineType"
                                value={formData.cuisineType}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
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
                    </div>

                    {/* Right Column */}
                    <div>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Opening Time*</label>
                            <input
                                type="time"
                                name="openingTime"
                                value={formData.openingTime}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Closing Time*</label>
                            <input
                                type="time"
                                name="closingTime"
                                value={formData.closingTime}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Email*</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Password*</label>
                            <input
                                type="password"
                                name="restaurantPassword"
                                value={formData.restaurantPassword}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                required
                                minLength="8"
                            />
                        </div>
                    </div>
                </div>

                {/* Full Width Fields */}
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        rows="3"
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 mb-2">Cover Image</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full p-2 border rounded"
                    />
                    {coverImage && (
                        <div className="mt-2">
                            <img
                                src={URL.createObjectURL(coverImage)}
                                alt="Preview"
                                className="h-32 object-cover rounded"
                            />
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-2 px-4 rounded text-white ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                    {isSubmitting ? 'Creating...' : 'Create Restaurant'}
                </button>
            </form>
        </div>
    );
};

export default RestaurantCreateForm;