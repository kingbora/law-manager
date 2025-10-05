'use client';

import { Calendar, Card, Flex, List, Space, Tag, Typography } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import React, { useCallback, useMemo, useState } from 'react';

import RequireAuth from '../../../components/RequireAuth';

import 'dayjs/locale/zh-cn';

dayjs.locale('zh-cn');

type TodoStatus = 'pending' | 'in-progress' | 'completed';

type TodoItem = {
  id: string;
  date: string;
  title: string;
  description?: string;
  status: TodoStatus;
};

const statusTagMap: Record<TodoStatus, { color: string; label: string }> = {
  pending: { color: 'default', label: '待处理' },
  'in-progress': { color: 'processing', label: '进行中' },
  completed: { color: 'success', label: '已完成' },
};

const sampleTodos: TodoItem[] = [
  {
    id: 'todo-1',
    date: dayjs().format('YYYY-MM-DD'),
    title: '审核新客户资料',
    status: 'in-progress',
  },
  {
    id: 'todo-2',
    date: dayjs().format('YYYY-MM-DD'),
    title: '准备法庭材料',
    description: '上午 10:00 与团队同步',
    status: 'pending',
  },
  {
    id: 'todo-3',
    date: dayjs().add(1, 'day').format('YYYY-MM-DD'),
    title: '与客户电话沟通',
    status: 'pending',
  },
  {
    id: 'todo-4',
    date: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
    title: '更新案件资料库',
    status: 'completed',
  },
];

const getTodosForDate = (date: Dayjs) =>
  sampleTodos.filter((todo) => dayjs(todo.date).isSame(date, 'day'));

export default function CalendarPage() {
  const [viewDate, setViewDate] = useState<Dayjs>(() => dayjs());
  const [selectedDate, setSelectedDate] = useState<Dayjs>(() => dayjs());

  const todosForSelectedDate = useMemo(
    () => getTodosForDate(selectedDate),
    [selectedDate],
  );

  const renderDateCell = useCallback((date: Dayjs) => {
    const todos = getTodosForDate(date);
    if (todos.length === 0) {
      return null;
    }

    return (
      <Space direction='vertical' size={4} style={{ width: '100%' }}>
        {todos.slice(0, 2).map((todo) => (
          <Tag
            key={todo.id}
            color={statusTagMap[todo.status].color}
            style={{ width: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {todo.title}
          </Tag>
        ))}
        {todos.length > 2 ? (
          <Typography.Text type='secondary' style={{ fontSize: 12 }}>
            +{todos.length - 2} 更多
          </Typography.Text>
        ) : null}
      </Space>
    );
  }, []);

  const handleSelect = (date: Dayjs) => {
    setSelectedDate(date);
    setViewDate(date);
  };

  const handlePanelChange = (date: Dayjs) => {
    setViewDate(date);
  };

  return (
    <RequireAuth>
      <Space direction='vertical' size={24} style={{ width: '100%' }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          日程安排
        </Typography.Title>
        <Flex gap={24} vertical={false} wrap>
          <Card style={{ flex: '1 1 420px' }} bodyStyle={{ padding: 0 }}>
            <Calendar
              value={viewDate}
              onSelect={handleSelect}
              onPanelChange={handlePanelChange}
              fullscreen={false}
              dateCellRender={renderDateCell}
            />
          </Card>
          <Card
            style={{ flex: '1 1 320px', minWidth: 320 }}
            title={`${selectedDate.format('YYYY年MM月DD日')} 待办事项`}
          >
            {todosForSelectedDate.length === 0 ? (
              <Typography.Paragraph type='secondary' style={{ margin: 0 }}>
                今日暂无待办事项。
              </Typography.Paragraph>
            ) : (
              <List
                dataSource={todosForSelectedDate}
                renderItem={(item) => {
                  const tagInfo = statusTagMap[item.status];
                  return (
                    <List.Item key={item.id}>
                      <List.Item.Meta
                        title={item.title}
                        description={item.description}
                      />
                      <Tag color={tagInfo.color}>{tagInfo.label}</Tag>
                    </List.Item>
                  );
                }}
              />
            )}
          </Card>
        </Flex>
      </Space>
    </RequireAuth>
  );
}
