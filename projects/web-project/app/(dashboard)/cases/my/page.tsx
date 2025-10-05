'use client';

import {
  Button,
  Card,
  Dropdown,
  Form,
  Input,
  Progress,
  Select,
  Space,
  Table,
  Tooltip,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import React, { useCallback, useMemo, useState } from 'react';
import { EllipsisOutlined, PlusOutlined } from '@ant-design/icons';

import CaseDetailModal from '../../../../components/cases/CaseDetailModal';
import {
  CASE_STAGES,
  URGENCY_LEVELS,
  type CaseRecord,
  type CaseStage,
  type UrgencyLevel,
} from '../../../../components/cases/constants';
import { useDashboardHeaderActions } from '../../../../components/dashboard/DashboardShell';

const INITIAL_CASES: CaseRecord[] = [
  {
    caseNo: '2024MS001',
    reason: '民事纠纷',
    client: '华南智造集团',
    parties: ['张三', '李四'],
    lawyer: '王雪',
    stage: '证据交换',
    urgency: '紧急',
    acceptDate: '2024-04-12',
    description: '客户方与供应商之间存在重大质量争议，需紧急收集证据并准备庭审材料。',
    materials: ['立案材料汇总.pdf', '证据照片.zip', '质检报告.docx'],
  },
  {
    caseNo: '2024MS002',
    reason: '劳动仲裁',
    client: '北辰能源投资',
    parties: ['刘明'],
    lawyer: '陈楠',
    stage: '调解',
    urgency: '普通',
    acceptDate: '2024-03-03',
    description: '涉及拖欠补偿金，当前进入调解阶段，需准备双方最新沟通记录。',
    materials: ['劳动合同.pdf', '调解会议纪要.docx'],
  },
  {
    caseNo: '2024MS003',
    reason: '知识产权',
    client: '星河科技',
    parties: ['王蕾', '未来创新有限公司'],
    lawyer: '赵云',
    stage: '庭审',
    urgency: '特急',
    acceptDate: '2024-02-22',
    description: '专利侵权案件，下周即将开庭，需要完善答辩意见书并协调技术专家出庭。',
    materials: ['专利证书.pdf', '侵权比对图.xlsx', '答辩意见初稿.docx'],
  },
  {
    caseNo: '2023MS118',
    reason: '合同纠纷',
    client: '盛世地产',
    parties: ['赵六'],
    lawyer: '李航',
    stage: '执行',
    urgency: '普通',
    acceptDate: '2023-11-18',
    description: '合同违约案件，目前进入执行阶段，需跟进法院执行进度并补充资产信息。',
    materials: ['合同原件扫描.pdf', '执行申请书.docx'],
  },
];

const createEmptyCase = (): CaseRecord => ({
  caseNo: '',
  reason: '',
  client: '',
  parties: [],
  lawyer: '',
  stage: CASE_STAGES[0],
  urgency: URGENCY_LEVELS[0],
  acceptDate: dayjs().format('YYYY-MM-DD'),
  description: '',
  materials: [],
});

type FilterValues = {
  party: string;
  stage?: CaseStage;
  urgency?: UrgencyLevel;
};

const DEFAULT_FILTERS: FilterValues = {
  party: '',
  stage: undefined,
  urgency: undefined,
};

export default function MyCasesPage() {
  const [form] = Form.useForm<FilterValues>();
  const [caseData, setCaseData] = useState<CaseRecord[]>(INITIAL_CASES);
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTERS);
  const [selectedCase, setSelectedCase] = useState<CaseRecord | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftCaseNo, setDraftCaseNo] = useState('');
  const [draftReason, setDraftReason] = useState('');
  const [draftClient, setDraftClient] = useState('');
  const [draftParties, setDraftParties] = useState('');
  const [draftStage, setDraftStage] = useState<CaseStage>(CASE_STAGES[0]);
  const [draftUrgency, setDraftUrgency] = useState<UrgencyLevel>(URGENCY_LEVELS[0]);
  const [draftLawyer, setDraftLawyer] = useState('');
  const [draftAcceptDate, setDraftAcceptDate] = useState<Dayjs | null>(dayjs());
  const [draftDescription, setDraftDescription] = useState('');
  const [draftMaterials, setDraftMaterials] = useState<UploadFile[]>([]);
  const [loggingAction, setLoggingAction] = useState<string | null>(null);

  const filteredCases = useMemo(() => {
    return caseData.filter((item) => {
      if (filters.party && !item.parties.some((name) => name.includes(filters.party.trim()))) {
        return false;
      }
      if (filters.stage && item.stage !== filters.stage) {
        return false;
      }
      if (filters.urgency && item.urgency !== filters.urgency) {
        return false;
      }
      return true;
    });
  }, [caseData, filters]);

  const openCaseDetail = useCallback((record: CaseRecord) => {
    setSelectedCase(record);
    setIsCreating(false);
    setDraftCaseNo(record.caseNo ?? '');
    setDraftReason(record.reason ?? '');
    setDraftClient(record.client ?? '');
    setDraftParties(record.parties.join('\n'));
    setDraftStage(record.stage);
    setDraftUrgency(record.urgency);
    setDraftLawyer(record.lawyer ?? '');
    setDraftAcceptDate(dayjs(record.acceptDate));
    setDraftDescription(record.description ?? '');
    setDraftMaterials(
      record.materials.map((name, index) => ({
        uid: `${record.caseNo}-${index}`,
        name,
        status: 'done',
        url: '#',
      })),
    );
    setIsEditing(false);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedCase(null);
    setIsCreating(false);
    setIsEditing(false);
  }, []);

  const handleCreateNew = useCallback(() => {
    const emptyCase = createEmptyCase();
    setSelectedCase(emptyCase);
    setIsCreating(true);
    setIsEditing(true);
    setDraftCaseNo('');
    setDraftReason('');
    setDraftClient('');
    setDraftParties('');
    setDraftStage(emptyCase.stage);
    setDraftUrgency(emptyCase.urgency);
    setDraftLawyer('');
    setDraftAcceptDate(dayjs(emptyCase.acceptDate));
    setDraftDescription('');
    setDraftMaterials([]);
  }, []);

  const headerActionNode = useMemo(
    () => (
      <Button type='primary' icon={<PlusOutlined />} onClick={handleCreateNew}>
        新增案件
      </Button>
    ),
    [handleCreateNew],
  );

  useDashboardHeaderActions(headerActionNode);

  const handleSearch = (values: FilterValues) => {
    setFilters({
      party: values.party?.trim() ?? '',
      stage: values.stage,
      urgency: values.urgency,
    });
  };

  const handleReset = () => {
    form.resetFields();
    setFilters(DEFAULT_FILTERS);
  };

  const handleSaveEdit = () => {
    const normalizedParties = draftParties
      .split(/[\n,，、]+/)
      .map((item) => item.trim())
      .filter(Boolean);

    const normalizedMaterials = draftMaterials
      .map((file) => file.name?.trim() ?? '')
      .filter(Boolean);
    const acceptDateValue = draftAcceptDate?.format('YYYY-MM-DD') ?? dayjs().format('YYYY-MM-DD');

    if (isCreating) {
      const newCase: CaseRecord = {
        caseNo: draftCaseNo.trim(),
        reason: draftReason.trim(),
        client: draftClient.trim(),
        parties: normalizedParties,
        lawyer: draftLawyer.trim(),
        stage: draftStage,
        urgency: draftUrgency,
        acceptDate: acceptDateValue,
        description: draftDescription.trim(),
        materials: normalizedMaterials,
      };

      if (!newCase.caseNo) {
        message.warning('请填写案号');
        return;
      }

      setCaseData((prev) => [newCase, ...prev]);
      setSelectedCase(newCase);
      setDraftCaseNo(newCase.caseNo);
      setDraftReason(newCase.reason);
      setDraftClient(newCase.client);
      setDraftParties(newCase.parties.join('\n'));
      setDraftStage(newCase.stage);
      setDraftUrgency(newCase.urgency);
      setDraftLawyer(newCase.lawyer);
      setDraftAcceptDate(dayjs(newCase.acceptDate));
      setDraftDescription(newCase.description);
      setDraftMaterials(
        normalizedMaterials.map((name, index) => ({
          uid: `${newCase.caseNo}-${index}`,
          name,
          status: 'done',
          url: '#',
        })),
      );
      setIsCreating(false);
      setIsEditing(false);
      message.success('新案件已创建');
      return;
    }

    if (!selectedCase) return;

    const updatedCase = {
      ...selectedCase,
      reason: draftReason.trim(),
      client: draftClient.trim(),
      parties: normalizedParties,
      stage: draftStage,
      urgency: draftUrgency,
      description: draftDescription.trim(),
      materials: normalizedMaterials,
    } satisfies CaseRecord;

    setCaseData((prev) =>
      prev.map((item) => (item.caseNo === selectedCase.caseNo ? updatedCase : item)),
    );
    setSelectedCase(updatedCase);
    setDraftReason(updatedCase.reason);
    setDraftClient(updatedCase.client);
    setDraftParties(updatedCase.parties.join('\n'));
    setDraftStage(updatedCase.stage);
    setDraftUrgency(updatedCase.urgency);
    setDraftLawyer(updatedCase.lawyer);
    setDraftAcceptDate(dayjs(updatedCase.acceptDate));
    setDraftDescription(updatedCase.description);
    setDraftMaterials(
      normalizedMaterials.map((name, index) => ({
        uid: `${updatedCase.caseNo}-${index}`,
        name,
        status: 'done',
        url: '#',
      })),
    );
    setIsEditing(false);
    message.success('案件信息已更新');
  };

  const handleCancelEdit = () => {
    if (isCreating) {
      closeModal();
      return;
    }
    if (!selectedCase) return;
    setDraftCaseNo(selectedCase.caseNo ?? '');
    setDraftReason(selectedCase.reason ?? '');
    setDraftClient(selectedCase.client ?? '');
    setDraftParties(selectedCase.parties.join('\n'));
    setDraftStage(selectedCase.stage);
    setDraftUrgency(selectedCase.urgency);
    setDraftLawyer(selectedCase.lawyer ?? '');
    setDraftAcceptDate(dayjs(selectedCase.acceptDate));
    setDraftDescription(selectedCase.description ?? '');
    setDraftMaterials(
      selectedCase.materials.map((name, index) => ({
        uid: `${selectedCase.caseNo}-${index}`,
        name,
        status: 'done',
        url: '#',
      })),
    );
    setIsEditing(false);
  };

  const handleOperation = useCallback((action: string, record: CaseRecord) => {
    setLoggingAction(action);
    setTimeout(() => {
      setLoggingAction(null);
      message.info(`${action} 功能即将上线（案号：${record.caseNo}）`);
    }, 300);
  }, []);

  const handleMaterialDownload = useCallback((material: string) => {
    message.info(`正在准备下载：${material}`);
  }, []);

  const handleMaterialUploadChange = useCallback((fileList: UploadFile[]) => {
    setDraftMaterials(
      fileList.map((file) => ({
        ...file,
        status: 'done',
        url: file.url ?? '#',
      })),
    );
  }, []);

  const columns: ColumnsType<CaseRecord> = useMemo(
    () => [
      {
        title: '案号',
        dataIndex: 'caseNo',
        key: 'caseNo',
        fixed: 'left',
        width: 140,
        render: (_, record) => (
          <Typography.Link onClick={() => openCaseDetail(record)}>{record.caseNo}</Typography.Link>
        ),
      },
      {
        title: '案由',
        dataIndex: 'reason',
        key: 'reason',
      },
      {
        title: '委托人',
        dataIndex: 'client',
        key: 'client',
      },
      {
        title: '当事人',
        dataIndex: 'parties',
        key: 'parties',
        render: (parties: CaseRecord['parties']) => parties.join('、'),
      },
      {
        title: '承办律师',
        dataIndex: 'lawyer',
        key: 'lawyer',
      },
      {
        title: '案件进度',
        dataIndex: 'stage',
        key: 'stage',
        width: 260,
        render: (_, record) => {
          const currentIndex = CASE_STAGES.indexOf(record.stage);
          const percent =
            currentIndex >= 0
              ? Math.round(((currentIndex + 1) / CASE_STAGES.length) * 100)
              : 0;
          return (
            <Space direction='vertical' size={4} style={{ minWidth: 240 }}>
              <Progress steps={CASE_STAGES.length} percent={percent} showInfo={false} status='active' />
              <Typography.Text type='secondary'>当前进度：{record.stage}</Typography.Text>
            </Space>
          );
        },
      },
      {
        title: '受理时间',
        dataIndex: 'acceptDate',
        key: 'acceptDate',
        sorter: (a, b) => dayjs(a.acceptDate).valueOf() - dayjs(b.acceptDate).valueOf(),
        render: (value: string) => dayjs(value).format('YYYY年MM月DD日'),
      },
      {
        title: '操作',
        key: 'actions',
        fixed: 'right',
        width: 120,
        render: (_, record) => {
          const items: MenuProps['items'] = [
            {
              key: 'supplement',
              label: '补充结案文件',
              onClick: () => handleOperation('补充结案文件', record),
            },
            {
              key: 'archive',
              label: '案件归档',
              onClick: () => handleOperation('案件归档', record),
            },
            {
              key: 'transfer',
              label: '转交',
              onClick: () => handleOperation('转交', record),
            },
          ];
          return (
            <Dropdown menu={{ items }} trigger={['click']} disabled={loggingAction !== null}>
              <Tooltip title='操作'>
                <Button
                  type='text'
                  icon={<EllipsisOutlined />}
                  disabled={loggingAction !== null}
                  aria-label='案件操作'
                />
              </Tooltip>
            </Dropdown>
          );
        },
      },
    ],
    [handleOperation, loggingAction, openCaseDetail],
  );

  const canEditRestrictedFields = isCreating;
  const modalVisible = Boolean(selectedCase);

  return (
    <div style={{ padding: '24px 0' }}>
      <Space direction='vertical' size='large' style={{ width: '100%' }}>
        <Card>
          <Form
            form={form}
            layout='inline'
            onFinish={handleSearch}
            initialValues={DEFAULT_FILTERS}
            onReset={handleReset}
            style={{
              rowGap: 16,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              columnGap: 16,
            }}
          >
            <Form.Item name='party' label='当事人'>
              <Input allowClear placeholder='请输入当事人姓名' style={{ width: 220 }} />
            </Form.Item>
            <Form.Item name='stage' label='案件进度'>
              <Select
                allowClear
                placeholder='请选择阶段'
                style={{ width: 180 }}
                options={CASE_STAGES.map((stage) => ({ label: stage, value: stage }))}
              />
            </Form.Item>
            <Form.Item name='urgency' label='紧急程度'>
              <Select
                allowClear
                placeholder='请选择紧急程度'
                style={{ width: 160 }}
                options={URGENCY_LEVELS.map((level) => ({ label: level, value: level }))}
              />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type='primary' htmlType='submit'>
                  检索
                </Button>
                <Button htmlType='reset'>重置</Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>

        <Card styles={{ body: { padding: 0 } }}>
          <Table
            rowKey='caseNo'
            columns={columns}
            dataSource={filteredCases}
            pagination={{ pageSize: 8, showSizeChanger: false }}
            scroll={{ x: 1200 }}
          />
        </Card>
      </Space>

      <CaseDetailModal
        open={modalVisible}
        isCreating={isCreating}
        isEditing={isEditing}
        canEditRestrictedFields={canEditRestrictedFields}
        selectedCase={selectedCase}
        draftCaseNo={draftCaseNo}
        draftReason={draftReason}
        draftClient={draftClient}
        draftParties={draftParties}
        draftStage={draftStage}
        draftUrgency={draftUrgency}
        draftLawyer={draftLawyer}
        draftAcceptDate={draftAcceptDate}
        draftDescription={draftDescription}
        draftMaterials={draftMaterials}
        onChangeCaseNo={setDraftCaseNo}
        onChangeReason={setDraftReason}
        onChangeClient={setDraftClient}
        onChangeParties={setDraftParties}
        onChangeStage={setDraftStage}
        onChangeUrgency={setDraftUrgency}
        onChangeLawyer={setDraftLawyer}
        onChangeAcceptDate={setDraftAcceptDate}
        onChangeDescription={setDraftDescription}
        onMaterialChange={handleMaterialUploadChange}
        onMaterialRemove={(uid) =>
          setDraftMaterials((prev) => prev.filter((item) => item.uid !== uid))
        }
        onMaterialDownload={handleMaterialDownload}
        onCancel={closeModal}
        onSave={handleSaveEdit}
        onCancelEdit={handleCancelEdit}
        onStartEdit={() => setIsEditing(true)}
      />
    </div>
  );
}
