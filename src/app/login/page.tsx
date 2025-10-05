// admin-app/app/login/page.tsx
"use client";

import { useState } from 'react';
import { adminAuthProviderClient } from '@/providers/auth-provider/auth-provider.client';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  Input, 
  Button, 
  Typography, 
  Space,
  Alert,
  theme 
} from 'antd';
import { 
  MailOutlined, 
  LockOutlined,
  TeamOutlined,
  CheckCircleOutlined 
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { useToken } = theme;

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { token } = useToken();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await adminAuthProviderClient.login({ email });

    if (result.success) {
      setSuccess(true);
      setError('');
    } else {
      setError(result.error?.message || 'Login failed');
    }
    
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ 
        backgroundColor: token.colorBgContainer 
      }}>
        <div className="max-w-md w-full">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img
              src="/aoswhite.png"
              alt="ArbitrageOS Logo"
              className="h-32"
              style={{ 
                width: 'auto',
                objectFit: 'contain'
              }}
            />
          </div>

          <Card className="w-full text-center shadow-lg border-0">
            <div className="space-y-6">
              {/* Success Icon */}
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center border border-green-200">
                  <CheckCircleOutlined className="text-green-600 text-2xl" />
                </div>
              </div>

              {/* Success Message */}
              <div className="space-y-3">
                <Title level={3} className="mb-0">
                  Check Your Email
                </Title>
                <Text type="secondary" className="text-base">
                  We sent a magic link to
                </Text>
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <Text strong className="text-gray-900 text-lg">
                    {email}
                  </Text>
                </div>
                <Text type="secondary" className="block text-sm">
                  Click the link in your email to access the admin dashboard.
                </Text>
              </div>

              {/* Back to Login */}
              <Button 
                type="link" 
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                }}
                className="text-[#5CC49D] hover:text-[#4aa882]"
              >
                ← Back to login
              </Button>
            </div>
          </Card>

          {/* Footer */}
          <div className="text-center mt-6">
            <Text type="secondary" className="text-xs">
              <span style={{ color: '#5CC49D' }}>arbitrage</span>OS Admin Panel • 
              {' '}<span style={{ color: '#5CC49D' }}>Secure Access</span>
            </Text>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ 
      backgroundColor: token.colorBgContainer 
    }}>
      <div className="max-w-md w-full px-4">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img
            src="/aoswhite.png"
            alt="ArbitrageOS Logo"
            className="h-32"
            style={{ 
              width: 'auto',
              objectFit: 'contain'
            }}
          />
        </div>

        <Card className="w-full shadow-lg border-0">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#5CC49D] rounded-lg flex items-center justify-center">
                <LockOutlined className="text-white text-lg" />
              </div>
            </div>
            <Title level={3} className="mb-2">
              Admin Login
            </Title>
            <Text type="secondary">
              Enter your email to receive a secure magic link
            </Text>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Text strong className="text-sm">
                Admin Email
              </Text>
              <Input
                size="large"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                prefix={<MailOutlined className="text-gray-400" />}
                required
                className="w-full"
              />
            </div>

            {/* Error Alert */}
            {error && (
              <Alert
                message="Login Failed"
                description={error}
                type="error"
                showIcon
                closable
                onClose={() => setError('')}
              />
            )}

            {/* Submit Button */}
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={!email}
              size="large"
              block
              style={{ 
                backgroundColor: '#5CC49D', 
                borderColor: '#5CC49D',
                height: '48px'
              }}
              className="font-semibold hover:opacity-90"
            >
              {loading ? 'Sending Magic Link...' : 'Send Magic Link'}
            </Button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4  rounded-lg border border-blue-200">
            <Space align="start">
              <TeamOutlined className="text-blue-600 mt-1" />
              <div>
                <Text strong className="text-blue-900 text-sm">
                  Restricted Access
                </Text>
                <Text className="text-blue-700 block text-xs mt-1">
                  Only authorized administrators can access this panel. 
                  All login attempts are monitored and logged.
                </Text>
              </div>
            </Space>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <Text type="secondary" className="text-xs">
            <span style={{ color: '#5CC49D' }}>arbitrage</span>OS Admin Panel • 
            {' '}<span style={{ color: '#5CC49D' }}>Secure Access Management</span>
            {' '}© 2025
          </Text>
        </div>
      </div>
    </div>
  );
}