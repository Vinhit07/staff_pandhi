import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../utils/constants';
import { Button, Input } from '../../components/ui';
import toast from 'react-hot-toast';

export const SignUp = () => {
    const navigate = useNavigate();
    const { signup, loading, error, clearError } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        outletCode: '',
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

        if (!formData.name.trim()) {
            errors.name = 'Name is required';
        }

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

        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        if (!formData.outletCode.trim()) {
            errors.outletCode = 'Outlet code is required';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const result = await signup(
            formData.name,
            formData.email,
            formData.password,
            formData.outletCode
        );

        if (result.success) {
            toast.success(result.message || 'Registration successful!');
            navigate(ROUTES.SIGNIN);
        } else {
            toast.error(result.error || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen bg-background flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-sidebar items-center justify-center p-12">
                <div className="max-w-md text-center">
                    <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl font-bold text-primary-foreground">H</span>
                    </div>
                    <h1 className="text-4xl font-bold text-foreground mb-4">Join Our Team</h1>
                    <p className="text-lg text-muted-foreground">
                        Create your staff account to access the HungerBox management portal.
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
                            <h2 className="text-2xl font-bold text-foreground">Create Account</h2>
                            <p className="text-muted-foreground mt-1">Fill in your details to get started</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                label="Full Name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="John Doe"
                                error={formErrors.name}
                            />

                            <Input
                                label="Email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="john@example.com"
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
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-8 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>

                            <Input
                                label="Confirm Password"
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                error={formErrors.confirmPassword}
                                autoComplete="new-password"
                            />

                            <Input
                                label="Outlet Code"
                                type="text"
                                name="outletCode"
                                value={formData.outletCode}
                                onChange={handleChange}
                                placeholder="OUTLET001"
                                error={formErrors.outletCode}
                            />

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
                                <UserPlus className="h-4 w-4" />
                                Create Account
                            </Button>
                        </form>

                        <div className="mt-4 p-3 bg-accent/50 rounded-lg">
                            <p className="text-xs text-muted-foreground">
                                Demo outlet code: <span className="font-mono font-medium">OUTLET001</span>
                            </p>
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-muted-foreground">
                                Already have an account?{' '}
                                <Link to={ROUTES.SIGNIN} className="text-primary font-medium hover:underline">
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
