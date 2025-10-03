'use client';

import { Card, Descriptions, List, Tag, Typography } from 'antd';
import React from 'react';

import {
  AuthUserRoles,
  type AuthUserRole,
} from '@law-manager/api-schema/auth';

const roleDetails: Record<
  AuthUserRole,
  {
    label: string;
    description: string;
    capabilities: string[];
    tagColor: string;
  }
> = {
  master: {
    label: '超级管理员',
    description: '拥有系统最高权限，可管理组织结构、全局设置与安全策略。',
    capabilities: ['管理所有角色权限', '分配和回收系统资源', '查看全局运营报表'],
    tagColor: 'magenta',
  },
  admin: {
    label: '管理员',
    description: '负责团队成员管理与模块配置，保障运营顺畅。',
    capabilities: ['创建/禁用用户账号', '维护客户与案件基础数据', '配置业务流程规则'],
    tagColor: 'blue',
  },
  sale: {
    label: '商拓顾问',
    description: '专注客户拓展与渠道维护，可访问销售看板与线索管理。',
    capabilities: ['录入潜在客户与跟进记录', '查看基础角色信息', '提交业务需求至管理员'],
    tagColor: 'gold',
  },
  lawyer: {
    label: '律师',
    description: '处理客户案件的核心角色，可访问所负责案件的详细资料。',
    capabilities: ['查看与管理负责案件', '上传证据与文书', '与团队协作共享资料库'],
    tagColor: 'green',
  },
  assistant: {
    label: '助理',
    description: '辅助律师开展工作，处理资料整理与日程协调。',
    capabilities: ['编辑案件基础信息', '管理庭审日程', '提交资料审核申请'],
    tagColor: 'purple',
  },
};

const roleOrder: AuthUserRole[] = [...AuthUserRoles];

export default function PermissionsPage() {
  return (
    <div style={{ padding: '24px 0' }}>
      <Card title='角色权限概览'>
        <Typography.Paragraph type='secondary'>
          角色权限与身份管控将贯穿整个系统，后续将与后台动态配置打通，支持自定义角色与字段级权限。
        </Typography.Paragraph>
        <List
          itemLayout='vertical'
          dataSource={roleOrder}
          renderItem={(role) => {
            const detail = roleDetails[role];
            return (
              <List.Item key={role}>
                <List.Item.Meta
                  title={
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        flexWrap: 'wrap',
                      }}
                    >
                      <Typography.Text strong>{detail.label}</Typography.Text>
                      <Tag color={detail.tagColor}>{role}</Tag>
                    </div>
                  }
                  description={detail.description}
                />
                <Descriptions column={1} size='small' bordered>
                  <Descriptions.Item label='核心权限'>
                    <Typography.Text>
                      {detail.capabilities.join('；')}
                    </Typography.Text>
                  </Descriptions.Item>
                </Descriptions>
              </List.Item>
            );
          }}
        />
      </Card>

      <Card style={{ marginTop: 24 }} title='即将上线的权限控制能力'>
        <Typography.Paragraph>
          • 更细粒度的模块访问控制，例如案件文档、财务与结算模块。
        </Typography.Paragraph>
        <Typography.Paragraph>
          • 角色审批流程，管理员可发起权限变更审批链路。
        </Typography.Paragraph>
        <Typography.Paragraph>
          • 权限变更审计日志，记录操作人、时间与影响范围。
        </Typography.Paragraph>
      </Card>
    </div>
  );
}
