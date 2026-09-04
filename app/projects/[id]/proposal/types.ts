export type TabKey =
  | "cover"
  | "approval"
  | "abstract"
  | "bab1"
  | "bab2"
  | "matrix"
  | "bab3"
  | "references"
  | "appendix"
  | "latex";

export type TemplateType = "TELKOM_FIF" | "GENERAL_ID";

export interface ReferenceItem {
  id: string;
  title: string;
  authors: string;
  year: number;
  publication: string;
  doi: string;
  selected: boolean;
  keyFindings?: string;
  mappedVariables?: string;
  methodology?: string;
}

export interface CustomSubChapterItem {
  id: string;
  chapter: "bab1" | "bab2" | "bab3";
  level: string;
  prefix?: string;
  indentCm: number;
  title: string;
  content: string;
  hidden?: boolean;
}

export interface AcademicNumberingRule {
  level: string;
  name: string;
  format: string;
  indentCm: number;
  indentLabel: string;
  color: string;
  textColor: string;
  example: string;
}

export const ACADEMIC_NUMBERING_RULES: AcademicNumberingRule[] = [
  { level: "subbab", name: "Nomor untuk subbab", format: "A., B., C., dst. (atau 1.X)", indentCm: 0, indentLabel: "0 cm", color: "#fef08a", textColor: "#854d0e", example: "A. Kajian Pustaka" },
  { level: "anak_subbab", name: "Nomor untuk anak subbab", format: "1., 2., 3., dst.", indentCm: 0.5, indentLabel: "0.5 cm", color: "#bbf7d0", textColor: "#166534", example: "1. Landasan Teori" },
  { level: "anak_subbab_1", name: "Nomor untuk anak subbab pertama", format: "a., b., c., dst.", indentCm: 1.0, indentLabel: "1 cm", color: "#a5f3fc", textColor: "#0e7490", example: "a. Definisi Variabel" },
  { level: "anak_subbab_2", name: "Nomor untuk anak subbab kedua", format: "1)., 2)., 3)., dst.", indentCm: 1.5, indentLabel: "1.5 cm", color: "#fbcfe8", textColor: "#9d174d", example: "1). Dimensi Indikator" },
  { level: "anak_subbab_3", name: "Nomor untuk anak subbab ketiga", format: "a)., b)., c)., dst.", indentCm: 2.0, indentLabel: "2 cm", color: "#fca5a5", textColor: "#991b1b", example: "a). Parameter Pengujian" },
  { level: "anak_subbab_4", name: "Nomor untuk anak subbab keempat", format: "(1)., (2)., (3)., dst.", indentCm: 2.5, indentLabel: "2.5 cm", color: "#5eead4", textColor: "#115e59", example: "(1). Skala Likert 5 Poin" },
  { level: "anak_subbab_5", name: "Nomor untuk anak subbab kelima", format: "(a)., (b)., (c)., dst.", indentCm: 3.0, indentLabel: "3 cm", color: "#cbd5e1", textColor: "#334155", example: "(a). Butir Kuesioner 1" },
];

export interface AcademicPresetItem {
  id: string;
  chapter: "bab1" | "bab2" | "bab3";
  num: string;
  badge: string;
  title: string;
  desc: string;
  content: string;
}

