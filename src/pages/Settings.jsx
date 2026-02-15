import { useState, useRef } from 'react';
import { Camera, Trash2, Edit2, Save, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Badge } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export const Settings = () => {
    const { user, outlet, updateProfile } = useAuth();
    const fileInputRef = useRef(null);

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        designation: user?.designation || '',
        phone: user?.phone || '',
    });
    const [originalData, setOriginalData] = useState({ ...formData });
    const [profileImage, setProfileImage] = useState(user?.imageUrl || null);
    const [saving, setSaving] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEdit = () => {
        setOriginalData({ ...formData });
        setIsEditing(true);
    };

    const handleCancel = () => {
        setFormData({ ...originalData });
        setIsEditing(false);
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast.error('Name is required');
            return;
        }

        setSaving(true);
        const result = await updateProfile({
            name: formData.name,
            designation: formData.designation,
            phone: formData.phone,
        });

        if (result.success) {
            toast.success('Profile updated successfully');
            setIsEditing(false);
        } else {
            toast.error(result.error || 'Failed to update profile');
        }
        setSaving(false);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB');
            return;
        }

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            setProfileImage(e.target?.result);
            toast.success('Profile picture updated');
        };
        reader.readAsDataURL(file);
    };

    const handleImageDelete = () => {
        setProfileImage(null);
        toast.success('Profile picture removed');
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground">Manage your profile and preferences</p>
            </div>

            {/* Profile Picture Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Profile Picture</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center overflow-hidden">
                                {profileImage ? (
                                    <img
                                        src={profileImage}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-3xl font-bold text-primary-foreground">
                                        {getInitials(formData.name)}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                            <Button
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Camera className="h-4 w-4" />
                                Upload Photo
                            </Button>
                            {profileImage && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleImageDelete}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Remove Photo
                                </Button>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                                Max file size: 5MB
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Profile Information */}
            <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0">
                    <CardTitle>Profile Information</CardTitle>
                    {!isEditing && (
                        <Button variant="outline" size="sm" onClick={handleEdit}>
                            <Edit2 className="h-4 w-4" />
                            Edit Profile
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            disabled={!isEditing}
                        />

                        <Input
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            disabled
                        />

                        <Input
                            label="Designation"
                            name="designation"
                            value={formData.designation}
                            onChange={handleChange}
                            disabled={!isEditing}
                            placeholder="e.g., Staff Member"
                        />

                        <Input
                            label="Phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            disabled={!isEditing}
                            placeholder="+91 9876543210"
                        />

                        <Input
                            label="Outlet Name"
                            value={outlet?.name || 'Not Assigned'}
                            disabled
                        />

                        <Input
                            label="Outlet Address"
                            value={outlet?.address || 'N/A'}
                            disabled
                        />
                    </div>

                    {isEditing && (
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                            <Button variant="ghost" onClick={handleCancel}>
                                <X className="h-4 w-4" />
                                Cancel
                            </Button>
                            <Button onClick={handleSave} loading={saving}>
                                <Save className="h-4 w-4" />
                                Save Changes
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Account Security */}
            <Card>
                <CardHeader>
                    <CardTitle>Account Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div>
                            <p className="font-medium text-foreground">Password</p>
                            <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
                        </div>
                        <Button variant="outline" size="sm">
                            Change Password
                        </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div>
                            <p className="font-medium text-foreground">Two-Factor Authentication</p>
                            <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                        </div>
                        <Button variant="outline" size="sm">
                            Enable
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Permissions */}
            <Card>
                <CardHeader>
                    <CardTitle>Your Permissions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {user?.staffDetails?.permissions?.map((perm, index) => (
                            <div
                                key={index}
                                className={`p-4 rounded-lg border-2 ${perm.isGranted
                                    ? 'bg-green-50 border-green-200'
                                    : 'bg-muted/50 border-border'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${perm.isGranted ? 'bg-green-500' : 'bg-muted-foreground'
                                        }`} />
                                    <span className="font-medium text-foreground">{perm.type}</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {perm.isGranted ? 'Access granted' : 'Access denied'}
                                </p>
                            </div>
                        )) || (
                                <p className="text-muted-foreground col-span-3">No permissions assigned</p>
                            )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Settings;
