import { useState, useEffect, useMemo } from 'react';
import {
  Card, Table, Tag, Button, Select, Pagination, Dialog, Textarea,
  Empty, message, Row, Col, Statistic, Image, Drawer, Tooltip,
} from 'tdesign-react';
import {
  SearchIcon, CheckCircleIcon, CloseCircleIcon, TimeIcon,
  FilterIcon, RefreshIcon, UserIcon, Building2Icon,
  FileIcon, HomeIcon, ChatBubbleIcon,
} from 'tdesign-icons-react';
import { useAuthStore } from '@/store/authStore';
import {
  authApi,
  BreederStatus,
  BreederType,
  BreederInfo,
  UserInfo,
  BreederStatistics,
} from '@/api/auth';
import './BreederReviewPage.less';

const { Option } = Select;

const statusConfig: Record<BreederStatus, { label: string; theme: string; color: string; icon: JSX.Element }> = {
  [BreederStatus.PENDING]: { label: '待审核', theme: 'warning', color: '#f59e0b', icon: <TimeIcon /> },
  [BreederStatus.UNDER_REVIEW]: { label: '审核中', theme: 'warning', color: '#f59e0b', icon: <TimeIcon /> },
  [BreederStatus.APPROVED]: { label: '已通过', theme: 'success', color: '#10b981', icon: <CheckCircleIcon /> },
  [BreederStatus.REJECTED]: { label: '已拒绝', theme: 'danger', color: '#ef4444', icon: <CloseCircleIcon /> },
  [BreederStatus.SUSPENDED]: { label: '已暂停', theme: 'danger', color: '#ef4444', icon: <CloseCircleIcon /> },
};

const typeConfig: Record<BreederType, { label: string; icon: JSX.Element; color: string }> = {
  [BreederType.INDIVIDUAL]: { label: '个人育种者', icon: <UserIcon />, color: '#3b82f6' },
  [BreederType.COMPANY]: { label: '专业育种基地', icon: <Building2Icon />, color: '#8b5cf6' },
  [BreederType.ORGANIZATION]: { label: '组织机构', icon: <HomeIcon />, color: '#06b6d4' },
  [BreederType.RESEARCH_INSTITUTE]: { label: '科研院所', icon: <FileIcon />, color: '#ec4899' },
};

