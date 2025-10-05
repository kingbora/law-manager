'use client';

import {
  Button,
  DatePicker,
  Descriptions,
  Input,
  List,
  Modal,
  Select,
  Space,
  Typography,
  Upload,
} from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { UploadOutlined } from '@ant-design/icons';
import React from 'react';

import {
  CASE_STAGES,
  URGENCY_LEVELS,
  type CaseRecord,
  type CaseStage,
  type UrgencyLevel,
} from './constants';

type CaseDetailModalProps = {
  open: boolean;
  isCreating: boolean;
  isEditing: boolean;
  canEditRestrictedFields: boolean;
  selectedCase: CaseRecord | null;
  draftCaseNo: string;
  draftReason: string;
  draftClient: string;
  draftParties: string;
  draftStage: CaseStage;
  draftUrgency: UrgencyLevel;
  draftLawyer: string;
  draftAcceptDate: Dayjs | null;
  draftDescription: string;
  draftMaterials: UploadFile[];
  onChangeCaseNo: (value: string) => void;
  onChangeReason: (value: string) => void;
  onChangeClient: (value: string) => void;
  onChangeParties: (value: string) => void;
  onChangeStage: (value: CaseStage) => void;
  onChangeUrgency: (value: UrgencyLevel) => void;
  onChangeLawyer: (value: string) => void;
  onChangeAcceptDate: (value: Dayjs | null) => void;
  onChangeDescription: (value: string) => void;
  onMaterialChange: (materials: UploadFile[]) => void;
  onMaterialRemove: (uid: string) => void;
  onMaterialDownload: (material: string) => void;
  onCancel: () => void;
  onSave: () => void;
  onCancelEdit: () => void;
  onStartEdit: () => void;
};

