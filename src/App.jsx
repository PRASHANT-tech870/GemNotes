import { useState, createContext, useContext, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate, Link } from 'react-router-dom';
import './App.css';
// Import Google identity library
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

// Set your Google Client ID
const GOOGLE_CLIENT_ID = '219445210127-m2l1od9935os0qkugrlo2afq9nf2ene2.apps.googleusercontent.com';

// Theme Context
const ThemeContext = createContext(null);

// Auth Context
const AuthContext = createContext(null);

// Helper function to format content with code blocks
const formatContent = (content) => {
  if (!content) return '';

  // Replace markdown-style bold text with HTML
  content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Format code blocks
  const codeBlockRegex = /```([\s\S]*?)```/g;
  content = content.replace(codeBlockRegex, (match, code) => {
    return `<pre><code>${code.trim()}</code></pre>`;
  });

  return content;
};

// Theme Toggle Component
const ThemeToggle = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  
  return (
    <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
      {theme === 'light' ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="5" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      )}
    </button>
  );
};

// Login Component
const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await fetch('https://gemnotes-fastapi-backend-production.up.railway.app/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        login(data.access_token);
        navigate('/');
      } else {
        setError(data.detail || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // Send the Google ID token to your backend for verification
      const response = await fetch('https://gemnotes-fastapi-backend-production.up.railway.app/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token: credentialResponse.credential 
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        login(data.access_token);
        navigate('/');
      } else {
        setError(data.detail || 'Google login failed');
      }
    } catch (err) {
      setError('An error occurred with Google login. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}
        
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError('Google Login Failed')}
          useOneTap
          theme="outline"
          size="large"
          text="signin_with"
          shape="rectangular"
          width="100%"
        />

        <div className="auth-separator">
          <span>or</span>
        </div>
        
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="auth-button">Login</button>
        <div className="auth-switch">
          Don't have an account? <a href="/signup">Sign up</a>
        </div>
      </form>
    </div>
  );
};

const Signup = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://gemnotes-fastapi-backend-production.up.railway.app/auth/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        navigate('/login');
      } else {
        const data = await response.json();
        setError(data.detail || 'Signup failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // Send the Google ID token to your backend for verification and signup
      const response = await fetch('https://gemnotes-fastapi-backend-production.up.railway.app/auth/google-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token: credentialResponse.credential 
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        navigate('/login');
      } else {
        setError(data.detail || 'Google signup failed');
      }
    } catch (err) {
      setError('An error occurred with Google signup. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Sign Up</h2>
        {error && <div className="error-message">{error}</div>}
        
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError('Google Signup Failed')}
          useOneTap
          theme="outline"
          size="large"
          text="signup_with"
          shape="rectangular"
          width="100%"
        />

        <div className="auth-separator">
          <span>or</span>
        </div>
        
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="auth-button">Sign Up</button>
        <div className="auth-switch">
          Already have an account? <a href="/login">Login</a>
        </div>
      </form>
    </div>
  );
};

