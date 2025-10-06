// admin-app/app/login/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Input, Button, Typography, Alert, Space, theme } from 'antd';
import { MailOutlined, LockOutlined, TeamOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { useToken } = theme;

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { token } = useToken();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Login failed');
      }

      // Store in BOTH localStorage and cookie
      const sessionData = JSON.stringify(result.session);
      
      // localStorage for client-side auth checks
      localStorage.setItem('admin_session', sessionData);
      
      // Cookie for API route authentication
      const expires = new Date();
      expires.setDate(expires.getDate() + 7);
      document.cookie = `admin_session=${encodeURIComponent(sessionData)}; path=/; expires=${expires.toUTCString()}`;
      
      console.log('Session stored:', localStorage.getItem('admin_session'));
      
      window.location.href = '/';
      
    } catch (err: any) {
      setError(err.message || 'Invalid email or not an admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={{ 
        backgroundColor: 'black',
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(92, 196, 157, 0.05) 0%, transparent 50%)'
      }}
    >
      <div className="max-w-md w-full px-4">
        <div className="flex justify-center mb-8">
          <img
            src="/aoswhite.png"
            alt="ArbitrageOS Logo"
            className="h-32"
            style={{ 
              width: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 12px rgba(92, 196, 157, 0.2))'
            }}
          />
        </div>

        <Card 
          className="w-full shadow-lg border-0"
          style={{
            borderRadius: '16px',
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(92, 196, 157, 0.2)'
          }}
        >
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #5CC49D 0%, #4aa882 100%)',
                  boxShadow: '0 4px 12px rgba(92, 196, 157, 0.3)'
                }}
              >
                <LockOutlined className="text-white text-xl" />
              </div>
            </div>
            <Title level={3} className="mb-2" style={{ fontWeight: 600, color: 'white' }}>
              Admin Login
            </Title>
            <Text style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.7)' }}>
              Enter your admin email to continue
            </Text>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Text strong className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Admin Email
              </Text>
              <Input
                size="large"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                prefix={<MailOutlined style={{ color: 'rgba(255, 255, 255, 0.5)' }} />}
                required
                className="w-full"
                style={{
  borderRadius: '8px',
  height: '48px',
  fontSize: '15px',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderColor: 'rgba(255, 255, 255, 0.2)',
  color: 'white'
}}
              />
            </div>

            {error && (
              <Alert
                message="Login Failed"
                description={error}
                type="error"
                showIcon
                closable
                onClose={() => setError('')}
                style={{ borderRadius: '8px' }}
              />
            )}

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={!email}
              size="large"
              block
              style={{ 
                background: 'linear-gradient(135deg, #5CC49D 0%, #4aa882 100%)',
                borderColor: 'transparent',
                height: '48px',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(92, 196, 157, 0.3)',
                transition: 'all 0.3s ease'
              }}
              className="hover:opacity-90"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div 
            className="mt-6 p-4 rounded-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%)',
              border: '1px solid rgba(33, 150, 243, 0.3)'
            }}
          >
            <Space align="start">
              <TeamOutlined style={{ color: '#2196F3', marginTop: '2px' }} />
              <div>
                <Text strong style={{ color: '#4FC3F7', fontSize: '13px' }}>
                  Restricted Access
                </Text>
                <Text 
                  style={{ 
                    color: 'rgba(255, 255, 255, 0.7)', 
                    fontSize: '12px',
                    display: 'block',
                    marginTop: '4px',
                    lineHeight: '1.5'
                  }}
                >
                  Only authorized administrators can access this panel.
                  All login attempts are monitored.
                </Text>
              </div>
            </Space>
          </div>
        </Card>

        <div className="text-center mt-6">
          <Text style={{ fontSize: '12px', color: 'white' }}>
            <span style={{ color: '#5CC49D', fontWeight: 600 }}>arbitrage</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>OS Admin Panel © 2025</span>
          </Text>
        </div>
      </div>
    </div>
  );
}