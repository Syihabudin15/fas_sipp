"use client";

import { useUser } from "@/components/UserContext";
import {
  BarChart,
  PencapaianChart,
  StatusDapemChart,
} from "@/components/utils/ChartUtils";
import {
  GetDetailDapem,
  GetSisaPokokMargin,
  IDRFormat,
} from "@/components/utils/PembiayaanUtil";
import {
  ICashDesc,
  IDapem,
  IJenisPembiayaan,
  ISumdan,
} from "@/libs/IInterfaces";
import {
  DollarOutlined,
  FolderOpenOutlined,
  KeyOutlined,
  MoneyCollectOutlined,
  PayCircleOutlined,
  SwapOutlined,
  TeamOutlined,
  BankOutlined,
} from "@ant-design/icons";
import { Col, Row, Spin } from "antd";
import moment from "moment";
import React, { useEffect, useMemo, useState } from "react";

interface IDashboard {
  alldata: IDapem[];
  droppingall: IDapem[];
  droppingmonthly: IDapem[];
  prevmonth: { month: string; data: IDapem[] }[];
  byjepem: IJenisPembiayaan[];
  bysumdan: ISumdan[];
}

// Fungsi pembantu untuk menghitung Pending Terima Bersih agar kode JSX tetap bersih
const hitungPendingTerimaBersih = (droppingall: IDapem[]) => {
  const dataTb = droppingall.filter(
    (d) => d.cash_status !== "DISETUJUI" && d.dropping_status === "DISETUJUI",
  );

  return dataTb.reduce((acc, curr) => {
    // const angs = GetAngsuran(
    //   curr.plafond,
    //   curr.tenor,
    //   curr.c_margin + curr.c_margin_sumdan,
    //   curr.margin_type,
    //   curr.rounded,
    //   curr.c_ned,
    // ).angsuran;

    // const biaya =
    //   GetDapem(curr as IDapem).biaya +
    //   curr.c_takeover +
    //   curr.c_fee_bpp +
    //   curr.c_blokir * angs;
    const detail = GetDetailDapem(curr);
    const biaya =
      detail.biaya + curr.c_takeover + detail.angsuran * curr.c_blokir;

    const tbDiberikan = curr.cash_desc
      ? (JSON.parse(curr.cash_desc) as ICashDesc[])
      : [];
    const tb = curr.plafond - biaya;

    return (
      acc + (tb - tbDiberikan.reduce((accu, curru) => accu + curru.amount, 0))
    );
  }, 0);
};

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<IDashboard>({
    alldata: [],
    droppingall: [],
    droppingmonthly: [],
    prevmonth: [],
    byjepem: [],
    bysumdan: [],
  });
  const user = useUser();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Gagal memuat data dashboard:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Perhitungan Nilai Statistik
  const totalPlafondAll = data.droppingall.reduce(
    (acc, curr) => acc + curr.plafond,
    0,
  );
  const totalPlafondMonth = data.droppingmonthly.reduce(
    (acc, curr) => acc + curr.plafond,
    0,
  );

  const approvedDapemStats = useMemo(
    () =>
      data.droppingall
        .filter((dapem) => dapem.dropping_status === "DISETUJUI")
        .map((dapem) => ({
          dapem,
          repayment: GetSisaPokokMargin(dapem as IDapem),
        })),
    [data.droppingall],
  );

  const totalOutstanding = approvedDapemStats.reduce(
    (acc, curr) => acc + curr.repayment.principal,
    0,
  );
  const tunggakanValue = approvedDapemStats.reduce(
    (acc, curr) => acc + curr.repayment.prevvalueall,
    0,
  );
  const tunggakanCount = approvedDapemStats.reduce(
    (acc, curr) => acc + curr.repayment.prevcount,
    0,
  );
  const tagihanBulanIniValue = approvedDapemStats.reduce(
    (acc, curr) => acc + curr.repayment.install,
    0,
  );
  const totalTagihan = approvedDapemStats.reduce(
    (acc, curr) => acc + GetDetailDapem(curr.dapem).angsuran,
    0,
  );

  const totalPendingTakeover = approvedDapemStats.reduce(
    (acc, curr) =>
      acc +
      (curr.dapem.takeover_status !== "DISETUJUI" ? curr.dapem.c_takeover : 0),
    0,
  );

  return (
    <Spin spinning={loading} size="large">
      <div className="p-4 bg-slate-50 min-h-screen space-y-6">
        {/* SECTION 1: KARTU STATISTIK GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatisticCard
            name="Data Pencairan"
            icon={<DollarOutlined />}
            iconBg="bg-emerald-50 text-emerald-600"
            mainValue={`Rp ${IDRFormat(totalPlafondAll)}`}
            subValue={`+ Rp ${IDRFormat(totalPlafondMonth)}`}
            subValueColor="text-emerald-600"
          />

          <StatisticCard
            name="Number Of Account"
            icon={<TeamOutlined />}
            iconBg="bg-blue-50 text-blue-600"
            mainValue={`${data.droppingall.length} NOA`}
            subValue={`+ ${data.droppingmonthly.length} NOA baru`}
            subValueColor="text-blue-600"
          />

          <StatisticCard
            name="Data Instansi"
            icon={<BankOutlined />}
            iconBg="bg-amber-50 text-amber-600"
            customContent={
              <div className="space-y-1 text-xs text-slate-600 font-medium w-full mt-1">
                <div className="flex justify-between border-b border-slate-100 pb-0.5">
                  <span>Taspen</span>
                  <span className="text-slate-800 font-semibold">
                    {
                      data.droppingall.filter(
                        (f) => f.Debitur.group_skep === "PT. TASPEN",
                      ).length
                    }{" "}
                    NOA
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-0.5">
                  <span>Asabri</span>
                  <span className="text-slate-800 font-semibold">
                    {
                      data.droppingall.filter(
                        (f) => f.Debitur.group_skep === "PT. ASABRI",
                      ).length
                    }{" "}
                    NOA
                  </span>
                </div>
              </div>
            }
          />

          <StatisticCard
            name="Outstanding"
            icon={<MoneyCollectOutlined />}
            iconBg="bg-indigo-50 text-indigo-600"
            mainValue={`Rp ${IDRFormat(totalOutstanding)}`}
            subValue={`${data.droppingall.filter((d) => d.dropping_status === "DISETUJUI").length} NOA Aktif`}
            subValueColor="text-indigo-600"
          />

          <StatisticCard
            name="Lunas & Tunggakan"
            icon={<PayCircleOutlined />}
            iconBg="bg-rose-50 text-rose-600"
            mainValue={`${data.droppingall.filter((d) => d.dropping_status === "LUNAS").length} NOA Lunas`}
            subValue={`(${tunggakanCount}x) Rp ${IDRFormat(tunggakanValue)} Tunggakan`}
            subValueColor="text-rose-600"
          />

          <StatisticCard
            name="Total Tagihan"
            icon={<MoneyCollectOutlined />}
            iconBg="bg-sky-50 text-sky-600"
            mainValue={`Rp ${IDRFormat(totalTagihan)}`}
            subValue={`${
              data.droppingall.filter((d) => d.dropping_status === "DISETUJUI")
                .length
            } NOA Menagih`}
            subValueColor="text-slate-500"
          />
          <StatisticCard
            name="Tagihan Bulan Berjalan"
            icon={<MoneyCollectOutlined />}
            iconBg="bg-sky-50 text-sky-600"
            mainValue={`Rp ${IDRFormat(tagihanBulanIniValue)}`}
            subValue={`${
              data.droppingall
                .filter((d) => d.dropping_status === "DISETUJUI")
                .flatMap((d) => d.Angsurans)
                .filter((d) => moment(d.date_pay).isSame(moment(), "month"))
                .length
            } NOA Menagih`}
            subValueColor="text-slate-500"
          />

          <StatisticCard
            name="Pending Takeover"
            icon={<PayCircleOutlined />}
            iconBg="bg-violet-50 text-violet-600"
            mainValue={`Rp ${IDRFormat(totalPendingTakeover)}`}
            subValue={`${data.droppingall.filter((d) => d.takeover_status !== "DISETUJUI" && d.dropping_status === "DISETUJUI").length} NOA Pending`}
            subValueColor="text-slate-500"
          />

          <StatisticCard
            name="Pending Mutasi & Flagging"
            icon={<SwapOutlined />}
            iconBg="bg-purple-50 text-purple-600"
            mainValue={`Mutasi: ${data.droppingall.filter((d) => d.mutasi_status !== "DISETUJUI").length} NOA`}
            mainValueClass="text-base"
            subValue={`Flagging: ${data.droppingall.filter((d) => d.flagging_status !== "DISETUJUI").length} NOA`}
            subValueColor="text-purple-600"
          />

          <StatisticCard
            name="Pending Terima Bersih"
            icon={<KeyOutlined />}
            iconBg="bg-amber-50 text-amber-600"
            mainValue={`Rp ${IDRFormat(hitungPendingTerimaBersih(data.droppingall))}`}
            mainValueClass="text-base truncate"
            subValue={`${data.droppingall.filter((d) => d.cash_status !== "DISETUJUI" && d.dropping_status === "DISETUJUI").length} NOA Pending`}
            subValueColor="text-slate-500"
          />

          <StatisticCard
            name="Pending Berkas & Jaminan"
            icon={<FolderOpenOutlined />}
            iconBg="bg-teal-50 text-teal-600"
            mainValue={`Jaminan: ${data.droppingall.filter((d) => d.guarantee_status !== "MITRA" && d.dropping_status === "DISETUJUI").length} NOA`}
            mainValueClass="text-sm"
            subValue={`Berkas: ${data.droppingall.filter((d) => d.document_status !== "MITRA" && d.dropping_status === "DISETUJUI").length} NOA`}
            subValueColor="text-teal-600"
          />
        </div>

        {/* SECTION 2: CHARTS / GRAFIK */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-100 hover:shadow-md transition-all duration-200">
              <h3 className="font-bold text-slate-800 text-base mb-1">
                Grafik Pembiayaan Perbulan
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Tren riwayat data pencairan beberapa bulan terakhir
              </p>
              <div className="h-64 flex items-center justify-center">
                <PencapaianChart data={data.prevmonth} />
              </div>
            </div>
          </Col>

          <Col xs={24} lg={12}>
            <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-100 hover:shadow-md transition-all duration-200">
              <h3 className="font-bold text-slate-800 text-base mb-1">
                Status Pembiayaan
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Rasio volume portofolio berdasarkan status pengajuan
              </p>
              <div className="h-64 flex items-center justify-center">
                <StatusDapemChart
                  data={[
                    {
                      name: "DISETUJUI",
                      value: data.alldata
                        .filter((d) => d.dropping_status === "DISETUJUI")
                        .reduce((acc, curr) => acc + curr.plafond, 0),
                    },
                    {
                      name: "LUNAS",
                      value: data.alldata
                        .filter((d) => d.dropping_status === "LUNAS")
                        .reduce((acc, curr) => acc + curr.plafond, 0),
                    },
                    {
                      name: "PENDING",
                      value: data.alldata
                        .filter((d) => d.dropping_status === "PENDING")
                        .reduce((acc, curr) => acc + curr.plafond, 0),
                    },
                    {
                      name: "PROSES",
                      value: data.alldata
                        .filter((d) => d.dropping_status === "PROSES")
                        .reduce((acc, curr) => acc + curr.plafond, 0),
                    },
                    {
                      name: "DITOLAK",
                      value: data.alldata
                        .filter((d) => d.dropping_status === "DITOLAK")
                        .reduce((acc, curr) => acc + curr.plafond, 0),
                    },
                    {
                      name: "BATAL",
                      value: data.alldata
                        .filter((d) => d.dropping_status === "BATAL")
                        .reduce((acc, curr) => acc + curr.plafond, 0),
                    },
                  ]}
                />
              </div>
            </div>
          </Col>

          {user && !user.sumdanId && (
            <Col xs={24} lg={12}>
              <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-100 hover:shadow-md transition-all duration-200">
                <h3 className="font-bold text-slate-800 text-base mb-1">
                  Grafik Pembiayaan By Mitra
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Distribusi total penyaluran dana per mitra kerja sama
                </p>
                <div className="h-64 flex items-center justify-center">
                  <BarChart
                    data={data.bysumdan.map((j) => ({
                      name: j.code,
                      value: j.ProdukPembiayaans.flatMap(
                        (p) => p.Dapems,
                      ).reduce((acc, curr) => acc + curr.plafond, 0),
                    }))}
                  />
                </div>
              </div>
            </Col>
          )}

          <Col xs={24} lg={12}>
            <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-100 hover:shadow-md transition-all duration-200">
              <h3 className="font-bold text-slate-800 text-base mb-1">
                Grafik By Jenis Pembiayaan
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Segmentasi pembiayaan berdasarkan jenis produk akad
              </p>
              <div className="h-64 flex items-center justify-center">
                <StatusDapemChart
                  data={data.byjepem.map((j) => ({
                    name: j.name,
                    value: j.Dapems.reduce(
                      (acc, curr) => acc + curr.plafond,
                      0,
                    ),
                  }))}
                />
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </Spin>
  );
}

