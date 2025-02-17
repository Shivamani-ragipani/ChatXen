import React, { useState } from "react";
import "./Login.css";
import assets from "../../assets/assets.js";
import { login, signup, resetPass } from "../../config/firebase.js";
import { toast } from "react-toastify";

const Login = () => {
  const [currState, setCurrState] = useState("Sign Up");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      if (currState === "Sign Up") {
        await signup(userName, email, password);
        toast.success("Account created successfully! Please log in.");
        setCurrState("Login"); // Switch to login after signup
      } else {
        await login(email, password); // ✅ Fixed: Added `await`
        toast.success("Login successful!");
      }
    } catch (error) {
      console.error("Authentication Error:", error.message);
      toast.error("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="logo_chat">
        <img src={assets.logo_chat} alt="Image" />
        <h4>ChatXen</h4>
      </div>
      <form onSubmit={onSubmitHandler} className="login-form">
        <h2>{currState}</h2>
        {currState === "Sign Up" && (
          <input
            onChange={(e) => setUserName(e.target.value)}
            value={userName}
            type="text"
            placeholder="Username"
            className="form-input"
            required
          />
        )}
        <input
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          type="email"
          placeholder="Email Address"
          className="form-input"
          required
        />
        <input
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          type="password"
          placeholder="Password"
          className="form-input"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Please wait..." : currState === "Sign Up" ? "Create Account" : "Login"}
        </button>

        <div className="login-term">
          <input type="checkbox" required />
          <p>Agree to the terms of use & privacy policy.</p>
        </div>

        <div className="login-forgot">
          {currState === "Sign Up" ? (
            <p className="login-toggle">
              Already have an account?{" "}
              <span onClick={() => setCurrState("Login")}>Login Here!</span>
            </p>
          ) : (
            <p className="login-toggle">
              Create a new account?{" "}
              <span onClick={() => setCurrState("Sign Up")}>Click Here!</span>
            </p>
          )}
          {currState === "Login" && (
            <p className="login-toggle">
              Forgot Password?{" "}
              <span onClick={() => resetPass(email)}>Reset Here!</span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default Login;
