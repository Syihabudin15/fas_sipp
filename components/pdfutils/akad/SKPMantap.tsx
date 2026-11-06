import { GetDetailDapem, IDRFormat } from "@/components/utils/PembiayaanUtil";
import { IDapem } from "@/libs/IInterfaces";
import moment from "moment";
import { ListStyle, NumberToWordsID } from "../utils";

export const SKPMantap = (record: IDapem) => {
  const detail = GetDetailDapem(record);
  return `
  
  <p class="font-bold text-xl text-center underline mb-6 -mt-20">SURAT PERNYATAAN DAN KUASA</p>
  

  <div class="ml-4 mt-1 ">
    <div class="flex gap-2">
      <p class="w-52">Nama</p>
      <p class="w-4">:</p>
      <p class="flex-1">${record.Debitur.fullname}</p>
    </div>
    <div class="flex gap-2">
      <p class="w-52">Tempat/tgl lahir</p>
      <p class="w-4">:</p>
      <p class="flex-1">${record.Debitur.birthplace}, ${moment(record.Debitur.birthdate).format("DD-MM-YYYY")}</p>
    </div>
    <div class="flex gap-2">
      <p class="w-52">Alamat</p>
      <p class="w-4">:</p>
      <p class="flex-1">${record.Debitur.address}, KELURAHAN ${record.Debitur.ward}, KECAMATAN ${record.Debitur.district}, ${record.Debitur.city}, ${record.Debitur.province} ${record.Debitur.pos_code}</p>
    </div>
    <div class="flex gap-2">
      <p class="w-52">No KTP</p>
      <p class="w-4">:</p>
      <p class="flex-1">${record.Debitur.nik}</p>
    </div>
    <div class="flex gap-2">
      <p class="w-52">Nopen</p>
      <p class="w-4">:</p>
      <p class="flex-1">${record.Debitur.nopen}</p>
    </div>
  </div>
  
  <p class="mt-2">Yang untuk melakukan tindakan hukum dalam surat ini telah mendapatkan persetujuan dari suami/istri yaitu :</p>
  <div class="ml-4 mt-2 ">
    <div class="flex gap-2">
      <p class="w-52">Nama</p>
      <p class="w-4">:</p>
      <p class="flex-1">${record.marriage_status === "KAWIN" ? record.aw_name : ""}</p>
    </div>
    <div class="flex gap-2">
      <p class="w-52">Tempat/tgl lahir</p>
      <p class="w-4">:</p>
      <p class="flex-1">${record.marriage_status === "KAWIN" ? record.aw_birthplace + ", " + moment(record.aw_birthdate).format("DD-MM-YYYY") : ""}</p>
    </div>
    <div class="flex gap-2">
      <p class="w-52">Alamat</p>
      <p class="w-4">:</p>
      <p class="flex-1">${record.marriage_status === "KAWIN" ? `${record.aw_address}, KELURAHAN ${record.aw_ward}, KECAMATAN ${record.aw_district}, ${record.aw_city}, ${record.aw_province} ${record.aw_pos_code}` : ""}</p>
    </div>
    <div class="flex gap-2">
      <p class="w-52">No KTP</p>
      <p class="w-4">:</p>
      <p class="flex-1">${record.marriage_status === "KAWIN" ? record.aw_nik : ""}</p>
    </div>
    <p>*) diisi apabila peminjam bukan janda/duda</p>
  </div>

  <div class="ml-1 mt-2">
    <p>Dengan ini menyatakan telah mendapat pinjaman dari <span class="border-b border-gray-700 border-dashed font-bold">${process.env.NEXT_PUBLIC_APP_COMPANY_NAME}</span> sebagai Mitra yang telah bekerjasama dengan <span class="font-bold">PT BANK MANDIRI TASPEN</span> melalui <span class="font-bold">Koperasi Mantap Mulia Sejahtera</span> sebesar <span class="border-b border-gray-700 border-dashed font-bold">Rp. ${IDRFormat(record.plafond)} (${NumberToWordsID(record.plafond)} Rupiah)</span> atau sejumlah yang disetujui oleh <span class="border-b border-gray-700 border-dashed font-bold">${process.env.NEXT_PUBLIC_APP_COMPANY_NAME}</span>, serta sesuai dengan surat pembiayaan nomor <span class="border-b border-gray-700 border-dashed font-bold">${record.no_contract}</span> Yang saya tanda tangani kemudian, dan untuk menjamin pembayaran atas pinjaman tersebut dengan ini saya memberikan kuasa kepada <span class="border-b border-gray-700 border-dashed font-bold">${process.env.NEXT_PUBLIC_APP_COMPANY_NAME}</span>, <span class="font-bold">Koperasi Mantap Mulia Sejahtera</span> dan <span class="font-bold">PT BANK MANDIRI TASPEN</span> untuk memotong uang gaji saya sebesar <span class="border-b border-gray-700 border-dashed font-bold">Rp. ${IDRFormat(detail.angsuran)} (${NumberToWordsID(detail.angsuran)} Rupiah)</span> dan menyetorkan uang hasil potongan tersebut kepada <span class="border-b border-gray-700 border-dashed font-bold">${process.env.NEXT_PUBLIC_APP_COMPANY_NAME}</span> sebagai pembayaran angsuran pinjaman saya selama <span class="border-b border-gray-700 border-dashed font-bold">${record.tenor}</span> bulan berturut – turut, mulai tanggal <span class="border-b border-gray-700 border-dashed font-bold">${moment(record.date_contract).format("DD-MM-YYYY")}</span> s/d tanggal <span class="border-b border-gray-700 border-dashed font-bold">${moment(record.date_contract).add(record.tenor, "months").format("DD-MM-YYYY")}</span>.</p>
    <p class="mt-2">Dengan ini saya juga menyatakan :</p>
    ${ListStyle(
      [
        `Bahwa sisa gaji saya sendiri pada saat ini dan seterusnya (sampai pembiayaan saya lunas) benar-benar cukup untuk dipotong sejumlah tersebut diatas, dan jika ternyata dikemudian hari gaji saya tidak cukup jumlahnya untuk dipotong karena sebab apapun, maka saya berkomitmen untuk tetap menyelesaikan kewajiban angsuran saya sampai dengan pinjaman lunas.`,
        `Bahwa sepenuhnya dari pinjaman yang saya ambil/terima tersebut benar-benar saya pergunakan untuk keperluan saya sendiri dan saya tidak akan mengalihkan dan/atau memindahkan kantor bayar gaji saya ke tempat lain sampai dengan pinjaman saya lunas sepenuhnya.`,
        `Untuk kepentingan asuransi saya menyatakan (dalam kondisi sehat) (pernah mengidap penyakit cacar/tumor/kanker/TBC/asma/tekanan darah tinggi/diabetes/lever/ginjal/jantung/stroke/rematik/penyakit kronis lainnya) (pernah dirawat dirumah sakit karena pebedahan atau penyakit) dalam lima tahun ini (**) dan dengan ini menyatakan akan tunduk pada syarat dan ketentuan yang berlaku pada perusahaan asuransi dalam proses penutupan dan pengajuan klaim.\n**) Di coret apabila tidak perlu`,
        `Bahwa saya sanggup melunasi pinjaman saya kepada <span class="border-b border-gray-700 border-dashed font-bold">${process.env.NEXT_PUBLIC_APP_COMPANY_NAME}</span> sebagai Mitra yang telah bekerjasama dengan <span class="font-bold">PT BANK MANDIRI TASPEN</span> melalui <span class="font-bold">Koperasi Mantap Mulia Sejahtera</span> apabila saya melakukan pernikahan yang menyebabkan tunjangan pensiun (Janda/Duda ***) Hilang.\n***) Di coret apabila peminjam bukan janda/duda`,
        `Bahwa saya memberikan persetujuan kepada <span class="border-b border-gray-700 border-dashed font-bold">${process.env.NEXT_PUBLIC_APP_COMPANY_NAME}</span> sebagai Mitra yang telah bekerjasama dengan <span class="font-bold">PT BANK MANDIRI TASPEN</span> melalui <span class="font-bold">Koperasi Mantap Mulia Sejahtera</span> untuk membagikan data pribadi saya kepada pihak ketiga lainnya sehubungan dengan keperluan pemotongan gaji saya tersebut.`,
      ],
      "number",
    )}
  </div>

  <p class="mt-2">Pemberian kuasa ini tidak otomatis melepaskan tanggung jawab saya terhadap kelancaran pembayaran angsuran pinjaman tersebut sampai dengan lunas tepat waktunya, sehingga saya sebagai pihak pemberi kuasa bertanggung jawab penuh terhadap segala tindakan penerima kuasa yang berkaitan dengan surat kuasa ini. Dan saya memberikan wewenang kepada pihak <span class="border-b border-gray-700 border-dashed font-bold">${process.env.NEXT_PUBLIC_APP_COMPANY_NAME}</span>, <span class="font-bold">Koperasi Mantap Mulia Sejahtera</span> dan <span class="font-bold">PT BANK MANDIRI TASPEN</span> untuk membantu melakukan penagihan apabila dipandang ada keterlambatan dalam penyerahan uang hasil pemotongan gaji saya tersebut. Demikian surat pernyataan ini saya buat dengan sebenarnya, tidak dapat dibatalkan atau dicabut dengan alasan apapun.</p>

  <div class="flex justify-between gap-6 items-end mt-2">
    <div class="flex-1">
        <p >${(record.city || record.Debitur.city || "KOTA BANDUNG").toLowerCase().replace("kota", "").replace("kabupaten", "").toUpperCase()}, ${moment(record.date_contract).format("DD-MM-YYYY")}</p>
        <p class="font-bold">Yang memberi kuasa</p>
        <div class="h-24 pt-8 opacity-50">
          <p >Materai 10.000</p>
        </div>
        <div>
          <p class="w-full underline font-bold">${record.Debitur.fullname}</p>
          <p class="font-bold">Nopen: ${record.Debitur.nopen}</p>
        </div>
      </div>
      <div class="flex-1">
        <p class="font-bold">Mengetahui/menyetujui</p>
        <div class="h-24 flex items-center justify-center opacity-50">
        </div>
        <div>
          <p class="w-full underline font-bold">${process.env.NEXT_PUBLIC_APP_AKAD_NAME}</p>
          <p class="font-bold">Ketua Koperasi</p>
        </div>
      </div>
    </div>
    <div class="flex-1 mt-4">
      <p class="font-bold">Suami/Istri/Pemberi Kuasa</p>
      <div class="h-20 flex items-center justify-center opacity-50">
      </div>
      <div>
        <p class="w-full underline font-bold">${record.marriage_status === "KAWIN" ? record.aw_name : ""}</p>
      </div>
    </div>
  </div>

`;
};
