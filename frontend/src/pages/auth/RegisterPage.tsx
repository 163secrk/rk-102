import { useState, useMemo } from 'react';
import { Form, Input, Button, Link, message, Radio, Textarea, Upload } from 'tdesign-react';
import {
  UserIcon, LockOnIcon, BrowseIcon, BrowseOffIcon, MailIcon, PhoneSearchIcon, ChatIcon,
  UploadIcon, HomeIcon, Building2Icon, FileIcon
} from 'tdesign-icons-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { RegisterAccountType, BreederType } from '@/api/auth';
import './AuthPages.less';

const { FormItem } = Form;

export default function RegisterPage() {
  const [form] = Form.useForm();
  const [showPwd, setShowPwd] = useState(false);
  const [accountType, setAccountType] = useState<RegisterAccountType>(RegisterAccountType.GUEST);
  const [breederType, setBreederType] = useState<BreederType>(BreederType.INDIVIDUAL);
  const [credentialUrls, setCredentialUrls] = useState<string[]>([]);
  const navigate = useNavigate();
  const { register, registerBreeder, loading, uploading, uploadCredentials } = useAuthStore();

  const accountTypeOptions = [
    { label: '普通用户', value: RegisterAccountType.GUEST },
    { label: '育种者/基地', value: RegisterAccountType.BREEDER },
  ];

  const breederTypeOptions = [
    { label: '个人育种者', value: BreederType.INDIVIDUAL, icon: <UserIcon /> },
    { label: '专业育种基地', value: BreederType.COMPANY, icon: <Building2Icon /> },
    { label: '组织机构', value: BreederType.ORGANIZATION, icon: <HomeIcon /> },
    { label: '科研院所', value: BreederType.RESEARCH_INSTITUTE, icon: <FileIcon /> },
  ];

  const isBreeder = accountType === RegisterAccountType.BREEDER;
  const isIndividual = breederType === BreederType.INDIVIDUAL;

  const handleUpload = async (file: File) => {
    const result = await uploadCredentials(file);
    setCredentialUrls(prev => [...prev, result.url]);
    message.success('文件上传成功');
    return {
      status: 'success' as const,
      response: { url: result.url },
    };
  };

  const handleRemove = (file: any) => {
    const index = credentialUrls.indexOf(file.response?.url || file.url);
    if (index > -1) {
      setCredentialUrls(prev => prev.filter((_, i) => i !== index));
    }
    return true;
  };

  const onSubmit = async ({ validateResult }: any) => {
    if (validateResult !== true) return;
    try {
      const formData = form.getFieldsValue(true) as {
        username: string;
        nickname?: string;
        email: string;
        phone?: string;
        password: string;
        realName?: string;
        idCardNumber?: string;
        companyName?: string;
        businessLicense?: string;
        address?: string;
        contactPhone?: string;
        description?: string;
      };

      const baseData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim(),
        password: formData.password,
        nickname: formData.nickname?.trim(),
        accountType,
      };

      if (isBreeder) {
        if (credentialUrls.length === 0) {
          message.error('请至少上传一份资质证明文件');
          return;
        }
        await registerBreeder({
          ...baseData,
          breederType,
          realName: formData.realName!,
          idCardNumber: formData.idCardNumber?.trim(),
          companyName: formData.companyName?.trim(),
          businessLicense: formData.businessLicense?.trim(),
          address: formData.address?.trim(),
          contactPhone: formData.contactPhone?.trim(),
          description: formData.description?.trim(),
          credentials: JSON.stringify(credentialUrls),
        });
        message.success('注册提交成功，等待管理员审核');
      } else {
        await register(baseData);
        message.success('注册成功，欢迎加入灵脉');
      }

      setTimeout(() => navigate('/dashboard', { replace: true }), 300);
    } catch {
      // 拦截器已处理
    }
  };

  const uploadTips = useMemo(() => {
    if (isIndividual) {
      return '请上传身份证正反面照片';
    }
    return '请上传营业执照、资质证书等证明文件';
  }, [isIndividual]);

  return (
    <div className="auth-card glass-card register-card">
      <div className="auth-card-header">
        <h2 className="card-title">创建账户</h2>
        <p className="card-sub">注册灵脉，开启生命溯源之旅</p>
      </div>

      <Form
        form={form}
        labelWidth={0}
        onSubmit={onSubmit}
        className="auth-form"
      >
        <FormItem name="accountType">
          <Radio.Group
            value={accountType}
            onChange={(v: any) => setAccountType(v as RegisterAccountType)}
            variant="default-filled"
          >
            {accountTypeOptions.map(opt => (
              <Radio.Button key={opt.value} value={opt.value}>
                {opt.label}
              </Radio.Button>
            ))}
          </Radio.Group>
        </FormItem>

        {isBreeder && (
          <FormItem name="breederType">
            <Radio.Group
              value={breederType}
              onChange={(v: any) => setBreederType(v as BreederType)}
              variant="default-filled"
            >
              {breederTypeOptions.map(opt => (
                <Radio.Button key={opt.value} value={opt.value}>
                  {opt.icon} {opt.label}
                </Radio.Button>
              ))}
            </Radio.Group>
          </FormItem>
        )}

        <div className="form-row-2">
          <FormItem name="username" rules={[
            { required: true, message: '请输入用户名' },
            { min: 4, message: '用户名至少4个字符' },
            { pattern: /^[a-zA-Z0-9_]+$/, message: '仅支持字母数字下划线' },
          ]}>
            <Input size="large" placeholder="用户名（4-50字符）" prefixIcon={<UserIcon />} />
          </FormItem>
          <FormItem name="nickname" rules={[{ max: 50, message: '昵称最多50字符' }]}>
            <Input size="large" placeholder="昵称（可选）" prefixIcon={<ChatIcon />} />
          </FormItem>
        </div>

        <FormItem name="email" rules={[
          { required: true, message: '请输入邮箱' },
          { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '请输入有效邮箱' },
        ]}>
          <Input size="large" placeholder="邮箱地址" prefixIcon={<MailIcon />} />
        </FormItem>

        <FormItem name="phone" rules={[
          { pattern: /^1[3-9]\d{9}$/, message: '请输入有效手机号' },
        ]}>
          <Input size="large" placeholder="手机号（可选）" prefixIcon={<PhoneSearchIcon />} />
        </FormItem>

        {isBreeder && (
          <>
            <div className="form-section-title">身份信息</div>

            <FormItem name="realName" rules={[
              { required: true, message: `请输入${isIndividual ? '真实姓名' : '法人姓名'}` },
              { max: 100, message: '姓名最多100字符' },
            ]}>
              <Input
                size="large"
                placeholder={isIndividual ? '真实姓名' : '企业法人姓名'}
                prefixIcon={<UserIcon />}
              />
            </FormItem>

            {isIndividual ? (
              <FormItem name="idCardNumber" rules={[
                { required: true, message: '请输入身份证号' },
                {
                  pattern: /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/,
                  message: '请输入有效的身份证号',
                },
              ]}>
                <Input size="large" placeholder="身份证号" prefixIcon={<FileIcon />} />
              </FormItem>
            ) : (
              <>
                <FormItem name="companyName" rules={[
                  { required: true, message: '请输入企业/基地名称' },
                  { max: 100, message: '名称最多100字符' },
                ]}>
                  <Input size="large" placeholder="企业/基地名称" prefixIcon={<Building2Icon />} />
                </FormItem>

                <FormItem name="businessLicense" rules={[
                  { required: true, message: '请输入营业执照编号' },
                  { max: 50, message: '编号最多50字符' },
                ]}>
                  <Input size="large" placeholder="营业执照编号" prefixIcon={<FileIcon />} />
                </FormItem>
              </>
            )}

            <div className="form-row-2">
              <FormItem name="address" rules={[{ max: 200, message: '地址最多200字符' }]}>
                <Input size="large" placeholder="联系地址（可选）" prefixIcon={<HomeIcon />} />
              </FormItem>
              <FormItem name="contactPhone" rules={[
                { pattern: /^1[3-9]\d{9}$/, message: '请输入有效联系电话' },
              ]}>
                <Input size="large" placeholder="联系电话（可选）" prefixIcon={<PhoneSearchIcon />} />
              </FormItem>
            </div>

            <FormItem name="description" rules={[{ max: 500, message: '简介最多500字符' }]}>
              <Textarea
                placeholder="育种者简介（可选）"
                autosize={{ minRows: 3, maxRows: 5 }}
              />
            </FormItem>

            <div className="form-section-title">资质证明</div>

            <FormItem
              label=""
              name="credentials"
              rules={[{ required: isBreeder, message: '请上传资质证明文件' }]}
            >
              <Upload
                multiple
                accept="image/*,.pdf"
                max={5}
                sizeLimit={10 * 1024 * 1024}
                placeholder="点击或拖拽上传"
                tips={`${uploadTips}，支持图片和PDF，单文件不超过10MB`}
                requestMethod={(files: any) => {
                  const file = Array.isArray(files) ? files[0] : files;
                  return handleUpload(file.raw as File);
                }}
                onRemove={handleRemove as any}
                uploadButton={
                  <div className="t-upload__placeholder">
                    <UploadIcon size="24" />
                    <div className="t-upload__text">选择文件上传</div>
                  </div>
                }
              />
            </FormItem>
          </>
        )}

        <FormItem name="password" rules={[
          { required: true, message: '请输入密码' },
          { min: 8, message: '密码至少8个字符' },
          {
            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            message: '密码需包含大小写字母和数字',
          },
        ]}>
          <Input
            size="large"
            type={showPwd ? 'text' : 'password'}
            placeholder="至少8位，含大小写字母和数字"
            prefixIcon={<LockOnIcon />}
            suffixIcon={
              <span onClick={() => setShowPwd(!showPwd)} style={{ cursor: 'pointer' }}>
                {showPwd ? <BrowseOffIcon size="18" /> : <BrowseIcon size="18" />}
              </span>
            }
          />
        </FormItem>

        <FormItem name="password2" rules={[
          { required: true, message: '请确认密码' },
          {
            validator: (v: string) => {
              const pwd = form.getFieldValue?.('password');
              return v === pwd;
            },
            message: '两次密码不一致',
          },
        ]}>
          <Input
            size="large"
            type={showPwd ? 'text' : 'password'}
            placeholder="再次输入密码"
            prefixIcon={<LockOnIcon />}
          />
        </FormItem>

        {isBreeder && (
          <div className="notice-box">
            <p>📋 提交后，管理员将在1-3个工作日内完成审核</p>
            <p>🔒 您的个人信息和资质文件将被严格保密</p>
          </div>
        )}

        <FormItem>
          <Button
            type="submit"
            theme="primary"
            block
            size="large"
            loading={loading || uploading}
            className="submit-btn"
          >
            {isBreeder ? '提交注册申请' : '注册账户'}
          </Button>
        </FormItem>
      </Form>

      <div className="auth-footer-switch">
        <span>已有账户？</span>
        <Link theme="primary" onClick={() => navigate('/login')}>返回登录</Link>
      </div>
    </div>
  );
}