export default function CaseDetailModal(props: CaseDetailModalProps) {
  const {
    open,
    isCreating,
    isEditing,
    canEditRestrictedFields,
    selectedCase,
    draftCaseNo,
    draftReason,
    draftClient,
    draftParties,
    draftStage,
    draftUrgency,
    draftLawyer,
    draftAcceptDate,
    draftDescription,
    draftMaterials,
    onChangeCaseNo,
    onChangeReason,
    onChangeClient,
    onChangeParties,
    onChangeStage,
    onChangeUrgency,
    onChangeLawyer,
    onChangeAcceptDate,
    onChangeDescription,
    onMaterialChange,
    onMaterialRemove,
    onMaterialDownload,
    onCancel,
    onSave,
    onCancelEdit,
    onStartEdit,
  } = props;

  const isFormEditable = isCreating || isEditing;
  const modalTitle = isCreating ? '新增案件' : selectedCase?.caseNo ?? '案件详情';

  return (
    <Modal
      open={open}
      title={modalTitle}
      onCancel={onCancel}
      width={720}
      destroyOnClose
      maskClosable={false}
      footer={
        selectedCase || isCreating
          ? isFormEditable
            ? (
                <Space>
                  <Button onClick={onCancelEdit}>取消</Button>
                  <Button type='primary' onClick={onSave}>
                    {isCreating ? '创建' : '保存'}
                  </Button>
                </Space>
              )
            : (
                <Button type='primary' onClick={onStartEdit}>
                  编辑
                </Button>
              )
          : null
      }
    >
      {selectedCase || isCreating ? (
        <Space direction='vertical' size='large' style={{ width: '100%' }}>
          <Descriptions column={2} bordered size='small'>
            <Descriptions.Item label='案号'>
              {canEditRestrictedFields ? (
                <Input
                  value={draftCaseNo}
                  onChange={(event) => onChangeCaseNo(event.target.value)}
                  placeholder='请输入案号'
                />
              ) : (
                selectedCase?.caseNo ?? draftCaseNo
              )}
            </Descriptions.Item>
            <Descriptions.Item label='案由'>
              {isFormEditable ? (
                <Input
                  value={draftReason}
                  onChange={(event) => onChangeReason(event.target.value)}
                  placeholder='请输入案由'
                />
              ) : (
                selectedCase?.reason ?? draftReason
              )}
            </Descriptions.Item>
            <Descriptions.Item label='委托人'>
              {isFormEditable ? (
                <Input
                  value={draftClient}
                  onChange={(event) => onChangeClient(event.target.value)}
                  placeholder='请输入委托人'
                />
              ) : (
                selectedCase?.client ?? draftClient
              )}
            </Descriptions.Item>
            <Descriptions.Item label='承办律师'>
              {canEditRestrictedFields ? (
                <Input
                  value={draftLawyer}
                  onChange={(event) => onChangeLawyer(event.target.value)}
                  placeholder='请输入承办律师'
                />
              ) : (
                selectedCase?.lawyer ?? draftLawyer
              )}
            </Descriptions.Item>
            <Descriptions.Item label='当前进度'>
              {isFormEditable ? (
                <Select<CaseStage>
                  value={draftStage}
                  onChange={onChangeStage}
                  style={{ minWidth: 160 }}
                  options={CASE_STAGES.map((stage) => ({ label: stage, value: stage }))}
                />
              ) : (
                selectedCase?.stage ?? draftStage
              )}
            </Descriptions.Item>
            <Descriptions.Item label='当事人' span={2}>
              {isFormEditable ? (
                <Input.TextArea
                  rows={3}
                  value={draftParties}
                  onChange={(event) => onChangeParties(event.target.value)}
                  placeholder='每行一位当事人'
                />
              ) : selectedCase ? selectedCase.parties.join('、') : draftParties}
            </Descriptions.Item>
            <Descriptions.Item label='受理时间'>
              {canEditRestrictedFields ? (
                <DatePicker
                  value={draftAcceptDate}
                  onChange={onChangeAcceptDate}
                  style={{ width: '100%' }}
                  format='YYYY-MM-DD'
                />
              ) : (
                selectedCase?.acceptDate
                  ? dayjs(selectedCase.acceptDate).format('YYYY年MM月DD日')
                  : draftAcceptDate?.format('YYYY年MM月DD日') ?? '--'
              )}
            </Descriptions.Item>
            <Descriptions.Item label='紧急程度'>
              {isFormEditable ? (
                <Select<UrgencyLevel>
                  value={draftUrgency}
                  onChange={onChangeUrgency}
                  style={{ minWidth: 140 }}
                  options={URGENCY_LEVELS.map((level) => ({ label: level, value: level }))}
                />
              ) : (
                selectedCase?.urgency ?? draftUrgency
              )}
            </Descriptions.Item>
          </Descriptions>

          <div>
            <Typography.Title level={5}>案件详细说明</Typography.Title>
            {isFormEditable ? (
              <Input.TextArea
                rows={4}
                value={draftDescription}
                onChange={(event) => onChangeDescription(event.target.value)}
                placeholder='请输入案件详细说明'
              />
            ) : (
              <Typography.Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                {selectedCase?.description || draftDescription || '暂无说明'}
              </Typography.Paragraph>
            )}
          </div>

          <div>
            <Typography.Title level={5}>案件材料清单</Typography.Title>
            {isFormEditable ? (
              <Space direction='vertical' style={{ width: '100%' }}>
                <Upload
                  multiple
                  fileList={draftMaterials}
                  beforeUpload={() => false}
                  onChange={({ fileList }) => onMaterialChange(fileList)}
                  onRemove={(file) => {
                    onMaterialRemove(file.uid);
                    return true;
                  }}
                >
                  <Button icon={<UploadOutlined />}>选择文件</Button>
                </Upload>
                <Typography.Text type='secondary'>支持上传多个材料文件，提交后自动保存列表。</Typography.Text>
              </Space>
            ) : selectedCase && selectedCase.materials.length > 0 ? (
              <List
                size='small'
                bordered
                dataSource={selectedCase.materials}
                renderItem={(item) => (
                  <List.Item>
                    <Typography.Link onClick={() => onMaterialDownload(item)}>
                      {item}
                    </Typography.Link>
                  </List.Item>
                )}
              />
            ) : (
              <Typography.Text type='secondary'>暂无材料记录</Typography.Text>
            )}
          </div>
        </Space>
      ) : null}
    </Modal>
  );
}
