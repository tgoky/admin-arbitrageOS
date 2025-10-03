// admin-app/src/components/AdminDashboard.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../../providers/ThemeProvider';
import { adminInviteService, type UserWithStats } from '@/services/admin-invite.service';
import { 
  Button, 
  Card, 
  Input, 
  Modal, 
  Typography, 
  Progress, 
  Space, 
  Avatar, 
  Badge,
  Row,
  Col,
  Table,
  Statistic,
  Tag,
  message
} from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  TeamOutlined,
  BarChartOutlined,
  SendOutlined,
  EyeOutlined,
  FilterOutlined,
  ExportOutlined,
  SearchOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Search } = Input;
const { Column } = Table;

// Interfaces matching service
interface User extends UserWithStats {
  status: 'invited' | 'active' | 'suspended' | null;
}

interface Invite {
  id: string;
  email: string;
  status: 'sent' | 'accepted' | 'expired';
  sent_at: Date;
  accepted_at: Date | null;
  invited_by: string;
}

interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  pendingInvites: number;
  totalWorkspaces: number;
  totalToolsUsed: number;
}

const AdminDashboard = () => {
  const router = useRouter();
  const { theme } = useTheme();
  
  // State variables
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalUsers: 0,
    activeUsers: 0,
    pendingInvites: 0,
    totalWorkspaces: 0,
    totalToolsUsed: 0,
  });

  // Load data
