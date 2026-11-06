"use client";

import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, message } from "antd";
import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
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

  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-blue-300 via-teal-50/30 to-slate-100 p-4 sm:p-6">
      <div className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full border border-emerald-500/10 bg-emerald-500/5" />
      <div className="pointer-events-none absolute -bottom-40 -right-20 h-120 w-120 rounded-full border border-amber-500/10 bg-amber-500/5" />

      {/* Container Utama dengan Bayangan Tajam Tipis (Soft Clean Edge Card) */}
      <div className="relative z-10 flex min-h-125 w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/70 bg-white/95 shadow-[0_20px_50px_rgba(15,23,42,0.25)] backdrop-blur-sm transition-all duration-300 md:flex-row">
        {/* SISI KIRI: Desain Premium Monokromatik Hijau-Emas */}
        <div className="relative flex min-h-55 w-full flex-col items-center justify-between overflow-hidden bg-slate-900 p-8 text-center md:min-h-130 md:w-5/12">
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src="/login.mp4"
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-slate-950/55" />

          <div className="hidden md:block"></div>

          {/* Konten Utama Kiri */}
          <div className="my-auto z-10 flex flex-col items-center">
            <div className="p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 mb-5 inline-block shadow-inner">
              <img
                src={process.env.NEXT_PUBLIC_APP_LOGO ?? "/images/app_logo.png"}
                alt={`${process.env.NEXT_PUBLIC_APP_FULLNAME ?? "KOPJAS"} Logo`}
                className="h-14 md:h-16 object-contain"
              />
            </div>
            <h1 className="text-lg md:text-xl font-extrabold text-white tracking-wider uppercase">
              {process.env.NEXT_PUBLIC_APP_FULLNAME ?? "KOPJAS / SYREL"}
            </h1>
            <div className="w-8 h-0.5 bg-linear-to-r from-emerald-400 to-amber-400 my-3 rounded-full"></div>
            <p className="text-xs text-white max-w-55 leading-relaxed tracking-wide hidden md:block">
              Sistem manajemen terintegrasi penjamin akurasi, keamanan, dan
              efisiensi data.
            </p>
          </div>

          {/* Hak Cipta Sisi Kiri */}
          <div className="hidden md:block z-10">
            <p className="text-[10px] text-white font-medium tracking-widest uppercase">
              SECURE PLATFORM · {new Date().getFullYear()}
            </p>
          </div>
        </div>

        {/* SISI KANAN: Form Kerja Minimalis & Tipografi Tajam */}
        <div className="w-full md:w-7/12 p-8 md:p-14 flex flex-col justify-center bg-white">
          <div className="mb-8">
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
              Portal Resmi Internal
            </span>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight mt-3">
              Autentikasi Akun
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Gunakan hak akses terdaftar untuk memasuki aplikasi.
            </p>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
            className="space-y-4"
          >
            {/* Input Username yang diperbarui komponen visualnya */}
            <Form.Item
              label={
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                  ID Pengguna / Username
                </span>
              }
              name="username"
              rules={[
                { required: true, message: "Kolom username wajib diisi!" },
              ]}
              className="mb-4"
            >
              <Input
                prefix={<UserOutlined className="text-slate-400 mr-1" />}
                placeholder="Masukkan username Anda"
                size="large"
                style={{ borderRadius: "10px" }}
                className="border-slate-200 hover:border-emerald-400 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,0.1)] py-2.5 text-sm transition-all"
              />
            </Form.Item>

            {/* Input Password */}
            <Form.Item
              label={
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                  Kata Sandi / Password
                </span>
              }
              name="password"
              rules={[
                { required: true, message: "Kolom password wajib diisi!" },
              ]}
              className="mb-4"
            >
              <Input.Password
                prefix={<LockOutlined className="text-slate-400 mr-1" />}
                placeholder="••••••••"
                size="large"
                style={{ borderRadius: "10px" }}
                className="border-slate-200 hover:border-emerald-400 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,0.1)] py-2.5 text-sm transition-all"
              />
            </Form.Item>

            <div className="flex items-center justify-between pb-3">
              <Form.Item name="rememberMe" valuePropName="checked" noStyle>
                <Checkbox className="text-slate-400 text-xs custom-checkbox">
                  Simpan sesi login di browser ini
                </Checkbox>
              </Form.Item>
            </div>

            {/* Tombol dengan Warna Solid Emerald Premium */}
            <Form.Item className="mb-0">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                style={{ borderRadius: "10px" }}
                className="h-11 bg-emerald-600 hover:bg-emerald-700 border-none text-xs font-bold tracking-widest shadow-md shadow-emerald-600/10 active:scale-[0.98] transition-all"
              >
                MASUK
              </Button>
            </Form.Item>
          </Form>

          {/* Hak Cipta khusus Tampilan Mobile */}
          <div className="block md:hidden mt-10 pt-4 border-t border-slate-100 text-center">
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">
              © {new Date().getFullYear()}{" "}
              {process.env.NEXT_PUBLIC_APP_FULLNAME ?? "SYREL"}
            </p>
          </div>
        </div>
      </div>

      {/* Injeksi Style Tambahan untuk Menyesuaikan Aksen Warna Ant Design bawaan */}
      <style jsx global>{`
        .ant-checkbox-checked .ant-checkbox-inner {
          background-color: #10b981 !important;
          border-color: #10b981 !important;
        }
        .ant-checkbox-wrapper:hover .ant-checkbox-inner,
        .ant-checkbox:hover .ant-checkbox-inner,
        .ant-checkbox-input:focus + .ant-checkbox-inner {
          border-color: #10b981 !important;
        }
      `}</style>
    </div>
  );
}
