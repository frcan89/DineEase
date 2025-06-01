import React from 'react'; // useState is removed as count state is part of Home now
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LoginPage from './components/LoginPage'; // Adjust path if necessary
import './App.css'; // Or your main app stylesheet

// Importing existing assets for the Home component
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';

// Placeholder for a Home component or other page content
// The original App content is moved into this Home component
const Home = () => {
  // const [count, setCount] = useState(0) // This line is commented out as per original instruction to remove count
  // If count state is needed, React and useState should be imported in this component scope or passed as props.
  // For simplicity, and following the removal of `useState` from App's imports, we'll remove the counter functionality.
  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        {/* <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button> */}
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR (This message might be less relevant now or moved)
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <nav>
        <Link to="/login">Go to Login</Link>
      </nav>
    </>
  );
};

function App() {
  return (
    <Router>
      <div className="App">
        {/* Optional: Add a navigation bar here that's visible on all pages */}
        {/* <nav> <Link to="/">Home</Link> | <Link to="/login">Login</Link> </nav> */}

        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
