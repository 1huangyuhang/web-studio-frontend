import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Table,
  Button,
  Tag,
  message,
  Modal,
  Select,
  Typography,
  Space,
} from 'antd';
import axiosInstance, { apiCache } from '../services/axiosInstance';
import wsService from '../services/websocket';
import EnhancedPagination from '../components/EnhancedPagination';
import AdminTableSection from '../components/AdminTableSection';
import {
  AdminTableRowActions,
  AdminTableActionAux,
  AdminTableActionDelete,
} from '../components/AdminTableRowActions';
import AdminListPageShell from '../components/AdminListPageShell';
import ManagementWriteGate from '../components/ManagementWriteGate';
import { canWriteInManagementUi } from '@/utils/managementWriteAccess';
import { parsePaginatedList } from '../types/api';
import { emitMgmtStatsSummaryRefresh } from '@/utils/managementStatsRefresh';
import AdminListSearchBar from '../components/AdminListSearchBar';
import { adminListTableLocale } from '../utils/adminTableLocale';
import { useDebouncedValue } from '../hooks/useDebouncedValue';

const { Paragraph } = Typography;

/** 与后端 Prisma TicketStatus 一致 */
type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

const TICKET_STATUSES: TicketStatus[] = [
  'OPEN',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
];

const STATUS_LABEL: Record<TicketStatus, string> = {
  OPEN: '待处理',
  IN_PROGRESS: '处理中',
  RESOLVED: '已解决',
  CLOSED: '已关闭',
};

const STATUS_TAG_COLOR: Record<TicketStatus, string> = {
  OPEN: 'default',
  IN_PROGRESS: 'processing',
  RESOLVED: 'success',
  CLOSED: 'default',
};

interface ListRow {
  id: number;
  fullName: string;
  emailAddress: string;
  messageSubject: string;
  status: TicketStatus;
  createdAt: string;
  hasAttachment: boolean;
  attachmentName: string | null;
}

interface Detail {
  id: number;
  fullName: string;
  phoneNumber: string | null;
  emailAddress: string;
  companyName: string | null;
  messageSubject: string;
  askYourQuestion: string;
  status: TicketStatus;
  attachmentName: string | null;
  hasAttachment: boolean;
  createdAt: string;
  updatedAt: string;
}

function parseStatus(raw: unknown): TicketStatus {
  const s = String(raw ?? 'OPEN');
  return TICKET_STATUSES.includes(s as TicketStatus)
    ? (s as TicketStatus)
    : 'OPEN';
}

