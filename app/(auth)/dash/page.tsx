"use client";

import {
  ArrowRightOutlined,
  BankOutlined,
  CalculatorOutlined,
  FileProtectOutlined,
  HeartOutlined,
  ReadOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { useUser } from "@/components/UserContext";
import { useAccess } from "@/libs/Permission";
import Link from "next/link";

const workflow = [
  {
    step: "01",
    title: "Rencanakan",
    description:
      "Buat simulasi dan periksa kelayakan pembiayaan sebelum pengajuan diproses.",
    icon: <CalculatorOutlined />,
    color: "bg-[#edf5ef] text-[#286344]",
  },
  {
    step: "02",
    title: "Verifikasi",
    description:
      "Pantau kelengkapan data, hasil verifikasi, dan persetujuan secara bertahap.",
    icon: <FileProtectOutlined />,
    color: "bg-[#fff2e8] text-[#c96a32]",
  },
  {
    step: "03",
    title: "Kelola layanan",
    description:
      "Lanjutkan proses pencairan, dokumen, tagihan, serta koordinasi dengan mitra.",
    icon: <BankOutlined />,
    color: "bg-[#eef2f8] text-[#536b8a]",
  },
];

const fundingSchemes = [
  {
    title: "Dana Internal",
    description:
      "Pembiayaan menggunakan dana dan likuiditas internal koperasi.",
    accent: "border-l-[#286344]",
  },
  {
    title: "Channeling",
    description:
      "Penyaluran dana mitra dengan pengelolaan operasional koperasi.",
    accent: "border-l-[#e77d38]",
  },
  {
    title: "Fronting",
    description:
      "Dukungan pembiayaan awal yang dikelola bersama mitra strategis.",
    accent: "border-l-[#8294a8]",
  },
];

export default function PensionWelcomeDashboard() {
  const user = useUser();
  const { crossAccess } = useAccess("/");
  const firstName = user?.fullname?.trim().split(/\s+/)[0] || "Rekan Kerja";
  const currentHour = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      hourCycle: "h23",
      timeZone: "Asia/Jakarta",
    }).format(new Date()),
  );
  const greeting =
    currentHour < 11
      ? "Selamat pagi"
      : currentHour < 15
        ? "Selamat siang"
        : currentHour < 18
          ? "Selamat sore"
          : "Selamat malam";
  const today = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date());

  const shortcuts = [
    {
      href: "/simulasi",
      title: "Simulasi Pembiayaan",
      description: "Hitung dan siapkan rencana pembiayaan.",
      icon: <CalculatorOutlined />,
      access: ["read", "write", "update", "showpercent"],
      color: "bg-[#edf5ef] text-[#286344]",
    },
    {
      href: "/monitoring",
      title: "Monitoring Pembiayaan",
      description: "Pantau pengajuan dan kelengkapan proses.",
      icon: <ReadOutlined />,
      access: ["read", "write", "update"],
      color: "bg-[#fff2e8] text-[#c96a32]",
    },
    {
      href: "/proses/verif",
      title: "Verifikasi Pembiayaan",
      description: "Lanjutkan pemeriksaan berkas pengajuan.",
      icon: <FileProtectOutlined />,
      access: ["read", "proses"],
      color: "bg-[#eef2f8] text-[#536b8a]",
    },
    {
      href: "/dashboard",
      title: "Dashboard Bisnis",
      description: "Lihat ringkasan portofolio pembiayaan.",
      icon: <BankOutlined />,
      access: ["read"],
      color: "bg-[#f2eff8] text-[#78639a]",
    },
  ].filter(({ href, access }) =>
    access.some((action) => crossAccess(action, href)),
  );

  const userDetails = [
    user?.position,
    user?.cabang,
    user?.sumdan,
  ].filter((detail): detail is string => Boolean(detail));

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-5 pb-3">
      <section className="relative overflow-hidden rounded-[22px] bg-linear-to-br from-[#174b38] via-[#216044] to-[#39744e] px-5 py-6 text-white shadow-[0_16px_36px_rgba(23,75,56,0.14)] sm:px-7 sm:py-7">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full border-[38px] border-white/[0.055]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-28 right-28 h-56 w-56 rounded-full bg-[#e77d38]/20 blur-3xl"
        />
        <div className="relative z-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.09] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#ffd4b2]">
              <SafetyCertificateOutlined />
              Portal operasional internal
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              {greeting}, {firstName}
              <span className="text-[#f4a261]">.</span>
            </h1>
            <p className="mt-2.5 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
              Semua kebutuhan kerja karyawan dan mitra koperasi, dalam satu
              ruang untuk mengelola pembiayaan pensiun.
            </p>
            {userDetails.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {userDetails.map((detail) => (
                  <span
                    key={detail}
                    className="rounded-full border border-white/15 bg-white/[0.08] px-3 py-1.5 text-[11px] font-medium text-white/85"
                  >
                    {detail}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 backdrop-blur-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4a261] text-lg text-[#49351f]">
              <HeartOutlined />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-white/55">
                Hari ini
              </p>
              <p className="mt-0.5 text-xs font-semibold text-white sm:text-sm">
                {today}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="quick-access-title">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2
              id="quick-access-title"
              className="text-lg font-semibold tracking-tight text-[#26352d]"
            >
              Akses cepat
            </h2>
            <p className="mt-1 text-xs text-[#818b83]">
              Pintasan ke pekerjaan yang sering digunakan.
            </p>
          </div>
          <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#9aa39c]">
            Sesuai akses akun
          </span>
        </div>
        {shortcuts.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {shortcuts.map((shortcut) => (
              <Link
                key={shortcut.href}
                href={shortcut.href}
                className="group flex min-h-36 flex-col rounded-2xl border border-[#e7ece7] bg-white p-4 no-underline shadow-[0_5px_18px_rgba(31,56,41,0.035)] transition-all hover:-translate-y-0.5 hover:border-[#cbdacc] hover:shadow-[0_12px_28px_rgba(31,56,41,0.09)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${shortcut.color}`}
                  >
                    {shortcut.icon}
                  </span>
                  <ArrowRightOutlined className="mt-1 text-xs text-[#a3ada5] transition-transform group-hover:translate-x-1 group-hover:text-[#286344]" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-[#334139]">
                  {shortcut.title}
                </h3>
                <p className="mt-1 text-xs leading-5 text-[#838d85]">
                  {shortcut.description}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#dce4dc] bg-white p-5 text-sm text-[#778179]">
            Belum ada pintasan yang tersedia untuk akun Anda. Gunakan menu
            navigasi atau hubungi administrator untuk informasi akses.
          </div>
        )}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <div className="rounded-2xl border border-[#e7ece7] bg-white p-5 shadow-[0_5px_18px_rgba(31,56,41,0.035)] sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold tracking-tight text-[#26352d]">
              Alur kerja pembiayaan
            </h2>
            <p className="mt-1 text-xs text-[#818b83]">
              Gambaran ringkas proses dari perencanaan hingga layanan berjalan.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {workflow.map((item) => (
              <article
                key={item.step}
                className="rounded-xl border border-[#edf0ed] bg-[#fbfcfb] p-4"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl text-base ${item.color}`}
                  >
                    {item.icon}
                  </span>
                  <span className="text-[10px] font-bold tracking-[0.12em] text-[#b3bcb4]">
                    TAHAP {item.step}
                  </span>
                </div>
                <h3 className="mt-4 text-sm font-semibold text-[#334139]">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-xs leading-5 text-[#838d85]">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#e7ece7] bg-white p-5 shadow-[0_5px_18px_rgba(31,56,41,0.035)] sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold tracking-tight text-[#26352d]">
              Skema pendanaan
            </h2>
            <p className="mt-1 text-xs text-[#818b83]">
              Model pendanaan yang dikelola dalam sistem.
            </p>
          </div>
          <div className="space-y-3">
            {fundingSchemes.map((scheme) => (
              <article
                key={scheme.title}
                className={`rounded-r-xl border border-[#edf0ed] border-l-[3px] bg-[#fbfcfb] px-4 py-3 ${scheme.accent}`}
              >
                <h3 className="text-sm font-semibold text-[#334139]">
                  {scheme.title}
                </h3>
                <p className="mt-1 text-xs leading-5 text-[#838d85]">
                  {scheme.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <p className="pb-1 text-center text-[11px] text-[#9aa39c]">
        Gunakan navigasi samping untuk mengakses seluruh modul sesuai hak akses
        Anda.
      </p>
    </div>
  );
}
