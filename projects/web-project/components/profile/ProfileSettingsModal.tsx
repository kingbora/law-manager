'use client';

import {
  Avatar,
  Button,
  Form,
  Input,
  Modal,
  Space,
  Upload,
  Typography,
  message,
} from 'antd';
import type { RcFile, UploadChangeParam } from 'antd/es/upload';
import type { UploadFile } from 'antd/es/upload/interface';
import { UploadOutlined, UserOutlined } from '@ant-design/icons';
import React, { useEffect, useMemo, useState } from 'react';

import { useAuth } from '../../app/auth-context';

type ProfileFormValues = {
  name: string;
  username: string;
};

type ProfileSettingsModalProps = {
  open: boolean;
  onClose: () => void;
};

const ACCEPT_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

const getBase64 = (file: RcFile) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });

export default function ProfileSettingsModal({ open, onClose }: ProfileSettingsModalProps) {
  const { user, refresh } = useAuth();
  const [form] = Form.useForm<ProfileFormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);
  const [avatarList, setAvatarList] = useState<UploadFile[]>([]);

  const accountName = useMemo(() => {
    if (!user) return '';
    const withOptionalName = user as typeof user & { name?: string };
    return withOptionalName?.name ?? user.username ?? '';
  }, [user]);

  const initialNickname = user?.username ?? '';

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      name: accountName,
      username: initialNickname,
    });

    const withAvatar = user as typeof user & { avatar?: string; avatarUrl?: string; image?: string };
    const initialAvatar = withAvatar?.avatarUrl ?? withAvatar?.avatar ?? withAvatar?.image;
    if (initialAvatar) {
      setAvatarPreview(initialAvatar);
      setAvatarList([
        {
          uid: 'initial-avatar',
          name: 'avatar.png',
          status: 'done',
          url: initialAvatar,
        },
      ]);
    } else {
      setAvatarPreview(undefined);
      setAvatarList([]);
    }
  }, [accountName, form, initialNickname, open, user]);

  const handleAvatarChange = async ({ file, fileList }: UploadChangeParam<UploadFile>) => {
    const latestList = fileList.slice(-1).map((item) => ({
      ...item,
      status: 'done' as const,
    }));
    setAvatarList(latestList);
    const latest = latestList[latestList.length - 1];
    if (latest?.originFileObj) {
      try {
        const preview = await getBase64(latest.originFileObj as RcFile);
        setAvatarPreview(preview);
      } catch (error) {
        message.error('预览头像失败，请重试');
      }
    } else if (file.status === 'removed' || fileList.length === 0) {
      setAvatarPreview(undefined);
    }
  };

  const handleReset = () => {
    form.setFieldsValue({
      name: accountName,
      username: initialNickname,
    });

    const withAvatar = user as typeof user & { avatar?: string; avatarUrl?: string; image?: string };
    const initialAvatar = withAvatar?.avatarUrl ?? withAvatar?.avatar ?? withAvatar?.image;
    if (initialAvatar) {
      setAvatarPreview(initialAvatar);
      setAvatarList([
        {
          uid: 'initial-avatar',
          name: 'avatar.png',
          status: 'done',
          url: initialAvatar,
        },
      ]);
    } else {
      setAvatarPreview(undefined);
      setAvatarList([]);
    }
  };

  const handleSubmit = async (values: ProfileFormValues) => {
    setSubmitting(true);
    try {
      // TODO: replace with actual API integration when available
      await refresh();
      message.success('个人资料已更新');
      onClose();
    } catch (error) {
      console.error('Failed to update profile', error);
      message.error('更新失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title='个人资料'
      onCancel={onClose}
      destroyOnClose
      maskClosable={false}
      footer={null}
    >
      <Space direction='vertical' size='large' style={{ width: '100%' }}>
        <Space size='large' align='center'>
          <Avatar size={80} src={avatarPreview} icon={<UserOutlined />} />
          <div>
            <Typography.Paragraph style={{ marginBottom: 8 }}>
              支持 PNG、JPG、WebP 格式，单个文件最大 5MB。
            </Typography.Paragraph>
            <Upload
              accept={ACCEPT_IMAGE_TYPES.join(',')}
              maxCount={1}
              beforeUpload={() => false}
              onChange={handleAvatarChange}
              fileList={avatarList}
              onRemove={() => {
                setAvatarPreview(undefined);
                setAvatarList([]);
              }}
            >
              <Button icon={<UploadOutlined />}>选择头像</Button>
            </Upload>
          </div>
        </Space>

        <Form<ProfileFormValues>
          layout='vertical'
          requiredMark={false}
          form={form}
          onFinish={handleSubmit}
        >
          <Form.Item label='用户名' name='name'>
            <Input disabled />
          </Form.Item>
          <Form.Item
            label='昵称'
            name='username'
            rules={[{ required: true, message: '请输入昵称' }]}
          >
            <Input placeholder='请输入昵称' maxLength={64} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button onClick={handleReset}>重置</Button>
              <Button type='primary' htmlType='submit' loading={submitting}>
                保存修改
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Space>
    </Modal>
  );
}
