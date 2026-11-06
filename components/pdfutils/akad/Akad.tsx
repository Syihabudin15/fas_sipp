"use client";

import moment from "moment";
import { AnalisaPerhitungan } from "./Analisa";
import { IDapem } from "@/libs/IInterfaces";
import { JadwalAngsuran } from "./KartuAngsuran";
import { PerjanjianKredit } from "./PerjanjianKredit";
// import { SPKDR } from "./SKPDR";
import { BuktiPencairan } from "./BuktiPencairan";
import { Kesanggupan } from "./Kesanggupan";
import { PenyerahanJaminan } from "./PenyerahanJaminan";
import { FormCeklist1 } from "./FormCeklist1";
import { FLagging } from "./Flagging";
import { KuasaMutasi } from "../etc/forms/kuasaMutasi";
import { FormMutasiTaspen } from "../etc/forms/formMutasiTaspen";
import { FormKuasaDebet } from "../etc/formhm/formKuasaDebet";
import { PKHM } from "../etc/formhm/PKHM";
// import { FLaggingAsabri } from "./FlaggingAsabri";
import { SKPMantap } from "./SKPMantap";
import { PKBBTM } from "../etc/formBbtm/PKBBTM";

moment.locale("id");

const generateContractHtml = (record: IDapem) => {
  const handlePK = () => {
    switch (record.ProdukPembiayaan.Sumdan.code) {
      case "BPR HM":
        return PKHM(record);
      case "BPR BBTM":
        return PKBBTM(record);
      default:
        return PerjanjianKredit(record);
    }
  };
  // const handleGroupSKEP = () => {
  //   switch (record.Debitur.group_skep) {
  //     case "PT. TASPEN":
  //       return FLagging(record);
  //     case "PT. ASABRI":
  //       return FLaggingAsabri(record);
  //     default:
  //       return FLagging(record);
  //   }
  // };

  const html = `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      <style>
        @page {
          size: A4;
          margin: 10mm;
          @bottom-center {
            content: "Halaman " counter(page) " dari " counter(pages);
            font-family: Cambria, Georgia, 'Times New Roman', Times, serif;
            font-size: 9px;
          }
        }

        html, body {
          height: 100%;
          font-family: Cambria, Georgia, 'Times New Roman', Times, serif;
          font-size: 14px;
        }

        /* Pemisah halaman */
        .page-break {
          page-break-before: always;
          break-before: page;
          display: block;
          height: 0;
          border: none;
        }
          @media print {
            .page {
              position: relative;
              min-height: 95vh;    /* atau height A4 jika untuk print */
              padding-top: 70px;    /* ruang untuk header */
              page-break-after: always;
              line-height: 17px;
            }
    
            .page .page-header {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              padding: 5px;
              text-align: center;
              background: white;
              border-bottom: 1px solid #ccc;
            }
          }
      </style>
    </head>
    <body class="bg-white text-gray-800 leading-relaxed p-4 max-w-200">

      <div class="page" style="font-size: 12px;">
        ${AnalisaPerhitungan(record)}
      </div>
      
      <div class="page" style="font-size: 11px;">
        ${JadwalAngsuran(record, record.ProdukPembiayaan.Sumdan.name)}
      </div>
      <div class="page text-justify" style="font-size: 12px;">
        ${handlePK()}
      </div>
      ${
        record.ProdukPembiayaan.Sumdan.code === "BPR HM"
          ? `
      <div class="page text-justify" style="font-size: 12px;">
        ${FormKuasaDebet(record)}
      </div>`
          : ""
      }
      <div class="page pt-0 text-justify" style="font-size: 12px;">
        ${BuktiPencairan(record, "DEBITUR")}
      </div>
      <div class="page pt-0 text-justify" style="font-size: 12px;">
      ${Kesanggupan(record, "DEBITUR")}
      </div>
      <div class="page pt-0 text-justify" style="font-size: 12px;">
        ${FLagging(record)}
      </div>
      <div class="page text-justify" style="font-size: 11px;">
        ${PenyerahanJaminan(record)}
      </div>
      <div class="page text-justify" style="font-size: 11px;">
        ${KuasaMutasi(record)}
      </div>
      <div class="page text-justify" style="font-size: 11px;">
        ${FormMutasiTaspen(record)}
      </div>
      ${
        record.PayOffice.code === "BANK MANTAP"
          ? `<div class="page text-justify" style="font-size: 10px;">
        ${SKPMantap(record)}
      </div>`
          : ""
      }
      <div class="page text-justify" style="font-size: 11px;">
        ${FormCeklist1(record)}
      </div>
      
    </body>
  </html>
  `;

  return html;
};

export const printContract = (record: IDapem) => {
  const htmlContent = generateContractHtml(record);

  const w = window.open("", "_blank");
  if (!w) {
    alert("Popup diblokir. Mohon izinkan popup dari situs ini.");
    return;
  }

  w.document.open();
  w.document.write(htmlContent);
  w.document.close();
  w.onload = function () {
    setTimeout(() => {
      w.print();
    }, 200);
  };
};
