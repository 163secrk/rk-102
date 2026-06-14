import { Card, Row, Col, Button, Tag } from 'tdesign-react';
import {
  UserIcon, DashboardIcon, ChevronRightIcon, TimeIcon, CheckCircleIcon, CloseCircleIcon,
} from 'tdesign-icons-react';
import { useAuthStore } from '@/store/authStore';
import { BreederStatus } from '@/api/auth';
import './DashboardPage.less';

const stats = [
  { key: 'breeders', label: '认证育种者', value: 0, icon: <span style={{ fontSize: '24px' }}>👥</span>, trend: '+0%', color: '#d4af37' },
  { key: 'organisms', label: '建档个体', value: 0, icon: <span style={{ fontSize: '24px' }}>🌿</span>, trend: '+0%', color: '#10b981' },
  { key: 'pedigree', label: '谱系关系数', value: 0, icon: <span style={{ fontSize: '24px' }}>🌳</span>, trend: '+0%', color: '#3b82f6' },
  { key: 'traces', label: '溯源扫码', value: 0, icon: <span style={{ fontSize: '24px' }}>🔳</span>, trend: '+0%', color: '#8b5cf6' },
];

const quickEntries = [
  { key: 'breeder', title: '育种者认证', desc: '提交资质，成为认证育种机构', icon: '👥', route: '/breeders', color: '#d4af37' },
  { key: 'organism', title: '建立档案', desc: '为个体创建永久数字档案', icon: '🌿', route: '/organisms', color: '#10b981' },
  { key: 'pedigree', title: '谱系构建', desc: '构建无限层级谱系树', icon: '🌳', route: '/pedigree', color: '#3b82f6' },
  { key: 'trace', title: '生成溯源码', desc: '生成智能溯源二维码', icon: '🔳', route: '/trace', color: '#8b5cf6' },
  { key: 'health', title: '健康日志', desc: '记录成长健康数据', icon: '💚', route: '/health', color: '#ef4444' },
  { key: 'ownership', title: '所有权转移', desc: '安全转移所有权', icon: '🔄', route: '/ownership', color: '#06b6d4' },
  { key: 'alert', title: '预警调度', desc: '设置提醒日程', icon: '⏰', route: '/alerts', color: '#f59e0b' },
  { key: 'flow', title: '谱系可视化', desc: 'React Flow 谱系树', icon: '🗺️', route: '/pedigree', color: '#ec4899' },
];

