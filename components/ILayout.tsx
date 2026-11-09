"use client";

import {
  BankOutlined,
  BellOutlined,
  DoubleLeftOutlined,
  DoubleRightOutlined,
  LogoutOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import {
  Badge,
  Button,
  ConfigProvider,
  Drawer,
  Dropdown,
  Layout,
  Menu,
  Modal,
} from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useUser } from "./UserContext";
import { listMenuUI, MenuPermission } from "./IMenu";
import { useAccess } from "@/libs/Permission";
import Link from "next/link";

const { Header, Content, Sider } = Layout;

export default function ILayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1200);
  const router = useRouter();
  const pathname = usePathname();
  const user = useUser();
  const { crossAccess } = useAccess("/");
  const allowedMenuKeys = useMemo(
    () =>
      user
        ? (JSON.parse(user.Role.permission || "[]") as { path: string }[]).map(
            (permission) => permission.path,
          )
        : [],
    [user],
  );
  const currentMenu = listMenuUI
    .flatMap((item) => [item, ...(item.children ?? [])])
    .filter(
      (item) =>
        pathname === item.key || pathname.startsWith(`${item.key}/`),
    )
    .sort((a, b) => b.key.length - a.key.length)[0];
  const currentPageTitle =
    pathname === "/dash"
      ? "Ringkasan"
      : typeof currentMenu?.label === "string"
        ? currentMenu.label
        : "Portal Kerja";

  const [notif, setNotif] = useState({
    draft: 0,
    verif: 0,
    slik: 0,
    approv: 0,
    akad: 0,
    printSI: 0,
    SI: 0,
    printSD: 0,
    SD: 0,
    printTTPJ: 0,
    TTPJ: 0,
    count: 0,
    pelunasan: 0,
  });

  // 1. Bungkus getNotif dengan useCallback agar referensi fungsinya stabil
  const getNotif = useCallback(async () => {
    if (!user) return; // Jangan panggil API jika user belum termuat/null

    try {
      const res = await fetch("/api/notif");
      const result = await res.json();

      if (result.data) {
        let c = 0;
        if (crossAccess("update", "/monitoring"))
          c += result.data.draft + result.data.akad;
        if (crossAccess("read", "/proses/verif")) c += result.data.verif;
        if (crossAccess("read", "/proses/slik")) c += result.data.slik;
        if (crossAccess("read", "/proses/approv")) c += result.data.approv;
        if (crossAccess("read", "/pencairan/print")) c += result.data.printSI;
        if (crossAccess("read", "/pencairan/dropping")) c += result.data.SI;
        if (crossAccess("read", "/ttpb/print")) c += result.data.printSD;
        if (crossAccess("read", "/ttpb/dropping")) c += result.data.SD;
        if (crossAccess("read", "/ttpj/print")) c += result.data.printTTPJ;
        if (crossAccess("read", "/ttpj/dropping")) c += result.data.TTPJ;
        if (crossAccess("read", "/pelunasan")) c += result.data.pelunasan;

        setNotif({ ...result.data, count: c });
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, [user, crossAccess]); // Hanya dibuat ulang jika user atau hak akses berubah

  // 2. Misahkan window resize listener agar tidak terganggu oleh perubahan state user
  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowWidth(window.innerWidth);
      const handleResize = () => setWindowWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  // 3. Efek khusus untuk pooling notifikasi (Sangat aman dari penumpukan/looping)
  useEffect(() => {
    if (!user) return;

    getNotif(); // Panggil sekali saat user pertama kali siap

    // Naikkan interval menjadi 10 atau 15 detik agar meringankan beban server database Anda
    const interval = setInterval(getNotif, 1000 * 60 * 5);

    return () => clearInterval(interval);
  }, [user, getNotif]);

  const handleLogout = async () => {
    setLoading(true);
    await fetch("/api/auth", { method: "DELETE" })
      .then((res) => res.json())
      .then(() => {
        window.location.replace("/");
      });
    setLoading(false);
  };

  const isMobile = windowWidth < 600;
  const menuItems = user ? MenuPermission(listMenuUI, allowedMenuKeys) : [];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#286344",
          colorInfo: "#286344",
          borderRadius: 12,
        },
        components: {
          Menu: {
            itemSelectedBg: "#edf5ef",
            itemSelectedColor: "#286344",
            itemHoverBg: "#f4f7f4",
            itemHoverColor: "#174b38",
            itemBorderRadius: 10,
            itemHeight: 42,
          },
        },
      }}
    >
      <Layout
        className="app-shell"
        style={{
          minHeight: "100vh",
          gap: 12,
          padding: 12,
          backgroundColor: "#f3f5f2",
        }}
      >
        <Sider
          breakpoint="xs"
          collapsedWidth={isMobile ? 0 : 80}
          collapsed={collapsed}
          onCollapse={(value: boolean) => setCollapsed(value)}
          width={260}
          hidden={isMobile}
          theme="light"
          style={{
            margin: 0,
            borderRadius: "16px",
            border: "1px solid #e7ece7",
            boxShadow: "0 12px 32px rgba(31, 56, 41, 0.06)",
            height: "calc(100vh - 24px)",
            position: "sticky",
            top: 12,
            left: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            transition: "all 0.25s ease",
          }}
        >
          <div
            style={{
              margin: "8px",
              padding: collapsed ? "12px 4px" : "16px",
              borderRadius: "16px",
              background:
                "linear-gradient(140deg, #174b38 0%, #286344 72%, #39744e 100%)",
              color: "#fff",
              boxShadow: "0 12px 24px rgba(23, 75, 56, 0.18)",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: collapsed ? "column" : "row",
              alignItems: "center",
              gap: collapsed ? 8 : 12,
              transition: "all 0.3s",
            }}
          >
            <div
              style={{
                width: collapsed ? 40 : 46,
                height: collapsed ? 40 : 46,
                borderRadius: 14,
                display: "grid",
                placeItems: "center",
                color: "#f4a261",
                fontSize: 22,
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.16)",
                flexShrink: 0,
              }}
            >
              {process.env.NEXT_PUBLIC_APP_LOGO ? (
                <Image
                  src={process.env.NEXT_PUBLIC_APP_LOGO}
                  alt="Logo koperasi"
                  width={30}
                  height={30}
                  unoptimized
                  style={{ objectFit: "contain" }}
                />
              ) : (
                <BankOutlined />
              )}
            </div>

            {!collapsed && (
              <div
                style={{
                  textAlign: "left",
                  lineHeight: 1.4,
                  zIndex: 1,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user?.fullname}
                </div>
                <div style={{ opacity: 0.68, fontSize: 11, marginBottom: 6 }}>
                  @{user?.username}
                </div>
                <div
                  style={{
                    display: "inline-block",
                    background: "rgba(255,255,255,0.12)",
                    borderRadius: "999px",
                    padding: "2px 8px",
                    fontSize: 10,
                    fontWeight: 500,
                    border: "1px solid rgba(255,255,255,0.14)",
                    maxWidth: "100%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user?.sumdan
                    ? user.sumdan
                    : `${user?.position} · ${user?.cabang}`}
                </div>
              </div>
            )}

            {!collapsed && (
              <Button
                size="small"
                type="text"
                aria-label="Perluas menu navigasi"
                title="Perluas menu navigasi"
                icon={
                  <DoubleLeftOutlined
                    style={{ color: "rgba(255,255,255,0.6)" }}
                  />
                }
                onClick={() => setCollapsed(true)}
                style={{
                  position: "absolute",
                  top: 8,
                  right: 4,
                  color: "rgba(255,255,255,0.72)",
                }}
              />
            )}
          </div>

          {collapsed && (
            <div className="flex justify-center w-full my-2">
              <Button
                size="small"
                type="text"
                aria-label="Ciutkan menu navigasi"
                title="Ciutkan menu navigasi"
                icon={<DoubleRightOutlined />}
                onClick={() => setCollapsed(false)}
              />
            </div>
          )}

          {user && (
            <div
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
                padding: "4px 6px 12px",
              }}
              className="custom-scrollbar"
            >
              {!collapsed && (
                <div className="px-3 pb-2 pt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#9aa39c]">
                  Menu utama
                </div>
              )}
              <Menu
                className="app-shell-menu"
                theme="light"
                mode="inline"
                selectedKeys={[currentMenu?.key ?? pathname]}
                style={{
                  borderRight: "none",
                  background: "transparent",
                  fontSize: 13,
                  fontWeight: 500,
                }}
                items={menuItems}
                onClick={(e) => router.push(e.key)}
              />
            </div>
          )}
        </Sider>

        <Layout style={{ background: "transparent" }}>
          <Header
            className="app-shell-header"
            style={{
              margin: 0,
              padding: "0 20px",
              height: 72,
              lineHeight: "normal",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#fff",
              borderRadius: "16px",
              border: "1px solid #e7ece7",
              boxShadow: "0 8px 24px rgba(31, 56, 41, 0.035)",
              position: "sticky",
              top: 12,
              zIndex: 10,
            }}
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#edf5ef]">
                {process.env.NEXT_PUBLIC_APP_LOGO ? (
                  <Image
                    src={process.env.NEXT_PUBLIC_APP_LOGO}
                    alt="Logo"
                    width={32}
                    height={32}
                    unoptimized
                    className="h-full w-full object-contain p-1.5"
                  />
                ) : (
                  <BankOutlined className="text-base text-[#286344]" />
                )}
              </div>
              <div className="flex min-w-0 flex-col justify-center">
                <p className="m-0 truncate text-[10px] font-bold uppercase leading-4 tracking-[0.14em] text-[#829087]">
                  {process.env.NEXT_PUBLIC_APP_SHORTNAME || "Portal Koperasi"}
                </p>
                <h1 className="m-0 mt-0.5 truncate text-[15px] font-semibold leading-5 tracking-tight text-[#25372d]">
                  {currentPageTitle}
                </h1>
              </div>
            </div>

            <div className="ml-3 flex shrink-0 items-center gap-1.5 sm:gap-2">
              {isMobile && (
                <Button
                  type="text"
                  shape="circle"
                  aria-label="Buka menu navigasi"
                  icon={<MenuOutlined />}
                  onClick={() => setMobileMenuOpen(true)}
                  className="!h-9 !w-9 !text-[#53665a]"
                />
              )}
              <Dropdown
                trigger={["click"]}
                placement="bottomRight"
                popupRender={() => (
                  <div
                    style={{
                      width: 280,
                      maxHeight: 350,
                      overflowY: "auto",
                      padding: "12px",
                      background: "white",
                      borderRadius: "12px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 13,
                        color: "#64748b",
                        marginBottom: 4,
                        paddingBottom: 4,
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      Pusat Notifikasi Aplikasi
                    </div>
                    <Notify
                      crossAccess={crossAccess("update", "/monitoring")}
                      url="/monitoring"
                      name="DRAFT"
                      count={notif.draft}
                    />
                    <Notify
                      crossAccess={crossAccess("update", "/monitoring")}
                      url="/monitoring"
                      name="AKAD"
                      count={notif.akad}
                    />
                    <Notify
                      crossAccess={crossAccess("read", "/proses/verif")}
                      url="/proses/verif"
                      name="VERIF"
                      count={notif.verif}
                    />
                    <Notify
                      crossAccess={crossAccess("read", "/proses/slik")}
                      url="/proses/slik"
                      name="SLIK"
                      count={notif.slik}
                    />
                    <Notify
                      crossAccess={crossAccess("read", "/proses/approv")}
                      url="/proses/approv"
                      name="APPROV"
                      count={notif.approv}
                    />
                    <Notify
                      crossAccess={crossAccess("read", "/pencairan/print")}
                      url="/pencairan/print"
                      name="CETAK SI"
                      count={notif.printSI}
                    />
                    <Notify
                      crossAccess={crossAccess("read", "/pencairan/dropping")}
                      url="/pencairan/dropping"
                      name="DROPPING"
                      count={notif.SI}
                    />
                    <Notify
                      crossAccess={crossAccess("read", "/ttpb/print")}
                      url="/ttpb/print"
                      name="CETAK SD"
                      count={notif.printSD}
                    />
                    <Notify
                      crossAccess={crossAccess("read", "/ttpb/dropping")}
                      url="/ttpb/dropping"
                      name="Penyerahan Document"
                      count={notif.SD}
                    />
                    <Notify
                      crossAccess={crossAccess("read", "/ttpj/print")}
                      url="/ttpj/print"
                      name="CETAK TTPJ"
                      count={notif.printTTPJ}
                    />
                    <Notify
                      crossAccess={crossAccess("read", "/ttpj/dropping")}
                      url="/ttpj/dropping"
                      name="Penyerahan Jaminan"
                      count={notif.TTPJ}
                    />
                    <Notify
                      crossAccess={crossAccess("read", "/pelunasan")}
                      url="/pelunasan"
                      name="Pelunasan"
                      count={notif.pelunasan}
                    />
                  </div>
                )}
              >
                <Button
                  type="text"
                  shape="circle"
                  aria-label="Buka notifikasi"
                  title="Buka notifikasi"
                  className="!h-10 !w-10 !bg-[#f3f6f3] !text-[#286344] hover:!bg-[#eaf2eb]"
                  icon={
                    <Badge count={notif.count} size="small" overflowCount={99}>
                      <BellOutlined
                        style={{ fontSize: 18, color: "#64748b" }}
                      />
                    </Badge>
                  }
                />
              </Dropdown>

              <Button
                type="text"
                danger
                shape="circle"
                aria-label="Keluar aplikasi"
                title="Keluar aplikasi"
                className="!h-10 !w-10 !bg-[#fff3ed] !text-[#c75d2c] hover:!bg-[#ffeadc]"
                icon={<LogoutOutlined style={{ fontSize: 16 }} />}
                onClick={() => setOpen(true)}
              />
            </div>
          </Header>

          <Content
            className="custom-scrollbar app-shell-content"
            style={{
              margin: "12px 0 0",
              background: "#fff",
              borderRadius: "16px",
              padding: "16px",
              border: "1px solid #e7ece7",
              boxShadow: "0 8px 24px rgba(31, 56, 41, 0.025)",
            }}
          >
            <div>{children}</div>
          </Content>
        </Layout>

        <Modal
          open={open}
          onCancel={() => setOpen(false)}
          title="Konfirmasi Keluar Aplikasi"
          onOk={handleLogout}
          confirmLoading={loading}
          okText="Ya, Keluar"
          cancelText="Batal"
          okButtonProps={{ danger: true, style: { borderRadius: "8px" } }}
          cancelButtonProps={{ style: { borderRadius: "8px" } }}
        >
          <p style={{ color: "#64748b" }}>
            Apakah Anda yakin ingin mengakhiri sesi ini? Anda harus login
            kembali untuk mengakses data.
          </p>
        </Modal>

        {isMobile && (
          <Drawer
            placement="left"
            size={Math.min(340, windowWidth * 0.85)}
            open={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
            title={
              <div className="flex items-center gap-2">
                <span
                  style={{ fontWeight: 800, fontSize: 15, color: "#174b38" }}
                >
                  Navigasi
                </span>
              </div>
            }
            styles={{
              header: { borderBottom: "1px solid #edf0ed" },
              body: { padding: "8px 0" },
            }}
          >
            {user && (
              <Menu
                theme="light"
                mode="inline"
                selectedKeys={[pathname]}
                style={{ borderRight: "none" }}
                items={menuItems}
                onClick={(e) => {
                  router.push(e.key);
                  setMobileMenuOpen(false);
                }}
              />
            )}
          </Drawer>
        )}

        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #d3ddd4;
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #9baa9d;
          }
          .app-shell-menu .ant-menu-item a {
            color: inherit;
            text-decoration: none;
          }
          .app-shell-menu .ant-menu-item {
            margin-block: 3px;
          }
          .app-shell-menu .ant-menu-submenu-title {
            font-weight: 600;
          }
          @media (max-width: 599px) {
            .app-shell {
              gap: 0 !important;
              padding: 6px !important;
            }
            .app-shell-header {
              padding: 0 12px !important;
              height: 60px !important;
            }
            .app-shell-content {
              margin: 8px 0 0 !important;
              padding: 10px !important;
            }
          }
        `}</style>
      </Layout>
    </ConfigProvider>
  );
}

// Komponen Notify dipisah ke bawah tetap dipertahankan seperti semula
const Notify = ({
  url,
  name,
  count,
  crossAccess,
}: {
  url: string;
  name: string;
  count: number;
  crossAccess: boolean;
}) => {
  if (!crossAccess) return null;
  return (
    <Link
      href={url}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 12px",
        borderRadius: "8px",
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        textDecoration: "none",
        transition: "all 0.2s",
      }}
      className="hover:bg-slate-100"
    >
      <span style={{ color: "#334155", fontSize: "12px", fontWeight: 500 }}>
        {name}
      </span>
      {count > 0 ? (
        <span
          style={{
            background: "#ef4444",
            color: "#fff",
            padding: "1px 8px",
            borderRadius: "10px",
            fontSize: "11px",
            fontWeight: 600,
          }}
        >
          {count}
        </span>
      ) : (
        <span style={{ color: "#94a3b8", fontSize: "11px" }}>0</span>
      )}
    </Link>
  );
};
