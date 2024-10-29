import React, { useState, useEffect } from 'react';
import AdminDashboard from './components/AdminDashboard';
import { auth } from './data/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Login from './components/Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    });
  }, []);

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <div className='flex items-center justify-center h-auto'>
      {isAuthenticated ? (
        <div className='w-full h-auto'>
          <div className='bg-[#fff] w-full p-[20px]'>
            <button onClick={handleLogout} className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'>Chiqish</button>
            <h1 className='mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl'>Boshqaruv <span className='text-blue-600 dark:text-blue-500'>paneli</span></h1>
          </div>
          <AdminDashboard />
        </div>
      ) : (
        <Login onLogin={() => setIsAuthenticated(true)} />
      )}
    </div>
  );
}

export default App;