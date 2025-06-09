import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './MovieRecommender.css';

const MovieRecommender = () => {
    const [likedMovies, setLikedMovies] = useState([]);
    const [newMovie, setNewMovie] = useState('');
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState({
        recommendations: false,
        watchlist: false,
        watched: false
    });
    const [error, setError] = useState(null);
    const [watchlist, setWatchlist] = useState([]);
    const [watchedMovies, setWatchedMovies] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('recommendations'); // 'recommendations', 'watchlist', 'watched'
    const [preferences, setPreferences] = useState({
        genres: [],
        mood: '',
        contentType: '',
        region: '',
        sortBy: 'relevance' // 'relevance', 'rating', 'year'
    });

    // Load data from localStorage on component mount
    useEffect(() => {
        try {
            const savedWatchlist = localStorage.getItem('watchlist');
            const savedWatchedMovies = localStorage.getItem('watchedMovies');
            const savedLikedMovies = localStorage.getItem('likedMovies');
            const savedPreferences = localStorage.getItem('preferences');
            
            if (savedWatchlist) setWatchlist(JSON.parse(savedWatchlist));
            if (savedWatchedMovies) setWatchedMovies(JSON.parse(savedWatchedMovies));
            if (savedLikedMovies) setLikedMovies(JSON.parse(savedLikedMovies));
            if (savedPreferences) setPreferences(JSON.parse(savedPreferences));
        } catch (err) {
            console.error('Error loading saved data:', err);
            setError('Failed to load saved data');
        }
    }, []);

    // Save data to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
    }, [watchlist]);

    useEffect(() => {
        localStorage.setItem('watchedMovies', JSON.stringify(watchedMovies));
    }, [watchedMovies]);

    useEffect(() => {
        localStorage.setItem('likedMovies', JSON.stringify(likedMovies));
    }, [likedMovies]);

    useEffect(() => {
        localStorage.setItem('preferences', JSON.stringify(preferences));
    }, [preferences]);

    // Memoized filtered lists
    const filteredWatchlist = useMemo(() => {
        return watchlist.filter(movie => 
            movie.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [watchlist, searchQuery]);

    const filteredWatchedMovies = useMemo(() => {
        return watchedMovies.filter(movie => 
            movie.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [watchedMovies, searchQuery]);

    const filteredRecommendations = useMemo(() => {
        return recommendations.filter(movie => 
            movie.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [recommendations, searchQuery]);

    // Memoized handlers
    const handleAddMovie = useCallback(() => {
        if (newMovie.trim()) {
            setLikedMovies(prev => [...prev, newMovie.trim()]);
            setNewMovie('');
        }
    }, [newMovie]);

    const handleRemoveMovie = useCallback((index) => {
        setLikedMovies(prev => prev.filter((_, i) => i !== index));
    }, []);

    const handlePreferenceChange = useCallback((type, value) => {
        setPreferences(prev => ({
            ...prev,
            [type]: value
        }));
    }, []);

    const handleAddToWatchlist = useCallback((movie) => {
        if (!watchlist.some(m => m.title === movie.title)) {
            setWatchlist(prev => [...prev, movie]);
            setError(null);
        } else {
            setError('Movie is already in your watchlist');
        }
    }, [watchlist]);

    const handleRemoveFromWatchlist = useCallback((movieTitle) => {
        setWatchlist(prev => prev.filter(m => m.title !== movieTitle));
    }, []);

    const handleMarkAsWatched = useCallback((movie) => {
        if (!watchedMovies.some(m => m.title === movie.title)) {
            setWatchedMovies(prev => [...prev, movie]);
            handleRemoveFromWatchlist(movie.title);
            setError(null);
        } else {
            setError('Movie is already marked as watched');
        }
    }, [watchedMovies, handleRemoveFromWatchlist]);

    const handleRemoveFromWatched = useCallback((movieTitle) => {
        setWatchedMovies(prev => prev.filter(m => m.title !== movieTitle));
    }, []);

    const handleGetRecommendations = useCallback(async () => {
        if (likedMovies.length === 0) {
            setError('Please add at least one movie or TV series');
            return;
        }

        setLoading(prev => ({ ...prev, recommendations: true }));
        setError(null);

        try {
            const response = await fetch('YOUR_BACKEND_URL/api/recommend', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    likedMovies,
                    preferences,
                    excludeMovies: [...watchedMovies.map(m => m.title), ...watchlist.map(m => m.title)]
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get recommendations');
            }

            const data = await response.json();
            setRecommendations(data.recommendations);
            setActiveTab('recommendations');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(prev => ({ ...prev, recommendations: false }));
        }
    }, [likedMovies, preferences, watchedMovies, watchlist]);

    const handleSortChange = useCallback((sortBy) => {
        setPreferences(prev => ({ ...prev, sortBy }));
    }, []);

    const handleClearAll = useCallback(() => {
        if (window.confirm('Are you sure you want to clear all your data?')) {
            setLikedMovies([]);
            setWatchlist([]);
            setWatchedMovies([]);
            setRecommendations([]);
            setError(null);
            localStorage.clear();
        }
    }, []);

    return (
        <div className="movie-recommender">
            <h1>Movie & TV Series Recommender</h1>
            
            {/* Navigation Tabs */}
            <div className="nav-tabs">
                <button 
                    className={activeTab === 'recommendations' ? 'active' : ''}
                    onClick={() => setActiveTab('recommendations')}
                >
                    Recommendations
                </button>
                <button 
                    className={activeTab === 'watchlist' ? 'active' : ''}
                    onClick={() => setActiveTab('watchlist')}
                >
                    Watchlist ({watchlist.length})
                </button>
                <button 
                    className={activeTab === 'watched' ? 'active' : ''}
                    onClick={() => setActiveTab('watched')}
                >
                    Watched ({watchedMovies.length})
                </button>
            </div>

            {/* Search Bar */}
            <div className="search-section">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search in current view..."
                    className="search-input"
                />
            </div>

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

            {/* Sort Options */}
            <div className="filter-section">
                <h3>Sort By</h3>
                <div className="radio-group">
                    <label>
                        <input
                            type="radio"
                            name="sortBy"
                            value="relevance"
                            checked={preferences.sortBy === 'relevance'}
                            onChange={(e) => handleSortChange(e.target.value)}
                        />
                        Relevance
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="sortBy"
                            value="rating"
                            checked={preferences.sortBy === 'rating'}
                            onChange={(e) => handleSortChange(e.target.value)}
                        />
                        Rating
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="sortBy"
                            value="year"
                            checked={preferences.sortBy === 'year'}
                            onChange={(e) => handleSortChange(e.target.value)}
                        />
                        Year
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

            {/* Watchlist Section */}
            {activeTab === 'watchlist' && (
                <div className="watchlist-section">
                    <h3>My Watchlist</h3>
                    {loading.watchlist ? (
                        <div className="loading">Loading watchlist...</div>
                    ) : filteredWatchlist.length === 0 ? (
                        <div className="empty-state">Your watchlist is empty</div>
                    ) : (
                        <div className="watchlist-grid">
                            {filteredWatchlist.map((movie, index) => (
                                <div key={index} className="movie-card">
                                    {movie.poster_url && (
                                        <img src={movie.poster_url} alt={movie.title} />
                                    )}
                                    <h4>{movie.title}</h4>
                                    <div className="movie-actions">
                                        <button onClick={() => handleMarkAsWatched(movie)}>Mark as Watched</button>
                                        <button onClick={() => handleRemoveFromWatchlist(movie.title)}>Remove</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Watched Movies Section */}
            {activeTab === 'watched' && (
                <div className="watched-section">
                    <h3>Already Watched</h3>
                    {loading.watched ? (
                        <div className="loading">Loading watched movies...</div>
                    ) : filteredWatchedMovies.length === 0 ? (
                        <div className="empty-state">No watched movies yet</div>
                    ) : (
                        <div className="watched-grid">
                            {filteredWatchedMovies.map((movie, index) => (
                                <div key={index} className="movie-card">
                                    {movie.poster_url && (
                                        <img src={movie.poster_url} alt={movie.title} />
                                    )}
                                    <h4>{movie.title}</h4>
                                    <div className="movie-actions">
                                        <button onClick={() => handleRemoveFromWatched(movie.title)}>Remove</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Get Recommendations Button */}
            <button 
                className="get-recommendations"
                onClick={handleGetRecommendations}
                disabled={loading.recommendations}
            >
                {loading.recommendations ? 'Getting Recommendations...' : 'Get Recommendations'}
            </button>

            {/* Clear All Button */}
            <button 
                className="clear-all"
                onClick={handleClearAll}
            >
                Clear All Data
            </button>

            {/* Error Message */}
            {error && (
                <div className="error">
                    {error}
                    <button onClick={() => setError(null)}>Dismiss</button>
                </div>
            )}

            {/* Recommendations */}
            {activeTab === 'recommendations' && recommendations.length > 0 && (
                <div className="recommendations">
                    <h3>Recommendations</h3>
                    {loading.recommendations ? (
                        <div className="loading">Loading recommendations...</div>
                    ) : filteredRecommendations.length === 0 ? (
                        <div className="empty-state">No recommendations match your search</div>
                    ) : (
                        <div className="recommendations-grid">
                            {filteredRecommendations.map((rec, index) => (
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
                                    <div className="movie-actions">
                                        <button onClick={() => handleAddToWatchlist(rec)}>Add to Watchlist</button>
                                        <button onClick={() => handleMarkAsWatched(rec)}>Mark as Watched</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MovieRecommender; 