// Dashboard/Welcome Component
const Dashboard = () => {
  const { logout, token } = useContext(AuthContext);
  const [notes, setNotes] = useState([]);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch notes on component mount
  useEffect(() => {
    fetchNotes();
  }, [token]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://gemnotes-fastapi-backend-production.up.railway.app/notes/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      } else {
        setError('Failed to fetch notes');
      }
    } catch (err) {
      setError('An error occurred while fetching notes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;

    try {
      const response = await fetch('https://gemnotes-fastapi-backend-production.up.railway.app/notes/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: newNoteTitle })
      });

      if (response.ok) {
        const newNote = await response.json();
        setNotes([...notes, newNote]);
        setNewNoteTitle('');
      } else {
        setError('Failed to create note');
      }
    } catch (err) {
      setError('An error occurred while creating note');
    }
  };

  const handleNoteClick = (noteId) => {
    navigate(`/notes/${noteId}`);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="welcome-container">
      <ThemeToggle />
      <div className="welcome-content">
        <h1 className="welcome-title">Welcome to <span className="gem-text">Gem</span><span>Notes!</span></h1>
        <p className="welcome-text">
          Create and organize your notes with bullet points. Click on a note to view or edit it.
        </p>
      </div>

      <div className="notes-container">
        <form className="create-note-form" onSubmit={handleCreateNote}>
          <input
            type="text"
            placeholder="Enter note title..."
            value={newNoteTitle}
            onChange={(e) => setNewNoteTitle(e.target.value)}
          />
          <button type="submit">Create Note</button>
        </form>

        {error && <div className="error-message">{error}</div>}
        
        {loading ? (
          <p>Loading notes...</p>
        ) : notes.length === 0 ? (
          <p>No notes yet. Create your first note!</p>
        ) : (
          <div className="notes-grid">
            {notes.map((note) => (
              <div 
                key={note.id} 
                className="note-card" 
                onClick={() => handleNoteClick(note.id)}
              >
                <div className="note-header">
                  <h3 className="note-title">{note.title}</h3>
                </div>
                <div className="note-date">
                  {formatDate(note.created_at)}
                </div>
                <div className="note-preview">
                  {note.bullet_points.length > 0 
                    ? note.bullet_points.slice(0, 3).map(bp => bp.content.split('\n')[0]).join(', ') 
                    : 'No bullet points yet'}
                </div>
              </div>
            ))}
          </div>
        )}
        
        <button onClick={logout} className="logout-button">
          Logout
        </button>
      </div>
    </div>
  );
};

