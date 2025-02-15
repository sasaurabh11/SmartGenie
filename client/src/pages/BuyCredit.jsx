import React, { useContext } from "react";
import { plans } from "../content/data";
import logoIcon from "../assets/ginie-image.jpg";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { loadCreditsData, paymentGateway, verifyRazor } from "../services/api";

const BuyCredit = () => {
  const { user, loadCreditsBalance, token, setShowLogin } = useContext(AppContext);

  const navigate = useNavigate();

  const initPay = async (order) => {
    try {
      console.log("Razorpay Key:", import.meta.env.VITE_RAZORPAY_KEY_ID);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Credits Payment',
        description: 'Credits Payment',
        order_id: order.id,
        receipt: order.receipt,
        handler : async (response) => {
          const data = await verifyRazor(response, token);

          if(data.success) {
            loadCreditsBalance();
            navigate('/')
            toast.success("Credit Added")
          }
        }
      }
  
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("error in payment intialization", error.message);
      toast.error(error.message)
    }
  } 
  
  const paymentHandler = async (planId) => {
    try {
      
      if(!user) {
        setShowLogin(true)
      }

      const response = await paymentGateway(planId, token);

      if(response.success) {
        initPay(response.order);
      }

    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <div className="min-h-[80vh] text-center pt-14 mb-10">
      <button className="border border-amber-300 font-bold px-10 py-2 rounded-full mb-6">
        Our Plans
      </button>
      <h1 className="text-center text-3xl font-medium mb-6 sm:mb-10 text-amber-300">
        Choose The Plan
      </h1>

      <div className="flex flex-wrap justify-center gap-6 text-left">
        {plans.map((item, index) => (
          <div
            key={index}
            className="bg-cyan-300 drop-shadow-sm border rounded-lg py-12 px-8 text-gray-600 hover:scale-105 transition-all duration-500"
          >
            <img width={40} className="rounded-full" src={logoIcon} alt="" />
            <p className="mt-3 mb-1 font-semibold">{item.id}</p>
            <p className="text-sm">{item.desc}</p>
            <p className="mt-6">
              <span className="text-3xl font-medium">₹{item.price} </span> /{" "}
              {item.credits} credits
            </p>
            <button onClick={() => paymentHandler(item.id)} className="w-full bg-yellow-100 text-black mt-8 text-sm rounded-md py-2.5 min-w-52 cursor-pointer">
              {user ? "Purchase" : "Get Started"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuyCredit;
