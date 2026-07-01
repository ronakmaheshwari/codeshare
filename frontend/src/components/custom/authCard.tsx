import { useState, useCallback } from "react";
import { useAuth } from "@/provider/authContext";
import { useNavigate } from "react-router-dom";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Shapes, Eye, EyeOff, Loader2 } from "lucide-react";

interface AuthProps {
  type: "signup" | "signin";
}

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AuthCard = ({ type }: AuthProps) => {
  const isSignup = type === "signup";
  const navigate = useNavigate();
  const { setToken } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

    // Clear field-level error as the user edits
    setErrors((prev) => (prev[id as keyof FormErrors] ? { ...prev, [id]: undefined } : prev));
  };

  const validate = useCallback((): FormErrors => {
    const next: FormErrors = {};

    if (isSignup && !formData.name.trim()) {
      next.name = "Full name is required";
    }

    if (!formData.email.trim()) {
      next.email = "Email is required";
    } else if (!EMAIL_REGEX.test(formData.email)) {
      next.email = "Enter a valid email address";
    }

    if (!formData.password) {
      next.password = "Password is required";
    } else if (isSignup && formData.password.length < 8) {
      next.password = "Password must be at least 8 characters";
    }

    if (isSignup && formData.password !== formData.confirmPassword) {
      next.confirmPassword = "Passwords do not match";
    }

    return next;
  }, [formData, isSignup]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const endpoint = isSignup ? "/api/auth/signup" : "/api/auth/signin";
      const payload = isSignup
        ? {
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
          }
        : {
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
          };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Something went wrong. Please try again.");
      }

      if (!data?.token) {
        throw new Error("Unexpected response from server.");
      }

      setToken(data.token);
      navigate("/");
    } catch (err) {
      setErrors({
        form: err instanceof Error ? err.message : "Unable to authenticate. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden bg-slate-50">
      <div className="hidden lg:block w-[60%] p-5">
        <div className="w-full h-full rounded-4xl bg-indigo-900 flex flex-col justify-center items-center px-16 text-white">
            <h1 className="text-5xl font-bold mb-6 text-center">
            {isSignup ? "Welcome to Code Share" : "Welcome Back"}
            </h1>

            <p className="text-lg text-indigo-200 max-w-lg text-center leading-relaxed">
            {isSignup
                ? "Share your code, collaborate with developers, and build amazing projects together. Join CodeShare today."
                : "Welcome back! Your code, projects, and collaborations are waiting for you."}
            </p>
        </div>
        </div>

      <div className="w-full lg:w-[40%] flex items-center justify-center px-6 sm:px-10 py-10">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-4 mb-3">
            <Shapes className="w-9 h-8 bg-stone-200 rounded-md p-1 text-indigo-900" aria-hidden="true" />
            <h2 className="text-3xl font-bold">{isSignup ? "Sign Up" : "Sign In"}</h2>
          </div>

          <p className="text-gray-500 mb-8">
            {isSignup ? "Create a new account." : "Login to your existing account."}
          </p>

          {errors.form && (
            <div
              role="alert"
              className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <FieldGroup>
              {isSignup && (
                <Field data-invalid={!!errors.name}>
                  <FieldLabel htmlFor="name">Full Name</FieldLabel>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                    className="h-10 border border-stone-400"
                  />
                  {errors.name && <FieldError id="name-error">{errors.name}</FieldError>}
                </Field>
              )}

              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : "email-description"}
                  className="h-10 border border-stone-400"
                />
                {errors.email ? (
                  <FieldError id="email-error">{errors.email}</FieldError>
                ) : (
                  <FieldDescription id="email-description">
                    We'll never share your email.
                  </FieldDescription>
                )}
              </Field>

              <Field data-invalid={!!errors.password}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete={isSignup ? "new-password" : "current-password"}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
                    className="h-10 border border-stone-400 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <FieldError id="password-error">{errors.password}</FieldError>}
              </Field>

              {isSignup && (
                <Field data-invalid={!!errors.confirmPassword}>
                  <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      autoComplete="new-password"
                      aria-invalid={!!errors.confirmPassword}
                      aria-describedby={
                        errors.confirmPassword ? "confirmPassword-error" : undefined
                      }
                      className="h-10 border border-stone-400 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <FieldError id="confirmPassword-error">{errors.confirmPassword}</FieldError>
                  )}
                </Field>
              )}

              <Field orientation="horizontal">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-indigo-900 text-white disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {isSignup ? "Creating account..." : "Signing in..."}
                    </span>
                  ) : isSignup ? (
                    "Create Account"
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </Field>
            </FieldGroup>
          </form>

          <div className="mt-6 text-center text-sm">
            {isSignup ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/signin")}
                  className="font-semibold text-indigo-600 hover:underline"
                >
                  Sign In
                </button>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/signup")}
                  className="font-semibold text-indigo-600 hover:underline"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthCard;