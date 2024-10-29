import React, { useState } from 'react';
import { auth } from '../data/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLogin();
    } catch (error) {
      setError('Noto\'g\'ri email yoki parol');
    }
  };

  return (
    <div className='flex flex-col gap-2 items-center'>
      <h2 className='text-4xl font-extrabold'>Kirish</h2>
      <form onSubmit={handleLogin} className='flex items-center flex-col gap-1 justify-center w-[220px]'>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
        />
        <div className='relative w-full'>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Parol"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className='absolute inset-y-0 right-0 flex items-center px-2 text-gray-600'
          >
            {showPassword ? <FaEye color='#fff' /> : <FaEyeSlash color='#fff' />}
          </button>
        </div>
        <button type="submit" className='py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700'>Kirish</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
}

export default Login;