const SupportTickets: React.FC = () => {
  const [rows, setRows] = useState<ListRow[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | undefined>(
    undefined
  );
  const [listLoading, setListLoading] = useState(false);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput, 400);
  const prevDebounced = useRef(debouncedSearch);
  useEffect(() => {
    if (prevDebounced.current !== debouncedSearch) {
      prevDebounced.current = debouncedSearch;
      setPage(1);
    }
  }, [debouncedSearch]);

  const mapRow = (item: Record<string, unknown>): ListRow => ({
    id: Number(item.id),
    fullName: String(item.fullName ?? ''),
    emailAddress: String(item.emailAddress ?? ''),
    messageSubject: String(item.messageSubject ?? ''),
    status: parseStatus(item.status),
    createdAt:
      typeof item.createdAt === 'string'
        ? item.createdAt
        : String(item.createdAt ?? ''),
    hasAttachment: Boolean(item.hasAttachment),
    attachmentName:
      item.attachmentName != null ? String(item.attachmentName) : null,
  });

  const load = useCallback(async () => {
    setListLoading(true);
    try {
      const st = debouncedSearch.trim();
      const res = await axiosInstance.get('/support-tickets', {
        params: {
          page,
          pageSize,
          ...(statusFilter ? { status: statusFilter } : {}),
          ...(st ? { search: st } : {}),
        },
      });
      const { list, total: t } =
        parsePaginatedList<Record<string, unknown>>(res);
      setRows(list.map(mapRow));
      setTotal(t);
    } catch (e) {
      message.error('加载工单失败');
      console.error(e);
    } finally {
      setListLoading(false);
    }
  }, [page, pageSize, statusFilter, debouncedSearch]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onChange = () => {
      apiCache.clear();
      emitMgmtStatsSummaryRefresh();
      void load();
    };
    wsService.on('supportTicket:created', onChange);
    wsService.on('supportTicket:updated', onChange);
    wsService.on('supportTicket:deleted', onChange);
    return () => {
      wsService.off('supportTicket:created', onChange);
      wsService.off('supportTicket:updated', onChange);
      wsService.off('supportTicket:deleted', onChange);
    };
  }, [load]);

  const openDetail = async (id: number) => {
    try {
      const res = await axiosInstance.get<Detail>(`/support-tickets/${id}`);
      setDetail({ ...res.data, status: parseStatus(res.data.status) });
      setDetailOpen(true);
    } catch {
      message.error('加载详情失败');
    }
  };

  const downloadAttachment = async (id: number, name: string) => {
    try {
      const blob = (await axiosInstance.get(
        `/support-tickets/${id}/attachment`,
        {
          responseType: 'blob',
        }
      )) as unknown as Blob;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name || `attachment-${id}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      message.error('下载失败');
    }
  };

  const setStatus = async (id: number, status: TicketStatus) => {
    try {
      await axiosInstance.patch(`/support-tickets/${id}`, { status });
      message.success('状态已更新');
      emitMgmtStatsSummaryRefresh();
      void load();
      if (detail?.id === id)
        setDetail((prev) => (prev ? { ...prev, status } : null));
    } catch {
      message.error('更新失败');
    }
  };

  const remove = (id: number) => {
    Modal.confirm({
      title: '删除该工单？',
      onOk: async () => {
        await axiosInstance.delete(`/support-tickets/${id}`);
        message.success('已删除');
        apiCache.clear();
        emitMgmtStatsSummaryRefresh();
        setDetailOpen(false);
        setDetail(null);
        void load();
      },
    });
  };

  const columns = [
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (s: TicketStatus) => (
        <Tag color={STATUS_TAG_COLOR[s]}>{STATUS_LABEL[s]}</Tag>
      ),
    },
    { title: '姓名', dataIndex: 'fullName', width: 100 },
    { title: '邮箱', dataIndex: 'emailAddress', ellipsis: true },
    { title: '主题', dataIndex: 'messageSubject', ellipsis: true },
    {
      title: '附件',
      width: 80,
      render: (_: unknown, r: ListRow) => (r.hasAttachment ? '有' : '—'),
    },
    { title: '时间', dataIndex: 'createdAt', width: 180 },
    {
      title: '操作',
      key: 'act',
      width: 160,
      render: (_: unknown, r: ListRow) => (
        <AdminTableRowActions>
          <AdminTableActionAux onClick={() => void openDetail(r.id)}>
            详情
          </AdminTableActionAux>
          {r.hasAttachment && r.attachmentName ? (
            <AdminTableActionAux
              onClick={() => void downloadAttachment(r.id, r.attachmentName!)}
            >
              下载
            </AdminTableActionAux>
          ) : null}
          <ManagementWriteGate>
            <AdminTableActionDelete onClick={() => remove(r.id)} />
          </ManagementWriteGate>
        </AdminTableRowActions>
      ),
    },
  ];

  const hasFilters = Boolean(debouncedSearch.trim() || statusFilter);

  return (
    <AdminListPageShell
      title="帮助工单"
      description="前台帮助中心提交的工单，可查看详情、更新状态或删除；支持姓名、邮箱、主题、问题描述等关键词检索。"
      filter={
        <div className="admin-page__filter">
          <Space wrap align="center" size="middle">
            <AdminListSearchBar
              placeholder="搜索姓名、邮箱、主题、问题描述…"
              value={searchInput}
              onChange={setSearchInput}
              totalCount={total}
            />
            <Select
              allowClear
              placeholder="按状态筛选"
              style={{ width: 200, maxWidth: '100%' }}
              value={statusFilter}
              onChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
              options={TICKET_STATUSES.map((value) => ({
                value,
                label: STATUS_LABEL[value],
              }))}
            />
          </Space>
        </div>
      }
    >
      <AdminTableSection
        pagination={
          <EnhancedPagination
            currentPage={page}
            pageSize={pageSize}
            total={total}
            onChange={(p, ps) => {
              setPage(p);
              setPageSize(ps);
            }}
          />
        }
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={rows}
          pagination={false}
          loading={listLoading}
          scroll={{ x: 960 }}
          locale={adminListTableLocale(hasFilters)}
        />
      </AdminTableSection>

      <Modal
        title={`工单 #${detail?.id ?? ''}`}
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={640}
        destroyOnClose
      >
        {detail ? (
          <>
            <p>
              <strong>状态：</strong>
              {canWriteInManagementUi() ? (
                <Select
                  size="small"
                  value={detail.status}
                  style={{ width: 140, marginLeft: 8 }}
                  onChange={(v) => void setStatus(detail.id, v as TicketStatus)}
                  options={TICKET_STATUSES.map((value) => ({
                    value,
                    label: STATUS_LABEL[value],
                  }))}
                />
              ) : (
                <Tag
                  style={{ marginLeft: 8 }}
                  color={STATUS_TAG_COLOR[detail.status]}
                >
                  {STATUS_LABEL[detail.status]}
                </Tag>
              )}
            </p>
            <p>
              <strong>姓名：</strong> {detail.fullName}
            </p>
            <p>
              <strong>邮箱：</strong> {detail.emailAddress}
            </p>
            <p>
              <strong>电话：</strong> {detail.phoneNumber || '—'}
            </p>
            <p>
              <strong>公司：</strong> {detail.companyName || '—'}
            </p>
            <p>
              <strong>主题：</strong> {detail.messageSubject}
            </p>
            <Paragraph>
              <strong>问题描述：</strong>
            </Paragraph>
            <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
              {detail.askYourQuestion}
            </Paragraph>
            {detail.hasAttachment ? (
              <Button
                type="primary"
                onClick={() =>
                  void downloadAttachment(
                    detail.id,
                    detail.attachmentName || `ticket-${detail.id}`
                  )
                }
              >
                下载附件
              </Button>
            ) : null}
          </>
        ) : null}
      </Modal>
    </AdminListPageShell>
  );
};

export default SupportTickets;