export default function BreederReviewPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState<BreederStatistics | null>(null);
  const [breederList, setBreederList] = useState<Array<BreederInfo & { user: UserInfo }>>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<BreederStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<BreederType | ''>('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedBreeder, setSelectedBreeder] = useState<(BreederInfo & { user: UserInfo }) | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [reviewDialogVisible, setReviewDialogVisible] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | 'suspend'>('approve');
  const [reviewNote, setReviewNote] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, listRes] = await Promise.all([
        authApi.getBreederStatistics(),
        authApi.getBreederList({
          status: statusFilter || undefined,
          type: typeFilter || undefined,
          page,
          limit: pageSize,
        }),
      ]);
      setStatistics(statsRes);
      setBreederList(listRes.data);
      setTotal(listRes.total);
    } catch {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, statusFilter, typeFilter]);

  const filteredList = useMemo(() => {
    if (!searchKeyword) return breederList;
    const keyword = searchKeyword.toLowerCase();
    return breederList.filter((item) =>
      item.user.username.toLowerCase().includes(keyword) ||
      item.user.email.toLowerCase().includes(keyword) ||
      item.realName.toLowerCase().includes(keyword) ||
      item.companyName?.toLowerCase().includes(keyword)
    );
  }, [breederList, searchKeyword]);

  const handleViewDetail = (breeder: BreederInfo & { user: UserInfo }) => {
    setSelectedBreeder(breeder);
    setDrawerVisible(true);
  };

  const handleApprove = (breeder: BreederInfo & { user: UserInfo }) => {
    setSelectedBreeder(breeder);
    setReviewAction('approve');
    setReviewNote('');
    setReviewDialogVisible(true);
  };

  const handleReject = (breeder: BreederInfo & { user: UserInfo }) => {
    setSelectedBreeder(breeder);
    setReviewAction('reject');
    setReviewNote('');
    setReviewDialogVisible(true);
  };

  const handleSuspend = (breeder: BreederInfo & { user: UserInfo }) => {
    setSelectedBreeder(breeder);
    setReviewAction('suspend');
    setReviewNote('');
    setReviewDialogVisible(true);
  };

  const handleConfirmReview = async () => {
    if (!selectedBreeder) return;

    if (reviewAction === 'reject' && !reviewNote.trim()) {
      message.error('拒绝时必须填写审核备注');
      return;
    }

    setReviewLoading(true);
    try {
      if (reviewAction === 'approve') {
        await authApi.approveBreeder(selectedBreeder.id, { reviewNote: reviewNote.trim() });
        message.success('审核通过成功');
      } else if (reviewAction === 'reject') {
        await authApi.rejectBreeder(selectedBreeder.id, { reviewNote: reviewNote.trim() });
        message.success('审核拒绝成功');
      } else if (reviewAction === 'suspend') {
        await authApi.suspendBreeder(selectedBreeder.id, { reviewNote: reviewNote.trim() });
        message.success('暂停成功');
      }
      setReviewDialogVisible(false);
      loadData();
    } catch {
      // 拦截器已处理
    } finally {
      setReviewLoading(false);
    }
  };

  const parseCredentials = (credentials?: string) => {
    if (!credentials) return [];
    try {
      return JSON.parse(credentials);
    } catch {
      return [credentials];
    }
  };

  const canReview = (status: BreederStatus) => {
    return status === BreederStatus.PENDING || status === BreederStatus.UNDER_REVIEW;
  };

  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';
  const isVerifier = user?.role === 'verifier' || isAdmin;

  const getApiBaseUrl = () => {
    return 'http://localhost:8102';
  };

  const tableColumns = [
    {
      colKey: 'userInfo',
      title: '账户信息',
      width: 220,
      cell: ({ row }: any) => (
        <div className="user-cell">
          <div className="user-avatar">
            <UserIcon size="18" />
          </div>
          <div className="user-info">
            <div className="user-name">{row.user.username}</div>
            <div className="user-email">{row.user.email}</div>
          </div>
        </div>
      ),
    },
    {
      colKey: 'type',
      title: '类型',
      width: 150,
      cell: ({ row }: any) => {
        const config = typeConfig[row.type as BreederType];
        return (
          <Tag variant="outline" style={{ borderColor: config.color, color: config.color }}>
            {config.icon} {config.label}
          </Tag>
        );
      },
    },
    {
      colKey: 'realName',
      title: '实名/企业',
      width: 180,
      cell: ({ row }: any) => (
        <div>
          <div className="real-name">{row.realName}</div>
          {row.companyName && <div className="company-name">{row.companyName}</div>}
        </div>
      ),
    },
    {
      colKey: 'credentials',
      title: '资质编号',
      width: 180,
      cell: ({ row }: any) => (
        <div>
          {row.businessLicense && <div className="license">执照: {row.businessLicense}</div>}
          {row.idCardNumber && <div className="id-card">身份证: {row.idCardNumber.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2')}</div>}
          {row.certificationNumber && <div className="cert-no" style={{ color: '#10b981' }}>认证: {row.certificationNumber}</div>}
        </div>
      ),
    },
    {
      colKey: 'status',
      title: '状态',
      width: 120,
      cell: ({ row }: any) => {
        const config = statusConfig[row.status as BreederStatus];
        return (
          <Tag theme={config.theme as any}>
            {config.icon} {config.label}
          </Tag>
        );
      },
    },
    {
      colKey: 'createdAt',
      title: '申请时间',
      width: 180,
      cell: ({ row }: any) => new Date(row.createdAt).toLocaleString('zh-CN'),
    },
    {
      colKey: 'actions',
      title: '操作',
      width: 260,
      fixed: 'right' as const,
      cell: ({ row }: any) => (
        <div className="action-buttons">
          <Tooltip content="查看详情">
            <Button
              size="small"
              variant="text"
              icon={<FileIcon />}
              onClick={() => handleViewDetail(row)}
            />
          </Tooltip>
          {isVerifier && canReview(row.status as BreederStatus) && (
            <>
              <Tooltip content="通过认证">
                <Button
                  size="small"
                  variant="text"
                  theme="primary"
                  icon={<CheckCircleIcon />}
                  onClick={() => handleApprove(row)}
                >
                  通过
                </Button>
              </Tooltip>
              <Tooltip content="拒绝申请">
                <Button
                  size="small"
                  variant="text"
                  theme="danger"
                  icon={<CloseCircleIcon />}
                  onClick={() => handleReject(row)}
                >
                  拒绝
                </Button>
              </Tooltip>
            </>
          )}
          {isAdmin && row.status === BreederStatus.APPROVED && (
            <Tooltip content="暂停认证">
              <Button
                size="small"
                variant="text"
                theme="warning"
                onClick={() => handleSuspend(row)}
              >
                暂停
              </Button>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="breeder-review-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">育种者认证审核</h1>
          <p className="page-desc">管理和审核育种者与专业育种基地的认证申请</p>
        </div>
        <Button
          theme="default"
          icon={<RefreshIcon />}
          onClick={loadData}
          loading={loading}
        >
          刷新
        </Button>
      </div>

      {statistics && (
        <Row gutter={16} className="stats-row">
          <Col xs={6} md={4}>
            <Card className="stat-card glass-card" bordered={false}>
              <Statistic
                title="总申请数"
                value={statistics.total}
                prefix={<FileIcon />}
              />
            </Card>
          </Col>
          <Col xs={6} md={4}>
            <Card className="stat-card glass-card" bordered={false}>
              <Statistic
                title="待审核"
                value={statistics.pending}
                prefix={<TimeIcon />}
              />
            </Card>
          </Col>
          <Col xs={6} md={4}>
            <Card className="stat-card glass-card" bordered={false}>
              <Statistic
                title="已通过"
                value={statistics.approved}
                prefix={<CheckCircleIcon />}
              />
            </Card>
          </Col>
          <Col xs={6} md={4}>
            <Card className="stat-card glass-card" bordered={false}>
              <Statistic
                title="已拒绝"
                value={statistics.rejected}
                prefix={<CloseCircleIcon />}
              />
            </Card>
          </Col>
          <Col xs={6} md={4}>
            <Card className="stat-card glass-card" bordered={false}>
              <Statistic
                title="个人育种者"
                value={statistics.individual}
                prefix={<UserIcon />}
              />
            </Card>
          </Col>
          <Col xs={6} md={4}>
            <Card className="stat-card glass-card" bordered={false}>
              <Statistic
                title="企业/基地"
                value={statistics.company}
                prefix={<Building2Icon />}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Card className="filter-card glass-card" bordered={false}>
        <div className="filter-bar">
          <div className="filter-left">
            <Select
              value={statusFilter}
              onChange={(v: any) => { setStatusFilter(v); setPage(1); }}
              clearable
              placeholder="状态筛选"
              prefixIcon={<FilterIcon />}
              style={{ width: 160 }}
            >
              {Object.entries(statusConfig).map(([key, config]) => (
                <Option key={key} value={key} label={config.label}>
                  <span style={{ color: config.color }}>{config.icon}</span> {config.label}
                </Option>
              ))}
            </Select>
            <Select
              value={typeFilter}
              onChange={(v: any) => { setTypeFilter(v); setPage(1); }}
              clearable
              placeholder="类型筛选"
              prefixIcon={<FilterIcon />}
              style={{ width: 180 }}
            >
              {Object.entries(typeConfig).map(([key, config]) => (
                <Option key={key} value={key} label={config.label}>
                  <span style={{ color: config.color }}>{config.icon}</span> {config.label}
                </Option>
              ))}
            </Select>
          </div>
          <div className="filter-right">
            <div className="search-box">
              <SearchIcon size="16" />
              <input
                placeholder="搜索用户名、邮箱、姓名..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="table-card glass-card" bordered={false}>
        <Table
          columns={tableColumns}
          data={filteredList}
          loading={loading}
          rowKey="id"
          hover
          stripe
          empty={<Empty description="暂无数据" />}
        />

        <div className="pagination-wrap">
          <Pagination
            total={total}
            pageSize={pageSize}
            current={page}
            onChange={(p: any) => setPage(p.current)}
            showPageSize={false}
          />
        </div>
      </Card>

      <Drawer
        placement="right"
        size="680px"
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        header={
          <div className="drawer-header">
            <h3>育种者详情</h3>
            {selectedBreeder && (
              <Tag theme={statusConfig[selectedBreeder.status as BreederStatus].theme as any}>
                {statusConfig[selectedBreeder.status as BreederStatus].label}
              </Tag>
            )}
          </div>
        }
      >
        {selectedBreeder && (
          <div className="breeder-detail">
            <section className="detail-section">
              <h4><UserIcon /> 账户信息</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>用户名</label>
                  <span>{selectedBreeder.user.username}</span>
                </div>
                <div className="detail-item">
                  <label>邮箱</label>
                  <span>{selectedBreeder.user.email}</span>
                </div>
                <div className="detail-item">
                  <label>手机号</label>
                  <span>{selectedBreeder.user.phone || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>注册时间</label>
                  <span>{new Date(selectedBreeder.user.createdAt).toLocaleString('zh-CN')}</span>
                </div>
              </div>
            </section>

            <section className="detail-section">
              <h4>{typeConfig[selectedBreeder.type as BreederType].icon} 身份信息</h4>
              <div className="detail-badge">
                <Tag variant="outline" style={{ borderColor: typeConfig[selectedBreeder.type as BreederType].color, color: typeConfig[selectedBreeder.type as BreederType].color }}>
                  {typeConfig[selectedBreeder.type as BreederType].label}
                </Tag>
              </div>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>{selectedBreeder.type === BreederType.INDIVIDUAL ? '真实姓名' : '法人姓名'}</label>
                  <span>{selectedBreeder.realName}</span>
                </div>
                {selectedBreeder.idCardNumber && (
                  <div className="detail-item">
                    <label>身份证号</label>
                    <span>{selectedBreeder.idCardNumber}</span>
                  </div>
                )}
                {selectedBreeder.companyName && (
                  <div className="detail-item">
                    <label>企业/基地名称</label>
                    <span>{selectedBreeder.companyName}</span>
                  </div>
                )}
                {selectedBreeder.businessLicense && (
                  <div className="detail-item">
                    <label>营业执照编号</label>
                    <span>{selectedBreeder.businessLicense}</span>
                  </div>
                )}
                <div className="detail-item">
                  <label>联系地址</label>
                  <span>{selectedBreeder.address || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>联系电话</label>
                  <span>{selectedBreeder.contactPhone || '-'}</span>
                </div>
                {selectedBreeder.certificationNumber && (
                  <div className="detail-item">
                    <label>认证编号</label>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>{selectedBreeder.certificationNumber}</span>
                  </div>
                )}
                {selectedBreeder.certifiedAt && (
                  <div className="detail-item">
                    <label>认证时间</label>
                    <span>{new Date(selectedBreeder.certifiedAt).toLocaleString('zh-CN')}</span>
                  </div>
                )}
              </div>
              {selectedBreeder.description && (
                <div className="detail-item full">
                  <label>简介</label>
                  <p>{selectedBreeder.description}</p>
                </div>
              )}
            </section>

            <section className="detail-section">
              <h4><FileIcon /> 资质证明文件</h4>
              <div className="credentials-grid">
                {parseCredentials(selectedBreeder.credentials).map((url: string, index: number) => (
                  <div key={index} className="credential-item">
                    <Image
                      src={`${getApiBaseUrl()}${url}`}
                      alt={`资质证明 ${index + 1}`}
                      fit="cover"
                      lazy
                    />
                  </div>
                ))}
              </div>
            </section>

            {selectedBreeder.reviewNote && (
              <section className="detail-section">
                <h4><ChatBubbleIcon /> 审核备注</h4>
                <div className="review-note">
                  <p>{selectedBreeder.reviewNote}</p>
                  {selectedBreeder.reviewedAt && (
                    <span className="review-time">{new Date(selectedBreeder.reviewedAt).toLocaleString('zh-CN')}</span>
                  )}
                </div>
              </section>
            )}

            {isVerifier && canReview(selectedBreeder.status as BreederStatus) && (
              <div className="detail-actions">
                <Button
                  theme="primary"
                  size="large"
                  icon={<CheckCircleIcon />}
                  onClick={() => {
                    setDrawerVisible(false);
                    handleApprove(selectedBreeder);
                  }}
                >
                  审核通过
                </Button>
                <Button
                  theme="danger"
                  size="large"
                  icon={<CloseCircleIcon />}
                  onClick={() => {
                    setDrawerVisible(false);
                    handleReject(selectedBreeder);
                  }}
                >
                  审核拒绝
                </Button>
              </div>
            )}
          </div>
        )}
      </Drawer>

      <Dialog
        visible={reviewDialogVisible}
        header={
          reviewAction === 'approve' ? '确认审核通过' :
          reviewAction === 'reject' ? '确认审核拒绝' : '确认暂停认证'
        }
        body={
          <div className="review-dialog">
            <p>
              {reviewAction === 'approve' && '确认通过该育种者的认证申请？通过后该用户将获得育种者权限。'}
              {reviewAction === 'reject' && '确认拒绝该育种者的认证申请？拒绝后请填写拒绝原因。'}
              {reviewAction === 'suspend' && '确认暂停该育种者的认证资格？暂停后该用户将无法使用育种者功能。'}
            </p>
            <Textarea
              value={reviewNote}
              onChange={(v) => setReviewNote(v)}
              placeholder={reviewAction === 'reject' ? '请输入拒绝原因（必填）' : '请输入审核备注（可选）'}
              autosize={{ minRows: 3, maxRows: 5 }}
            />
          </div>
        }
        confirmBtn="确认"
        cancelBtn="取消"
        onConfirm={handleConfirmReview}
        onCancel={() => setReviewDialogVisible(false)}
        confirmLoading={reviewLoading}
      />
    </div>
  );
}
