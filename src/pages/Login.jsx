import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Eye, Briefcase } from "lucide-react";
import { authService } from "../services";
import { RiseOutlined } from "@ant-design/icons";

/* ---------------- Floating Background Cards ---------------- */

const BackgroundCard = ({ index = 1 }) => {
  const isEven = index % 2 === 0;
  const price = 100000 + (index * 15398) % 400000;
  const orderId = 1000 + (index * 79) % 9000;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 0.6, y: 0 }}
      transition={{ delay: (index % 5) * 0.1, duration: 0.8 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-4"
    >
      <div className="flex justify-between">
        <div>
          <div className="font-semibold text-gray-700 text-sm">
           {isEven ? "Lead" : "Deal"}  #{orderId}
          </div>
          <div className="text-xs text-gray-400">Fixed Display</div>
        </div>
        <span className="text-xs font-bold text-gray-700">{isEven ? "Proposal" : "Quote"} ₹{price}</span>
      </div>

      <span
        className={`text-[10px] px-2 py-1 rounded-full font-medium ${
          isEven
            ?  "bg-amber-50 text-amber-600"
            : "bg-emerald-50 text-emerald-600"
        }`}
      >
        {isEven ? "In Progress" :  "Deal Won"}
      </span>
    </motion.div>
  );
};

const FloatingColumn = ({ speed = 20, children, className }) => (
  <motion.div
    animate={{ y: [0, "-50%"] }}
    transition={{ duration: speed, ease: "linear", repeat: Infinity }}
    className={className}
  >
    {children}
    {children}
  </motion.div>
);

/* ---------------- Login Component ---------------- */

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await authService.login(email, password);

      if (response.success) {
        navigate("/");
      } else {
        setError(response.message || "Invalid Email or Password");
      }
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };
  // const handleLogin = () => {
  //   setError("");
  //   setLoading(true);

  //   setTimeout(() => {
  //     if (email === "admin@gmail.com" && password === "12345678") {

  //       localStorage.setItem("auth", "true");

  //       navigate("/dashboard");

  //     } else {
  //       setError("Invalid Email or Password");
  //     }

  //     setLoading(false);
  //   }, 500);
  // };
  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center relative overflow-hidden p-4">

      {/* Floating Animated Background */}
      <div className="absolute inset-0 flex gap-6 justify-center opacity-30 pointer-events-none -skew-y-6 scale-110">

        <FloatingColumn speed={40} className="flex flex-col gap-6 w-64">
          {[1, 2, 3, 4, 5].map(i => <BackgroundCard key={i} index={i} />)}
        </FloatingColumn>

        <FloatingColumn speed={55} className="flex flex-col gap-6 w-64 pt-20">
          {[6, 7, 8, 9, 10].map(i => <BackgroundCard key={i} index={i} />)}
        </FloatingColumn>

        <FloatingColumn speed={45} className="flex flex-col gap-6 w-64 hidden md:flex">
          {[11, 12, 13, 14, 15].map(i => <BackgroundCard key={i} index={i} />)}
        </FloatingColumn>

        <FloatingColumn speed={45} className="flex flex-col gap-6 w-64 hidden md:flex">
          {[16, 17, 18, 19, 20].map(i => <BackgroundCard key={i} index={i} />)}
        </FloatingColumn>

      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-gray-50/80 to-transparent pointer-events-none" />

      {/* Login Card */}
      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/40 relative z-10">
        {/* Logo */}
        <div className="text-center mb-6">
                    <div
                    className="w-fit mx-auto p-4 mb-2 shadow-xl flex justify-center items-center rounded-lg"
                      style={{
                        background: "#1C2244",
                      }}
                    >
                      <RiseOutlined style={{ color: "#fff", fontSize: 24 }} />
                    </div>

          <h1 className="text-2xl font-bold text-gray-800">
            Welcome Back
          </h1>

          <p className="text-gray-500 text-sm">
            Sign in to your account
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">
            {error}
          </div>
        )}

        {/* Email */}
        <div className="mb-5">
          <label className="text-sm text-gray-600 mb-2 block">
            Email
          </label>

          <div className="relative">
            <input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-4 pr-12 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400" />

            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="text-sm text-gray-600 mb-2 block">
            Password
          </label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-4 pr-12 py-2.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
            />

            <Eye
              size={18}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            />
          </div>
        </div>

        {/* Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full cursor-pointer py-3 text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-300/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-400">
            Application Developed and maintained by
          </p>

          <p className="text-sm font-medium text-gray-600 mt-1">
            Atelier Technology Solutions
          </p>
        </div>

      </div>
    </div>
  );
}