const statusConfig = {
  [BreederStatus.PENDING]: { label: '审核中', theme: 'warning', icon: <TimeIcon />, color: '#f59e0b' },
  [BreederStatus.UNDER_REVIEW]: { label: '正在审核', theme: 'warning', icon: <TimeIcon />, color: '#f59e0b' },
  [BreederStatus.APPROVED]: { label: '已认证', theme: 'success', icon: <CheckCircleIcon />, color: '#10b981' },
  [BreederStatus.REJECTED]: { label: '已拒绝', theme: 'danger', icon: <CloseCircleIcon />, color: '#ef4444' },
  [BreederStatus.SUSPENDED]: { label: '已暂停', theme: 'danger', icon: <CloseCircleIcon />, color: '#ef4444' },
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const breeder = user?.breeder;
  const statusInfo = breeder ? statusConfig[breeder.status] : null;

  return (
    <div className="dashboard-page">
      <div className="welcome-section glass-card">
        <div className="welcome-left">
          <h1 className="welcome-title">
            你好，<span className="gold-gradient-text">{user?.nickname || user?.username}</span> 👋
          </h1>
          <p className="welcome-desc">
            欢迎来到灵脉系统，今天是 {new Date().toLocaleDateString('zh-CN', {
              year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
            })}，共守护 <span className="accent">0</span> 份生命档案。
          </p>
        </div>
        <div className="welcome-right">
          <Button theme="primary" size="large" icon={<DashboardIcon />}>
            查看数据总览 <ChevronRightIcon />
          </Button>
        </div>
      </div>

      {breeder && statusInfo && (
        <Card className="breeder-status-card glass-card" bordered={false}>
          <div className="status-header">
            <div className="status-icon" style={{ background: `${statusInfo.color}15`, color: statusInfo.color }}>
              {statusInfo.icon}
            </div>
            <div className="status-info">
              <div className="status-title">
                育种者认证状态
                <Tag theme={statusInfo.theme as any} size="large" style={{ marginLeft: '12px' }}>
                  {statusInfo.label}
                </Tag>
              </div>
              <div className="status-desc">
                {breeder.status === BreederStatus.PENDING && '您的认证申请正在等待管理员审核，通常需要1-3个工作日'}
                {breeder.status === BreederStatus.UNDER_REVIEW && '管理员正在审核您的资质材料，请耐心等待'}
                {breeder.status === BreederStatus.APPROVED && (
                  <>
                    恭喜！您已通过认证，认证编号：<strong>{breeder.certificationNumber}</strong>，
                    认证时间：{breeder.certifiedAt ? new Date(breeder.certifiedAt).toLocaleDateString('zh-CN') : '-'}
                  </>
                )}
                {breeder.status === BreederStatus.REJECTED && (
                  <>
                    很抱歉，您的认证申请未通过。原因：<strong>{breeder.reviewNote || '资质材料不完整'}</strong>，
                    请补充材料后重新提交申请
                  </>
                )}
                {breeder.status === BreederStatus.SUSPENDED && (
                  <>
                    您的认证已被暂停。原因：<strong>{breeder.reviewNote || '违反平台规则'}</strong>，
                    如有疑问请联系客服
                  </>
                )}
              </div>
            </div>
          </div>
          {(breeder.status === BreederStatus.REJECTED || breeder.status === BreederStatus.SUSPENDED) && (
            <div className="status-actions">
              <Button theme="primary">重新提交申请</Button>
              <Button theme="default">联系客服</Button>
            </div>
          )}
        </Card>
      )}

      <Row gutter={16} className="stats-row">
        {stats.map((s) => (
          <Col key={s.key} xs={12} md={6}>
            <Card className="stat-card glass-card" bordered={false}>
              <div className="stat-icon" style={{ color: s.color }}>{s.icon}</div>
              <div className="stat-info">
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.value.toLocaleString()}</div>
              </div>
              <div className="stat-trend">{s.trend}</div>
            </Card>
          </Col>
        ))}
      </Row>

      <div className="section-title">
        <h3>快捷入口</h3>
        <p>快速开始使用灵脉核心功能</p>
      </div>

      <Row gutter={16}>
        {quickEntries.map((q) => (
          <Col key={q.key} xs={12} md={6} lg={6}>
            <Card className="entry-card glass-card" bordered={false}>
              <div className="entry-icon" style={{ background: `${q.color}15`, color: q.color }}>
                {q.icon}
              </div>
              <div className="entry-title">{q.title}</div>
              <div className="entry-desc">{q.desc}</div>
              <div className="entry-go">
                进入 <ChevronRightIcon size="14" />
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={16} className="bottom-row">
        <Col xs={12} md={8}>
          <Card className="glass-card" bordered={false} title="最近动态">
            <div className="empty-state">
            <p style={{margin:0}}>暂无动态，开始使用功能后此处将展示</p>
            </div>
          </Card>
        </Col>
        <Col xs={12} md={8}>
          <Card className="glass-card" bordered={false} title="预警提醒">
            <div className="empty-state">
            <p style={{margin:0}}>一切正常，暂无预警</p>
            </div>
          </Card>
        </Col>
        <Col xs={12} md={8}>
          <Card className="glass-card" bordered={false} title="待办事项">
            <div className="empty-state">
            <p style={{margin:0}}>暂无待办</p>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
