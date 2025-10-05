// admin-app/src/components/InvitesPage.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../providers/ThemeProvider';
import { 
  Button, 
  Card, 
  Input, 
  Modal, 
  Typography, 
  Space, 
  Table,
  Tag,
  message,
  Row,
  Col,
  Statistic,
  Badge,
  Tooltip,
} from 'antd';
import { 
  MailOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SendOutlined,
  ReloadOutlined,
  DeleteOutlined,
  CopyOutlined,
  SearchOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Search } = Input;
const { Column } = Table;

interface Invite {
  id: string;
  email: string;
  status: 'sent' | 'accepted' | 'expired';
  sent_at: Date;
  accepted_at: Date | null;
  invited_by: string;
}

const InvitesPage = () => {
  const { theme } = useTheme();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Load invites
  const loadInvites = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/invites');
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setInvites(result.data);
        }
      } else {
        message.error('Failed to load invites');
      }
    } catch (error) {
      console.error('Load invites error:', error);
      message.error('Failed to load invites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvites();
  }, []);

  // Filter invites
  const filteredInvites = invites.filter(invite =>
    invite.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invite.invited_by.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate stats
  const stats = {
    total: invites.length,
    sent: invites.filter(i => i.status === 'sent').length,
    accepted: invites.filter(i => i.status === 'accepted').length,
    expired: invites.filter(i => i.status === 'expired').length,
  };

  // Status tag helper
  const getInviteStatusTag = (status: Invite['status']) => {
    const statusConfig = {
      sent: { color: 'blue', text: 'Sent', icon: <ClockCircleOutlined /> },
      accepted: { color: 'green', text: 'Accepted', icon: <CheckCircleOutlined /> },
      expired: { color: 'red', text: 'Expired', icon: <CloseCircleOutlined /> }
    };
    const config = statusConfig[status];
    return <Tag color={config.color} icon={config.icon}>{config.text}</Tag>;
  };

  // Send invite handler
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
        await loadInvites();
      } else {
        message.error(result.error || 'Failed to send invite');
      }
    } catch (error) {
      message.error('Failed to send invite');
    } finally {
      setSendingInvite(false);
    }
  };

  // Resend invite handler
  const handleResendInvite = async (inviteId: string, email: string) => {
    try {
      const response = await fetch(`/api/admin/invites/${inviteId}/resend`, {
        method: 'POST',
      });

      const result = await response.json();
      
      if (result.success) {
        message.success(`Invite resent to ${email}`);
        await loadInvites();
      } else {
        message.error(result.error || 'Failed to resend invite');
      }
    } catch (error) {
      message.error('Failed to resend invite');
    }
  };

  // Copy email handler
  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    message.success('Email copied to clipboard');
  };

  return (
    <div className="min-h-screen w-full" style={{ 
      backgroundColor: theme === 'dark' ? '#000000' : '#f9fafb' 
    }}>
      {/* Header */}
      <header className={`${theme === 'dark' ? 'bg-[#181919] border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div>
            <Title level={3} className="mb-0" style={{ color: theme === 'dark' ? '#fff' : '#000' }}>
              User Invitations
            </Title>
            <Text type="secondary" className="text-sm">
              Send and manage platform invitations
            </Text>
          </div>

          <Space>
            <Button 
              icon={<ReloadOutlined />}
              onClick={loadInvites}
              loading={loading}
            >
              Refresh
            </Button>
            <Button 
              type="primary" 
              icon={<SendOutlined />}
              onClick={() => setShowInviteModal(true)}
             
              size="large"
            >
              Send Invitation
            </Button>
          </Space>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-6 py-6">
        {/* Stats Cards */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={6}>
            <Card size="small" className="text-center h-full">
              <Statistic
                title="Total Invites"
                value={stats.total}
                prefix={<MailOutlined />}
                valueStyle={{ color: theme === 'dark' ? '#5CC49D' : '#5CC49D' }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card size="small" className="text-center h-full">
              <Statistic
                title="Pending"
                value={stats.sent}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card size="small" className="text-center h-full">
              <Statistic
                title="Accepted"
                value={stats.accepted}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card size="small" className="text-center h-full">
              <Statistic
                title="Expired"
                value={stats.expired}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Search Bar */}
        <Card className="mb-6">
          <Search
            placeholder="Search by email or inviter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
            prefix={<SearchOutlined />}
            size="large"
          />
        </Card>

        {/* Invites Table */}
        <Card 
          title={
            <div className="flex items-center gap-2">
              <MailOutlined />
              <span>All Invitations</span>
              <Badge count={filteredInvites.length} showZero style={{ backgroundColor: '#5CC49D' }} />
            </div>
          }
        >
          <Table 
            dataSource={filteredInvites}
            loading={loading}
            pagination={{ 
              pageSize: 15,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} invites`
            }}
            scroll={{ x: 900 }}
            rowKey="id"
                 className="no-vertical-borders"
          >
            <Column 
              title="Email" 
              dataIndex="email" 
              key="email"
              render={(email: string) => (
                <Space>
                  <Text strong>{email}</Text>
                  <Tooltip title="Copy email">
                    <Button 
                      type="text" 
                      size="small" 
                      icon={<CopyOutlined />}
                      onClick={() => handleCopyEmail(email)}
                    />
                  </Tooltip>
                </Space>
              )}
            />
            
            <Column 
              title="Status" 
              key="status"
              render={(invite: Invite) => getInviteStatusTag(invite.status)}
            />
            
            <Column 
              title="Sent At" 
              key="sentAt"
              render={(invite: Invite) => new Date(invite.sent_at).toLocaleString()}
              sorter={(a: Invite, b: Invite) => 
                new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime()
              }
            />
            
            <Column 
              title="Accepted At" 
              key="acceptedAt"
              render={(invite: Invite) => 
                invite.accepted_at 
                  ? new Date(invite.accepted_at).toLocaleString()
                  : <Text type="secondary">-</Text>
              }
            />

            <Column 
              title="Invited By" 
              dataIndex="invited_by" 
              key="invitedBy"
            />
            
            <Column 
              title="Actions" 
              key="actions"
              render={(invite: Invite) => (
                <Space>
                  <Tooltip title="Resend invite">
                    <Button 
                      size="small"
                      icon={<ReloadOutlined />}
                      onClick={() => handleResendInvite(invite.id, invite.email)}
                      disabled={invite.status === 'accepted'}
                    >
                      Resend
                    </Button>
                  </Tooltip>
                </Space>
              )}
            />
          </Table>
        </Card>
      </main>

      {/* Invite Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#5CC49D] rounded-lg flex items-center justify-center">
              <MailOutlined className="text-white" />
            </div>
            <div>
              <Title level={4} className="mb-0">Send Platform Invitation</Title>
              <Text type="secondary" className="text-sm">Invite a new user to arbitrageOS</Text>
            </div>
          </div>
        }
        open={showInviteModal}
        onCancel={() => {
          setShowInviteModal(false);
          setInviteEmail("");
        }}
        footer={[
          <Button 
            key="cancel" 
            onClick={() => {
              setShowInviteModal(false);
              setInviteEmail("");
            }} 
            disabled={sendingInvite}
          >
            Cancel
          </Button>,
          <Button
            key="send"
            type="primary"
            loading={sendingInvite}
            disabled={!inviteEmail.trim()}
            onClick={handleSendInvite}
           
            icon={<SendOutlined />}
          >
            Send Invitation
          </Button>
        ]}
        width={600}
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
              size="large"
              onPressEnter={handleSendInvite}
            />
          </div>
          
          <div className={`p-4 rounded-lg border ${
            theme === 'dark' 
              ? 'bg-blue-900/20 border-blue-800' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <Space direction="vertical" size="small">
              <Text strong className={theme === 'dark' ? 'text-blue-300' : 'text-blue-900'}>
                📧 What happens next?
              </Text>
              <ul className={`text-sm m-0 pl-5 ${theme === 'dark' ? 'text-blue-200' : 'text-blue-700'}`}>
                <li>User receives a magic link email</li>
                <li>Link redirects to main platform</li>
                <li>Account created automatically on first login</li>
                <li>Invite expires in 7 days</li>
              </ul>
            </Space>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InvitesPage;