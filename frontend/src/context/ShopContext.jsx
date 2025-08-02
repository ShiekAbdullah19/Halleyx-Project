import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { products as oldProducts } from "../assets/assets";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {

    const backend_url = 'http://localhost:4000';

    const currency = '$';
    const delivery_fee = 10;
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});

    // New auth state
    const [user, setUser] = useState(null);

    // Products state fetched from backend API and merged with old products
    const [products, setProducts] = useState([]);

    // Expose setUser to allow Navbar to update user state on token retrieval
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setUser({ token });
        }
    }, []);

    // Fetch products from backend API and merge with old products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${backend_url}/api/product/list`);
                const data = await response.json();
                if (data.success) {
                    // Merge backend products with old products, placing old products below new products
                    const mergedProducts = [...data.products, ...oldProducts];
                    setProducts(mergedProducts);
                } else {
                    toast.error('Failed to fetch products');
                    setProducts(oldProducts); // fallback to old products only
                }
            } catch (error) {
                toast.error('Error fetching products: ' + error.message);
                setProducts(oldProducts); // fallback to old products only
            }
        };
        fetchProducts();
    }, []);

    const addToCart = async (itemId, size) => {

        if (!size) {
            toast.error('Select product size');
            return;
        }

        let cartData = structuredClone(cartItems);

        if (cartData[itemId]) {
            if (cartData[itemId][size]) {
                cartData[itemId][size] += 1;
            }
            else {
                cartData[itemId][size] = 1;
            }
        }
        else {
            cartData[itemId] = {};
            cartData[itemId][size] = 1
        }
        setCartItems(cartData)

    }

    const updateQuantity = async (itemId, size, quantity) => {

        let cartData = structuredClone(cartItems);
        cartData[itemId][size] = quantity;
        setCartItems(cartData);

    }

    const getCartCount = () => {
        let totalCount = 0;
        for (const itemId in cartItems) {
            for (const size in cartItems[itemId]) {
                if (cartItems[itemId][size] > 0) {
                    totalCount += cartItems[itemId][size];
                }
            }
        }
        return totalCount;
    }

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const itemId in cartItems) {
            let itemInfo = products.find((product) => product._id === itemId);
            if (itemInfo) {
                for (const size in cartItems[itemId]) {
                    if (cartItems[itemId][size] > 0) {
                        totalAmount += itemInfo.price * cartItems[itemId][size];
                    }
                }
            }
        }
        return totalAmount;
    }

    // Login function
    const login = async (email, password) => {
        try {
            // Call backend API for login
            const response = await fetch(`${backend_url}/api/user/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            }
            const data = await response.json();
            // Store token in localStorage
            localStorage.setItem('token', data.token);
            setUser({ token: data.token });
            toast.success('Login successful');
            navigate('/');
            return true;
        } catch (error) {
            toast.error(error.message);
            return false;
        }
    };

    // Sign up function
    const signUp = async (name, email, password) => {
        try {
            const response = await fetch(`${backend_url}/api/user/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Sign up failed');
            }
            const data = await response.json();
            // Store token in localStorage
            localStorage.setItem('token', data.token);
            setUser({ token: data.token });
            toast.success('Sign up successful');
            return true;
        } catch (error) {
            toast.error(error.message);
            return false;
        }
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        toast.info('Logged out');
        navigate('/login');
    };

    const value = {
        currency, delivery_fee,
        products,
        navigate,
        search, setSearch,
        showSearch, setShowSearch,
        addToCart, updateQuantity,
        cartItems,
        getCartCount, getCartAmount,
        user,
        signUp,
        login,
        logout,
    }

    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )


}

export default ShopContextProvider;
