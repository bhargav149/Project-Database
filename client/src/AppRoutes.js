import { BrowserRouter as Router, Route,Routes } from 'react-router-dom';

// Import your components (App and Home)
import App from './components/LandingPage';
import Home from './components/Home';
import MainPage from './MainPage';

// Your main component where you set up routing
const AppRoutes = () => {
  return (
<Router>
      <Routes>
        {/* change MainPage to App if you want to run locally */}
        <Route path="/" element={<MainPage />} />
        {/* <Route path="/" element={<App />} /> */}
        {/* <Route path="/login" element={<Home />} /> */}
      </Routes>
    </Router>
  );
};

export default AppRoutes;