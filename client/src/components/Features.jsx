import React from "react";
import { motion } from "framer-motion";
import { FaImage, FaFileAlt, FaRobot, FaLightbulb, FaLock, FaRocket } from "react-icons/fa";

const Features = () => {
  const features = [
    {
      icon: <FaImage className="text-2xl text-purple-400" />,
      title: "AI Image Generation",
      description: "Create stunning visuals from text descriptions with our advanced AI model."
    },
    {
      icon: <FaFileAlt className="text-2xl text-pink-400" />,
      title: "Content Summarization",
      description: "Quickly extract key information from websites and lengthy documents."
    },
    {
      icon: <FaRobot className="text-2xl text-amber-400" />,
      title: "Smart Chatbot",
      description: "Engage with our intelligent assistant for answers and creative ideas."
    },
    {
      icon: <FaLightbulb className="text-2xl text-cyan-400" />,
      title: "Creative Inspiration",
      description: "Overcome creative blocks with our idea generation tools."
    },
    {
      icon: <FaLock className="text-2xl text-green-400" />,
      title: "Secure & Private",
      description: "Your data remains confidential with our encryption protocols."
    },
    {
      icon: <FaRocket className="text-2xl text-red-400" />,
      title: "Lightning Fast",
      description: "Get results in seconds with our optimized AI infrastructure."
    }
  ];

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-purple-900/10 to-purple-900/30">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Choose SmartGenie?</h2>
          <p className="text-purple-200 max-w-2xl mx-auto">Our platform offers everything you need to bring your ideas to life</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="p-6 rounded-2xl bg-purple-900/20 border border-purple-500/30 backdrop-blur-sm hover:bg-purple-900/30 transition-all duration-300"
            >
              <div className="mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-purple-200">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;