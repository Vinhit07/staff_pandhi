import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../utils/constants';
import { Button, Input } from '../../components/ui';
import toast from 'react-hot-toast';

export const SignIn = () => {
    const navigate = useNavigate();
    const { signIn, loading, error, clearError } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setFormErrors(prev => ({ ...prev, [name]: '' }));
        if (error) clearError();
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.email) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Please enter a valid email';
        }

        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            await signIn(formData);
            toast.success('Welcome back!');
            navigate(ROUTES.DASHBOARD);
        } catch (err) {
            toast.error(err.message || 'Login failed');
        }
    };

    const fillDemoCredentials = () => {
        setFormData({
            email: 'vinith11107@gmail.com',
            password: 'Vinhit07&',
        });
        setFormErrors({});
    };

    return (
        <div className="min-h-screen bg-background flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-sidebar items-center justify-center p-12">
                <div className="max-w-md text-center">
                    <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl font-bold text-primary-foreground">H</span>
                    </div>
                    <h1 className="text-4xl font-bold text-foreground mb-4">HungerBox Staff</h1>
                    <p className="text-lg text-muted-foreground">
                        Manage orders, inventory, and customer service efficiently with our staff portal.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl font-bold text-primary-foreground">H</span>
                        </div>
                        <h1 className="text-2xl font-bold text-foreground">HungerBox Staff</h1>
                    </div>

                    <div className="bg-card rounded-xl border-2 border-border p-8 shadow-lg">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-foreground">Welcome Back</h2>
                            <p className="text-muted-foreground mt-1">Sign in to your account</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                label="Email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="staff@hungerbox.com"
                                error={formErrors.email}
                                autoComplete="email"
                            />

                            <div className="relative">
                                <Input
                                    label="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    error={formErrors.password}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-8 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>

                            {error && (
                                <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-3">
                                    <p className="text-sm text-destructive">{error}</p>
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full"
                                loading={loading}
                            >
                                <LogIn className="h-4 w-4" />
                                Sign In
                            </Button>
                        </form>

                        {/* Demo Credentials */}
                        <div className="mt-6 p-4 bg-accent/50 rounded-lg">
                            <p className="text-xs font-medium text-accent-foreground mb-2">Demo Credentials:</p>
                            <p className="text-xs text-muted-foreground">Email: staff@hungerbox.com</p>
                            <p className="text-xs text-muted-foreground">Password: password</p>
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={fillDemoCredentials}
                                className="mt-2 w-full"
                            >
                                Use Demo Credentials
                            </Button>
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-muted-foreground">
                                Don't have an account?{' '}
                                <Link to={ROUTES.SIGNUP} className="text-primary font-medium hover:underline">
                                    Sign Up
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignIn;
