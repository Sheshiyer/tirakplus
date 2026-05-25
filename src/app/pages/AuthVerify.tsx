import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Icons } from "../components/navigation/Icons";
import { useAuth } from "../api/AuthContext";
import { AssetRegistry } from "../registry/assets";
import type { UserRole } from "../../shared/contracts";

export function AuthVerify() {
  const location = useLocation();
  const navigate = useNavigate();
  const { verify, isLoading, error } = useAuth();
  const email = location.state?.email || "your email";
  const role: Extract<UserRole, "traveller" | "companion"> =
    location.state?.role === "companion" ? "companion" : "traveller";
  const fromPath = typeof location.state?.from === "string" ? location.state.from : undefined;
  
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedCode = value.slice(0, 6).split("");
      const newCode = [...code];
      for (let i = 0; i < pastedCode.length; i++) {
        if (index + i < 6) {
          newCode[index + i] = pastedCode[i];
        }
      }
      setCode(newCode);
      
      const nextIndex = Math.min(index + pastedCode.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && code[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length === 6) {
      try {
        await verify(email, fullCode, role);
        navigate(fromPath || (role === "companion" ? "/companion" : "/traveller"));
      } catch (err) {
        // T034: Auth error state will be shown
        setCode(["", "", "", "", "", ""]);
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }
    }
  };

  const handleResend = () => {
    // Simulate resend
    setCode(["", "", "", "", "", ""]);
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  };

  return (
    <section className="auth-page">
      <Link 
        to="/auth/login" 
        className="auth-back-link"
      >
        <Icons.ChevronLeft />
        <span>Back to sign in</span>
      </Link>

      <div className="auth-panel">
        <div className="auth-muse-card" aria-label="Muse code check">
          <span className="auth-muse-orb" aria-hidden="true">
            <img src={AssetRegistry.muse.floating.privacyLockStart} alt="" />
          </span>
          <div>
            <p className="eyebrow">Private code</p>
            <p>Muse keeps this entry tied to your {role} path.</p>
          </div>
        </div>
        <div className="auth-heading auth-heading-left">
          <h1>Confirm the code</h1>
          <p>
            We sent a 6-digit code to <strong>{email}</strong>.
          </p>
        </div>

        <form onSubmit={handleVerify} className="auth-form auth-form-spacious">
          <div className="code-input-grid">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isLoading}
                className={`code-input${error ? " code-input-error" : ""}`}
                aria-label={`Digit ${index + 1}`}
              />
            ))}
          </div>
          
          {error && (
            <p className="auth-error auth-error-center">
              {error.message || "Invalid verification code."}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={code.join("").length !== 6 || isLoading}
          >
            {isLoading ? "Verifying..." : "Verify and sign in"}
          </Button>
        </form>

        <div className="auth-secondary-action">
          <p>Didn't receive the code?</p>
          <Button variant="secondary" onClick={handleResend} disabled={isLoading}>
            Resend code
          </Button>
        </div>
      </div>
    </section>
  );
}
