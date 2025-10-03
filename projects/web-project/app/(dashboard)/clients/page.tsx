'use client';

import { Button, Card, Divider, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React from 'react';

import { useAuth } from '../../auth-context';

type ClientRecord = {
  key: string;
  clientName: string;
  caseName: string;
  status: '待跟进' | '进行中' | '已结案';
  responsible: string;
  nextAction: string;
};

const clientData: ClientRecord[] = [
  {
    key: '1',
    clientName: '北京华纳科技有限公司',
    caseName: '技术保密协议纠纷',
    status: '进行中',
    responsible: '张律师',
    nextAction: '准备下周证据材料',
  },
  {
    key: '2',
    clientName: '上海卓越投资集团',
    caseName: '股权转让合同审查',
    status: '待跟进',
    responsible: '李律师',
    nextAction: '安排客户会面确认条款',
  },
  {
    key: '3',
    clientName: '深圳未来动力有限公司',
    caseName: '劳动仲裁案件应诉',
    status: '已结案',
    responsible: '周律师',
    nextAction: '归档并生成客户报告',
  },
];

const statusTagColor: Record<ClientRecord['status'], string> = {
  待跟进: 'gold',
  进行中: 'blue',
  已结案: 'green',
};

const columns: ColumnsType<ClientRecord> = [
  {
    title: '客户名称',
    dataIndex: 'clientName',
    key: 'clientName',
  },
  {
    title: '关联案件/项目',
    dataIndex: 'caseName',
    key: 'caseName',
  },
  {
    title: '当前状态',
    dataIndex: 'status',
    key: 'status',
    render: (status: ClientRecord['status']) => (
      <Tag color={statusTagColor[status]}>{status}</Tag>
    ),
  },
  {
    title: '责任律师',
    dataIndex: 'responsible',
    key: 'responsible',
  },
  {
    title: '下一步行动',
    dataIndex: 'nextAction',
    key: 'nextAction',
  },
];

export default function ClientsPage() {
  const { user } = useAuth();

  return (
    <div style={{ padding: '24px 0' }}>
      <Card
        title='客户与案件管理'
        extra={
          <Button type='primary'>新增客户</Button>
        }
      >
        <Typography.Paragraph type='secondary' style={{ marginBottom: 16 }}>
          以下展示的是重点客户与案件进展，{user?.username ?? '团队成员'} 可点击行查看详情或在顶部添加新客户。
        </Typography.Paragraph>
        <Table
          columns={columns}
          dataSource={clientData}
          pagination={{ pageSize: 5, hideOnSinglePage: true }}
        />
      </Card>

      <Card style={{ marginTop: 24 }} title='操作建议'>
        <Typography.Paragraph>
          • 每周更新客户联系方式与关键进展。
        </Typography.Paragraph>
        <Typography.Paragraph>
          • 将案件阶段同步至团队以便资源协调。
        </Typography.Paragraph>
        <Typography.Paragraph>
          • 对即将开庭或谈判的案件提前两周准备资料。
        </Typography.Paragraph>
        <Divider style={{ margin: '16px 0' }} />
        <Typography.Text type='secondary'>
          后续将接入真实数据源与筛选功能，支持按照客户行业与案件类别进行筛选。
        </Typography.Text>
      </Card>
    </div>
  );
}
