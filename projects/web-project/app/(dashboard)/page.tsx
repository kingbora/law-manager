'use client';

import { Card, Col, List, Row, Statistic, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import React, { useMemo } from 'react';

import { useAuth } from '../auth-context';

const overviewMetrics = [
  { title: '待处理案件', value: 8, suffix: '件', color: '#1677ff' },
  { title: '本周新增客户', value: 5, suffix: '位', color: '#52c41a' },
  { title: '进行中合约', value: 12, suffix: '份', color: '#faad14' },
];

const quickReminders = [
  {
    title: '合同审核：王某 vs. XX 科技',
    time: dayjs().add(2, 'day').format('YYYY年MM月DD日 HH:mm'),
    type: '合同审核',
    tagColor: 'blue',
  },
  {
    title: '开庭准备：李某某劳动仲裁案',
    time: dayjs().add(3, 'day').format('YYYY年MM月DD日 HH:mm'),
    type: '庭审',
    tagColor: 'red',
  },
  {
    title: '客户回访：深圳华信律所合作',
    time: dayjs().add(5, 'day').format('YYYY年MM月DD日 HH:mm'),
    type: '客户回访',
    tagColor: 'purple',
  },
];

export default function DashboardOverviewPage() {
  const { user } = useAuth();

  const greeting = useMemo(() => {
    const hour = dayjs().hour();
    if (hour < 12) return '上午好';
    if (hour < 18) return '下午好';
    return '晚上好';
  }, []);

  return (
    <div style={{ padding: '24px 0' }}>
      <Typography.Title level={3} style={{ marginBottom: 8 }}>
        {greeting}，{user?.username ?? '团队成员'}
      </Typography.Title>
      <Typography.Paragraph type='secondary' style={{ marginBottom: 32 }}>
        以下是今日律所的运营概览，祝您工作顺利。
      </Typography.Paragraph>

      <Row gutter={[24, 24]}>
        {overviewMetrics.map((metric) => (
          <Col key={metric.title} xs={24} sm={12} lg={8}>
            <Card hoverable>
              <Statistic
                title={metric.title}
                value={metric.value}
                suffix={metric.suffix}
                valueStyle={{ color: metric.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={14}>
          <Card title='重点提醒'>
            <List
              itemLayout='horizontal'
              dataSource={quickReminders}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <SpaceBetween>
                        <Typography.Text strong>{item.title}</Typography.Text>
                        <Tag color={item.tagColor}>{item.type}</Tag>
                      </SpaceBetween>
                    }
                    description={
                      <Typography.Text type='secondary'>
                        计划时间：{item.time}
                      </Typography.Text>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title='常用操作'>
            <Typography.Paragraph>
              通过侧边栏快速进入模块，或跟进以下建议操作：
            </Typography.Paragraph>
            <List
              dataSource={[
                '更新客户资料并完善案情信息',
                '查看本周庭审日程并准备材料',
                '审查最新的保密协议和合规要求',
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Typography.Text>{item}</Typography.Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

type SpaceBetweenProps = {
  children: React.ReactNode;
};

function SpaceBetween({ children }: SpaceBetweenProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}
    >
      {children}
    </div>
  );
}
