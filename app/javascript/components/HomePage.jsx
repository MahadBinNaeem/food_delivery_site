import React, { useState, useEffect } from 'react';

function HomePage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        debugger
        const response = await fetch('/api/v1/restaurants', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
          mode: 'cors'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fetched restaurants:', data);
        setRestaurants(data);
      } catch (err) {
        console.error('Error fetching restaurants:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  if (loading) return <div className="p-4">Loading restaurants...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Restaurants</h1>
      debugger
      {restaurants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <div key={restaurant.id} className="border rounded-lg p-4 shadow hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold">{restaurant.name}</h2>
              <p className="text-gray-600">Cuisine: {restaurant.cuisine}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No restaurants found.</p>
      )}
    </div>
  );
}

export default HomePage;