export const ACADEMIC_PRESET_ITEMS: AcademicPresetItem[] = [
  // BAB 1
  {
    id: "preset_1_2",
    chapter: "bab1",
    num: "1.2",
    badge: "BAB 1",
    title: "Identifikasi Masalah",
    desc: "Menjabarkan butir-butir permasalahan riil di lapangan berdasarkan observasi awal & research gap.",
    content:
      "Berdasarkan uraian latar belakang, permasalahan yang dapat diidentifikasi adalah sebagai berikut:\n1. Belum optimalnya integrasi variabel dalam proses operasional akademik.\n2. Tingginya disparitas efektivitas akibat keterbatasan implementasi instrumen terstandar.\n3. Perlunya bukti empiris mengenai relasi kausalitas antar faktor pendukung.",
  },
  {
    id: "preset_1_5",
    chapter: "bab1",
    num: "1.5",
    badge: "BAB 1",
    title: "Batasan Masalah & Asumsi Penelitian",
    desc: "Membatasi ruang lingkup objek, sampel responden, periode, dan konteks studi agar fokus.",
    content:
      "Agar penelitian lebih terarah dan mendalam, batasan masalah ditetapkan sebagai berikut:\n1. Penelitian difokuskan pada mahasiswa aktif program studi terkait.\n2. Periode pengumpulan data primer dilakukan selama semester berjalan.\n3. Variabel yang diuji dibatasi pada konstruk yang tertera pada model konseptual.",
  },
  {
    id: "preset_1_6",
    chapter: "bab1",
    num: "1.6",
    badge: "BAB 1",
    title: "Sistematika Penulisan Tugas Akhir",
    desc: "Uraian ringkas alur isi Bab I hingga Bab V skripsi secara komprehensif.",
    content:
      "Sistematika penulisan proposal ini dibagi menjadi:\n- BAB I: Menguraikan latar belakang, rumusan masalah, tujuan, dan manfaat.\n- BAB II: Menguraikan tinjauan pustaka, matriks literatur, kerangka pemikiran, dan hipotesis.\n- BAB III: Menguraikan metodologi penelitian, populasi, sampel, instrumen, dan teknik analisis data.",
  },

  // BAB 2
  {
    id: "preset_2_1",
    chapter: "bab2",
    num: "2.1",
    badge: "BAB 2",
    title: "Grand Theory & Middle Range Theory",
    desc: "Landasan teori induk (misal: TAM, UTAUT, RBV, Delone & McLean) yang memayungi variabel.",
    content:
      "Penelitian ini berpijak pada Grand Theory Technology Acceptance Model (Davis, 1989) yang menjelaskan bagaimana pengguna menerima dan menggunakan teknologi berdasarkan persepsi kebermanfaatan (perceived usefulness) dan kemudahan penggunaan (perceived ease of use).",
  },
  {
    id: "preset_2_2",
    chapter: "bab2",
    num: "2.2",
    badge: "BAB 2",
    title: "Kajian Variabel Bebas & Terikat",
    desc: "Uraian teoretis mendalam mengenai dimensi, indikator, dan pengukuran tiap variabel.",
    content:
      "Kajian variabel penelitian mencakup pemetaan indikator teoretis yang teruji validitasnya pada penelitian terdahulu, dilengkapi dengan skala pengukuran Likert 5-poin.",
  },
  {
    id: "preset_2_4",
    chapter: "bab2",
    num: "2.4",
    badge: "BAB 2",
    title: "Pengembangan Hipotesis & Logika Teoretis",
    desc: "Argumen penalaran kausalitas dan telaah komparasi empiris yang melahirkan H1, H2, dst.",
    content:
      "Pengembangan hipotesis dibangun atas telaah bukti empiris jurnal-jurnal bereputasi yang membuktikan adanya korelasi positif dan signifikan antar variabel yang diteliti.",
  },

  // BAB 3
  {
    id: "preset_3_2",
    chapter: "bab3",
    num: "3.2",
    badge: "BAB 3",
    title: "Populasi, Sampel, dan Sampling (Rumus Slovin)",
    desc: "Kriteria inklusi/eksklusi responden, perhitungan ukuran sampel, dan teknik pengambilan sampel.",
    content:
      "Penentuan jumlah sampel menggunakan rumus Slovin dengan tingkat presisi kesalahan (e) sebesar 5%. Teknik pengambilan sampel dilakukan secara purposive sampling dengan kriteria responden aktif.",
  },
  {
    id: "preset_3_3",
    chapter: "bab3",
    num: "3.3",
    badge: "BAB 3",
    title: "Definisi Operasional & Skala Pengukuran Likert",
    desc: "Tabel operasionalisasi variabel, dimensi butir kuesioner, dan penskalaan (1-5 Sangat Setuju).",
    content:
      "Setiap konstruk variabel dioperasionalkan ke dalam 4-5 butir pernyataan kuesioner berskala Likert 5 poin (1: Sangat Tidak Setuju, hingga 5: Sangat Setuju).",
  },
  {
    id: "preset_3_4",
    chapter: "bab3",
    num: "3.4",
    badge: "BAB 3",
    title: "Uji Validitas & Reliabilitas Instrumen",
    desc: "Kriteria r-hitung vs r-tabel Pearson dan batas Cronbach's Alpha > 0.70.",
    content:
      "Pengujian instrumen dilakukan melalui uji validitas (Corrected Item-Total Correlation > r-tabel) dan uji reliabilitas dengan syarat koefisien Cronbach's Alpha > 0.70.",
  },
  {
    id: "preset_3_5",
    chapter: "bab3",
    num: "3.5",
    badge: "BAB 3",
    title: "Teknik Analisis Regresi / PLS-SEM",
    desc: "Uji Measurement Model (Outer Model) dan Structural Model (Inner Model).",
    content:
      "Analisis data diuji menggunakan Structural Equation Modeling berbasis Partial Least Squares (PLS-SEM) dengan evaluasi outer model (Convergent Validity, Discriminant Validity, Composite Reliability) dan inner model (R-Square, f-Square, Path Coefficients).",
  },
];

export interface CoverData {
  title: string;
  author: string;
  nim: string;
  prodi: string;
  fakultas: string;
  universitas: string;
  kota: string;
  year: string;
}

export interface ApprovalData {
  titleEng: string;
  kota: string;
  dateDay: string;
  dateMonth: string;
  dateYear: string;
  pembimbing1: string;
  nipPembimbing1: string;
  pembimbing2: string;
  nipPembimbing2: string;
  kaprodi: string;
  nipKaprodi: string;
}

export interface AbstractData {
  indo: string;
  keywordsIndo: string;
  eng: string;
  keywordsEng: string;
}

export interface AppendixData {
  title: string;
  content: string;
}

export interface PdfPageSelection {
  cover: boolean;
  approval: boolean;
  abstract: boolean;
  bab1: boolean;
  bab2: boolean;
  bab3: boolean;
  references: boolean;
  appendix: boolean;
}

export interface AiChatMessage {
  sender: "ai" | "user";
  text: string;
  time: string;
  revisedContent?: string;
  explanation?: string;
  usedCitations?: string[];
}

export interface TypoSuggestion {
  word: string;
  suggestion: string;
  reason: string;
  position: { x: number; y: number };
}