// Komponen Reusable Tunggal untuk efisiensi render kartu statistik
const StatisticCard = ({
  name,
  icon,
  iconBg,
  mainValue,
  mainValueClass = "text-xl",
  subValue,
  subValueColor = "text-slate-500",
  customContent,
}: {
  name: string;
  icon: React.ReactNode;
  iconBg: string;
  mainValue?: string;
  mainValueClass?: string;
  subValue?: string;
  subValueColor?: string;
  customContent?: React.ReactNode;
}) => {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between h-36 hover:-translate-y-0.5 transition-all duration-200">
      {/* Bagian Atas: Nama dan Ikon */}
      <div className="flex justify-between items-start">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider truncate mr-2">
          {name}
        </span>
        <div
          className={`p-2 rounded-lg text-base flex items-center justify-center shrink-0 ${iconBg}`}
        >
          {icon}
        </div>
      </div>

      {/* Bagian Bawah: Angka Utama & Sub-informasi */}
      <div className="mt-2 w-full">
        {customContent ? (
          customContent
        ) : (
          <>
            <h4
              className={`font-bold text-slate-800 tracking-tight leading-none ${mainValueClass}`}
            >
              {mainValue}
            </h4>
            <p
              className={`text-xs font-medium mt-1.5 mb-0 ${subValueColor} truncate`}
            >
              {subValue}
            </p>
          </>
        )}
      </div>
    </div>
  );
};
