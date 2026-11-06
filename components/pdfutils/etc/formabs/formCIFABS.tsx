import { IDapem } from "@/libs/IInterfaces";
import moment from "moment";

export const FormCIFABS = (record?: IDapem) => {
  return `
  <div style="font-size:11px; width:100%; box-sizing:border-box; overflow-wrap:anywhere;">
    <!-- Section Header Logo & No Rekening -->
    <div class="flex gap-8">
      <div class="flex-1">
        <img src="/images/logo-abs.bmp" alt="Logo ABS" />
      </div>
      <div class="flex-1">
        <div class="flex gap-4">
          <div class="flex-1">
            <div class="flex gap-2">
              <p class="w-28">Nomor CIF</p>
              <div class="flex-1 border-b border-gray-700"></div>
            </div>
            <div class="flex gap-2">
              <p class="w-28">Nomor Tabungan</p>
              <div class="flex-1 border-b border-gray-700"></div>
            </div>
          </div>
          <div class="flex-2">
            <div class="flex justify-end">
              <img src="/images/logo-bpr.bmp" width="30px" alt="Logo BPR" />
            </div>
            <div>
              <div class="flex gap-2">
                <p class="w-6">No.</p>
                <div class="flex-1 border-b border-gray-700"></div>
              </div>
              <div class="flex gap-2 justify-between mt-1">
                <div class="flex gap-2 items-center">
                  <p>Baru</p>
                  <div class="border w-4 h-4 border-gray-700 flex justify-center items-center">${record ? "✓" : ""}</div>
                </div>
                <div class="flex gap-2 items-center">
                  <p>Pengkinian</p>
                  <div class="border w-4 h-4 border-gray-700"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section Body Formulir -->
    <div class="border border-gray-700 mt-2">
      <!-- Title & Kantor/Tanggal -->
      <div class="border-b border-gray-700 p-2">
        <p class="text-center font-bold">FORMULIR PEMBUKAAN REKENING/PENGKINIAN DATA UNTUK ORANG PERSEORANGAN</p>
        <div class="flex gap-4 justify-between mt-3">
          <div class="flex gap-2 flex-1">
            <p class="w-20">Kantor</p>
            <div class="flex-1 border-b border-gray-700"></div>
          </div>
          <div class="flex gap-2 flex-1">
            <p class="w-20">Tanggal:</p>
            <div class="flex-1 border-b border-gray-700">
              ${record ? moment(record.created_at).format("DD-MM-YYYY") : ""}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Option Bertindak Untuk -->
      <div class="p-2 flex flex-wrap gap-2">
        <p class="w-28">Bertindak Untuk</p>
        <div class="flex-1 min-w-0 flex flex-col gap-1">
          <div class="flex gap-2 items-center">
            <div class="border border-gray-700 h-4 w-4 flex justify-center items-center">✓</div>
            <p>Diri Sendiri</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <div class="flex gap-2 items-center">
              <div class="border border-gray-700 h-4 w-4 flex justify-center items-center"></div>
              <p>Beneficial Owner dengan melampirkan:</p>
            </div>
            <div class="flex gap-2 items-center">
              <div class="border border-gray-700 h-4 w-4 flex justify-center items-center"></div>
              <p>Surat Penugasan</p>
            </div>
            <div class="flex gap-2 items-center">
              <div class="border border-gray-700 h-4 w-4 flex justify-center items-center"></div>
              <p>Surat Kuasa</p>
            </div>
            <div class="flex gap-2 items-center">
              <div class="border border-gray-700 h-4 w-4 flex justify-center items-center"></div>
              <p>Surat Perjanjian</p>
            </div>
            <div class="flex gap-2 items-center">
              <div class="border border-gray-700 h-4 w-4 flex justify-center items-center"></div>
              <p>Lainnya</p>
              <p>_______________________</p>
            </div>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-1">
        <div class="min-w-0">
          <p class="pl-1">Data Pribadi</p>
          <div class="border border-gray-700">
            <div class="flex gap-4">
              <p class="w-40">Nama Lengkap</p>
              <p class="min-w-0 flex-1 border-b border-gray-700">${record?.Debitur.fullname || ""}</p>
            </div>
            <div class="flex gap-4">
              <p class="w-40">Nama Alias</p>
              <p class="min-w-0 flex-1 border-b border-gray-700"></p>
            </div>
            <div class="flex gap-4">
              <p class="w-40">Tempat & Tgl Lahir</p>
              <p class="min-w-0 flex-1 border-b border-gray-700">${record?.Debitur.birthplace || "                  "}, ${record?.Debitur.birthdate ? moment(record.Debitur.birthdate).format("DD-MM-YYYY") : ""}</p>
            </div>
            <div class="flex gap-4">
              <p class="w-40">Nama Gadis Ibu Kandung</p>
              <p class="min-w-0 flex-1 border-b border-gray-700">${record?.Debitur.mother_name || "                  "}</p>
            </div>
            <div class="">
              <div class="flex gap-4">
                <p class="w-40">Jenis Kelamin</p>
                <div class="flex-1">
                  <div class="flex gap-2">
                    <div class="min-w-0 flex-1 flex gap-1">${FormCheck(record?.Debitur.gender?.toLowerCase() === "laki - laki")} Laki-laki</div>
                    <div class="min-w-0 flex-1 flex gap-1">${FormCheck(record?.Debitur.gender?.toLowerCase() === "perempuan")} Perempuan</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="">
              <div class="flex gap-4">
                <p class="w-40">Jenis Identitas</p>
                <div class="flex-1">
                  <div class="flex gap-2">
                    <div class="min-w-0 flex-1 flex gap-1">${FormCheck(record ? true : false)} KTP</div>
                    <div class="min-w-0 flex-1 flex gap-1">${FormCheck(false)} Lainnya ______________</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex gap-4">
              <p class="w-40">Nomor Identitas</p>
              <div class="min-w-0 flex-1" style="display:grid; grid-template-columns:repeat(16, minmax(0, 1fr));">
                ${(
                  record?.Debitur.nik?.replace(/\D/g, "").slice(0, 16).split("") || [
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                  ]
                )
                  .map((item) => {
                    return `<div class="h-4 min-w-0 border border-gray-800 text-center text-xs">${item}</div>`;
                  })
                  .join("")}
              </div>
            </div>
            <div class="flex gap-4">
              <p class="w-40">Alamat Sesuai Identitas</p>
              <div class="${!record ? "h-12" : ""} min-w-0 flex-1 border-b border-gray-700">${record ? `${record.Debitur.address}, KELUARAH ${record.Debitur.ward}, KECAMATAN ${record.Debitur.district}, ${record.Debitur.city}, ${record.Debitur.province} ${record.Debitur.pos_code}` : ""}</div>
            </div>

          </div>
        </div>
        
        <div class="min-w-0">
          <p class="pl-1">Informasi Alamat</p>
          <div class="border border-gray-700">
            <p>Alamat tempat tinggal (jika sama dengan identitas, tidak perlu diisi)</p>
            <div style="min-height:1.25rem;">${record && !record.dom_status ? `${record.address}, KELUARAH ${record.ward}, KECAMATAN ${record.district}, ${record.city}, ${record.province} ${record.pos_code}` : ""}</div>
            <div class="border-t border-gray-700 mt-2">
              <div class="flex gap-4">
                <p style="width:32%; flex:0 0 32%; min-width:0;">Status Tempat Tinggal</p>
                <div class="min-w-0 flex-1">
                  <div class="flex gap-2">
                    <div class="min-w-0 flex-1 flex gap-1">${FormCheck(record?.house_status?.toLowerCase() === "milik sendiri")} Rumah milik sendiri</div>
                    <div class="min-w-0 flex-1 flex gap-1">${FormCheck(record?.house_status?.toLowerCase() === "milik keluarga")} Rumah milik keluarga</div>
                  </div>
                  <div class="flex gap-2">
                    <div class="min-w-0 flex-1 flex gap-1">${FormCheck(record?.house_status?.toLowerCase() === "rumah dinas")} Rumah dinas</div>
                    <div class="min-w-0 flex-1 flex gap-1">${FormCheck(record?.house_status?.toLowerCase() === "sewa")} Rumah sewa / Kontrak</div>
                  </div>
                  <div class="flex gap-2">
                    <div class="min-w-0 flex-1 flex gap-1">${FormCheck(record?.house_status?.toLowerCase() === "kos")} Kost</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="">
              <div class="flex gap-4">
                <p style="width:32%; flex:0 0 32%; min-width:0;">Alamat kirim surat</p>
                <div class="min-w-0 flex-1">
                  <div class="flex gap-2">
                    <div class="min-w-0 flex-1 flex gap-1">${FormCheck(false)} Sesuai alamat identitas</div>
                    <div class="min-w-0 flex-1 flex gap-1">${FormCheck(false)} Sesuai alamat kantor</div>
                  </div>
                  <div class="flex gap-2">
                    <div class="flex gap-2">${FormCheck(record ? true : false)} Sesuai alamat tempat tinggal</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="">
              <div class="flex gap-4">
                <p class="w-36">Alamat elektronik</p>
              </div>
            </div>
            <div class="flex gap-2">
              <div class="min-w-0 flex-1 flex gap-1">
                <p style="width:35%; flex:0 0 35%; min-width:0;">Nomor HP</p>
                <p class="min-w-0 flex-1 border-b border-gray-700">${record?.Debitur.phone || ""}</p>
              </div>
              <div class="min-w-0 flex-1 flex gap-1">
                <p style="width:35%; flex:0 0 35%; min-width:0;">Email</p>
                <p class="min-w-0 flex-1 border-b border-gray-700"></p>
              </div>
            </div>
            <div class="flex gap-2">
              <div class="min-w-0 flex-1 flex gap-1">
                <p style="width:35%; flex:0 0 35%; min-width:0;">Telepon Rumah</p>
                <p class="min-w-0 flex-1 border-b border-gray-700"></p>
              </div>
              <div class="min-w-0 flex-1 flex gap-1">
                <p style="width:35%; flex:0 0 35%; min-width:0;">Telepon Kantor</p>
                <p class="min-w-0 flex-1 border-b border-gray-700"></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `;
};

const FormCheck = (
  check: boolean,
  w?: string,
  val?: string | undefined | null,
  classstyle?: string,
) => {
  return `
    <div class="${w ? w : "w-4"} h-4 flex-shrink-0 text-xs border border-gray-800 ${check ? "flex items-center justify-center" : classstyle ? classstyle : ""}">
      ${check ? "✓" : val ? val : ""}
    </div>
  `;
};
