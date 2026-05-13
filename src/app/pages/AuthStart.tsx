import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuth } from "../api/AuthContext";

export function AuthStart() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      try {
        await login(email);
        navigate("/auth/verify", { state: { email } });
      } catch (err) {
        // Handle error if needed (T034)
      }
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-panel">
        <div className="auth-heading">
          <h1>Welcome to Tirak</h1>
          <p>Enter your email to sign in or create an account.</p>
        </div>

        <form onSubmit={handleContinue} className="auth-form">
          <Input
            id="email"
            type="email"
            label="Email address"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
          
          {error && (
            <p className="auth-error">
              {error.message || "Failed to send verification code."}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={!email || isLoading}
          >
            {isLoading ? "Sending code..." : "Continue with email"}
          </Button>
        </form>

        <p className="auth-terms">
          By continuing, you agree to our <Link to="/safety">Terms of Service</Link> and recognize our commitment to a <Link to="/safety">respectful community</Link>.
        </p>
      </div>
    </section>
  );
}
