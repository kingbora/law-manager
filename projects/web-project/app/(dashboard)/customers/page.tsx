'use client';

import { PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  Modal,
  Radio,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useCallback, useMemo, useState } from 'react';

import { useDashboardHeaderActions } from '../../../components/dashboard/DashboardShell';

type CustomerType = '单位客户' | '自然人';

type CustomerRecord = {
  id: string;
  name: string;
  types: CustomerType[];
  nature?: string;
  legalPerson?: string;
  creditCode?: string;
  idNumber?: string;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  lawyer?: string;
  createdAt: string;
};

type CustomerFilterValues = {
  name: string;
  type?: CustomerType;
  lawyer: string;
};

type CreateCustomerFormValues = {
  customerType?: CustomerType;
  name: string;
  nature?: string;
  legalPerson?: string;
  creditCode?: string;
  idNumber?: string;
  gender?: string[];
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  lawyer?: string;
};

const CUSTOMER_NATURE_OPTIONS = [
  '国有企业',
  '股份公司',
  '有限公司',
  '外商投资企业',
  '个体工商户',
  '企业法人分支机构',
  '集体经济组织',
];

const CUSTOMER_TYPE_OPTIONS: { label: string; value: CustomerType }[] = [
  { label: '单位客户', value: '单位客户' },
  { label: '自然人', value: '自然人' },
];

const GENDER_OPTIONS = [
  { label: '男', value: '男' },
  { label: '女', value: '女' },
];

const INITIAL_FILTERS: CustomerFilterValues = {
  name: '',
  type: undefined,
  lawyer: '',
};

const INITIAL_CUSTOMERS: CustomerRecord[] = [
  {
    id: 'CUS202401',
    name: '华南智造集团',
    types: ['单位客户'],
    nature: '国有企业',
    legalPerson: '李兆华',
    creditCode: '91440101MA5D3T1A9',
    phone: '020-88997766',
    email: 'contact@hnsmart.com',
    address: '广东省广州市天河区智慧谷路88号',
    lawyer: '王雪',
    createdAt: '2024-03-15 10:24',
  },
  {
    id: 'CUS202402',
    name: '星河科技有限公司',
    types: ['单位客户'],
    nature: '有限公司',
    legalPerson: '陈宇航',
    creditCode: '91310115MA1K6Y3Q0',
    phone: '021-66778899',
    email: 'service@xinghe.com',
    address: '上海市浦东新区张江科学城88弄',
    lawyer: '赵云',
    createdAt: '2024-02-18 14:02',
  },
  {
    id: 'CUS202403',
    name: '张丽',
    types: ['自然人'],
    idNumber: '440582199205156329',
    gender: '女',
    phone: '13800138000',
    lawyer: '李航',
    createdAt: '2024-03-22 09:41',
  },
];

