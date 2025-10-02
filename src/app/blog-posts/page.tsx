"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../../providers/ThemeProvider';
import { 
  Button, 
  Card, 
  Input, 
  Modal, 
  Typography, 
  Progress, 
  Space, 
  Avatar, 
  Dropdown, 
  Badge,
  Row,
  Col,
  Table,
  Statistic,
  Tag,
  Popover,
  List,
  message
} from 'antd';
import { 
  PlusOutlined, 
  UserOutlined, 
  MailOutlined, 
  ArrowRightOutlined, 
  BellOutlined, 
  DownOutlined, 
  LoadingOutlined,
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

// Interfaces
interface User {
  id: string;
  email: string;
  name: string;
  status: 'invited' | 'active' | 'suspended';
  lastLogin?: string;
  inviteSentAt: string;
  workspaceCount: number;
  toolsUsed: number;
}

interface Invite {
  id: string;
  email: string;
  status: 'sent' | 'accepted' | 'expired';
  sentAt: string;
  acceptedAt?: string;
  invitedBy: string;
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
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Mock data - replace with actual API calls
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      email: 'john@example.com',
      name: 'John Doe',
      status: 'active',
      lastLogin: '2024-01-15T10:30:00Z',
      inviteSentAt: '2024-01-10T09:00:00Z',
      workspaceCount: 3,
      toolsUsed: 15
    },
    {
      id: '2',
      email: 'sarah@company.com',
      name: 'Sarah Wilson',
      status: 'active',
      lastLogin: '2024-01-14T14:20:00Z',
      inviteSentAt: '2024-01-08T11:00:00Z',
      workspaceCount: 2,
      toolsUsed: 8
    },
    {
      id: '3',
      email: 'mike@startup.com',
      name: 'Mike Johnson',
      status: 'invited',
      lastLogin: undefined,
      inviteSentAt: '2024-01-12T16:45:00Z',
      workspaceCount: 0,
      toolsUsed: 0
    }
  ]);

  const [invites, setInvites] = useState<Invite[]>([
    {
      id: '1',
      email: 'mike@startup.com',
      status: 'sent',
      sentAt: '2024-01-12T16:45:00Z',
      invitedBy: 'admin@arbitrageos.com'
    },
    {
      id: '2',
      email: 'lisa@tech.com',
      status: 'expired',
      sentAt: '2024-01-05T10:00:00Z',
      invitedBy: 'admin@arbitrageos.com'
    }
  ]);

  // Calculate metrics
  const metrics = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    pendingInvites: invites.filter(i => i.status === 'sent').length,
    totalToolsUsed: users.reduce((sum, user) => sum + user.toolsUsed, 0),
    totalWorkspaces: users.reduce((sum, user) => sum + user.workspaceCount, 0)
  };

  // Filter users based on search
  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Status helpers
  const getStatusTag = (status: User['status']) => {
    const statusConfig = {
      invited: { color: 'orange', text: 'Invited' },
      active: { color: 'green', text: 'Active' },
      suspended: { color: 'red', text: 'Suspended' }
    };
    const config = statusConfig[status];
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
    
    // Simulate API call
    setTimeout(() => {
      const newInvite: Invite = {
        id: Date.now().toString(),
        email: inviteEmail,
        status: 'sent',
        sentAt: new Date().toISOString(),
        invitedBy: 'admin@arbitrageos.com'
      };

      const newUser: User = {
        id: Date.now().toString(),
        email: inviteEmail,
        name: inviteEmail.split('@')[0],
        status: 'invited',
        inviteSentAt: new Date().toISOString(),
        workspaceCount: 0,
        toolsUsed: 0
      };

      setInvites(prev => [newInvite, ...prev]);
      setUsers(prev => [newUser, ...prev]);
      
      setSendingInvite(false);
      setShowInviteModal(false);
      setInviteEmail("");
      
      message.success(`Invite sent to ${inviteEmail}`);
    }, 1500);
  };

  const handleUserAction = (user: User, action: 'view' | 'suspend' | 'resend') => {
    setSelectedUser(user);
    
    switch (action) {
      case 'view':
        // Navigate to user detail or show modal
        message.info(`Viewing details for ${user.name}`);
        break;
      case 'suspend':
        const updatedUsers = users.map(u => 
          u.id === user.id 
            ? { ...u, status: u.status === 'suspended' ? 'active' : 'suspended' }
            : u
        );
        // setUsers(updatedUsers);
        message.success(`User ${user.status === 'suspended' ? 'activated' : 'suspended'}`);
        break;
      case 'resend':
        message.success(`Invite resent to ${user.email}`);
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
                title="Tools Used"
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
          >
            <Column 
              title="User" 
              key="user"
              render={(user: User) => (
                <Space>
                  <Avatar icon={<UserOutlined />} />
                  <div>
                    <div className="font-medium">{user.name}</div>
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
                user.lastLogin 
                  ? new Date(user.lastLogin).toLocaleDateString()
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
              render={(invite: Invite) => new Date(invite.sentAt).toLocaleString()}
            />
            <Column 
              title="Accepted At" 
              key="acceptedAt"
              render={(invite: Invite) => 
                invite.acceptedAt 
                  ? new Date(invite.acceptedAt).toLocaleString()
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