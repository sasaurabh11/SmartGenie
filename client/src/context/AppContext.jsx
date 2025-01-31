import { createContext, useEffect, useState } from "react";
import { generateImageApi, loadCreditsData } from "../services/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext()

const AppContextProvider = (props) => {
    const [user, setUser] = useState(null)
    const [showLogin, setShowLogin] = useState(false)
    const [token, setToken] = useState(localStorage.getItem('token'))
    const [credit, setCredit] = useState(false)

    const navigate = useNavigate();

    const loadCreditsBalance = async () => {
        try {
            
            const data = await loadCreditsData(token)
            if(data.success) {
                setCredit(data.credits)
                setUser(data.user)
            }

        } catch (error) {
            console.error(error.message)
            toast.error(error.message)
        }
    }

    const generateImage = async (prompt) => {
        try {
            const response = await generateImageApi(prompt, token)

            console.log('response in context', response)
            
            if(response.success) {
                loadCreditsBalance()
                return response.resultImage
            } else {
                toast.error(response.message)
                loadCreditsBalance();

                if(response.creditBalance === 0) {
                    navigate('/buy-credit')
                }
            }
            
        } catch (error) {
            console.error(error.message)
            toast.error(error.message)
        }
    }

    const logout = () => {
        setToken('')
        setUser(null)
        localStorage.removeItem('token')
    }

    useEffect(() => {
        if(token) {
            loadCreditsBalance()
        }
    }, [token])
    
    const value = {
        user, setUser,
        showLogin, setShowLogin,
        token, setToken,
        credit, setCredit,
        loadCreditsBalance,
        logout,
        generateImage
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider