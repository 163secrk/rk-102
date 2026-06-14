import { useState, FormEvent } from 'react';
import { Form, Input, Button, Checkbox, Link, message } from 'tdesign-react';
import { UserIcon, LockIcon, BrowseIcon, BrowseOffIcon } from 'tdesign-icons-react';
import { useNavigate, useLocation, NavigateFunction } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import './AuthPages.less';

const { FormItem } = Form;

export default function LoginPage() {
  const [form] = Form.useForm();
  const [showPwd, setShowPwd] = useState(false);
  const navigate: NavigateFunction = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuthStore();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const onSubmit = async (e: FormEvent<any>) => {
    e.preventDefault();
    try {
      const values = await form.validate();
      if (!values.account || !values.password) return;
      await login({
        account: values.account.trim(),
        password: values.password,
      });
      message.success('登录成功，欢迎回到灵脉');
      setTimeout(() => navigate(from, { replace: true }), 300);
    } catch {
      // 拦截器已处理
    }
  };

  return (
    <div className="auth-card glass-card">
      <div className="auth-card-header">
        <h2 className="card-title">欢迎回来</h2>
        <p className="card-sub">登录您的灵脉账户，继续守护珍稀生命</p>
      </div>

      <Form
        form={form}
        labelWidth={0}
        onSubmit={onSubmit}
        initialData={{ remember: true }}
        className="auth-form"
      >
        <FormItem name="account" rules={[{ required: true, message: '请输入用户名/邮箱/手机号' }]}>
          <Input
            size="large"
            placeholder="用户名 / 邮箱 / 手机号"
            prefixIcon={<UserIcon />}
            autoComplete="username"
          />
        </FormItem>

        <FormItem name="password" rules={[{ required: true, message: '请输入密码' }]}>
          <Input
            size="large"
            type={showPwd ? 'text' : 'password'}
            placeholder="请输入密码"
            prefixIcon={<LockIcon />}
            suffixIcon={
              <span onClick={() => setShowPwd(!showPwd)} style={{ cursor: 'pointer' }}>
                {showPwd ? <BrowseOffIcon size="18" /> : <BrowseIcon size="18" />}
              </span>
            }
            autoComplete="current-password"
          />
        </FormItem>

        <FormItem>
          <div className="form-row-between">
            <Checkbox name="remember">记住登录</Checkbox>
            <Link theme="primary" onClick={() => message.info('请联系管理员重置密码')}>忘记密码？</Link>
          </div>
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
            登录
          </Button>
        </FormItem>
      </Form>

      <div className="auth-footer-switch">
        <span>还没有账户？</span>
        <Link theme="primary" onClick={() => navigate('/register')}>立即注册</Link>
      </div>

      <div className="auth-tips">
        <p>💡 首次使用请先注册育种者身份获得认证权限</p>
      </div>
    </div>
  );
}
