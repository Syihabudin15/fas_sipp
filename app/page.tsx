"use client";

import {
  ArrowRightOutlined,
  BankOutlined,
  HeartOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Checkbox, Form, Input, message } from "antd";
import Image from "next/image";
import { useState } from "react";

type LoginValues = {
  username: string;
  password: string;
  rememberMe?: boolean;
};

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values: LoginValues) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: values.username,
          password: values.password,
          rememberMe: values.rememberMe,
        }),
      });

      const data = await res.json();

      if (data.status === 200 || data.status === 201) {
        message.success("Akses diberikan! Mengalihkan ke sistem...");
        if (typeof window !== "undefined") {
          window.location.replace("/dash");
        }
      } else {
        message.error(data.msg || "Kombinasi pengguna atau sandi tidak cocok.");
      }
    } catch (error) {
      console.error(error);
      message.error(
        "Koneksi ke server gagal. Silakan coba beberapa saat lagi.",
      );
    } finally {
      setLoading(false);
    }
  };

  const appName = process.env.NEXT_PUBLIC_APP_FULLNAME ?? "KOPJAS SJM";
  const appLogo = process.env.NEXT_PUBLIC_APP_LOGO;

  return (
    <main className="login-page relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#f3f6fa] px-4 py-8 font-sans sm:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-28 -top-32 h-96 w-96 rounded-full border border-[#dfe5ef] bg-white/50"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-44 -right-28 h-[30rem] w-[30rem] rounded-full border border-[#dce9f5] bg-[#eaf4fb]/60"
      />

      <section       className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[1.5rem] bg-white shadow-[0_28px_80px_rgba(23,36,59,0.16)] md:min-h-[640px] md:grid-cols-[1.02fr_0.98fr]">
        <aside         className="relative flex min-h-[300px] flex-col overflow-hidden bg-[#17243b] px-7 py-7 text-white sm:px-10 sm:py-9 md:min-h-full md:px-12 md:py-11">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full border-[34px] border-white/[0.045]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-[#1782a6]/25 blur-2xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 right-0 h-44 w-44 rounded-tl-[100%] bg-[#2563eb]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 right-0 h-36 w-36 rounded-tl-[100%] bg-[#3f8bb8]"
          />

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
              {appLogo ? (
                <Image
                  src={appLogo}
                  alt={`${appName} Logo`}
                  width={32}
                  height={32}
                  unoptimized
                  className="h-8 w-8 object-contain"
                />
              ) : (
                <BankOutlined className="text-2xl text-[#67d9ef]" />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold tracking-wide text-white">
                {appName}
              </p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
                Portal Internal Koperasi
              </p>
            </div>
          </div>

          <div className="relative z-10 my-auto max-w-md py-10 md:py-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#ffd3ad]">
              <HeartOutlined />
              Bersinergi melayani purna tugas
            </span>
            <h1 className="mt-6 text-[2rem] font-semibold leading-[1.15] tracking-tight sm:text-4xl">
              Mengelola layanan,
              <br />
              mendukung masa
              <br />
              <span className="text-[#67d9ef]">pensiun yang sejahtera.</span>
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/75">
              Platform kerja terpadu bagi karyawan dan mitra koperasi untuk
              mendukung layanan pembiayaan pensiun yang aman dan terpercaya.
            </p>
          </div>

          <div className="relative z-10 grid max-w-md grid-cols-2 gap-3 sm:gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-3.5 backdrop-blur-sm sm:p-4">
              <SafetyCertificateOutlined className="text-lg text-[#67d9ef]" />
              <p className="mt-2 text-xs font-semibold text-white">
                Akses kerja terlindungi
              </p>
              <p className="mt-1 text-[10px] leading-4 text-white/55">
                Untuk karyawan dan mitra
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-3.5 backdrop-blur-sm sm:p-4">
              <HeartOutlined className="text-lg text-[#67d9ef]" />
              <p className="mt-2 text-xs font-semibold text-white">
                Kolaborasi mitra
              </p>
              <p className="mt-1 text-[10px] leading-4 text-white/55">
                Bersama melayani pensiunan
              </p>
            </div>
          </div>
          <p className="relative z-10 mt-7 text-[10px] font-medium tracking-wide text-white/45">
            © {new Date().getFullYear()} {appName}
          </p>
        </aside>

        <div className="flex items-center px-7 py-10 sm:px-12 md:px-14 lg:px-16">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-8">
              <span className="inline-flex rounded-full bg-[#eaf2ff] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#2563eb]">
                Portal Internal Karyawan & Mitra
              </span>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-[#17243b]">
                Selamat datang
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#728096]">
                Masuk untuk mengelola layanan dan operasional koperasi.
              </p>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              requiredMark={false}
              className="space-y-3"
            >
              <Form.Item
                label={
                  <span className="text-xs font-semibold text-[#49566b]">
                    ID Pengguna
                  </span>
                }
                name="username"
                rules={[
                  { required: true, message: "Kolom username wajib diisi!" },
                ]}
                className="mb-5"
              >
                <Input
                  prefix={<UserOutlined className="mr-1 text-[#8190a4]" />}
                  placeholder="Masukkan ID pengguna"
                  size="large"
                  style={{ borderRadius: "10px", height: "48px" }}
                  className="border-[#dbe3ee] text-sm hover:border-[#4c78bd] focus:border-[#2563eb]"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-xs font-semibold text-[#49566b]">
                    Kata Sandi
                  </span>
                }
                name="password"
                rules={[
                  { required: true, message: "Kolom password wajib diisi!" },
                ]}
                className="mb-4"
              >
                <Input.Password
                  prefix={<LockOutlined className="mr-1 text-[#8190a4]" />}
                  placeholder="Masukkan kata sandi"
                  size="large"
                  style={{ borderRadius: "10px", height: "48px" }}
                  className="border-[#dbe3ee] text-sm hover:border-[#4c78bd] focus:border-[#2563eb]"
                />
              </Form.Item>

              <div className="pb-2">
                <Form.Item name="rememberMe" valuePropName="checked" noStyle>
                  <Checkbox className="text-xs text-[#66748a]">
                    Ingat saya di perangkat ini
                  </Checkbox>
                </Form.Item>
              </div>

              <Form.Item className="mb-0">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                  icon={!loading && <ArrowRightOutlined />}
                  iconPlacement="end"
                  style={{
                    height: "48px",
                    borderRadius: "12px",
                    backgroundColor: "#2563eb",
                    boxShadow: "0 8px 18px rgba(37, 99, 235, 0.2)",
                  }}
                  className="border-none text-sm font-semibold tracking-wide transition-all hover:!bg-[#1d4ed8] active:scale-[0.99]"
                >
                  Masuk ke akun
                </Button>
              </Form.Item>
            </Form>

            <div className="mt-8 flex items-start gap-3 rounded-2xl bg-[#f2f5fa] p-4">
              <SafetyCertificateOutlined className="mt-0.5 text-base text-[#4c78bd]" />
              <p className="text-[11px] leading-5 text-[#728096]">
                Jaga kerahasiaan ID pengguna dan kata sandi Anda. Pastikan
                keluar setelah menggunakan perangkat bersama.
              </p>
            </div>
            <p className="mt-7 text-center text-[10px] font-medium text-[#98a4b5]">
              Bersinergi melayani kesejahteraan di masa purna tugas.
            </p>
          </div>
        </div>
      </section>

      <style jsx global>{`
        .login-page {
          font-family: var(--font-geist-sans), sans-serif;
        }
        .login-page :is(
            .ant-input,
            .ant-input-affix-wrapper,
            .ant-checkbox-wrapper,
            .ant-btn
          ) {
              font-family: var(--font-geist-sans), sans-serif !important;
        }
        .login-page .ant-checkbox-checked .ant-checkbox-inner {
          background-color: #2563eb !important;
          border-color: #2563eb !important;
        }
        .login-page .ant-checkbox-wrapper:hover .ant-checkbox-inner,
        .login-page .ant-checkbox:hover .ant-checkbox-inner,
        .login-page .ant-checkbox-input:focus + .ant-checkbox-inner {
          border-color: #4c78bd !important;
        }
      `}</style>
    </main>
  );
}
