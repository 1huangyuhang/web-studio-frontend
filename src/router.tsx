import { lazy } from 'react';
import type { ReactNode } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/business/Layout';
import Home from './pages/Home';
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Applications = lazy(() => import('./pages/Applications'));
const Account = lazy(() => import('./pages/Account'));
const Shop = lazy(() => import('./pages/Shop'));
const Contact = lazy(() => import('./pages/Contact'));
const Activities = lazy(() => import('./pages/Activities'));
const Help = lazy(() => import('./pages/Help'));
const Courses = lazy(() => import('./pages/Courses'));
const Prices = lazy(() => import('./pages/Prices'));
const News = lazy(() => import('./pages/Company/News'));
const Case = lazy(() => import('./pages/Company/Case'));
const About = lazy(() => import('./pages/Company/About'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

const AnimatedImageDemo = lazy(() => import('./pages/AnimatedImageDemo'));

const layoutChildren: { path: string; element: ReactNode }[] = [
  {
    path: '',
    element: <Home />,
  },
  {
    path: 'dashboard',
    element: <Dashboard />,
  },
  {
    path: 'applications',
    element: <Applications />,
  },
  {
    path: 'account',
    element: <Account />,
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
];

if (import.meta.env.DEV) {
  layoutChildren.push({
    path: 'demo/animated-image',
    element: <AnimatedImageDemo />,
  });
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: layoutChildren,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
]);

export default router;