// Note Detail Component
const NoteDetail = () => {
  const { token } = useContext(AuthContext);
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newBulletPoint, setNewBulletPoint] = useState('');
  const [useGemini, setUseGemini] = useState(false);
  const [enhancementType, setEnhancementType] = useState('explain');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editingBulletId, setEditingBulletId] = useState(null);
  const [editBulletContent, setEditBulletContent] = useState('');
  const navigate = useNavigate();
  const noteId = window.location.pathname.split('/').pop(); // Get note ID from URL

  // Fetch note details on component mount
  useEffect(() => {
    fetchNoteDetails();
  }, [noteId, token]);

  const fetchNoteDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://gemnotes-fastapi-backend-production.up.railway.app/notes/${noteId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNote(data);
        setEditTitle(data.title);
      } else {
        setError('Failed to fetch note details');
      }
    } catch (err) {
      setError('An error occurred while fetching note details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBulletPoint = async (e) => {
    e.preventDefault();
    if (!newBulletPoint.trim()) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`https://gemnotes-fastapi-backend-production.up.railway.app/notes/${noteId}/bullet-points`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          content: newBulletPoint,
          enhance: useGemini,
          enhancement_type: enhancementType
        })
      });

      if (response.ok) {
        const bulletPoint = await response.json();
        setNote({
          ...note,
          bullet_points: [...note.bullet_points, bulletPoint]
        });
        setNewBulletPoint('');
        setUseGemini(false);
      } else {
        setError('Failed to add bullet point');
      }
    } catch (err) {
      setError('An error occurred while adding bullet point');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleBulletPoint = async (bulletId, completed) => {
    try {
      const bulletPoint = note.bullet_points.find(bp => bp.id === bulletId);
      const response = await fetch(`https://gemnotes-fastapi-backend-production.up.railway.app/notes/${noteId}/bullet-points/${bulletId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          content: bulletPoint.content,
          completed: !completed 
        })
      });

      if (response.ok) {
        const updatedBulletPoint = await response.json();
        setNote({
          ...note,
          bullet_points: note.bullet_points.map(bp => 
            bp.id === bulletId ? updatedBulletPoint : bp
          )
        });
      } else {
        setError('Failed to update bullet point');
      }
    } catch (err) {
      setError('An error occurred while updating bullet point');
    }
  };

  const handleDeleteBulletPoint = async (bulletId) => {
    try {
      const response = await fetch(`https://gemnotes-fastapi-backend-production.up.railway.app/notes/${noteId}/bullet-points/${bulletId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setNote({
          ...note,
          bullet_points: note.bullet_points.filter(bp => bp.id !== bulletId)
        });
      } else {
        setError('Failed to delete bullet point');
      }
    } catch (err) {
      setError('An error occurred while deleting bullet point');
    }
  };

  const handleSaveNote = async () => {
    try {
      const response = await fetch(`https://gemnotes-fastapi-backend-production.up.railway.app/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          title: editTitle
        })
      });

      if (response.ok) {
        const updatedNote = await response.json();
        setNote({
          ...note,
          title: updatedNote.title
        });
        setIsEditing(false);
      } else {
        setError('Failed to update note');
      }
    } catch (err) {
      setError('An error occurred while updating note');
    }
  };

  const handleDeleteNote = async () => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    
    try {
      const response = await fetch(`https://gemnotes-fastapi-backend-production.up.railway.app/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        navigate('/');
      } else {
        setError('Failed to delete note');
      }
    } catch (err) {
      setError('An error occurred while deleting note');
    }
  };

  const handleEditBulletPoint = (bulletId) => {
    const bulletPoint = note.bullet_points.find(bp => bp.id === bulletId);
    setEditingBulletId(bulletId);
    setEditBulletContent(bulletPoint.content);
  };

  const handleSaveBulletPoint = async () => {
    if (!editBulletContent.trim()) return;

    try {
      const bulletPoint = note.bullet_points.find(bp => bp.id === editingBulletId);
      const response = await fetch(`https://gemnotes-fastapi-backend-production.up.railway.app/${noteId}/bullet-points/${editingBulletId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: editBulletContent,
          completed: bulletPoint.completed
        })
      });

      if (response.ok) {
        const updatedBulletPoint = await response.json();
        setNote({
          ...note,
          bullet_points: note.bullet_points.map(bp =>
            bp.id === editingBulletId ? updatedBulletPoint : bp
          )
        });
        setEditingBulletId(null);
        setEditBulletContent('');
      } else {
        setError('Failed to update bullet point');
      }
    } catch (err) {
      setError('An error occurred while updating bullet point');
    }
  };

  const handleCancelEdit = () => {
    setEditingBulletId(null);
    setEditBulletContent('');
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) return <div className="welcome-container"><ThemeToggle /><p>Loading note...</p></div>;
  if (error) return <div className="welcome-container"><ThemeToggle /><p>Error: {error}</p></div>;
  if (!note) return <div className="welcome-container"><ThemeToggle /><p>Note not found</p></div>;

  return (
    <div className="welcome-container">
      <ThemeToggle />
      <div className="notes-container">
        <div className="note-detail">
          <div className="note-detail-header">
            {isEditing ? (
              <div className="edit-note-title">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  autoFocus
                />
                <button className="edit-button" onClick={handleSaveNote}>Save</button>
                <button className="back-button" onClick={() => {
                  setIsEditing(false);
                  setEditTitle(note.title);
                }}>Cancel</button>
              </div>
            ) : (
              <h2 className="note-detail-title">{note.title}</h2>
            )}
            <div className="note-actions">
              {!isEditing && (
                <>
                  <button className="back-button" onClick={() => navigate('/')}>Back</button>
                  <button className="edit-button" onClick={() => setIsEditing(true)}>Edit</button>
                  <button className="delete-button" onClick={handleDeleteNote}>Delete</button>
                </>
              )}
            </div>
          </div>
          
          <div className="bullet-points-list">
            {note.bullet_points.length === 0 ? (
              <p>No bullet points yet. Add your first bullet point below!</p>
            ) : (
              note.bullet_points.map((bullet) => (
                <div key={bullet.id} className={`bullet-point ${bullet.completed ? 'completed' : ''}`}>
                  {editingBulletId === bullet.id ? (
                    <div className="edit-bullet-form">
                      <textarea
                        value={editBulletContent}
                        onChange={(e) => setEditBulletContent(e.target.value)}
                        className="edit-bullet-textarea"
                      />
                      <div className="edit-bullet-actions">
                        <button onClick={handleSaveBulletPoint} className="save-button">Save</button>
                        <button onClick={handleCancelEdit} className="cancel-button">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <input
                        type="checkbox"
                        checked={bullet.completed}
                        onChange={() => handleToggleBulletPoint(bullet.id, bullet.completed)}
                        className="bullet-point-checkbox"
                      />
                      <div 
                        className="bullet-point-content" 
                        dangerouslySetInnerHTML={{ __html: formatContent(bullet.content) }}
                      />
                      <div className="bullet-point-actions">
                        <button 
                          className="edit-bullet-button"
                          onClick={() => handleEditBulletPoint(bullet.id)}
                        >
                          Edit
                        </button>
                        <button 
                          className="delete-bullet-button"
                          onClick={() => handleDeleteBulletPoint(bullet.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
          
          <form className="add-bullet-form" onSubmit={handleAddBulletPoint}>
            <div className="add-bullet-input-row">
              <input
                type="text"
                placeholder="Add new bullet point..."
                value={newBulletPoint}
                onChange={(e) => setNewBulletPoint(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            
            <div className="enhancement-toggle">
              <input
                type="checkbox"
                id="gemini-toggle"
                checked={useGemini}
                onChange={() => setUseGemini(!useGemini)}
                disabled={isSubmitting}
              />
              <label htmlFor="gemini-toggle">
                Enhance with Gemini AI <span className="gemini-badge">AI</span>
              </label>
            </div>
            
            {useGemini && (
              <div className="enhancement-options">
                <div className="enhancement-option">
                  <input
                    type="radio"
                    id="explain"
                    name="enhancement"
                    value="explain"
                    checked={enhancementType === 'explain'}
                    onChange={() => setEnhancementType('explain')}
                    disabled={isSubmitting}
                  />
                  <label htmlFor="explain">Explain</label>
                </div>
                <div className="enhancement-option">
                  <input
                    type="radio"
                    id="example"
                    name="enhancement"
                    value="example"
                    checked={enhancementType === 'example'}
                    onChange={() => setEnhancementType('example')}
                    disabled={isSubmitting}
                  />
                  <label htmlFor="example">Provide Example</label>
                </div>
                <div className="enhancement-option">
                  <input
                    type="radio"
                    id="code"
                    name="enhancement"
                    value="code"
                    checked={enhancementType === 'code'}
                    onChange={() => setEnhancementType('code')}
                    disabled={isSubmitting}
                  />
                  <label htmlFor="code">Code Example</label>
                </div>
              </div>
            )}
            
            <div className="add-bullet-actions">
              <button type="submit" disabled={isSubmitting || !newBulletPoint.trim()}>
                {isSubmitting ? (
                  <>
                    <span className="loading-spinner"></span>
                    {useGemini ? 'Enhancing...' : 'Adding...'}
                  </>
                ) : (
                  useGemini ? 'Add with Gemini' : 'Add Bullet Point'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const PrivateRoute = ({ children }) => {
  const { token } = useContext(AuthContext);
  return token ? children : <Navigate to="/login" />;
};

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
    // Save theme preference
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AuthContext.Provider value={{ token, login, logout }}>
          <Router>
            <Routes>
              <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />
              <Route path="/signup" element={!token ? <Signup /> : <Navigate to="/" />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/notes/:noteId"
                element={
                  <PrivateRoute>
                    <NoteDetail />
                  </PrivateRoute>
                }
              />
            </Routes>
          </Router>
        </AuthContext.Provider>
      </GoogleOAuthProvider>
    </ThemeContext.Provider>
  );
}

export default App;
