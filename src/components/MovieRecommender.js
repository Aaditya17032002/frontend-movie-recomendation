import React, { useState } from 'react';
import './MovieRecommender.css';

const MovieRecommender = () => {
    const [likedMovies, setLikedMovies] = useState([]);
    const [newMovie, setNewMovie] = useState('');
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [preferences, setPreferences] = useState({
        genres: [],
        mood: '',
        contentType: '', // 'movies' or 'tv_series'
        region: '' // 'hollywood' or 'bollywood'
    });

    const handleAddMovie = () => {
        if (newMovie.trim()) {
            setLikedMovies([...likedMovies, newMovie.trim()]);
            setNewMovie('');
        }
    };

    const handleRemoveMovie = (index) => {
        setLikedMovies(likedMovies.filter((_, i) => i !== index));
    };

    const handlePreferenceChange = (type, value) => {
        setPreferences(prev => ({
            ...prev,
            [type]: value
        }));
    };

    const handleGetRecommendations = async () => {
        if (likedMovies.length === 0) {
            setError('Please add at least one movie or TV series');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('YOUR_BACKEND_URL/api/recommend', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    likedMovies,
                    preferences
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get recommendations');
            }

            const data = await response.json();
            setRecommendations(data.recommendations);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="movie-recommender">
            <h1>Movie & TV Series Recommender</h1>
            
            {/* Content Type Filter */}
            <div className="filter-section">
                <h3>Content Type</h3>
                <div className="radio-group">
                    <label>
                        <input
                            type="radio"
                            name="contentType"
                            value=""
                            checked={preferences.contentType === ''}
                            onChange={(e) => handlePreferenceChange('contentType', e.target.value)}
                        />
                        All Content
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="contentType"
                            value="movies"
                            checked={preferences.contentType === 'movies'}
                            onChange={(e) => handlePreferenceChange('contentType', e.target.value)}
                        />
                        Movies Only
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="contentType"
                            value="tv_series"
                            checked={preferences.contentType === 'tv_series'}
                            onChange={(e) => handlePreferenceChange('contentType', e.target.value)}
                        />
                        TV Series Only
                    </label>
                </div>
            </div>

            {/* Region Filter */}
            <div className="filter-section">
                <h3>Region</h3>
                <div className="radio-group">
                    <label>
                        <input
                            type="radio"
                            name="region"
                            value=""
                            checked={preferences.region === ''}
                            onChange={(e) => handlePreferenceChange('region', e.target.value)}
                        />
                        All Regions
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="region"
                            value="hollywood"
                            checked={preferences.region === 'hollywood'}
                            onChange={(e) => handlePreferenceChange('region', e.target.value)}
                        />
                        Hollywood
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="region"
                            value="bollywood"
                            checked={preferences.region === 'bollywood'}
                            onChange={(e) => handlePreferenceChange('region', e.target.value)}
                        />
                        Bollywood
                    </label>
                </div>
            </div>

            {/* Movie Input */}
            <div className="input-section">
                <input
                    type="text"
                    value={newMovie}
                    onChange={(e) => setNewMovie(e.target.value)}
                    placeholder="Enter a movie or TV series you like"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddMovie()}
                />
                <button onClick={handleAddMovie}>Add</button>
            </div>

            {/* Liked Movies List */}
            <div className="liked-movies">
                <h3>Movies & TV Series You Like</h3>
                <ul>
                    {likedMovies.map((movie, index) => (
                        <li key={index}>
                            {movie}
                            <button onClick={() => handleRemoveMovie(index)}>Remove</button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Get Recommendations Button */}
            <button 
                className="get-recommendations"
                onClick={handleGetRecommendations}
                disabled={loading}
            >
                {loading ? 'Getting Recommendations...' : 'Get Recommendations'}
            </button>

            {/* Error Message */}
            {error && <div className="error">{error}</div>}

            {/* Recommendations */}
            {recommendations.length > 0 && (
                <div className="recommendations">
                    <h3>Recommendations</h3>
                    <div className="recommendations-grid">
                        {recommendations.map((rec, index) => (
                            <div key={index} className="recommendation-card">
                                {rec.poster_url && (
                                    <img src={rec.poster_url} alt={rec.title} />
                                )}
                                <h4>{rec.title}</h4>
                                <p className="type">{rec.type}</p>
                                <p className="reasoning">{rec.reasoning}</p>
                                {rec.genres && (
                                    <div className="genres">
                                        {rec.genres.map((genre, i) => (
                                            <span key={i} className="genre-tag">{genre}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MovieRecommender; 