const loadData = async () => {
  try {
    const [usersRes, invitesRes, statsRes] = await Promise.all([
      fetch('/api/admin/users'),
      fetch('/api/admin/invites'),
      fetch('/api/admin/statistics'),
    ]);

    if (!usersRes.ok || !invitesRes.ok || !statsRes.ok) {
      message.error('Failed to load data. Please try again.');
      return;
    }

    const [usersResult, invitesResult, statsResult] = await Promise.all([
      usersRes.json(),
      invitesRes.json(),
      statsRes.json(),
    ]);

    if (usersResult.success) {
      setUsers(usersResult.data as User[]);
    }

    if (invitesResult.success) {
      setInvites(invitesResult.data as Invite[]);
    }

    if (statsResult.success && statsResult.data) {
      setMetrics(statsResult.data);
    }
  } catch (error) {
    console.error('Load data error:', error);
    message.error('Failed to load data');
  }
};



  // Filter users based on search
  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Status helpers
  const getStatusTag = (status: User['status']) => {
    const statusConfig = {
      invited: { color: 'orange', text: 'Invited' },
      active: { color: 'green', text: 'Active' },
      suspended: { color: 'red', text: 'Suspended' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'default', text: 'Unknown' };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getInviteStatusTag = (status: Invite['status']) => {
    const statusConfig = {
      sent: { color: 'blue', text: 'Sent', icon: <ClockCircleOutlined /> },
      accepted: { color: 'green', text: 'Accepted', icon: <CheckCircleOutlined /> },
      expired: { color: 'red', text: 'Expired', icon: <CloseCircleOutlined /> }
    };
    const config = statusConfig[status];
    return <Tag color={config.color} icon={config.icon}>{config.text}</Tag>;
  };

  // Event handlers
const handleSendInvite = async () => {
  if (!inviteEmail.trim()) {
    message.error('Please enter a valid email address');
    return;
  }

  setSendingInvite(true);
  
  try {
    const response = await fetch('/api/admin/invites/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail }),
    });

    const result = await response.json();

    if (result.success) {
      message.success(`Invite sent to ${inviteEmail}`);
      setShowInviteModal(false);
      setInviteEmail("");
      await loadData();
    } else {
      message.error(result.error || 'Failed to send invite');
    }
  } catch (error) {
    message.error('Failed to send invite');
  } finally {
    setSendingInvite(false);
  }
};


const handleUserAction = async (user: User, action: 'view' | 'suspend' | 'resend') => {
  switch (action) {
    case 'view':
      message.info(`Viewing details for ${user.name || user.email}`);
      break;
      
    case 'suspend':
      try {
        const actionType = user.status === 'suspended' ? 'activate' : 'suspend';
        const response = await fetch(`/api/admin/users/${user.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: actionType }),
        });

        const result = await response.json();
        
        if (result.success) {
          message.success(`User ${user.status === 'suspended' ? 'activated' : 'suspended'}`);
          await loadData();
        } else {
          message.error(result.error || 'Action failed');
        }
      } catch (error) {
        message.error('Failed to update user status');
      }
      break;
      
    case 'resend':
      try {
        const invite = invites.find(i => i.email === user.email);
        if (!invite) {
          message.error('Invite not found');
          return;
        }

        const response = await fetch(`/api/admin/invites/${invite.id}/resend`, {
          method: 'POST',
        });

        const result = await response.json();
        
        if (result.success) {
          message.success(`Invite resent to ${user.email}`);
          await loadData();
        } else {
          message.error(result.error || 'Failed to resend invite');
        }
      } catch (error) {
        message.error('Failed to resend invite');
      }
      break;
  }
};

  // Effects
  useEffect(() => {
    const runBootSequence = async () => {
      const interval = setInterval(() => {
        setProgress(prev => {
          const increment = Math.random() > 0.85 ? 0 : (Math.random() > 0.7 ? 2 : 1);
          return Math.min(prev + increment, 100);
        });
      }, 200);

      await new Promise(resolve => setTimeout(resolve, 2000));
      clearInterval(interval);
      setProgress(100);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Load real data
      await loadData();
      setIsLoading(false);
    };

    runBootSequence();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center pt-20" style={{ 
        backgroundColor: theme === 'dark' ? '#000000' : '#f9fafb' 
      }}>
        <div className="flex flex-col items-center">
          <div className="mb-4">
            <img
              src={theme === 'dark' ? "/aoswhite.png" : "/aosblack.png"}
              alt="ArbitrageOS Logo"
              className="h-64"
              style={{ 
                width: 'auto',
                objectFit: 'contain'
              }}
            />
          </div>
          
          <Card 
            className="w-80 text-center shadow-lg -mt-2"
            bodyStyle={{ padding: '32px' }}
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <TeamOutlined className="text-[#5CC49D] text-xl" />
              <Text strong>Loading Admin Panel</Text>
            </div>
            
            <div className="space-y-4">
              <div>
                <Text className="text-sm font-medium">Initializing Admin System</Text>
                <div className="flex justify-between items-center mt-2">
                  <Progress 
                    percent={progress} 
                    strokeColor="#5CC49D"
                    trailColor={theme === 'dark' ? '#374151' : '#e5e7eb'}
                    size="small"
                    showInfo={false}
                    className="flex-1 mr-3"
                  />
                  <Text className="text-xs font-mono font-medium" style={{ color: '#5CC49D' }}>
                    {progress}%
                  </Text>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full" style={{ 
      backgroundColor: theme === 'dark' ? '#000000' : '#f9fafb' 
    }}>
      {/* Header */}
      <header className={`${theme === 'dark' ? 'bg-[#181919] border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-2`}>
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              src={theme === 'dark' ? "/aoswhite.png" : "/aosblack.png"}
              alt="ArbitrageOS Logo"
              style={{ 
                height: '140px',
                width: 'auto',
                objectFit: 'contain',
                marginRight: '16px'
              }}
            />
            <div className="flex items-center gap-2">
              <TeamOutlined className="text-[#5CC49D]" />
              <Text strong className={theme === 'dark' ? 'text-white' : 'text-black'}>
                Admin Panel
              </Text>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            <Search
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
              prefix={<SearchOutlined />}
            />
          </div>

          {/* Admin Menu */}
          <Space>
            <Button 
              icon={<ExportOutlined />}
              onClick={() => message.info('Export feature coming soon')}
            >
              Export
            </Button>
            <Button 
              type="primary" 
              icon={<SendOutlined />}
              onClick={() => setShowInviteModal(true)}
              style={{ backgroundColor: '#5CC49D', borderColor: '#5CC49D' }}
            >
              Invite User
            </Button>
          </Space>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-6 py-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <Title level={3} className="mb-1" style={{ color: theme === 'dark' ? '#fff' : '#000' }}>
            User Management Dashboard
          </Title>
          <Text type="secondary" className="text-sm">
            Monitor and manage platform access and user activity
          </Text>
        </div>

        {/* Stats Cards */}
        <Row gutter={[12, 12]} className="mb-6">
          <Col xs={24} sm={8} md={6}>
            <Card size="small" className="text-center h-full">
              <Statistic
                title="Total Users"
                value={metrics.totalUsers}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#5CC49D' }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={8} md={6}>
            <Card size="small" className="text-center h-full">
              <Statistic
                title="Active Users"
                value={metrics.activeUsers}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={8} md={6}>
            <Card size="small" className="text-center h-full">
              <Statistic
                title="Pending Invites"
                value={metrics.pendingInvites}
                prefix={<MailOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={8} md={6}>
            <Card size="small" className="text-center h-full">
              <Statistic
                title="Generations"
                value={metrics.totalToolsUsed}
                prefix={<BarChartOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Users Table */}
        <Card 
          title={
            <div className="flex items-center gap-2">
              <TeamOutlined />
              <span>Platform Users</span>
              <Badge count={filteredUsers.length} showZero />
            </div>
          }
          extra={
            <Space>
              <Button icon={<FilterOutlined />}>Filter</Button>
              <Button icon={<ExportOutlined />}>Export</Button>
            </Space>
          }
          className="mb-6"
        >
          <Table 
            dataSource={filteredUsers}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 800 }}
            rowKey="id"
               className="no-vertical-borders"
          >
            <Column 
              title="User" 
              key="user"
              render={(user: User) => (
                <Space>
                  <Avatar icon={<UserOutlined />} />
                  <div>
                    <div className="font-medium">{user.name || 'No name'}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                </Space>
              )}
            />
            <Column 
              title="Status" 
              key="status"
              render={(user: User) => getStatusTag(user.status)}
            />
            <Column 
              title="Last Login" 
              key="lastLogin"
              render={(user: User) => 
                user.last_login 
                  ? new Date(user.last_login).toLocaleDateString()
                  : 'Never'
              }
            />
            <Column 
              title="Workspaces" 
              key="workspaceCount"
              render={(user: User) => (
                <Tag color="blue">{user.workspaceCount}</Tag>
              )}
            />
            <Column 
              title="Tools Used" 
              key="toolsUsed"
              render={(user: User) => user.toolsUsed}
            />
            <Column 
              title="Actions" 
              key="actions"
              render={(user: User) => (
                <Space>
                  <Button 
                    size="small" 
                    icon={<EyeOutlined />}
                    onClick={() => handleUserAction(user, 'view')}
                  >
                    View
                  </Button>
                  <Button 
                    size="small"
                    icon={<MailOutlined />}
                    onClick={() => handleUserAction(user, 'resend')}
                    disabled={user.status !== 'invited'}
                  >
                    Resend
                  </Button>
                  <Button 
                    size="small"
                    danger={user.status !== 'suspended'}
                    onClick={() => handleUserAction(user, 'suspend')}
                  >
                    {user.status === 'suspended' ? 'Activate' : 'Suspend'}
                  </Button>
                </Space>
              )}
            />
          </Table>
        </Card>

        {/* Recent Invites */}
        <Card 
          title={
            <div className="flex items-center gap-2">
              <MailOutlined />
              <span>Recent Invites</span>
            </div>
          }
        >
          <Table 
            dataSource={invites}
            pagination={{ pageSize: 5 }}
            rowKey="id"
               className="no-vertical-borders" 
          >
            <Column title="Email" dataIndex="email" key="email" />
            <Column 
              title="Status" 
              key="status"
              render={(invite: Invite) => getInviteStatusTag(invite.status)}
            />
            <Column 
              title="Sent At" 
              key="sentAt"
              render={(invite: Invite) => new Date(invite.sent_at).toLocaleString()}
            />
            <Column 
              title="Accepted At" 
              key="acceptedAt"
              render={(invite: Invite) => 
                invite.accepted_at 
                  ? new Date(invite.accepted_at).toLocaleString()
                  : '-'
              }
            />
          </Table>
        </Card>
      </main>

      {/* Footer */}
      <footer className={`${theme === 'dark' ? 'bg-black border-gray-700' : 'bg-white border-gray-200'} border-t mt-auto px-6 py-2`}>
        <div className="flex items-center justify-center">
          <Text type="secondary" className="text-xs">
            <span className="" style={{ color: '#5CC49D' }}>arbitrage</span>OS Admin Panel • 
            {' '}<span style={{ color: '#5CC49D' }}>Secure Access Management</span>
            {' '}© 2025
          </Text>
        </div>
      </footer>

      {/* Invite User Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#5CC49D] rounded-lg flex items-center justify-center">
              <MailOutlined className="text-white text-sm" />
            </div>
            <div>
              <Title level={4} className="mb-0">Invite User to Platform</Title>
              <Text type="secondary" className="text-sm">Send an invitation email</Text>
            </div>
          </div>
        }
        open={showInviteModal}
        onCancel={() => setShowInviteModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowInviteModal(false)} disabled={sendingInvite}>
            Cancel
          </Button>,
          <Button
            key="send"
            type="primary"
            loading={sendingInvite}
            disabled={!inviteEmail.trim()}
            onClick={handleSendInvite}
            style={{ backgroundColor: '#5CC49D', borderColor: '#5CC49D' }}
          >
            Send Invitation
          </Button>
        ]}
      >
        <div className="space-y-4 pt-4">
          <div>
            <Text strong className="block mb-2">Email Address</Text>
            <Input
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="user@company.com"
              autoFocus
              prefix={<MailOutlined />}
            />
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Text type="secondary" className="text-sm">
              The user will receive an email invitation to join arbitrageOS. 
              They will be able to create their account and access the platform features.
            </Text>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDashboard;