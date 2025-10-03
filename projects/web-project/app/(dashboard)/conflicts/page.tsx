'use client';

import { Alert, Card, Empty, Input, List, Tag, Typography } from 'antd';
import React, { useMemo, useState } from 'react';

const conflictSamples = [
  {
    id: 'c1',
    matter: '王某诉华纳科技劳动纠纷',
    parties: ['王某', '华纳科技'],
    riskLevel: '高',
    description: '华纳科技目前在本律所开设有劳动合规顾问项目，存在潜在利益冲突。',
  },
  {
    id: 'c2',
    matter: '深圳未来动力 vs. 竞争对手商标争议',
    parties: ['深圳未来动力', '恒星动力'],
    riskLevel: '中',
    description: '双方均为长期客户，需评估是否采取信息隔离墙策略。',
  },
  {
    id: 'c3',
    matter: '上海卓越投资股权交割',
    parties: ['上海卓越投资', 'Blue Ocean Fund'],
    riskLevel: '低',
    description: '暂无历史业务往来，可继续推进并留存冲突检查记录。',
  },
] satisfies Array<{
  id: string;
  matter: string;
  parties: string[];
  riskLevel: '高' | '中' | '低';
  description: string;
}>;

const riskTagColor: Record<'高' | '中' | '低', string> = {
  高: 'red',
  中: 'orange',
  低: 'green',
};

export default function ConflictsPage() {
  const [keyword, setKeyword] = useState('');

  const filteredConflicts = useMemo(() => {
    if (!keyword.trim()) return conflictSamples;
    return conflictSamples.filter((item) => {
      const haystack = [item.matter, ...item.parties, item.description].join(' ');
      return haystack.toLowerCase().includes(keyword.trim().toLowerCase());
    });
  }, [keyword]);

  return (
    <div style={{ padding: '24px 0' }}>
      <Card title='利益冲突检索'>
        <Typography.Paragraph type='secondary'>
          输入客户、当事人或事项名称即可快速检索潜在冲突，后续将与案件数据库联动。
        </Typography.Paragraph>
        <Input.Search
          placeholder='请输入搜索关键词，例如“华纳科技”'
          allowClear
          enterButton='检索'
          size='large'
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          style={{ maxWidth: 480, marginBottom: 24 }}
        />

        {filteredConflicts.length > 0 ? (
          <List
            itemLayout='vertical'
            dataSource={filteredConflicts}
            renderItem={(item) => (
              <List.Item key={item.id}>
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
                      <Typography.Text strong>{item.matter}</Typography.Text>
                      <Tag color={riskTagColor[item.riskLevel]}>
                        风险等级：{item.riskLevel}
                      </Tag>
                    </div>
                  }
                  description={
                    <Typography.Text type='secondary'>
                      涉及主体：{item.parties.join('、')}
                    </Typography.Text>
                  }
                />
                <Typography.Paragraph style={{ marginTop: 8 }}>
                  {item.description}
                </Typography.Paragraph>
              </List.Item>
            )}
          />
        ) : (
          <Empty description='暂无匹配结果，请调整搜索条件' />
        )}
      </Card>

      <Card style={{ marginTop: 24 }} title='冲突审查提示'>
        <Alert
          message='合规建议'
          description='如发现潜在冲突，请立即通知合伙人并建立信息隔离墙，确保遵循律所合规要求。'
          type='warning'
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Typography.Paragraph>
          1. 记录冲突检索时间、关键词与结果，便于后续合规审计。
        </Typography.Paragraph>
        <Typography.Paragraph>
          2. 针对高风险客户建议使用冲突锁定功能，限制案件分配。
        </Typography.Paragraph>
        <Typography.Paragraph>
          3. 即将上线批量导入客户名单并自动交叉比对功能。
        </Typography.Paragraph>
      </Card>
    </div>
  );
}
