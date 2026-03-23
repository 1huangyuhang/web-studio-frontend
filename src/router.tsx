import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/business/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Shop from './pages/Shop';
import Contact from './pages/Contact';
import Activities from './pages/Activities';
import Help from './pages/Help';
import Courses from './pages/Courses';
import Prices from './pages/Prices';
import News from './pages/Company/News';
import Case from './pages/Company/Case';
import About from './pages/Company/About';
import AnimatedImageDemo from './pages/AnimatedImageDemo';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '',
        element: <Home />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'shop',
        element: <Shop />,
      },
      {
        path: 'activities',
        element: <Activities />,
      },
      {
        path: 'contact',
        element: <Contact />,
      },
      {
        path: 'help',
        element: <Help />,
      },
      {
        path: 'courses',
        element: <Courses />,
      },
      {
        path: 'prices',
        element: <Prices />,
      },
      {
        path: 'company/news',
        element: <News />,
      },
      {
        path: 'company/case',
        element: <Case />,
      },
      {
        path: 'company/about',
        element: <About />,
      },
      {
        path: 'demo/animated-image',
        element: <AnimatedImageDemo />,
      },
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
]);

export default router;
