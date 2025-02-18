import { createContext, useEffect, useState } from "react";
import { generateAssestsForVideo, generateImageApi, loadCreditsData, prepareVideo } from "../services/api";
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
            if(data && data.success) {
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
            
            if(response && response.success) {
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

    const generatecontentsForVideo = async (url) => {
        try {
            const response = await generateAssestsForVideo(url, token);
    
            if(response && response.success) {
                loadCreditsBalance();
                return response;
             }
             else {
                toast.error(response.message);
                loadCreditsBalance();

                if(response.creditBalance < 2) {
                    navigate('/buy-credit')
                }
             }
        } catch (error) {
            console.error(error.message)
            toast.error(error.message)            
        }
    }

    const prepareVideoFromAssets = async (path) => {
        try {
            
            const response = await prepareVideo(path, token)
            if(response && response.success) {
                loadCreditsBalance()
                return response.videoUrl
            } else {
                toast.error(response.message)
                loadCreditsBalance()

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
        generateImage,
        generatecontentsForVideo, prepareVideoFromAssets
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider