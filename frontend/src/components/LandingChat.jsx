import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Shield,
  Clock,
  Users,
  CheckCircle,
  ArrowRight,
  Star,
  Scale,
  Gavel,
  MessageCircle,
  Zap,
  Headphones,
  BookOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { saveBookingPreferences } from "../utils/bookingPreferences";

export default function LandingChat({ onSearchComplete }) {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "👋 Hello! I'm your AI Legal Assistant. I'm here to help you find the perfect lawyer for your needs. Let's start with a simple question - would you prefer online or offline consultation?",
    },
  ]);
  const [input, setInput] = useState("");
  const [conversationState, setConversationState] = useState({
    consultationType: null,
    city: null,
    caseDescription: null,
    awaitingClarification: false,
  });
  const [showChat, setShowChat] = useState(false);
  const endRef = useRef();

  useEffect(
    () => endRef.current?.scrollIntoView({ behavior: "smooth" }),
    [messages]
  );

  const handleSend = () => {
    if (!input.trim()) return;
    const txt = input.trim().toLowerCase();
    setMessages((m) => [...m, { role: "user", text: input.trim() }]);
    setInput("");

    setTimeout(() => {
      processUserInput(txt, input.trim());
    }, 700);
  };

  const processUserInput = (lowerText, originalText) => {
    const state = conversationState;
    let response = "";
    let newState = { ...state };

    const onlineKw = ["online", "virtual", "remote", "video", "call"];
    const offlineKw = [
      "offline",
      "in-person",
      "person",
      "office",
      "physical",
      "face to face",
      "face-to-face",
      "ofline",
    ];
    const isOnline = onlineKw.some((k) => lowerText.includes(k));
    const isOffline = offlineKw.some((k) => lowerText.includes(k));

    const extractCity = (text, origText) => {
      if (state.consultationType && !state.city) {
        const cleanText = origText.replace(/[.,!?;:]/g, "").trim();
        if (
          cleanText.length > 2 &&
          !onlineKw.includes(cleanText.toLowerCase()) &&
          !offlineKw.includes(cleanText.toLowerCase())
        ) {
          return cleanText.charAt(0).toUpperCase() + cleanText.slice(1);
        }
      }
      return null;
    };

    if (!newState.consultationType) {
      if (isOnline || isOffline) {
        newState.consultationType = isOnline ? "online" : "offline";
        response = `Perfect! ${
          isOnline ? "Online" : "Offline"
        } consultation it is. Which city are you in?`;
      }
    } else if (!newState.city) {
      const potentialCity = originalText.replace(/[.,!?;:]/g, "").trim();
      if (potentialCity.length > 2) {
        newState.city =
          potentialCity.charAt(0).toUpperCase() + potentialCity.slice(1);
        response = `Great! ${newState.city} it is. Now, please briefly describe your legal issue (for example: divorce case, property dispute, criminal matter, etc.).`;
      } else {
        response = "Could you please provide the name of your city?";
      }
    } else if (!newState.caseDescription) {
      if (originalText.length >= 3) {
        newState.caseDescription = originalText;
        response =
          "Thank you for the details. I'm analyzing your case to find the best matching lawyers...";
        setTimeout(() => analyzeCase(newState), 1500);
      } else {
        response =
          "Could you provide a bit more detail about your legal issue? For example: 'divorce case', 'property dispute', 'criminal matter', etc.";
      }
    } else {
      const changeIndicators = [
        "change",
        "different",
        "wrong",
        "instead",
        "rather",
        "nono",
        "no no",
        "actually",
        "switch",
      ];
      if (changeIndicators.some((indicator) => lowerText.includes(indicator))) {
        response =
          "I understand you want to make a change. Let's start over. Would you prefer online or offline consultation?";
        newState = {
          consultationType: null,
          city: null,
          caseDescription: null,
          awaitingClarification: false,
        };
      } else {
        response =
          "I have all your information. If you need to start over, just say 'change'.";
      }
    }

    if (
      newState.consultationType &&
      !state.consultationType &&
      !newState.city
    ) {
      const cleanText = originalText.toLowerCase();
      let remaining = cleanText;
      [...onlineKw, ...offlineKw].forEach(
        (k) => (remaining = remaining.replace(k, ""))
      );
      remaining = remaining
        .replace("consultation", "")
        .replace(" in ", "")
        .trim();

      if (remaining.length > 3) {
        newState.city = remaining.charAt(0).toUpperCase() + remaining.slice(1);
        response = `Perfect! ${
          newState.consultationType === "online" ? "Online" : "Offline"
        } consultation in ${
          newState.city
        }. Now, please briefly describe your legal issue.`;
      }
    }

    setConversationState(newState);
    setMessages((m) => [...m, { role: "ai", text: response }]);
  };

  const getAIResponse = async (userMessage, currentState) => {
    try {
      const response = await fetch("/api/analyze-case", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseDescription: currentState.caseDescription || userMessage,
          city: currentState.city,
          context: `User is asking: "${userMessage}". Current state: consultationType=${currentState.consultationType}, city=${currentState.city}, caseDescription=${currentState.caseDescription}`,
          useGeminiForResponse: true,
        }),
      });
      const data = await response.json();
      return data.geminiResponse || data.analysis;
    } catch (error) {
      console.error("Gemini API Error:", error);
      return null;
    }
  };

  const analyzeCase = async (state) => {
    try {
      console.log("Analyzing case with state:", state);

      const response = await fetch("/api/analyze-case", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseDescription: state.caseDescription,
          city: state.city,
        }),
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      if (data.needsClarification) {
        setMessages((m) => [...m, { role: "ai", text: data.message }]);
        if (data.clarificationQuestion) {
          setTimeout(() => {
            setMessages((m) => [
              ...m,
              { role: "ai", text: data.clarificationQuestion },
            ]);
          }, 1000);
        }
        setConversationState((prev) => ({
          ...prev,
          awaitingClarification: "case",
          caseDescription: null,
        }));
        return;
      }

      const guidanceMessage = data.legalGuidance
        ? `📋 **Legal Analysis & Guidance**\n\n**Summary:** ${
            data.legalGuidance.summary
          }\n**Severity:** ${data.legalGuidance.severity}\n**Urgency:** ${
            data.legalGuidance.urgency
          }\n\n**Recommended Lawyer:** ${
            data.legalGuidance.recommendedLawyerType
          }\n\n**Immediate Steps:**\n${data.legalGuidance.immediateSteps
            .map((step, i) => `${i + 1}. ${step}`)
            .join(
              "\n"
            )}\n\n**Documents Needed:**\n${data.legalGuidance.documentsNeeded
            .map((doc, i) => `${i + 1}. ${doc}`)
            .join("\n")}\n\n**Legal Process:** ${
            data.legalGuidance.legalProcess
          }\n\n**Timeline:** ${
            data.legalGuidance.timeline
          }\n\n**Cost Estimate:** ${
            data.legalGuidance.costEstimate
          }\n\n**Success Probability:** ${
            data.legalGuidance.successProbability
          }\n\n**Risks:**\n${data.legalGuidance.risks
            .map((risk, i) => `${i + 1}. ${risk}`)
            .join("\n")}\n\n**Additional Advice:** ${
            data.legalGuidance.additionalAdvice
          }`
        : data.analysis.description ||
          data.analysis.caseType ||
          "I've analyzed your case and found matching lawyers.";

      setMessages((m) => [...m, { role: "ai", text: guidanceMessage }]);

      setTimeout(() => {
        const searchResults = {
          location: state.city,
          type:
            data.analysis.caseType || data.analysis.specialization || "General",
          lawyers: data.matchingLawyers || [],
          analysis: data.analysis,
          legalGuidance: data.legalGuidance,
          exactMatches: data.exactMatches,
          relatedMatches: data.relatedMatches,
          generalMatches: data.generalMatches,
          caseDescription: state.caseDescription,
        };
        
        // Save booking preferences for later use after login
        saveBookingPreferences({
          consultationType: state.consultationType,
          city: state.city,
          caseDescription: state.caseDescription,
          searchResults: searchResults
        });
        
        onSearchComplete(searchResults);
      }, 2000);
    } catch (error) {
      console.error("Error analyzing case:", error);
      setMessages((m) => [
        ...m,
        {
          role: "ai",
          text: "I'm sorry, I encountered an error while analyzing your case. Please try again.",
        },
      ]);
    }
  };

  if (!showChat) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <div className="flex justify-center mb-8">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-blue-600 rounded-2xl blur-xl opacity-20 animate-pulse"></div>
                  <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-2xl shadow-2xl">
                    <Gavel className="w-12 h-12 text-white" />
                  </div>
                </motion.div>
              </div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 mb-6 leading-tight"
              >
                Legal<span className="text-blue-600">Bell</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto mb-8 leading-relaxed"
              >
                Connect with expert lawyers instantly. AI-powered legal guidance
                and personalized lawyer matching at your fingertips.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="flex flex-col gap-6 justify-center items-center"
              >
                {/* Enhanced Chat Bot Button */}
                <motion.button
                  onClick={() => setShowChat(true)}
                  className="group relative px-10 py-5 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white font-bold rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 flex items-center gap-4 text-xl overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 flex items-center gap-4">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
                      className="p-2 bg-white/20 rounded-full backdrop-blur-sm"
                    >
                      <MessageCircle className="w-6 h-6" />
                    </motion.div>
                    <span>Chat with AI Legal Assistant</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                </motion.button>

                {/* Trust Indicators */}
                <div className="flex flex-col sm:flex-row gap-4 items-center text-slate-600">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium">100% Confidential</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm font-medium">Instant Response</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Headphones className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium">24/7 Available</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <MessageCircle className="w-6 h-6" />,
                title: "AI Legal Chat Assistant",
                description:
                  "Start a conversation with our intelligent legal assistant that understands your needs and guides you step-by-step.",
                color: "from-blue-500 via-purple-500 to-indigo-500",
                highlight: true,
              },
              {
                icon: <Bot className="w-6 h-6" />,
                title: "Smart Case Analysis",
                description:
                  "Advanced AI analyzes your legal situation and provides personalized recommendations for the best lawyers.",
                color: "from-emerald-500 to-teal-500",
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: "Verified Legal Experts",
                description:
                  "Connect with experienced lawyers who specialize in your specific legal requirements.",
                color: "from-orange-500 to-red-500",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.6 }}
                className={`group relative ${feature.highlight ? 'md:scale-105' : ''}`}
              >
                {feature.highlight && (
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl opacity-30 blur-lg animate-pulse"></div>
                )}
                <div className={`relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border ${feature.highlight ? 'border-purple-200' : 'border-slate-100'} ${feature.highlight ? 'ring-2 ring-purple-100' : ''}`}>
                  {feature.highlight && (
                    <div className="absolute -top-3 -right-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      MOST POPULAR
                    </div>
                  )}
                  <div
                    className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} text-white mb-6 ${feature.highlight ? 'animate-bounce' : ''}`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className={`text-xl font-bold mb-3 ${feature.highlight ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600' : 'text-slate-900'}`}>
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                  {feature.highlight && (
                    <div className="mt-4 flex items-center gap-2 text-purple-600 font-medium text-sm">
                      <Sparkles className="w-4 h-4" />
                      <span>Start chatting instantly</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 pb-20"
        >
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-3xl p-8 border border-slate-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { number: "10K+", label: "Happy Clients" },
                { number: "500+", label: "Expert Lawyers" },
                { number: "98%", label: "Success Rate" },
                { number: "24/7", label: "Support Available" },
              ].map((stat, index) => (
                <div key={index}>
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm text-slate-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20"
        >
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            What Our Clients Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Business Owner",
                content:
                  "LegalBell connected me with the perfect corporate lawyer. The AI analysis was incredibly accurate and saved me hours of research.",
                rating: 5,
              },
              {
                name: "Michael Chen",
                role: "Individual Client",
                content:
                  "Found an excellent family lawyer through LegalBell. The process was smooth and the consultation was scheduled within minutes.",
                rating: 5,
              },
              {
                name: "Emily Rodriguez",
                role: "Startup Founder",
                content:
                  "The AI guidance helped me understand my legal needs before even talking to a lawyer. Highly recommend this platform!",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 + index * 0.1, duration: 0.6 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-slate-600 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-slate-500">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20"
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="relative z-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="flex items-center justify-center mb-6"
              >
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
              </motion.div>
              <h2 className="text-4xl font-bold mb-4">
                Start Chatting with Our AI Legal Assistant
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Get instant legal guidance, personalized recommendations, and find the perfect lawyer - all through a simple conversation
              </p>
              <motion.button
                onClick={() => setShowChat(true)}
                className="px-8 py-4 bg-white text-blue-600 font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex items-center gap-3 mx-auto text-lg group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <MessageCircle className="w-5 h-5 group-hover:animate-pulse" />
                <span>Start Chat Now</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <div className="mt-6 flex items-center justify-center gap-6 text-white/80 text-sm">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span>Instant Response</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Completely Free</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>No Legal Knowledge Required</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] max-w-4xl mx-auto relative">
      {/* Chat Header */}
      <div className="px-6 py-4 flex items-center justify-between bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-t-2xl shadow-lg z-10 shrink-0">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
            className="p-2 bg-white/20 backdrop-blur-sm rounded-full"
          >
            <MessageCircle className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h2 className="text-lg font-bold text-white">
              AI Legal Assistant
            </h2>
            <p className="text-xs text-white/80 flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Online and ready to help
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowChat(false)}
          className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
        >
          <ArrowRight className="w-5 h-5 rotate-180" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 space-y-6 scroll-smooth bg-gradient-to-b from-blue-50/30 via-white to-purple-50/20">
        {messages.map((m, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            key={i}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            } items-start gap-4 group`}
          >
            {m.role === "ai" && (
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 3, repeatDelay: 2 }}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shrink-0 mt-1 text-white"
              >
                <Bot className="w-6 h-6" />
              </motion.div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[75%] text-[15px] leading-relaxed ${
                m.role === "user"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-3 rounded-[2rem] rounded-tr-none font-medium shadow-lg"
                  : "bg-white/80 backdrop-blur-sm px-5 py-3 rounded-[2rem] rounded-tl-none shadow-md border border-purple-100 text-slate-800 font-medium"
              }`}
            >
              {m.text}
            </div>
          </motion.div>
        ))}
        <div ref={endRef} className="h-24"></div>{" "}
        {/* Spacer for floating input */}
      </div>

      {/* Input Area - Floating Pill */}
      <div className="absolute bottom-6 left-4 right-4 flex justify-center">
        <div className="w-full max-w-3xl bg-white/90 backdrop-blur-md rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-purple-200/60 p-2 flex items-center gap-2 focus-within:shadow-[0_8px_30px_rgb(147,51,234,0.15)] focus-within:border-purple-300 transition-all duration-300">
          <div className="pl-4 text-purple-500">
            <MessageCircle className="w-5 h-5" />
          </div>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your legal question here..."
            className="flex-1 pr-4 py-3 bg-transparent border-none text-slate-800 placeholder:text-slate-400 focus:outline-none text-[15px]"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-3 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white rounded-full hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md active:scale-95 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
