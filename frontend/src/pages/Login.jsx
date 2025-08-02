import React, { useState, useContext } from 'react'
import { ShopContext } from '../context/ShopContext'

const Login = () => {

    const { login, signUp } = useContext(ShopContext);

    const [currentState, setCurrentState] = useState('Login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        if (currentState === 'Login') {
            const success = await login(email, password);
            if (success) {
                // login success handled in context
            }
        } else {
            const success = await signUp(name, email, password);
            if (success) {
                // Show success popup, keep email and password to auto-fill login form, switch to login state
                alert('Successfully signed in');
                setCurrentState('Login');
            }
        }
    }

    return (
        <form onSubmit={onSubmitHandler} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
            <div className='inline-flex items-center gap-2 mb-2 mt-10'>
                <p className='prata-regular text-3xl'>{currentState}</p>
                <hr className=' border-none h-[1.5px] w-8 bg-gray-800' />
            </div>
            {currentState === 'Login' ? null : (
                <input
                    className='w-full px-3 py-2 border border-gray-800'
                    type="text"
                    placeholder='Name'
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            )}
            <input
                className='w-full px-3 py-2 border border-gray-800'
                type="email"
                placeholder='Email'
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                className='w-full px-3 py-2 border border-gray-800'
                type="password"
                placeholder='Password'
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <div className='w-full flex justify-between text-sm mt-[-8px]'>
                <p className='cursor-pointer'>Forgot your password?</p>
                {
                    currentState === 'Login'
                        ? <p onClick={() => setCurrentState('Sign Up')} className='cursor-pointer'>Create account</p>
                        : <p onClick={() => setCurrentState('Login')} className='cursor-pointer'>Login here</p>
                }
            </div>
            <button type='submit' className='bg-black text-white font-light px-8 py-2 mt-4'>{currentState === 'Login' ? 'Sign in' : 'Sign up'}</button>
        </form>
    )
}

export default Login
