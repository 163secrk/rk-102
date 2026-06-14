import { useState } from 'react';
import { Form, Input, Button, Link, message } from 'tdesign-react';
import {
  UserIcon, LockOnIcon, BrowseIcon, BrowseOffIcon, MailIcon, PhoneSearchIcon, ChatIcon } from 'tdesign-icons-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import './AuthPages.less';

const { FormItem } = Form;

export default function RegisterPage() {
  const [form] = Form.useForm();
  const [showPwd, setShowPwd] = useState(false);
  const navigate = useNavigate();
  const { register, loading } = useAuthStore();

  const onSubmit = async (context: any) => {
    context.e?.preventDefault();
    try {
      const values = await form.validate();
      if (!values || typeof values === 'boolean') return;
      const formData = values as unknown as {
        username: string;
        nickname?: string;
        email: string;
        phone?: string;
        password: string;
      };
      await register({
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim(),
        password: formData.password,
        nickname: formData.nickname?.trim(),
      });
      message.success('注册成功，欢迎加入灵脉');
      setTimeout(() => navigate('/dashboard', { replace: true }), 300);
    } catch {
      // 拦截器已处理
    }
  };

  return (
    <div className="auth-card glass-card">
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
        <div className="form-row-2">
          <FormItem name="username" rules={[
            { required: true, message: '请输入用户名' },
            { min: 4, message: '用户名至少4个字符' },
            { pattern: /^[a-zA-Z0-9_]+$/, message: '仅支持字母数字下划线' },
          ]}>
            <Input size="large" placeholder="用户名（4-50字符" prefixIcon={<UserIcon />} />
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

        <FormItem>
          <Button
            type="submit"
            theme="primary"
            block
            size="large"
            loading={loading}
            className="submit-btn"
          >
            注册账户
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
