"use client";

import { useMemo, useEffect, useState, useCallback, useId } from "react";
import moment from "moment";
import type {
  EDapemStatus,
  JenisPembiayaan,
  Sumdan,
} from "../../../generated/prisma/client";
import {
  App,
  Button,
  Card,
  DatePicker,
  Input,
  Modal,
  Progress,
  Select,
  Table,
  TableProps,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { HookAPI } from "antd/es/modal/useModal";
import {
  ArrowRightOutlined,
  BankOutlined,
  EditOutlined,
  FileFilled,
  FileProtectOutlined,
  FolderOutlined,
  PayCircleOutlined,
  PlusCircleOutlined,
  PrinterOutlined,
  SwapOutlined,
} from "@ant-design/icons";

import { FormInput, ViewFiles } from "@/components";
import { useUser } from "@/components/UserContext";
import { useAccess } from "@/libs/Permission";
import {
  ExportToExcel,
  FilterData,
  GetBerkasStatusTag,
  GetDroppingStatusTag,
  MappingToExcelDapem,
} from "@/components/utils/CompUtils";
import { DetailDapem } from "@/components/utils/LayoutUtils";
import {
  GetDetailDapem,
  IDRFormat,
  IDRToNumber,
} from "@/components/utils/PembiayaanUtil";
import {
  IActionTable,
  IAgentFronting,
  ICashDesc,
  IDapem,
  IPageProps,
  IPayOffice,
  IViewFiles,
} from "@/libs/IInterfaces";
import dayjs from "dayjs";

const { Paragraph } = Typography;
const { RangePicker } = DatePicker;

const DEFAULT_CASH_DESC: ICashDesc = {
  amount: 0,
  date: new Date(),
  desc: "",
  file: "",
};

const GENERAL_STATUS_OPTIONS = [
  { label: "DRAFT", value: "DRAFT" },
  { label: "PENDING", value: "PENDING" },
  { label: "PROSES", value: "PROSES" },
  { label: "SELESAI", value: "DISETUJUI" },
];

export default function Page() {
  const [pageProps, setPageProps] = useState<IPageProps<IDapem>>({
    page: 1,
    limit: 100,
    total: 0,
    data: [],
    search: "",
    sumdanId: "",
    jenisPembiayaanId: "",
    dropping_status: "",
    takeover_status: "",
    flagging_status: "",
    mutasi_status: "",
    cash_status: "",
    payOfficeId: "",
    agentFrontingId: "",
    backdate: "",
  });

  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<IActionTable<IDapem>>({
    upsert: false,
    delete: false,
    proses: false,
    selected: undefined,
  });

  const [sumdans, setSumdans] = useState<Sumdan[]>([]);
  const [jeniss, setJeniss] = useState<JenisPembiayaan[]>([]);
  const [agents, setAgents] = useState<IAgentFronting[]>([]);
  const [pays, setPays] = useState<IPayOffice[]>([]);
  const [views, setViews] = useState<IViewFiles>({ open: false, data: [] });

  const { modal } = App.useApp();
  const currentPath =
    typeof window !== "undefined" ? window.location.pathname : "/tmftb";
  const { hasAccess } = useAccess(currentPath);
  const user = useUser();

  // Membungkus fetch data utama dengan useCallback
  const getData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: pageProps.page.toString(),
      limit: pageProps.limit.toString(),
      approv_status: "DISETUJUI",
      includes: "true",
      ...(pageProps.search && { search: pageProps.search }),
      ...(pageProps.sumdanId && { sumdanId: pageProps.sumdanId }),
      ...(pageProps.jenisPembiayaanId && {
        jenisPembiayaanId: pageProps.jenisPembiayaanId,
      }),
      ...(pageProps.takeover_status && {
        takeover_status: pageProps.takeover_status,
      }),
      ...(pageProps.mutasi_status && {
        mutasi_status: pageProps.mutasi_status,
      }),
      ...(pageProps.flagging_status && {
        flagging_status: pageProps.flagging_status,
      }),
      ...(pageProps.cash_status && { cash_status: pageProps.cash_status }),
      ...(pageProps.payOfficeId && { payOfficeId: pageProps.payOfficeId }),
      ...(pageProps.agentFrontingId && {
        agentFrontingId: pageProps.agentFrontingId,
      }),
      ...(pageProps.dropping_status && {
        dropping_status: pageProps.dropping_status,
      }),
      ...(pageProps.backdate && { backdate: pageProps.backdate }),
    });

    try {
      const res = await fetch(`/api/dapem?${params.toString()}`);
      const json = await res.json();
      setPageProps((prev) => ({
        ...prev,
        data: json.data || [],
        total: json.total || 0,
      }));
    } catch (error) {
      console.error("Failed to fetch dapem data:", error);
    } finally {
      setLoading(false);
    }
  }, [
    pageProps.page,
    pageProps.limit,
    pageProps.search,
    pageProps.sumdanId,
    pageProps.jenisPembiayaanId,
    pageProps.dropping_status,
    pageProps.takeover_status,
    pageProps.mutasi_status,
    pageProps.cash_status,
    pageProps.flagging_status,
    pageProps.agentFrontingId,
    pageProps.payOfficeId,
    pageProps.backdate,
  ]);

  // Debounce data fetching
  useEffect(() => {
    const timeout = setTimeout(() => {
      getData();
    }, 200);
    return () => clearTimeout(timeout);
  }, [getData]);

  // Fetch data master sekali saat mounting
  useEffect(() => {
    let isMounted = true;
    const fetchMasterData = async () => {
      try {
        const [resSumdan, resJenis, resPay, resAgent] = await Promise.all([
          fetch("/api/sumdan?limit=500").then((r) => r.json()),
          fetch("/api/jenis?limit=50").then((r) => r.json()),
          fetch("/api/payoffice?limit=100").then((r) => r.json()),
          fetch("/api/agent?limit=100").then((r) => r.json()),
        ]);

        if (isMounted) {
          setSumdans(resSumdan.data || []);
          setJeniss(resJenis.data || []);
          setPays(resPay.data || []);
          setAgents(resAgent.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch master data:", error);
      }
    };

    fetchMasterData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Transformasi data untuk Select option dimemokan agar tidak di-map terus-menerus
  const sumdanOptions = useMemo(
    () => sumdans.map((s) => ({ label: s.code, value: s.id })),
    [sumdans],
  );
  const jenisOptions = useMemo(
    () => jeniss.map((s) => ({ label: s.name, value: s.id })),
    [jeniss],
  );
  const payOptions = useMemo(
    () => pays.map((s) => ({ label: s.code || s.name, value: s.id })),
    [pays],
  );
  const agentOptions = useMemo(
    () => agents.map((s) => ({ label: s.name, value: s.id })),
    [agents],
  );

  // Definisi kolom tabel dimemokan agar referensinya tetap sama
  const columns: TableProps<IDapem>["columns"] = useMemo(
    () => [
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
        render: (_, record, index) => (
          <div>
            <div>{(pageProps.page - 1) * pageProps.limit + index + 1}</div>
            <div className="opacity-80 text-xs">{record.id}</div>
          </div>
        ),
      },
      {
        title: "Pemohon",
        dataIndex: "pemohon",
        key: "pemohon",
        fixed:
          typeof window !== "undefined" && window.innerWidth < 600
            ? false
            : true,
        render: (_, record) => (
          <div>
            <p className="font-bold">{record.Debitur?.fullname}</p>
            <div className="text-xs opacity-80">
              <p>@{record.Debitur?.nopen}</p>
            </div>
          </div>
        ),
      },
      {
        title: "Permohonan",
        dataIndex: "permohonan",
        key: "permohonan",
        render: (_, record) => (
          <div>
            <div>
              Plafond : <Tag color="blue">{IDRFormat(record.plafond)}</Tag>
            </div>
            <div>
              Tenor : <Tag color="blue">{record.tenor} Bulan</Tag>
            </div>
          </div>
        ),
      },
      {
        title: "Angsuran",
        dataIndex: "angsuran",
        key: "angsuran",
        render: (_, record) => {
          const detail = GetDetailDapem(record);
          return (
            <div className="text-xs">
              <div className="flex gap-2 items-center">
                <Tag color="blue">
                  <BankOutlined /> {IDRFormat(detail.detail.angsuran_sumdan)}
                </Tag>
                <Tag color="blue">
                  {IDRFormat(detail.angsuran - detail.detail.angsuran_sumdan)}
                </Tag>
              </div>
              <div className="flex justify-center mt-1">
                <Tag color="blue">{IDRFormat(detail.angsuran)}</Tag>
              </div>
            </div>
          );
        },
      },
      {
        title: "Produk Pembiayaan",
        dataIndex: "produk",
        key: "produk",
        render: (_, record) => (
          <div>
            <p>
              {record.ProdukPembiayaan?.name}{" "}
              <span>({record.ProdukPembiayaan?.Sumdan?.code})</span>
            </p>
            <p className="opacity-80 text-xs">{record.JenisPembiayaan?.name}</p>
          </div>
        ),
      },
      {
        title: "AO & UP",
        dataIndex: "aoup",
        key: "aoup",
        render: (_, record) => {
          const ao = record.AO || record.AOCabang || record.AOArea;
          return (
            <div>
              <div>{ao?.fullname}</div>
              <div className="text-xs opacity-80">
                {ao?.Cabang?.name} | {ao?.Cabang?.Area?.name}
              </div>
            </div>
          );
        },
      },
      {
        title: "Agent Fronting",
        dataIndex: "agentFrontingId",
        key: "agentFrontingId",
        render: (_, record) => (
          <div>
            <div>{record.AgentFronting?.name}</div>
            <div className="text-xs opacity-80">
              {record.AgentFronting?.code}
            </div>
          </div>
        ),
      },
      {
        title: "Nomor Akad",
        dataIndex: "dataakad",
        key: "dataakad",
        render: (_, record) => (
          <div>
            {record.no_contract && <div>{record.no_contract}</div>}
            {record.date_contract && (
              <div className="text-xs opacity-80">
                {moment(record.date_contract).format("DD/MM/YYYY")}
              </div>
            )}
          </div>
        ),
      },
      {
        title: "Mutasi & Takeover",
        dataIndex: "produk",
        key: "produk_mutasi",
        width: 350,
        render: (_, record) => (
          <div>
            {record.JenisPembiayaan?.status_mutasi && (
              <div style={{ fontSize: 9 }}>
                <SwapOutlined />{" "}
                <Tag style={{ fontSize: 9 }} color="red">
                  {record.PrevPayOffice.code}
                </Tag>{" "}
                <ArrowRightOutlined style={{ fontSize: 9 }} />{" "}
                <Tag style={{ fontSize: 9 }} color="blue">
                  {record.PayOffice?.code || record.PayOffice?.name}
                </Tag>
              </div>
            )}
            {record.JenisPembiayaan?.status_takeover && (
              <div style={{ fontSize: 9 }} className="mt-1">
                <PayCircleOutlined />{" "}
                <Tag color="blue" style={{ fontSize: 9 }}>
                  {record.takeover_from} (
                  {moment(record.takeover_date).format("DD/MM/YYYY")})
                </Tag>
              </div>
            )}
          </div>
        ),
      },
      {
        title: "Status Dropping",
        dataIndex: "dropping_status",
        key: "dropping_status",
        width: 180,
        render: (_, record) => (
          <div className="flex gap-1 items-center">
            {GetDroppingStatusTag(record.dropping_status)}
            {record.Dropping?.process_at && (
              <div className="text-xs text-opacity-80">
                {moment(record.Dropping.process_at).format("DD/MM/YYYY HH:mm")}
              </div>
            )}
          </div>
        ),
      },
      {
        title: "Status Takeover",
        dataIndex: "takeover_status",
        key: "takeover_status",
        width: 250,
        render: (_, record) => (
          <div>
            <div className="flex gap-1 items-center">
              {GetDroppingStatusTag(record.takeover_status)}
              <Button
                size="small"
                icon={<FileFilled />}
                disabled={!record.file_takeover}
                onClick={() =>
                  setViews({
                    open: true,
                    data: [
                      {
                        name: "File Takeover",
                        url: record.file_takeover || "",
                      },
                    ],
                  })
                }
              />
              <span className="text-xs opacity-80">
                {moment(record.takeover_date_exc).format("DD/MM/YYYY")}
              </span>
            </div>
            <Paragraph
              ellipsis={{ rows: 2, expandable: "collapsible" }}
              style={{ fontSize: 11, margin: 0, marginTop: 4 }}
            >
              {record.takeover_desc}
            </Paragraph>
          </div>
        ),
      },
      {
        title: "Status Mutasi",
        dataIndex: "mutasi_status",
        key: "mutasi_status",
        width: 250,
        render: (_, record) => (
          <div>
            <div className="flex gap-1 items-center">
              {GetDroppingStatusTag(record.mutasi_status)}
              <Button
                size="small"
                icon={<FileFilled />}
                disabled={!record.file_mutasi}
                onClick={() =>
                  setViews({
                    open: true,
                    data: [
                      { name: "File Mutasi", url: record.file_mutasi || "" },
                    ],
                  })
                }
              />
              <span className="text-xs opacity-80">
                {moment(record.mutasi_date_exc).format("DD/MM/YYYY")}
              </span>
            </div>
            <Paragraph
              ellipsis={{ rows: 2, expandable: "collapsible" }}
              style={{ fontSize: 11, margin: 0, marginTop: 4 }}
            >
              {record.mutasi_desc}
            </Paragraph>
          </div>
        ),
      },
      {
        title: "Status Flagging",
        dataIndex: "flagging_status",
        key: "flagging_status",
        width: 250,
        render: (_, record) => (
          <div>
            <div className="flex gap-1 items-center">
              {GetDroppingStatusTag(record.flagging_status)}
              <Button
                size="small"
                icon={<FileFilled />}
                disabled={!record.file_flagging}
                onClick={() =>
                  setViews({
                    open: true,
                    data: [
                      {
                        name: "File Flagging",
                        url: record.file_flagging || "",
                      },
                    ],
                  })
                }
              />
              <span className="text-xs opacity-80">
                {moment(record.flagging_date_exc).format("DD/MM/YYYY")}
              </span>
            </div>
            <Paragraph
              ellipsis={{ rows: 2, expandable: "collapsible" }}
              style={{ fontSize: 11, margin: 0, marginTop: 4 }}
            >
              {record.flagging_desc}
            </Paragraph>
          </div>
        ),
      },
      {
        title: "Status Terima Bersih",
        dataIndex: "tb_status",
        key: "tb_status",
        width: 320,
        render: (_, record) => {
          const desc: ICashDesc[] = record.cash_desc
            ? JSON.parse(record.cash_desc)
            : [];
          const total = desc.reduce((acc, curr) => acc + curr.amount, 0);
          const tb = GetDetailDapem(record).tb;
          const percent = tb > 0 ? ((total / tb) * 100).toFixed(2) : "0.00";

          return (
            <div>
              <div className="flex gap-1 items-center">
                {GetDroppingStatusTag(record.cash_status)}
                <Button
                  size="small"
                  icon={<FileFilled />}
                  disabled={desc.length === 0}
                  onClick={() =>
                    setViews({
                      open: true,
                      data: desc.map((d, idx) => ({
                        name: `File ${idx + 1}`,
                        url: d.file,
                      })),
                    })
                  }
                />
                <span className="text-xs opacity-80">
                  {IDRFormat(total)}/{IDRFormat(tb)} ({percent}%) (
                  {IDRFormat(tb - total)})
                </span>
              </div>
              <Paragraph
                ellipsis={{ rows: 1, expandable: "collapsible" }}
                style={{ fontSize: 11, margin: 0, marginTop: 4 }}
              >
                {desc.map((d, i) => {
                  const itemPercent =
                    tb > 0 ? ((d.amount / tb) * 100).toFixed(2) : "0.00";
                  return (
                    <div key={i}>
                      {d.desc} {moment(d.date).format("DD/MM/YY HH:mm")} (Rp.{" "}
                      {IDRFormat(d.amount)}) ({itemPercent}%);
                    </div>
                  );
                })}
              </Paragraph>
            </div>
          );
        },
      },
      {
        title: "Status Berkas",
        dataIndex: "berkas_status",
        key: "berkas_status",
        width: 250,
        render: (_, record) => (
          <div>
            <div className="flex gap-1 items-center">
              {GetBerkasStatusTag(record.document_status)}
              <Button
                size="small"
                icon={<FileFilled />}
                disabled={!record.Berkas?.file_sub}
                onClick={() =>
                  setViews({
                    open: true,
                    data: [
                      {
                        name: "Pengiriman",
                        url: record.Berkas?.file_sub || "",
                      },
                      {
                        name: "Bukti Terima",
                        url: record.Berkas?.file_proof || "",
                      },
                    ],
                  })
                }
              />
              {record.Berkas?.process_at && (
                <span className="text-xs opacity-80">
                  Send : {moment(record.Berkas.process_at).format("DD/MM/YYYY")}
                </span>
              )}
            </div>
            <Paragraph
              ellipsis={{ rows: 2, expandable: "collapsible" }}
              style={{ fontSize: 11, margin: 0, marginTop: 4 }}
            >
              {record.document_desc}
            </Paragraph>
          </div>
        ),
      },
      {
        title: "Status Jaminan",
        dataIndex: "Jaminan_status",
        key: "Jaminan_status",
        width: 350,
        render: (_, record) => {
          const isTbo =
            moment().isAfter(record.tbo_date, "date") &&
            (!record.Jaminan || !record.Jaminan.status);
          return (
            <div>
              <div className="flex gap-1 items-center">
                {GetBerkasStatusTag(record.guarantee_status)}
                <Tag color={isTbo ? "red" : "blue"} variant="solid">
                  {isTbo ? "LEWAT TBO" : "MASA TBO"}
                </Tag>
                <Button
                  size="small"
                  icon={<FileFilled />}
                  disabled={!record.Jaminan?.file_sub}
                  onClick={() =>
                    setViews({
                      open: true,
                      data: [
                        {
                          name: "Pengiriman",
                          url: record.Jaminan?.file_sub || "",
                        },
                        {
                          name: "Bukti Terima",
                          url: record.Jaminan?.file_proof || "",
                        },
                      ],
                    })
                  }
                />
                <div className="text-xs opacity-80">
                  <div>
                    TBO : {moment(record.tbo_date).format("DD/MM/YYYY")}
                  </div>
                  {record.Jaminan?.process_at && (
                    <div>
                      Send :{" "}
                      {moment(record.Jaminan.process_at).format("DD/MM/YYYY")}
                    </div>
                  )}
                </div>
              </div>
              <Paragraph
                ellipsis={{ rows: 2, expandable: "collapsible" }}
                style={{ fontSize: 11, margin: 0, marginTop: 4 }}
              >
                {record.guarantee_desc}
              </Paragraph>
            </div>
          );
        },
      },
      {
        title: "Progress",
        dataIndex: "progress",
        key: "progress",
        width: 150,
        render: (_, record) => {
          let percent = 40;
          if (record.takeover_status === "DISETUJUI") percent += 10;
          if (record.mutasi_status === "DISETUJUI") percent += 10;
          if (record.flagging_status === "DISETUJUI") percent += 10;
          if (record.cash_status === "DISETUJUI") percent += 10;
          if (record.document_status === "MITRA") percent += 10;
          if (record.guarantee_status === "MITRA") percent += 10;
          return <Progress percent={percent} />;
        },
      },
      {
        title: "Progres Tagihan",
        dataIndex: "progres",
        key: "progres",
        width: 150,
        render: (_, record) => {
          const paidCount =
            record.Angsurans?.filter((f) => f.date_paid !== null).length || 0;
          const percent =
            record.tenor > 0
              ? parseFloat(((paidCount / record.tenor) * 100).toFixed(2))
              : 0;
          return (
            <Tooltip title={`${paidCount} / ${record.tenor}`}>
              <Progress percent={percent} />
            </Tooltip>
          );
        },
      },
      {
        title: "Created",
        dataIndex: "created_at",
        key: "created_at",
        render: (_, record) => (
          <div>
            <div>{record.User?.fullname}</div>
            <div className="opacity-80 text-xs">
              {moment(record.created_at).format("DD/MM/YYYY")}
            </div>
          </div>
        ),
      },
      {
        title: "Aksi",
        key: "action",
        width: 100,
        render: (_, record) => (
          <div className="flex gap-2">
            {hasAccess("update") && (
              <Button
                icon={<EditOutlined />}
                size="small"
                type="primary"
                onClick={() =>
                  setSelected((prev) => ({
                    ...prev,
                    proses: true,
                    selected: record,
                  }))
                }
              />
            )}
            <Tooltip
              title={`Detail Data ${record.Debitur?.fullname || ""} (${record.nopen})`}
            >
              <Button
                icon={<FolderOutlined />}
                type="primary"
                size="small"
                onClick={() =>
                  setSelected((prev) => ({
                    ...prev,
                    upsert: true,
                    selected: record,
                  }))
                }
              />
            </Tooltip>
          </div>
        ),
      },
    ],
    [pageProps.page, pageProps.limit, hasAccess],
  );

  const handleClearFilter = useCallback(() => {
    setPageProps((prev) => ({
      ...prev,
      search: "",
      sumdanId: "",
      jenisPembiayaanId: "",
      dropping_status: "",
      takeover_status: "",
      mutasi_status: "",
      flagging_status: "",
      cash_status: "",
      payOfficeId: "",
      agentFrontingId: "",
      backdate: "",
    }));
  }, []);

  const handleExportExcel = useCallback(() => {
    ExportToExcel(
      [{ sheetname: "alldata", data: MappingToExcelDapem(pageProps.data) }],
      "nominatif",
    );
  }, [pageProps.data]);

  const handleTableSummary = useCallback((pageData: readonly IDapem[]) => {
    const totalPlafond = pageData.reduce(
      (acc, item) => acc + (item.plafond || 0),
      0,
    );
    const angsSumdan = pageData.reduce(
      (acc, item) => acc + (GetDetailDapem(item).detail.angsuran_sumdan || 0),
      0,
    );
    const totalAngs = pageData.reduce(
      (acc, item) => acc + (GetDetailDapem(item).angsuran || 0),
      0,
    );
    const admAngsuran = Math.ceil(totalAngs - angsSumdan);

    return (
      <Table.Summary.Row className="text-xs bg-blue-400">
        <Table.Summary.Cell index={0} colSpan={2} className="text-center">
          <b>SUMMARY</b>
        </Table.Summary.Cell>
        <Table.Summary.Cell index={3} className="text-center">
          <b>{IDRFormat(totalPlafond)}</b>
        </Table.Summary.Cell>
        <Table.Summary.Cell index={4} className="text-center font-bold">
          <div>
            {IDRFormat(angsSumdan)} + {IDRFormat(admAngsuran)}
          </div>
          <div className="border-t border-gray-500">{IDRFormat(totalAngs)}</div>
        </Table.Summary.Cell>
        <Table.Summary.Cell
          index={5}
          colSpan={14}
          className="text-center font-bold"
        />
      </Table.Summary.Row>
    );
  }, []);

  return (
    <Card
      title={
        <div className="flex gap-2 font-bold text-xl">
          <FileProtectOutlined /> Proses TMFTB
        </div>
      }
      styles={{ body: { padding: 5 } }}
    >
      <div className="flex justify-between my-1 gap-2 overflow-auto">
        <div className="flex gap-2">
          <FilterData clearfilter={handleClearFilter}>
            <div className="p-1">
              <div className="grid grid-cols-2 gap-x-3 gap-y-3.5">
                <div className="col-span-2 flex flex-col space-y-1">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                    Periode
                  </label>
                  <RangePicker
                    size="small"
                    value={
                      Array.isArray(pageProps.backdate) &&
                      pageProps.backdate.length === 2
                        ? [
                            dayjs(pageProps.backdate[0]),
                            dayjs(pageProps.backdate[1]),
                          ]
                        : null
                    }
                    onChange={(date, dateStr) =>
                      setPageProps((prev) => ({
                        ...prev,
                        backdate: dateStr,
                        page: 1,
                      }))
                    }
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
            </div>
            {user && !user.sumdanId && (
              <div className="flex flex-col space-y-1">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide truncate">
                  Mitra Pembiayaan
                </label>
                <Select
                  size="small"
                  placeholder="Mitra..."
                  options={sumdanOptions}
                  value={pageProps.sumdanId}
                  onChange={(e) =>
                    setPageProps((prev) => ({
                      ...prev,
                      sumdanId: e,
                      page: 1,
                    }))
                  }
                  allowClear
                  style={{ width: "100%" }}
                />
              </div>
            )}
            <div className="flex flex-col space-y-1">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide truncate">
                Jenis Pembiayaan
              </label>
              <Select
                size="small"
                placeholder="Jenis..."
                options={jenisOptions}
                value={pageProps.jenisPembiayaanId}
                onChange={(e) =>
                  setPageProps((prev) => ({
                    ...prev,
                    jenisPembiayaanId: e,
                    page: 1,
                  }))
                }
                allowClear
                style={{ width: "100%" }}
              />
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide truncate">
                Agent Fronting
              </label>
              <Select
                size="small"
                placeholder="Agent..."
                options={agentOptions}
                value={pageProps.agentFrontingId}
                onChange={(e) =>
                  setPageProps((prev) => ({
                    ...prev,
                    agentFrontingId: e,
                    page: 1,
                  }))
                }
                allowClear
                style={{ width: "100%" }}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide truncate">
                Kantor Bayar
              </label>
              <Select
                size="small"
                placeholder="Kantor Bayar..."
                options={payOptions}
                value={pageProps.payOfficeId}
                onChange={(e) =>
                  setPageProps((prev) => ({
                    ...prev,
                    payOfficeId: e,
                    page: 1,
                  }))
                }
                allowClear
                style={{ width: "100%" }}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide truncate">
                Status Pembiayaan
              </label>
              <Select
                size="small"
                placeholder="Status Pembiayaan..."
                options={[
                  { label: "DISETUJUI", value: "DISETUJUI" },
                  { label: "LUNAS", value: "LUNAS" },
                ]}
                value={pageProps.dropping_status}
                onChange={(e) =>
                  setPageProps((prev) => ({
                    ...prev,
                    dropping_status: e,
                    page: 1,
                  }))
                }
                allowClear
                style={{ width: "100%" }}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide truncate">
                Status Takeover
              </label>
              <Select
                size="small"
                placeholder="Takeover..."
                options={GENERAL_STATUS_OPTIONS}
                value={pageProps.takeover_status}
                onChange={(e) =>
                  setPageProps((prev) => ({
                    ...prev,
                    takeover_status: e,
                    page: 1,
                  }))
                }
                allowClear
                style={{ width: "100%" }}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide truncate">
                Status Mutasi
              </label>
              <Select
                size="small"
                placeholder="Mutasi..."
                options={GENERAL_STATUS_OPTIONS}
                value={pageProps.mutasi_status}
                onChange={(e) =>
                  setPageProps((prev) => ({
                    ...prev,
                    mutasi_status: e,
                    page: 1,
                  }))
                }
                allowClear
                style={{ width: "100%" }}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide truncate">
                Status Flagging
              </label>
              <Select
                size="small"
                placeholder="Flagging..."
                options={GENERAL_STATUS_OPTIONS}
                value={pageProps.flagging_status}
                onChange={(e) =>
                  setPageProps((prev) => ({
                    ...prev,
                    flagging_status: e,
                    page: 1,
                  }))
                }
                allowClear
                style={{ width: "100%" }}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide truncate">
                Status Terima Bersih
              </label>
              <Select
                size="small"
                placeholder="TB Status..."
                options={GENERAL_STATUS_OPTIONS}
                value={pageProps.cash_status}
                onChange={(e) =>
                  setPageProps((prev) => ({
                    ...prev,
                    cash_status: e,
                    page: 1,
                  }))
                }
                allowClear
                style={{ width: "100%" }}
              />
            </div>
          </FilterData>
        </div>
        <div className="flex gap-2">
          <Button
            icon={<PrinterOutlined />}
            size="small"
            type="primary"
            onClick={handleExportExcel}
          >
            Excel
          </Button>
          <Input.Search
            size="small"
            style={{ width: 170 }}
            placeholder="Cari nama..."
            value={pageProps.search}
            onChange={(e) =>
              setPageProps((prev) => ({ ...prev, search: e.target.value }))
            }
          />
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={pageProps.data}
        size="small"
        loading={loading}
        rowKey="id"
        bordered
        scroll={{ x: "max-content", y: "48vh" }}
        pagination={{
          current: pageProps.page,
          pageSize: pageProps.limit,
          total: pageProps.total,
          onChange: (page, pageSize) => {
            setPageProps((prev) => ({ ...prev, page, limit: pageSize }));
          },
          pageSizeOptions: [50, 100, 500, 1000],
          showSizeChanger: true,
        }}
        summary={handleTableSummary}
      />

      {selected.selected && selected.upsert && (
        <DetailDapem
          open={selected.upsert}
          setOpen={(val: boolean) =>
            setSelected((prev) => ({
              ...prev,
              selected: undefined,
              upsert: val,
            }))
          }
          record={selected.selected}
          key={`detail${selected.selected.id}`}
          allowprogres
        />
      )}
      <ViewFiles
        setOpen={(v: boolean) => setViews((prev) => ({ ...prev, open: v }))}
        data={views}
      />
      {selected.selected && selected.proses && (
        <UpdateStatus
          open={selected.proses}
          setOpen={(val: boolean) =>
            setSelected((prev) => ({
              ...prev,
              proses: val,
              selected: undefined,
            }))
          }
          getData={getData}
          dapem={selected.selected}
          key={`upsert${selected.selected.id}`}
          hook={modal}
        />
      )}
    </Card>
  );
}

interface UpdateStatusProps {
  open: boolean;
  setOpen: (val: boolean) => void;
  getData: () => Promise<void>;
  dapem: IDapem;
  hook: HookAPI;
}

const UpdateStatus = ({
  open,
  setOpen,
  getData,
  dapem,
  hook,
}: UpdateStatusProps) => {
  const nominalId = useId();
  const [cashdesc, setCashdesc] = useState<ICashDesc[]>(() =>
    dapem.cash_desc
      ? (JSON.parse(dapem.cash_desc) as ICashDesc[])
      : [DEFAULT_CASH_DESC],
  );
  const [data, setData] = useState<IDapem>(dapem);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const payload = { ...data, cash_desc: JSON.stringify(cashdesc) };
    try {
      const res = await fetch("/api/dapem", {
        method: "PUT",
        body: JSON.stringify(payload),
      }).then((r) => r.json());

      if (res.status === 200) {
        hook.success({
          title: "BERHASIL",
          content: "Data Pembiayaan berhasil diupdate",
        });
        await getData();
        setOpen(false);
      } else {
        hook.error({ title: "ERROR!!", content: res.msg });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      hook.error({ title: "ERROR!!", content: "Terjadi kesalahan jaringan." });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMore = useCallback(() => {
    setCashdesc((prev) => [...prev, DEFAULT_CASH_DESC]);
  }, []);

  return (
    <Modal
      title={`Update Data ${dapem.id}`}
      open={open}
      onCancel={() => setOpen(false)}
      width={1200}
      loading={loading}
      onOk={handleSubmit}
      style={{ top: 20 }}
    >
      <div className="my-4 flex gap-2 flex-col sm:flex-row">
        <div className="flex-1">
          <FormInput
            data={{
              label: "Pemohon",
              class: "flex-1",
              type: "text",
              disabled: true,
              value: `${dapem.Debitur?.fullname || ""} (${dapem.nopen})`,
            }}
          />
          <div className="flex flex-wrap gap-2 border-b py-2">
            <FormInput
              data={{
                label: "Status Takeover",
                required: true,
                class: "flex-1",
                mode: "vertical",
                type: "select",
                options: GENERAL_STATUS_OPTIONS,
                value: data.takeover_status,
                onChange: (e: string) =>
                  setData((prev) => ({
                    ...prev,
                    takeover_status: e as EDapemStatus,
                  })),
              }}
            />
            <FormInput
              data={{
                label: "Tanggal Takeover",
                required: true,
                mode: "vertical",
                type: "date",
                class: "flex-1",
                value: moment(data.takeover_date_exc).format("YYYY-MM-DD"),
                onChange: (e: string) =>
                  setData((prev) => ({
                    ...prev,
                    takeover_date_exc: new Date(e),
                  })),
              }}
            />
            <FormInput
              data={{
                label: "Keterangan",
                required: true,
                class: "flex-1",
                type: "textarea",
                value: data.takeover_desc,
                onChange: (e: string) =>
                  setData((prev) => ({ ...prev, takeover_desc: e })),
              }}
            />
            <FormInput
              data={{
                label: "File",
                required: true,
                mode: "vertical",
                class: "flex-1",
                type: "upload",
                value: data.file_takeover,
                onChange: (e: string) =>
                  setData((prev) => ({ ...prev, file_takeover: e })),
              }}
            />
          </div>
          <div className="flex flex-wrap gap-2 border-b py-2">
            <FormInput
              data={{
                label: "Status Mutasi",
                required: true,
                mode: "vertical",
                class: "flex-1",
                type: "select",
                options: GENERAL_STATUS_OPTIONS,
                value: data.mutasi_status,
                onChange: (e: string) =>
                  setData((prev) => ({
                    ...prev,
                    mutasi_status: e as EDapemStatus,
                  })),
              }}
            />
            <FormInput
              data={{
                label: "Tanggal Mutasi",
                required: true,
                type: "date",
                mode: "vertical",
                class: "flex-1",
                value: moment(data.mutasi_date_exc).format("YYYY-MM-DD"),
                onChange: (e: string) =>
                  setData((prev) => ({
                    ...prev,
                    mutasi_date_exc: new Date(e),
                  })),
              }}
            />
            <FormInput
              data={{
                label: "Keterangan",
                required: true,
                mode: "vertical",
                class: "flex-1",
                type: "textarea",
                value: data.mutasi_desc,
                onChange: (e: string) =>
                  setData((prev) => ({ ...prev, mutasi_desc: e })),
              }}
            />
            <FormInput
              data={{
                label: "File",
                required: true,
                mode: "vertical",
                class: "flex-1",
                type: "upload",
                value: data.file_mutasi,
                onChange: (e: string) =>
                  setData((prev) => ({ ...prev, file_mutasi: e })),
              }}
            />
          </div>
          <div className="flex flex-wrap gap-2 py-2">
            <FormInput
              data={{
                label: "Status Flagging",
                required: true,
                mode: "vertical",
                type: "select",
                class: "flex-1",
                options: GENERAL_STATUS_OPTIONS,
                value: data.flagging_status,
                onChange: (e: string) =>
                  setData((prev) => ({
                    ...prev,
                    flagging_status: e as EDapemStatus,
                  })),
              }}
            />
            <FormInput
              data={{
                label: "Tanggal Flagging",
                required: true,
                type: "date",
                mode: "vertical",
                class: "flex-1",
                value: moment(data.flagging_date_exc).format("YYYY-MM-DD"),
                onChange: (e: string) =>
                  setData((prev) => ({
                    ...prev,
                    flagging_date_exc: new Date(e),
                  })),
              }}
            />
            <FormInput
              data={{
                label: "Keterangan",
                required: true,
                type: "textarea",
                mode: "vertical",
                class: "flex-1",
                value: data.flagging_desc,
                onChange: (e: string) =>
                  setData((prev) => ({ ...prev, flagging_desc: e })),
              }}
            />
            <FormInput
              data={{
                label: "File",
                required: true,
                mode: "vertical",
                class: "flex-1",
                type: "upload",
                value: data.file_flagging,
                onChange: (e: string) =>
                  setData((prev) => ({ ...prev, file_flagging: e })),
              }}
            />
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <FormInput
            data={{
              label: "Status TB",
              required: true,
              mode: "horizontal",
              type: "select",
              options: GENERAL_STATUS_OPTIONS,
              value: data.cash_status,
              onChange: (e: string) =>
                setData((prev) => ({
                  ...prev,
                  cash_status: e as EDapemStatus,
                })),
            }}
          />
          {cashdesc.map((c, i) => (
            <div
              className="w-full flex flex-wrap gap-2 border-b border-gray-400 py-1"
              key={`${nominalId}-${i}`}
            >
              <FormInput
                data={{
                  label: `Nominal (${i + 1})`,
                  required: true,
                  type: "text",
                  mode: "vertical",
                  class: "flex-1",
                  value: IDRFormat(c.amount),
                  onChange: (e: string) =>
                    setCashdesc((prev) =>
                      prev.map((cd, id) =>
                        i === id
                          ? { ...cd, amount: IDRToNumber(e || "0") }
                          : cd,
                      ),
                    ),
                }}
              />
              <FormInput
                data={{
                  label: `Tanggal TB (${i + 1})`,
                  required: true,
                  type: "date",
                  mode: "vertical",
                  class: "flex-1",
                  value: moment(c.date).format("YYYY-MM-DD"),
                  onChange: (e: string) =>
                    setCashdesc((prev) =>
                      prev.map((cd, id) =>
                        i === id ? { ...cd, date: new Date(e) } : cd,
                      ),
                    ),
                }}
              />
              <FormInput
                data={{
                  label: `Keterangan (${i + 1})`,
                  required: true,
                  type: "textarea",
                  mode: "vertical",
                  class: "flex-1",
                  value: c.desc,
                  onChange: (e: string) =>
                    setCashdesc((prev) =>
                      prev.map((cd, id) =>
                        i === id ? { ...cd, desc: e } : cd,
                      ),
                    ),
                }}
              />
              <FormInput
                data={{
                  label: "File",
                  required: true,
                  mode: "vertical",
                  class: "flex-1",
                  type: "upload",
                  value: c.file,
                  onChange: (e: string) =>
                    setCashdesc((prev) =>
                      prev.map((cd, id) =>
                        i === id ? { ...cd, file: e } : cd,
                      ),
                    ),
                }}
              />
            </div>
          ))}
          <div className="w-full">
            <Button
              icon={<PlusCircleOutlined />}
              type="primary"
              block
              onClick={handleAddMore}
            >
              Add More
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