export default function CustomersPage() {
  const [filterForm] = Form.useForm<CustomerFilterValues>();
  const [createForm] = Form.useForm<CreateCustomerFormValues>();

  const [filters, setFilters] = useState<CustomerFilterValues>(INITIAL_FILTERS);
  const [customers, setCustomers] = useState<CustomerRecord[]>(INITIAL_CUSTOMERS);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerRecord | null>(null);

  const selectedType = Form.useWatch('customerType', createForm) as CustomerType | undefined;
  const showEnterpriseFields = selectedType === '单位客户';
  const showIndividualFields = selectedType === '自然人';

  const openCreateModal = useCallback(() => {
    setEditingCustomer(null);
    createForm.resetFields();
    createForm.setFieldsValue({
      customerType: '单位客户',
    });
    setModalOpen(true);
  }, [createForm]);

  const openEditModal = useCallback(
    (record: CustomerRecord) => {
      setEditingCustomer(record);
      createForm.resetFields();
      setModalOpen(true);
      createForm.setFieldsValue({
        customerType: record.types[0] ?? '单位客户',
        name: record.name,
        nature: record.nature,
        legalPerson: record.legalPerson,
        creditCode: record.creditCode,
        idNumber: record.idNumber,
        gender: record.gender ? [record.gender] : [],
        phone: record.phone,
        email: record.email,
        address: record.address,
        notes: record.notes,
        lawyer: record.lawyer,
      });
    },
    [createForm],
  );

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingCustomer(null);
    createForm.resetFields();
  }, [createForm]);

  const headerActions = useMemo(
    () => (
      <Button type='primary' icon={<PlusOutlined />} onClick={openCreateModal}>
        新增客户
      </Button>
    ),
    [openCreateModal],
  );

  useDashboardHeaderActions(headerActions);

  const handleFilter = useCallback(
    (values: Partial<CustomerFilterValues>) => {
      setFilters({
        name: values.name?.trim() ?? '',
        type: values.type,
        lawyer: values.lawyer?.trim() ?? '',
      });
    },
    [],
  );

  const handleResetFilters = useCallback(() => {
    filterForm.resetFields();
    setFilters(INITIAL_FILTERS);
  }, [filterForm]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((item) => {
      if (filters.name && !item.name.includes(filters.name)) {
        return false;
      }
      if (filters.type && !item.types.includes(filters.type)) {
        return false;
      }
      if (filters.lawyer && !(item.lawyer ?? '').includes(filters.lawyer)) {
        return false;
      }
      return true;
    });
  }, [customers, filters]);

  const handleSubmit = useCallback(async () => {
    try {
      const values = await createForm.validateFields();
      if (!values.customerType) {
        message.warning('请选择客户类型');
        return;
      }

      setSubmitting(true);

      const customerType = values.customerType as CustomerType;
      const normalizedGender = Array.isArray(values.gender) ? values.gender[0] : values.gender;

      const baseData: Omit<CustomerRecord, 'id' | 'createdAt'> = {
        name: values.name.trim(),
        types: [customerType],
        nature: customerType === '单位客户' ? values.nature : undefined,
        legalPerson: customerType === '单位客户' ? values.legalPerson?.trim() : undefined,
        creditCode: customerType === '单位客户' ? values.creditCode?.trim() : undefined,
        idNumber: customerType === '自然人' ? values.idNumber?.trim() : undefined,
        gender: customerType === '自然人' ? normalizedGender : undefined,
        phone: values.phone?.trim(),
        email: values.email?.trim(),
        address: values.address?.trim(),
        notes: values.notes?.trim(),
        lawyer: values.lawyer?.trim(),
      };

      if (editingCustomer) {
        const updatedCustomer: CustomerRecord = {
          ...editingCustomer,
          ...baseData,
        };
        setCustomers((prev) =>
          prev.map((item) => (item.id === editingCustomer.id ? updatedCustomer : item)),
        );
        message.success('客户信息已更新');
      } else {
        const now = dayjs().format('YYYY-MM-DD HH:mm');
        const newCustomer: CustomerRecord = {
          id: `CUS${Date.now()}`,
          createdAt: now,
          ...baseData,
        };
        setCustomers((prev) => [newCustomer, ...prev]);
        message.success('新增客户成功');
      }

      setModalOpen(false);
      setEditingCustomer(null);
      createForm.resetFields();
    } catch (error) {
      if (error instanceof Error) {
        message.warning(error.message);
      }
    } finally {
      setSubmitting(false);
    }
  }, [createForm, editingCustomer]);

  const handleDelete = useCallback((id: string) => {
    setCustomers((prev) => prev.filter((item) => item.id !== id));
    message.success('客户已删除');
  }, []);

  const columns: ColumnsType<CustomerRecord> = useMemo(
    () => [
      {
        title: '客户名称',
        dataIndex: 'name',
        key: 'name',
        render: (_, record) => (
          <Space direction='vertical' size={4}>
            <Typography.Link onClick={() => openEditModal(record)} style={{ fontWeight: 600 }}>
              {record.name}
            </Typography.Link>
            <Space size={4} wrap>
              {record.types.map((type) => (
                <Tag key={`${record.id}-${type}`} color={type === '单位客户' ? 'geekblue' : 'green'}>
                  {type}
                </Tag>
              ))}
            </Space>
          </Space>
        ),
      },
      {
        title: '法人代表',
        dataIndex: 'legalPerson',
        key: 'legalPerson',
        render: (_, record) => (record.types.includes('单位客户') ? record.legalPerson ?? '-' : '-'),
      },
      {
        title: '联系电话',
        dataIndex: 'phone',
        key: 'phone',
        render: (value: string | undefined) => value ?? '-',
      },
      {
        title: '承办律师',
        dataIndex: 'lawyer',
        key: 'lawyer',
        render: (value: string | undefined) => value ?? '-',
      },
      {
        title: '录入时间',
        dataIndex: 'createdAt',
        key: 'createdAt',
      },
      {
        title: '操作',
        key: 'actions',
        render: (_, record) => (
          <Popconfirm
            title='确认删除该客户？'
            description='删除后将无法恢复该客户信息，请确认。'
            okText='确认'
            cancelText='取消'
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type='link' size='small' danger>
              删除
            </Button>
          </Popconfirm>
        ),
      },
    ],
    [handleDelete, openEditModal],
  );

  return (
    <div style={{ padding: '24px 0' }}>
      <Card style={{ marginBottom: 24 }}>
        <Form
          form={filterForm}
          layout='inline'
          onFinish={handleFilter}
          initialValues={INITIAL_FILTERS}
          style={{ rowGap: 16 }}
        >
          <Form.Item name='name' label='客户名称'>
            <Input allowClear placeholder='请输入客户名称' style={{ width: 224 }} />
          </Form.Item>
          <Form.Item name='type' label='客户类型'>
            <Select
              allowClear
              placeholder='请选择客户类型'
              options={CUSTOMER_TYPE_OPTIONS}
              style={{ width: 200 }}
            />
          </Form.Item>
          <Form.Item name='lawyer' label='承办律师'>
            <Input allowClear placeholder='请输入承办律师' style={{ width: 200 }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type='primary' htmlType='submit'>
                查询
              </Button>
              <Button onClick={handleResetFilters}>重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card>
        <Table<CustomerRecord>
          rowKey='id'
          columns={columns}
          dataSource={filteredCustomers}
          pagination={{ pageSize: 8, showSizeChanger: false }}
        />
      </Card>

      <Modal
        title={editingCustomer ? '编辑客户' : '新增客户'}
        open={modalOpen}
        onCancel={closeModal}
        onOk={handleSubmit}
        confirmLoading={submitting}
        width={640}
        destroyOnClose
        maskClosable={false}
        okText={editingCustomer ? '保存修改' : '确认创建'}
        cancelText='取消'
      >
        <Form<CreateCustomerFormValues>
          layout='vertical'
          form={createForm}
          initialValues={{ customerType: '单位客户' }}
        >
          <Form.Item
            name='customerType'
            label='客户类型'
            rules={[
              {
                validator: (_, value: CustomerType) => {
                  if (value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('请选择客户类型'));
                },
              },
            ]}
          >
            <Radio.Group options={CUSTOMER_TYPE_OPTIONS} optionType='button' buttonStyle='solid' />
          </Form.Item>

          <Form.Item
            name='name'
            label='客户名称'
            rules={[{ required: true, message: '请输入客户名称' }]}
          >
            <Input placeholder='请输入客户名称' />
          </Form.Item>

          {showEnterpriseFields && (
            <>
              <Form.Item
                name='nature'
                label='客户性质'
                rules={[
                  ({ getFieldValue }) => ({
                    validator: (_, value) => {
                      if (getFieldValue('customerType') === '单位客户') {
                        if (value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('请选择客户性质'));
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <Select placeholder='请选择客户性质' options={CUSTOMER_NATURE_OPTIONS.map((label) => ({ label, value: label }))} />
              </Form.Item>
              <Form.Item name='legalPerson' label='法人代表'>
                <Input placeholder='请输入法人代表' />
              </Form.Item>
              <Form.Item
                name='creditCode'
                label='统一社会信用代码'
                rules={[
                  ({ getFieldValue }) => ({
                    validator: (_, value) => {
                      if (getFieldValue('customerType') === '单位客户') {
                        if (value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('请输入统一社会信用代码'));
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <Input placeholder='请输入统一社会信用代码' />
              </Form.Item>
            </>
          )}

          {showIndividualFields && (
            <>
              <Form.Item
                name='idNumber'
                label='身份证'
                rules={[
                  ({ getFieldValue }) => ({
                    validator: (_, value) => {
                      if (getFieldValue('customerType') === '自然人') {
                        if (value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('请输入身份证号码'));
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <Input placeholder='请输入身份证号码' />
              </Form.Item>
              <Form.Item
                name='gender'
                label='性别'
                rules={[
                  ({ getFieldValue }) => ({
                    validator: (_, value: string[]) => {
                      if (getFieldValue('customerType') === '自然人') {
                        if (Array.isArray(value) && value.length > 0) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('请选择性别'));
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <Checkbox.Group options={GENDER_OPTIONS} />
              </Form.Item>
            </>
          )}

          <Form.Item name='phone' label='联系电话'>
            <Input placeholder='请输入联系电话' />
          </Form.Item>

          <Form.Item name='email' label='联系邮箱'>
            <Input placeholder='请输入联系邮箱' />
          </Form.Item>

          <Form.Item name='address' label='客户地址'>
            <Input placeholder='请输入客户地址' />
          </Form.Item>

          <Form.Item name='lawyer' label='承办律师'>
            <Input placeholder='请输入承办律师' />
          </Form.Item>

          <Form.Item name='notes' label='备注'>
            <Input.TextArea rows={3} placeholder='请输入备注信息' />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
