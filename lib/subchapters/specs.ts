import { SubchapterSpec } from "./types";

export const SUBCHAPTER_SPECS: Record<string, SubchapterSpec> = {
  // ── KELENGKAPAN DOKUMEN & PRELIMINARIES ──
  SECTION_COVER: {
    slug: "cover",
    code: "SECTION_COVER",
    defaultTitle: "Sampul Depan (Cover Skripsi)",
    cluster: "DOCS",
    aliases: ["cover", "sampul", "halaman_judul", "judul_skripsi"],
    variables: ["TOPIC", "PRODI", "NAMA_MAHASISWA", "NIM", "KAMPUS", "TAHUN"],
    outline: {
      systemPrompt: "Format halaman judul dan sampul depan resmi skripsi sesuai kaidah penulisan institusi perguruan tinggi.",
      recipeSteps: [
        "Cantumkan Judul Penelitian dalam huruf kapital tebal (ALL CAPS), piramida terbalik, proporsional.",
        "Cantumkan tujuan pengajuan dokumen (Tugas Akhir / Skripsi Sarjana).",
        "Cantumkan identitas lengkap mahasiswa: Nama, NIM, Program Studi, Fakultas, Universitas, dan Tahun Akademik.",
      ],
    },
    paper: {
      rules: {
        citationMode: "NONE",
        introSentenceRequired: false,
        alignmentRule: "Sesuai format resmi halaman sampul depan Dikti/Kampus",
        formatStyle: "PARAGRAPH",
        badgeText: "Halaman Sampul • Resmi",
        badgeColor: "#7E22CE",
      },
      previewExample: {
        points: [
          "JUDUL SKRIPSI (HURUF KAPITAL TEBAL, MAKSIMAL 3 BARIS)",
          "PROPOSAL TUGAS AKHIR / SKRIPSI",
          "Disusun oleh: [Nama Mahasiswa] - NIM: [NIM]",
          "PROGRAM STUDI INFORMATIKA - FAKULTAS ILMU KOMPUTER",
          "UNIVERSITAS ZETERA - 2024",
        ],
        renderedDraft: `OPTIMASI KINERJA KECERDASAN BUATAN GENERATIF DENGAN ARSITEKTUR MEMORI DINAMIS PADA PENYUSUNAN PROPOSAL TUGAS AKHIR\n\nPROPOSAL SKRIPSI\n\nDisusun oleh:\nNAMA MAHASISWA\nNIM. 1301210000\n\nPROGRAM STUDI TEKNIK INFORMATIKA\nFAKULTAS INFORMATIKA\nUNIVERSITAS ZETERA\n2024`,
      },
    },
  },

  SECTION_APPROVAL: {
    slug: "persetujuan",
    code: "SECTION_APPROVAL",
    defaultTitle: "Lembar Persetujuan / Pengesahan",
    cluster: "DOCS",
    aliases: ["persetujuan", "pengesahan", "lembar_pengesahan", "pembimbing"],
    variables: ["TOPIC", "PRODI", "NAMA_MAHASISWA", "NIM", "PEMBIMBING"],
    outline: {
      systemPrompt: "Format lembar pengesahan pembimbing dan ketua program studi dengan formulasi kalimat baku berita acara persetujuan proposal.",
      recipeSteps: [
        "Nyatakan judul, nama mahasiswa, dan NIM yang disetujui.",
        "Sediakan kolom tanda tangan Dosen Pembimbing Utama dan Pembimbing Pendamping.",
        "Sediakan kolom pengesahan Ketua Program Studi beserta NIP/NIDN.",
      ],
    },
    paper: {
      rules: {
        citationMode: "NONE",
        introSentenceRequired: false,
        alignmentRule: "Format kolom tanda tangan resmi berita acara",
        formatStyle: "PARAGRAPH",
        badgeText: "Berita Acara • Tanda Tangan",
        badgeColor: "#7E22CE",
      },
      previewExample: {
        points: [
          "LEMBAR PERSETUJUAN PROPOSAL SKRIPSI",
          "Menyatakan bahwa proposal skripsi ini telah diperiksa dan disetujui untuk diseminarkan.",
          "Dosen Pembimbing I & II, serta Ketua Program Studi.",
        ],
        renderedDraft: `LEMBAR PERSETUJUAN PROPOSAL SKRIPSI\n\nJudul: OPTIMASI KINERJA KECERDASAN BUATAN GENERATIF DENGAN ARSITEKTUR MEMORI DINAMIS\nNama: NAMA MAHASISWA\nNIM: 1301210000\n\nTelah disetujui untuk diajukan pada Seminar Proposal Tugas Akhir Program Studi Informatika.\n\nJakarta, 10 Desember 2024\n\nMenyetujui,\n(Pembimbing I)                      (Pembimbing II)\nNIDN. 0401018501                     NIDN. 0402028802`,
      },
    },
  },

  SECTION_ABSTRACT: {
    slug: "abstrak",
    code: "SECTION_ABSTRACT",
    defaultTitle: "Abstrak Dwibahasa & Kata Kunci",
    cluster: "DOCS",
    aliases: ["abstrak", "abstract", "intisari", "dwibahasa", "kata_kunci"],
    variables: ["TOPIC", "PRODI", "METODE", "OBJEK"],
    outline: {
      systemPrompt: "Susun ringkasan abstrak dwibahasa (Bahasa Indonesia & English) mencakup Latar Belakang singkat, Tujuan, Metode, dan Hasil yang diharapkan (IMRAD) dalam 200-250 kata, dilengkapi 3-5 kata kunci relevan.",
      recipeSteps: [
        "Tuliskan abstrak Bahasa Indonesia (200-250 kata) struktur IMRAD dalam 1 paragraf padat.",
        "Sediakan terjemahan akurat dalam Bahasa Inggris akademis baku (Abstract).",
        "Sertakan 3-5 kata kunci (keywords) yang mewakili variabel, metode, dan objek penelitian.",
      ],
    },
    paper: {
      rules: {
        citationMode: "NONE",
        introSentenceRequired: false,
        alignmentRule: "Struktur IMRAD, 1 paragraf padat (200-250 kata), dwibahasa",
        formatStyle: "PARAGRAPH",
        badgeText: "Dwibahasa • Struktur IMRAD",
        badgeColor: "#7E22CE",
      },
      previewExample: {
        points: [
          "ABSTRAK (Bahasa Indonesia): Latar belakang, tujuan, metode yang diusulkan, dan luaran yang diharapkan.",
          "Kata Kunci: 3-5 istilah kunci.",
          "ABSTRACT (English): Accurate translation.",
          "Keywords: 3-5 terms.",
        ],
        renderedDraft: `ABSTRAK\n\nPenyusunan proposal skripsi sering kali menghadapi kendala diskoneksi konteks logika antar-subbab ketika menggunakan alat bantu AI konvensional. Penelitian ini bertujuan untuk merancang dan menguji arsitektur dynamic context memory berbasis taksonomi akademis untuk menyelaraskan narasi proposal secara otomatis. Metode yang digunakan adalah applied experimental research dengan membandingkan model baseline terhadap arsitektur memori terstruktur. Hasil pengujian menunjukkan peningkatan konsistensi logika antar-subbab dengan tingkat keselarasan mencapai 94%.\n\nKata Kunci: Kecerdasan Buatan, Memori Dinamis, Proposal Skripsi.`,
      },
    },
  },

  SECTION_REFERENCES: {
    slug: "daftar-pustaka",
    code: "SECTION_REFERENCES",
    defaultTitle: "Daftar Pustaka (Standar IEEE & APA 7th)",
    cluster: "DOCS",
    aliases: ["daftar_pustaka", "bibliografi", "referensi", "references", "ieee", "apa7"],
    variables: ["TOPIC", "PRODI", "CITATIONS_LIST"],
    outline: {
      systemPrompt: "Format daftar pustaka akademis lengkap berstandar internasional IEEE (numerik kurung siku) atau APA 7th (alfabetis). Pastikan setiap entri memuat nama penulis, tahun, judul, publikasi, dan DOI/URL yang valid.",
      recipeSteps: [
        "Urutkan daftar pustaka sesuai gaya sitasi terpilih (numerik IEEE atau abjad APA 7th).",
        "Pastikan setiap artikel memuat nama penulis, tahun, judul, jurnal, volume, dan tautan DOI.",
      ],
    },
    paper: {
      rules: {
        citationMode: "REQUIRED",
        introSentenceRequired: false,
        alignmentRule: "Hanya memuat pustaka yang disitir dalam teks dokumen (tanpa phantom citation)",
        formatStyle: "NUMBERED_LIST",
        badgeText: "Standar IEEE / APA 7th • Valid DOI",
        badgeColor: "#7E22CE",
      },
      previewExample: {
        points: [
          "[1] A. Vaswani et al., 'Attention is all you need,' in Proc. NeurIPS, 2017, pp. 5998–6008.",
          "[2] Sugiyono, Metode Penelitian Kuantitatif, Kualitatif, dan R&D. Bandung: Alfabeta, 2019.",
          "[3] J. W. Creswell and J. D. Creswell, Research Design: Qualitative, Quantitative, and Mixed Methods Approaches, 5th ed. SAGE, 2018.",
        ],
        renderedDraft: `DAFTAR PUSTAKA\n\n[1] A. Vaswani, N. Shazeer, N. Parmar, J. Uszkoreit, L. Jones, A. N. Gomez, L. Kaiser, and I. Polosukhin, "Attention is all you need," in Advances in Neural Information Processing Systems (NeurIPS), vol. 30, 2017, pp. 5998–6008.\n\n[2] Sugiyono, Metode Penelitian Kuantitatif, Kualitatif, dan R&D. Bandung: CV. Alfabeta, 2019.\n\n[3] J. W. Creswell and J. D. Creswell, Research Design: Qualitative, Quantitative, and Mixed Methods Approaches, 5th ed. Thousand Oaks, CA: SAGE Publications, 2018.`,
      },
    },
  },

  SECTION_APPENDIX: {
    slug: "lampiran",
    code: "SECTION_APPENDIX",
    defaultTitle: "Lampiran & Instrumen Riset",
    cluster: "DOCS",
    aliases: ["lampiran", "appendix", "instrumen_kuesioner", "pedoman_wawancara"],
    variables: ["TOPIC", "PRODI"],
    outline: {
      systemPrompt: "Dokumentasikan lampiran instrumen pengumpulan data, pedoman observasi, kuesioner lengkap, dan contoh transkrip wawancara yang mendukung verifikasi penelitian.",
      recipeSteps: [
        "Susun instrumen pengumpulan data primer (kuesioner terstruktur atau pedoman wawancara).",
        "Sertakan tabel kisi-kisi instrumen penghubung variabel ke butir ukur.",
      ],
    },
    paper: {
      rules: {
        citationMode: "NONE",
        introSentenceRequired: false,
        alignmentRule: "Mendukung pembuktian instrumen yang dijabarkan di Bab 3",
        formatStyle: "PARAGRAPH",
        badgeText: "Instrumen Lengkap • Lampiran Bukti",
        badgeColor: "#7E22CE",
      },
      previewExample: {
        points: [
          "Lampiran 1: Kuesioner Evaluasi Usability Sistem (Skala Likert 1-5).",
          "Lampiran 2: Lembar Validasi Instrumen Ahli (Expert Judgment).",
          "Lampiran 3: Log Telemetri dan Kode Sumber Modul Routing.",
        ],
        renderedDraft: `LAMPIRAN 1: KUESIONER EVALUASI SISTEM\n\nPetunjuk Pengisian: Berikan tanda centang (✓) pada kolom yang paling sesuai dengan penilaian Anda (1 = Sangat Tidak Setuju s/d 5 = Sangat Setuju).\n\nNo. | Pernyataan | 1 | 2 | 3 | 4 | 5 |\n1. Antarmuka membantu penyusunan latar belakang secara terstruktur.\n2. Rumusan masalah yang dihasilkan selaras dengan tujuan penelitian.`,
      },
    },
  },

  // ── BAB I — PENDAHULUAN ──
  SUBCHAPTER_1_1: {
    slug: "latar-belakang",
    code: "SUBCHAPTER_1_1",
    defaultTitle: "Latar Belakang (Piramida Terbalik)",
    cluster: "BAB_1",
    aliases: ["latar_belakang", "latar_belakar", "piramida_terbalik", "fenomena"],
    variables: ["TOPIC", "PRODI", "BACKGROUND_CONTEXT"],
    outline: {
      systemPrompt: `Modeling piramida terbalik 8 langkah dari umum ke spesifik, fenomena empiris, dampak, penelitian terdahulu, research gap, dan jembatan ke rumusan masalah.`,
      recipeSteps: [
        "Definisikan konsep/variabel utama topik dari sumber akademik/resmi.",
        "Jelaskan fenomena/kondisi terkini terkait topik (data, tren, urgensi).",
        "Jelaskan dampak/pentingnya isu ini bila tidak diteliti/ditangani.",
        "Jelaskan konteks objek penelitian (platform, lokasi, populasi yang relevan).",
        "Jelaskan metode/pendekatan yang dipakai dan alasan relevansinya.",
        "Ulas singkat 2–4 penelitian terdahulu sejenis beserta temuannya.",
        "Identifikasi research gap dari penelitian terdahulu tersebut.",
        "Tutup dengan kalimat pengarah ke fokus penelitian (jembatan ke rumusan masalah).",
      ],
    },
    paper: {
      rules: {
        citationMode: "REQUIRED",
        introSentenceRequired: true,
        alignmentRule: "Menjadi landasan pembuktian empiris lahirnya Rumusan Masalah",
        formatStyle: "PARAGRAPH",
        badgeText: "Wajib Sitasi Empiris • Piramida Terbalik",
        badgeColor: "#2563EB",
      },
      previewExample: {
        introSentence: "Perkembangan kecerdasan buatan telah mengubah lanskap pengolahan data modern secara masif.",
        points: [
          "Paragraf 1-2: Landasan konseptual dan fenomena empiris makro [1].",
          "Paragraf 3-4: Tantangan teknis di lapangan dan dampak kegagalan sistem [2].",
          "Paragraf 5-6: Komparasi studi terdahulu serta pembuktian research gap [3], [4].",
          "Paragraf 7-8: Justifikasi metode terpilih dan sintesis perumusan tujuan penelitian.",
        ],
        renderedDraft: `Perkembangan teknologi kecerdasan buatan telah mengubah lanskap pengolahan data modern secara masif. Kendati demikian, berbagai organisasi masih menghadapi kendala latensi dan akurasi model dalam lingkungan produksi skala besar [1].\n\nPenelitian terdahulu yang dilakukan Pratama et al. (2023) menunjukkan bahwa optimasi komputasi awan mampu mereduksi latensi hingga 18%, namun belum mengintegrasikan adaptive memory routing [2]. Berdasarkan kesenjangan penelitian (research gap) tersebut, penelitian ini mengusulkan pendekatan hybrid dynamic context router untuk menjawab keterbatasan efisiensi yang ada.`,
      },
    },
  },

  SUBCHAPTER_1_2: {
    slug: "identifikasi-masalah",
    code: "SUBCHAPTER_1_2",
    defaultTitle: "Identifikasi Masalah",
    cluster: "BAB_1",
    aliases: ["identifikasi_masalah", "objek", "metode", "data"],
    variables: ["TOPIC", "PRODI", "BACKGROUND_CONTEXT"],
    outline: {
      systemPrompt: "Memetakan semua masalah potensial yang muncul dari isu di Latar Belakang dari sisi objek, metode, dan data.",
      recipeSteps: [
        "Daftar masalah yang muncul dari isu di Latar Belakang (poin bernomor).",
        "Pisahkan masalah dari sisi objek penelitian, metode yang digunakan, dan karakteristik data.",
        "Pastikan tiap poin masalah bisa dipetakan ke minimal satu Rumusan Masalah.",
      ],
    },
    paper: {
      rules: {
        citationMode: "NONE",
        introSentenceRequired: true,
        alignmentRule: "Setiap butir masalah harus dapat direspons oleh rumusan masalah",
        formatStyle: "NUMBERED_LIST",
        badgeText: "Tanpa Sitasi • Wajib 1 Kalimat Pengantar",
        badgeColor: "#059669",
      },
      previewExample: {
        introSentence: "Berdasarkan uraian latar belakang yang telah dipaparkan, maka permasalahan yang dapat diidentifikasi dalam penelitian ini adalah sebagai berikut:",
        points: [
          "1. Keterbatasan waktu respon sistem saat menangani lonjakan data transaksi secara simultan.",
          "2. Rendahnya akurasi klasifikasi algoritma eksisting akibat tingginya tingkat ketidakseimbangan kelas pada dataset.",
          "3. Belum tersedianya mekanisme pemantauan anomali terotomasi pada alur kerja operasional pengguna.",
        ],
        renderedDraft: `Berdasarkan uraian latar belakang yang telah dipaparkan, maka permasalahan yang dapat diidentifikasi dalam penelitian ini adalah sebagai berikut:\n1. Keterbatasan waktu respon sistem saat menangani lonjakan data transaksi secara simultan.\n2. Rendahnya akurasi klasifikasi algoritma eksisting akibat tingginya tingkat ketidakseimbangan kelas pada dataset.\n3. Belum tersedianya mekanisme pemantauan anomali terotomasi pada alur kerja operasional pengguna.`,
      },
    },
  },

  SUBCHAPTER_1_3: {
    slug: "rumusan-masalah",
    code: "SUBCHAPTER_1_3",
    defaultTitle: "Rumusan Masalah",
    cluster: "BAB_1",
    aliases: ["rumusan_masalah", "pertanyaan_penelitian", "research_question"],
    variables: ["TOPIC", "PRODI", "BACKGROUND_CONTEXT"],
    outline: {
      systemPrompt: "Perumusan kalimat tanya operasional yang selaras 1:1 dengan Tujuan Penelitian dan dapat dijawab oleh metodologi di Bab 3.",
      recipeSteps: [
        "Tulis dalam kalimat tanya yang jelas (\"Bagaimana...\", \"Apakah...\", \"Sejauh mana...\").",
        "Pastikan jumlah rumusan masalah selaras 1:1 dengan Tujuan Penelitian.",
        "Pastikan tiap rumusan masalah dapat dijawab secara empiris dengan metode di BAB III.",
      ],
    },
    paper: {
      rules: {
        citationMode: "NONE",
        introSentenceRequired: true,
        alignmentRule: "Wajib selaras 1:1 dengan butir Tujuan Penelitian (1.5)",
        formatStyle: "NUMBERED_LIST",
        badgeText: "Tanpa Sitasi • Selaras 1:1 Tujuan",
        badgeColor: "#D97706",
      },
      previewExample: {
        introSentence: "Berdasarkan batasan dan identifikasi masalah yang telah diuraikan, rumusan masalah dalam penelitian ini dirumuskan sebagai berikut:",
        points: [
          "1. Bagaimana merancang arsitektur dynamic context memory untuk meningkatkan pemahaman konteks pada dokumen tugas akhir?",
          "2. Bagaimana kinerja akurasi dan latensi inferensi dari metode yang diusulkan dibandingkan dengan model dasar (baseline)?",
          "3. Sejauh mana kepuasan dan efektivitas penggunaan antarmuka sistem oleh pengguna akhir?",
        ],
        renderedDraft: `Berdasarkan batasan dan identifikasi masalah yang telah diuraikan, rumusan masalah dalam penelitian ini dirumuskan sebagai berikut:\n1. Bagaimana merancang arsitektur dynamic context memory untuk meningkatkan pemahaman konteks pada dokumen tugas akhir?\n2. Bagaimana kinerja akurasi dan latensi inferensi dari metode yang diusulkan dibandingkan dengan model dasar (baseline)?\n3. Sejauh mana kepuasan dan efektivitas penggunaan antarmuka sistem oleh pengguna akhir?`,
      },
    },
  },

  SUBCHAPTER_1_4: {
    slug: "batasan-masalah",
    code: "SUBCHAPTER_1_4",
    defaultTitle: "Batasan Masalah",
    cluster: "BAB_1",
    aliases: ["batasan_masalah", "scope", "ruang_lingkup"],
    variables: ["TOPIC", "PRODI", "BACKGROUND_CONTEXT"],
    outline: {
      systemPrompt: "Membatasi ruang lingkup data, variabel yang diteliti, dan metode/tools yang digunakan agar riset terarah dan feasible.",
      recipeSteps: [
        "Batasi dari sisi data (rentang waktu observasi, jumlah sampel/dataset, sumber data).",
        "Batasi dari sisi variabel atau dimensi yang diteliti (fokus utama riset).",
        "Batasi dari sisi metode, algoritma, framework, atau tools perangkat lunak yang dipakai.",
      ],
    },
    paper: {
      rules: {
        citationMode: "NONE",
        introSentenceRequired: true,
        alignmentRule: "Menjaga batas kelayakan riset agar tidak melebar di luar metodologi Bab 3",
        formatStyle: "NUMBERED_LIST",
        badgeText: "Tanpa Sitasi • Scope Terukur",
        badgeColor: "#4F46E5",
      },
      previewExample: {
        introSentence: "Agar pembahasan dalam penelitian ini terarah dan tidak menyimpang dari tujuan yang ditetapkan, maka batasan masalah ditentukan sebagai berikut:",
        points: [
          "1. Data yang digunakan merupakan data dokumen teks skripsi mahasiswa tahun akademik 2021–2024.",
          "2. Variabel pengujian berfokus pada akurasi penarikan konteks antar-subbab dan kecepatan latensi inferensi.",
          "3. Implementasi sistem dibangun menggunakan bahasa pemrograman TypeScript dengan runtime Node.js dan basis data MySQL.",
        ],
        renderedDraft: `Agar pembahasan dalam penelitian ini terarah dan tidak menyimpang dari tujuan yang ditetapkan, maka batasan masalah ditentukan sebagai berikut:\n1. Data yang digunakan merupakan data dokumen teks skripsi mahasiswa tahun akademik 2021–2024.\n2. Variabel pengujian berfokus pada akurasi penarikan konteks antar-subbab dan kecepatan latensi inferensi.\n3. Implementasi sistem dibangun menggunakan bahasa pemrograman TypeScript dengan runtime Node.js dan basis data MySQL.`,
      },
    },
  },

  SUBCHAPTER_1_5: {
    slug: "tujuan-penelitian",
    code: "SUBCHAPTER_1_5",
    defaultTitle: "Tujuan Penelitian",
    cluster: "BAB_1",
    aliases: ["tujuan_penelitian", "deklaratif", "capaian_riset"],
    variables: ["TOPIC", "PRODI", "BACKGROUND_CONTEXT"],
    outline: {
      systemPrompt: "Pernyataan deklaratif hasil akhir dan capaian konkret penelitian yang selaras 1:1 dengan Rumusan Masalah.",
      recipeSteps: [
        "Tulis satu tujuan untuk tiap Rumusan Masalah dalam kalimat pernyataan deklaratif (\"Untuk mengetahui...\", \"Untuk menganalisis...\", \"Untuk merancang...\").",
        "Pastikan tujuan bersifat terukur (measurable) dan konsisten dengan Batasan Masalah.",
      ],
    },
    paper: {
      rules: {
        citationMode: "NONE",
        introSentenceRequired: true,
        alignmentRule: "Wajib selaras 1:1 dengan Rumusan Masalah (1.3)",
        formatStyle: "NUMBERED_LIST",
        badgeText: "Tanpa Sitasi • Selaras 1:1 Rumusan",
        badgeColor: "#059669",
      },
      previewExample: {
        introSentence: "Mengacu pada rumusan masalah yang telah ditetapkan, maka tujuan yang ingin dicapai dalam penelitian ini adalah sebagai berikut:",
        points: [
          "1. Merancang dan mengimplementasikan arsitektur dynamic context memory untuk menghubungkan pemahaman antar-subbab secara terstruktur.",
          "2. Menguji dan mengevaluasi kinerja akurasi relevansi serta latensi inferensi dari model yang dikembangkan.",
          "3. Menganalisis tingkat kepuasan dan efektivitas alur kerja pengguna dalam menyusun proposal tugas akhir.",
        ],
        renderedDraft: `Mengacu pada rumusan masalah yang telah ditetapkan, maka tujuan yang ingin dicapai dalam penelitian ini adalah sebagai berikut:\n1. Merancang dan mengimplementasikan arsitektur dynamic context memory untuk menghubungkan pemahaman antar-subbab secara terstruktur.\n2. Menguji dan mengevaluasi kinerja akurasi relevansi serta latensi inferensi dari model yang dikembangkan.\n3. Menganalisis tingkat kepuasan dan efektivitas alur kerja pengguna dalam menyusun proposal tugas akhir.`,
      },
    },
  },

  SUBCHAPTER_1_6: {
    slug: "manfaat-penelitian",
    code: "SUBCHAPTER_1_6",
    defaultTitle: "Manfaat Penelitian",
    cluster: "BAB_1",
    aliases: ["manfaat_penelitian", "teoritis", "praktis"],
    variables: ["TOPIC", "PRODI", "BACKGROUND_CONTEXT"],
    outline: {
      systemPrompt: "Menguraikan kontribusi keilmuan (teoretis) dan kegunaan nyata bagi objek/stakeholder (praktis).",
      recipeSteps: [
        "Manfaat teoretis: kontribusi terhadap khazanah keilmuan di bidang studi terkait.",
        "Manfaat praktis: kegunaan konkret bagi objek penelitian, pengguna, organisasi, atau peneliti selanjutnya.",
      ],
    },
    paper: {
      rules: {
        citationMode: "NONE",
        introSentenceRequired: true,
        alignmentRule: "Memperjelas nilai guna riset bagi ranah keilmuan dan praktisi",
        formatStyle: "NUMBERED_LIST",
        badgeText: "Tanpa Sitasi • Teoretis & Praktis",
        badgeColor: "#0284C7",
      },
      previewExample: {
        introSentence: "Hasil dari penelitian ini diharapkan dapat memberikan kontribusi yang nyata baik secara teoretis maupun praktis sebagai berikut:",
        points: [
          "1. Manfaat Teoretis: Memperkaya khazanah keilmuan di bidang Rekayasa Perangkat Lunak dan Kecerdasan Buatan, khususnya mengenai pemodelan memori kontekstual pada sistem penulisan ilmiah terotomasi.",
          "2. Manfaat Praktis: Menjadi pedoman teknis dan solusi perangkat lunak bagi perguruan tinggi dalam membantu mahasiswa menyusun proposal penelitian yang selaras dengan kaidah metodologis.",
        ],
        renderedDraft: `Hasil dari penelitian ini diharapkan dapat memberikan kontribusi yang nyata baik secara teoretis maupun praktis sebagai berikut:\n1. Manfaat Teoretis: Memperkaya khazanah keilmuan di bidang Rekayasa Perangkat Lunak dan Kecerdasan Buatan, khususnya mengenai pemodelan memori kontekstual pada sistem penulisan ilmiah terotomasi.\n2. Manfaat Praktis: Menjadi pedoman teknis dan solusi perangkat lunak bagi perguruan tinggi dalam membantu mahasiswa menyusun proposal penelitian yang selaras dengan kaidah metodologis.`,
      },
    },
  },

  SUBCHAPTER_1_7: {
    slug: "sistematika-penulisan",
    code: "SUBCHAPTER_1_7",
    defaultTitle: "Sistematika Penulisan (Roadmap Dokumen)",
    cluster: "BAB_1",
    aliases: ["sistematika_penulisan", "roadmap", "daftar_isi"],
    variables: ["TOPIC", "PRODI", "DATABASE_TOC"],
    outline: {
      systemPrompt: "Menyusun narasi roadmap struktur bab per bab sesuai Daftar Isi resmi database proyek secara kohesif tanpa sitasi pustaka.",
      recipeSteps: [
        "Baca seluruh daftar BAB dan sub-bab yang terdaftar di Daftar Isi Database proyek.",
        "Tuliskan narasi ringkas per bab yang merangkum fokus utama dan keterkaitan logis antar bab.",
        "Pastikan tidak ada sitasi kurung siku [1], [2] atau klaim pustaka (murni alur dokumen skripsi).",
      ],
    },
    paper: {
      rules: {
        citationMode: "NONE",
        introSentenceRequired: true,
        alignmentRule: "Wajib sinkron 1:1 dengan struktur Daftar Isi resmi di database proyek",
        formatStyle: "ROADMAP",
        badgeText: "Sinkron DB Daftar Isi • Tanpa Sitasi",
        badgeColor: "#10B981",
      },
      previewExample: {
        // ⚠️ PREVIEW INI HANYA CONTOH ILUSTRATIF — OUTPUT NYATA MENGIKUTI DAFTAR ISI DATABASE PROYEK USER
        // Jumlah BAB & isinya FLEKSIBEL mengikuti daftar isi yang dibuat mahasiswa (bisa 4, 5, 6 bab, dll.)
        introSentence: "Sistematika penulisan skripsi ini disusun ke dalam beberapa bab sebagai berikut:",
        points: [
          "BAB I PENDAHULUAN: Menguraikan latar belakang permasalahan, identifikasi masalah, rumusan masalah, batasan masalah, tujuan penelitian, dan manfaat penelitian.",
          "BAB II LANDASAN TEORI: Membahas landasan teori relevan, matriks komparasi penelitian terdahulu, dan kerangka berpikir.",
          "BAB III METODOLOGI PENELITIAN: Menjelaskan jenis dan pendekatan penelitian, objek/lokasi, populasi, teknik pengumpulan data, instrumen, dan teknik analisis.",
          "BAB IV HASIL DAN PEMBAHASAN: Memaparkan data, pengujian model, serta analisis temuan secara empiris.",
          "BAB V KESIMPULAN DAN SARAN: Merangkum hasil dan memberikan arahan pengembangan selanjutnya.",
        ],
        // Format: setiap BAB sebagai paragraf tersendiri — nama BAB BOLD kapital, deskripsi menjorok di bawahnya
        // (Persis seperti format skripsi Indonesia pada umumnya)
        renderedDraft:
          "Sistematika penulisan skripsi ini disusun ke dalam beberapa bab sebagai berikut:\n\n" +
          "**BAB I PENDAHULUAN**\nBab ini berisikan latar belakang masalah, rumusan masalah, batasan masalah, tujuan dan manfaat penelitian, metode penelitian, dan sistematika penulisan.\n\n" +
          "**BAB II LANDASAN TEORI**\nBab ini membahas secara singkat teori yang diperlukan dalam penelitian, penelitian terdahulu yang relevan, serta kerangka berpikir yang menjadi dasar konseptual penelitian.\n\n" +
          "**BAB III METODOLOGI PENELITIAN**\nPada bab ini akan dijelaskan metode yang digunakan penulis dalam melakukan penelitian, meliputi jenis penelitian, objek penelitian, teknik pengumpulan data, instrumen penelitian, dan teknik analisis data.\n\n" +
          "**BAB IV HASIL DAN PEMBAHASAN**\nBab ini memaparkan hasil analisis data, pengujian hipotesis atau model, serta pembahasan temuan penelitian secara empiris.\n\n" +
          "**BAB V KESIMPULAN DAN SARAN**\nBab ini merangkum kesimpulan dari seluruh hasil penelitian dan memberikan saran serta arahan pengembangan selanjutnya.",
        formatNote: "Tiap BAB = paragraf tersendiri (bold heading + deskripsi). Jumlah bab otomatis menyesuaikan Daftar Isi database proyek user.",
      },
    },
  },

  // ── BAB II — TINJAUAN PUSTAKA & LANDASAN TEORI ──
  SUBCHAPTER_2_1: {
    slug: "landasan-teori",
    code: "SUBCHAPTER_2_1",
    defaultTitle: "Landasan Teori",
    cluster: "BAB_2",
    aliases: ["landasan_teori", "definisi_konsep"],
    variables: ["TOPIC", "PRODI"],
    outline: {
      systemPrompt: "Kajian konsep fundamental, sintesis definisi kerja, dimensi indikator, dan cara kerja teknis metode.",
      recipeSteps: [
        "Definisi konsep dari minimal 2 sumber (buku/jurnal), bandingkan, lalu simpulkan definisi kerja yang dipakai penelitian ini.",
        "Karakteristik/dimensi/indikator dari konsep tersebut.",
        "Jika topik memakai metode/algoritma spesifik → jelaskan cara kerjanya secara konseptual, rujuk sumber aslinya.",
      ],
    },
    paper: {
      rules: {
        citationMode: "REQUIRED",
        introSentenceRequired: true,
        alignmentRule: "Mendasari setiap variabel dan metode yang akan diukur pada Bab 3",
        formatStyle: "PARAGRAPH",
        badgeText: "Wajib Sitasi Pustaka • Multi-Sumber",
        badgeColor: "#059669",
      },
      previewExample: {
        introSentence: "Landasan teori dalam penelitian ini mencakup pemaparan konsep-konsep fundamental yang menjadi pijakan teoretis pemecahan masalah:",
        points: [
          "1. Konsep Large Language Model (LLM) dan Attention Mechanism [5].",
          "2. Teori Dynamic Context Window dan Stateful Memory Architecture [6].",
          "3. Kerangka Evaluasi RAG (Retrieval-Augmented Generation) [7].",
        ],
        renderedDraft: `Kecerdasan Buatan Generatif berbasis Transformer memanfaatkan mekanisme multi-head self-attention untuk memproses dependensi konteks teks panjang [5]. Vaswani et al. (2017) menyatakan bahwa representasi vektor mampu menangkap relasi semantik secara efektif, namun tetap dibatasi oleh panjang jendela konteks maksimum.\n\nDalam konteks penelitian ini, definisi operasional Large Language Model mengacu pada arsitektur pretrained transformer yang dipadukan dengan modul memori terstruktur untuk mempertahankan histori keputusan ilmiah antar-subbab [6].`,
      },
    },
  },

  SUBCHAPTER_2_2: {
    slug: "penelitian-terdahulu",
    code: "SUBCHAPTER_2_2",
    defaultTitle: "Penelitian Terdahulu (Matriks Komparasi)",
    cluster: "BAB_2",
    aliases: ["penelitian_terdahulu", "tabel_komparasi", "state_of_the_art"],
    variables: ["TOPIC", "PRODI"],
    outline: {
      systemPrompt: "Tabel dan sintesis komparasi studi empiris terkini untuk menegaskan kebaruan (novelty) dan posisi riset.",
      recipeSteps: [
        "Tabel/daftar penelitian terdahulu: peneliti, tahun, topik, metode, hasil.",
        "Analisis persamaan & perbedaan dengan penelitian ini.",
        "Simpulkan gap/kontribusi baru penelitian ini secara eksplisit.",
      ],
    },
    paper: {
      rules: {
        citationMode: "REQUIRED",
        introSentenceRequired: true,
        alignmentRule: "Membuktikan kebaruan (novelty) dan mencegah duplikasi penelitian",
        formatStyle: "TABLE",
        badgeText: "Wajib Matriks Tabel • Novelty Gap",
        badgeColor: "#059669",
      },
      previewExample: {
        introSentence: "Kajian terhadap penelitian-penelitian terdahulu yang relevan disajikan dalam bentuk matriks komparasi berikut guna mempertegas posisi kebaruan penelitian:",
        points: [
          "1. Susun tabel komparasi: Peneliti (Tahun), Judul, Metode, Hasil Utama, dan Persamaan/Perbedaan.",
          "2. Narasi sintesis kritis yang menjelaskan kelemahan/keterbatasan studi terdahulu.",
          "3. Deklarasi kebaruan: 'Perbedaan mendasar penelitian ini dengan penelitian sebelumnya terletak pada integrasi...'",
        ],
        renderedDraft: `Kajian terhadap penelitian terdahulu yang relevan disajikan dalam bentuk matriks komparasi guna mempertegas posisi kebaruan penelitian:\n\nTabel 2.1 Matriks Komparasi Penelitian Terdahulu\n| No | Peneliti & Tahun | Metode | Hasil Utama | Perbedaan dengan Penelitian Ini |\n| 1 | Wibowo et al. (2022) | TF-IDF + Cosine | Relevansi dokumen 74% | Menggunakan representasi sparse statis, belum kontekstual |\n| 2 | Hidayat (2023) | Fine-tuned BERT | Akurasi F1 82% | Belum memiliki memori terstruktur antar-bab |\n\nBerdasarkan matriks di atas, kebaruan penelitian ini terletak pada penerapan arsitektur memori berlapis yang menghubungkan keputusan pada Bab 1 langsung ke pembentukan instrumen Bab 3.`,
      },
    },
  },

  SUBCHAPTER_2_3: {
    slug: "kerangka-berpikir",
    code: "SUBCHAPTER_2_3",
    defaultTitle: "Kerangka Berpikir",
    cluster: "BAB_2",
    aliases: ["kerangka_berpikir", "alur_input_output", "konseptual"],
    variables: ["TOPIC", "PRODI"],
    outline: {
      systemPrompt: "Visualisasi alur logis dari masalah & data, proses metode, hingga solusi output yang diharapkan.",
      recipeSteps: [
        "Gambarkan alur input → proses/metode → output yang diharapkan (diagram kerangka berpikir).",
        "Hubungkan tiap elemen kerangka berpikir ke teori di 2.1 dan gap di 2.2.",
      ],
    },
    paper: {
      rules: {
        citationMode: "OPTIONAL",
        introSentenceRequired: true,
        alignmentRule: "Menjadi jembatan logis dari masalah teoretis ke prosedur teknis Bab 3",
        formatStyle: "PARAGRAPH",
        badgeText: "Diagram Alur Logis • Input-Proses-Output",
        badgeColor: "#059669",
      },
      previewExample: {
        introSentence: "Kerangka berpikir dalam penelitian ini menggambarkan alur penyelesaian masalah secara terstruktur dari tahap identifikasi hingga pencapaian luaran akhir:",
        points: [
          "1. Input: Tingginya diskoneksi konteks antar-subbab pada penyusunan skripsi mahasiswa.",
          "2. Proses: Penerapan stateful memory embedding dan dynamic prompt injection berbasis taksonomi akademis.",
          "3. Output: Draf proposal skripsi yang utuh, kohesif, dan terverifikasi bebas sitasi pada bagian non-empiris.",
        ],
        renderedDraft: `Kerangka berpikir dalam penelitian ini disusun untuk menguraikan alur penalaran logis dari fenomena permasalahan menuju solusi akhir:\n\n1. Tahap Masukan (Input): Fenomena inkonsistensi narasi antar-subbab tugas akhir akibat model AI yang memproses instruksi secara terisolasi tanpa memory sharing.\n\n2. Tahap Pemrosesan (Process): Perancangan database-driven skill taxonomy dengan modul memori terstruktur yang mengaitkan identifikasi masalah, rumusan masalah, dan tujuan secara 1:1.\n\n3. Tahap Luaran (Output): Terwujudnya sistem asisten cerdas yang mampu menyintesis proposal penelitian secara adaptif dengan tingkat keselarasan logis yang tinggi.`,
      },
    },
  },

  SUBCHAPTER_2_4: {
    slug: "hipotesis-penelitian",
    code: "SUBCHAPTER_2_4",
    defaultTitle: "Hipotesis Penelitian [Kuantitatif]",
    cluster: "BAB_2",
    aliases: ["hipotesis", "kuantitatif", "h0_h1"],
    variables: ["TOPIC", "PRODI"],
    outline: {
      systemPrompt: "Perumusan dugaan sementara H0 dan H1 terarah yang akan diuji melalui statistik inferensial.",
      recipeSteps: [
        "Tulis H0/H1 untuk tiap hubungan variabel yang diuji.",
        "Harus konsisten dengan Rumusan Masalah & Kerangka Berpikir.",
      ],
    },
    paper: {
      rules: {
        citationMode: "OPTIONAL",
        introSentenceRequired: true,
        alignmentRule: "Wajib diuji secara inferensial pada teknik analisis Bab 3 dan hasil Bab 4",
        formatStyle: "NUMBERED_LIST",
        badgeText: "Kuantitatif • Format H0/H1",
        badgeColor: "#059669",
      },
      previewExample: {
        introSentence: "Berdasarkan kerangka pemikiran dan rumusan masalah yang diajukan, hipotesis dalam penelitian ini dirumuskan sebagai berikut:",
        points: [
          "H0: Tidak terdapat perbedaan performa akurasi yang signifikan antara arsitektur baseline dengan model dynamic context memory.",
          "H1: Terdapat peningkatan akurasi relevansi dan reduksi halusinasi yang signifikan pada model dengan dynamic context memory dibandingkan arsitektur baseline.",
        ],
        renderedDraft: `Berdasarkan kerangka pemikiran dan rumusan masalah yang diajukan, hipotesis dalam penelitian ini dirumuskan sebagai berikut:\n\nH0: Tidak terdapat perbedaan performa akurasi yang signifikan antara arsitektur baseline dengan model dynamic context memory.\n\nH1: Terdapat peningkatan akurasi relevansi dan reduksi halusinasi yang signifikan pada model dengan dynamic context memory dibandingkan arsitektur baseline.`,
      },
    },
  },

  // ── BAB III — METODOLOGI PENELITIAN ──
  SUBCHAPTER_3_1: {
    slug: "pendekatan-penelitian",
    code: "SUBCHAPTER_3_1",
    defaultTitle: "Jenis / Pendekatan Penelitian",
    cluster: "BAB_3",
    aliases: ["pendekatan", "metodologi", "desain_penelitian"],
    variables: ["TOPIC", "PRODI", "APPROACH"],
    outline: {
      systemPrompt: "Deklarasi paradigma metodologis (Kuantitatif / Kualitatif) dan rujukan buku metodologi standar.",
      recipeSteps: [
        "Nyatakan pendekatan (kuantitatif/kualitatif) dan alasan pemilihan, dikaitkan ke Rumusan Masalah.",
        "Rujuk definisi pendekatan dari sumber metodologi (mis. Sugiyono, Creswell).",
      ],
    },
    paper: {
      rules: {
        citationMode: "REQUIRED",
        introSentenceRequired: true,
        alignmentRule: "Menjadi landasan operasional bagi teknik sampling dan instrumen",
        formatStyle: "PARAGRAPH",
        badgeText: "Rujuk Buku Metodologi • Sugiyono/Creswell",
        badgeColor: "#D97706",
      },
      previewExample: {
        introSentence: "Penelitian ini menggunakan pendekatan ilmiah terstruktur guna menjawab rumusan masalah yang telah ditetapkan:",
        points: [
          "1. Pendekatan: Metode Kuantitatif dengan desain Eksperimen Semu (Quasi-Experiment).",
          "2. Rujukan: Sugiyono (2019) dan Creswell (2018) mengenai pengukuran empiris terukur.",
          "3. Justifikasi: Pendekatan ini dipilih karena penelitian mengukur performa teknis sistem secara numerik.",
        ],
        renderedDraft: `Penelitian ini menggunakan pendekatan kuantitatif dengan desain eksperimen terapan (applied research). Menurut Sugiyono (2019), metode kuantitatif digunakan untuk meneliti pada populasi atau sampel tertentu dengan instrumen pengujian terstandar guna menguji hipotesis yang telah dirumuskan [8].\n\nPendekatan ini dipandang paling tepat karena rumusan masalah dalam penelitian ini berorientasi pada pengukuran performa objektif berupa tingkat akurasi inferensi konteks dan efisiensi waktu komputasi.`,
      },
    },
  },

  SUBCHAPTER_3_2: {
    slug: "objek-lokasi",
    code: "SUBCHAPTER_3_2",
    defaultTitle: "Objek / Subjek dan Lokasi Penelitian",
    cluster: "BAB_3",
    aliases: ["objek_penelitian", "dataset", "lokasi_penelitian"],
    variables: ["TOPIC", "PRODI"],
    outline: {
      systemPrompt: "Profil platform, dataset, sistem, dan batasan spasial/waktu observasi penelitian.",
      recipeSteps: [
        "Jelaskan objek penelitian (platform/perusahaan/dataset) dan alasan pemilihannya.",
        "Jelaskan lokasi/waktu penelitian bila relevan.",
      ],
    },
    paper: {
      rules: {
        citationMode: "OPTIONAL",
        introSentenceRequired: true,
        alignmentRule: "Memberikan kepastian batasan empiris di mana observasi dilakukan",
        formatStyle: "PARAGRAPH",
        badgeText: "Profil Objek • Ruang & Waktu",
        badgeColor: "#D97706",
      },
      previewExample: {
        introSentence: "Objek dan ruang lingkup tempat pelaksanaan penelitian ini diuraikan sebagai berikut:",
        points: [
          "1. Objek Penelitian: Korpus naskah skripsi mahasiswa dan modul inferensi AI Router.",
          "2. Waktu & Lingkungan: Periode semester ganjil 2024/2025 pada lingkungan server laboratorium komputasi.",
        ],
        renderedDraft: `Objek dalam penelitian ini adalah dokumen proposal skripsi dan modul memori pada platform asisten penulisan ilmiah Zetera. Penelitian ini berfokus pada interaksi data antara input formulir mahasiswa dengan struktur bab resmi.\n\nPengambilan data dan pengujian eksperimental dilakukan pada lingkungan cloud server privat yang dikonfigurasi pada rentang bulan Oktober hingga Desember 2024.`,
      },
    },
  },

  SUBCHAPTER_3_3: {
    slug: "populasi-sampel",
    code: "SUBCHAPTER_3_3",
    defaultTitle: "Populasi & Sampel / Subjek & Informan",
    cluster: "BAB_3",
    aliases: ["populasi", "sampel", "sampling_slovin"],
    variables: ["TOPIC", "PRODI"],
    outline: {
      systemPrompt: "Penetapan populasi target, rumus ukuran sampel (Kuantitatif) atau kriteria informan kunci (Kualitatif).",
      recipeSteps: [
        "Kuantitatif: Definisikan populasi, teknik sampling, justifikasi ukuran sampel (rumus Slovin/Krejcie).",
        "Kualitatif: Kriteria informan/subjek dan teknik penentuannya (purposive/snowball).",
      ],
    },
    paper: {
      rules: {
        citationMode: "REQUIRED",
        introSentenceRequired: true,
        alignmentRule: "Sampel harus mewakili populasi target secara representatif",
        formatStyle: "PARAGRAPH",
        badgeText: "Rumus Sampling • Slovin / Purposive",
        badgeColor: "#D97706",
      },
      previewExample: {
        introSentence: "Populasi dan penetapan jumlah sampel dalam penelitian ini ditentukan berdasarkan kriteria metodologis berikut:",
        points: [
          "1. Populasi: Sebanyak 450 dokumen skripsi mahasiswa program studi Informatika.",
          "2. Rumus: Menggunakan rumus Slovin dengan batas toleransi kesalahan (error margin) 5%.",
          "3. Sampel: Diperoleh ukuran sampel minimum sebanyak 212 dokumen melalui Stratified Random Sampling.",
        ],
        renderedDraft: `Populasi dalam penelitian ini adalah seluruh berkas naskah skripsi mahasiswa tingkat akhir yang terdaftar pada sistem repositori kampus sejumlah 450 dokumen. Penentuan ukuran sampel dilakukan menggunakan rumus Slovin dengan tingkat presisi e = 0,05 [9]:\n\nn = N / (1 + N(e)^2) = 450 / (1 + 450(0,05)^2) = 211,76 ≈ 212 dokumen.`,
      },
    },
  },

  SUBCHAPTER_3_4: {
    slug: "pengumpulan-data",
    code: "SUBCHAPTER_3_4",
    defaultTitle: "Teknik Pengumpulan Data",
    cluster: "BAB_3",
    aliases: ["pengumpulan_data", "primer", "sekunder", "kuesioner"],
    variables: ["TOPIC", "PRODI"],
    outline: {
      systemPrompt: "Prosedur pengumpulan data primer dan sekunder (kuesioner, wawancara, observasi, scraping API).",
      recipeSteps: [
        "Jelaskan sumber data (primer/sekunder).",
        "Jelaskan metode pengumpulan (kuesioner/wawancara/scraping/API) beserta prosedurnya.",
      ],
    },
    paper: {
      rules: {
        citationMode: "OPTIONAL",
        introSentenceRequired: true,
        alignmentRule: "Memastikan data yang dikumpulkan valid dan dapat diuji reliabilitasnya",
        formatStyle: "NUMBERED_LIST",
        badgeText: "Primer & Sekunder • Prosedural",
        badgeColor: "#D97706",
      },
      previewExample: {
        introSentence: "Teknik pengumpulan data yang diterapkan dalam penelitian ini dirancang secara sistematis melalui dua pendekatan sumber data:",
        points: [
          "1. Data Primer: Diperoleh melalui observasi langsung pencatatan log latensi inferensi dan kuesioner kepada 50 responden pengguna sistem.",
          "2. Data Sekunder: Diperoleh dari arsip repositori digital naskah tugas akhir serta referensi jurnal internasional bereputasi.",
        ],
        renderedDraft: `Teknik pengumpulan data yang diterapkan dalam penelitian ini dirancang secara sistematis melalui dua pendekatan sumber data:\n\n1. Data Primer: Diperoleh melalui pencatatan log telemetri performa sistem (response time, token count) saat model memproses instruksi, serta kuesioner evaluasi kegunaan sistem.\n\n2. Data Sekunder: Diperoleh dari dokumen naskah tugas akhir yang telah lulus uji sidang pada repositori perpustakaan universitas.`,
      },
    },
  },

  SUBCHAPTER_3_5: {
    slug: "instrumen-penelitian",
    code: "SUBCHAPTER_3_5",
    defaultTitle: "Instrumen Penelitian & Kisi-Kisi",
    cluster: "BAB_3",
    aliases: ["instrumen", "kisi_kisi", "alat_ukur"],
    variables: ["TOPIC", "PRODI"],
    outline: {
      systemPrompt: "Dokumentasi alat ukur, pedoman pengumpulan data, software pendukung, dan tabel kisi-kisi instrumen.",
      recipeSteps: [
        "Jelaskan alat/instrumen yang dipakai (kuesioner, pedoman wawancara, tools/software).",
        "Sertakan tabel kisi-kisi instrumen (variabel, indikator, butir ukur).",
      ],
    },
    paper: {
      rules: {
        citationMode: "OPTIONAL",
        introSentenceRequired: true,
        alignmentRule: "Setiap variabel harus memiliki indikator ukur empiris yang terpetakan jelas",
        formatStyle: "TABLE",
        badgeText: "Tabel Kisi-Kisi • Butir Ukur",
        badgeColor: "#D97706",
      },
      previewExample: {
        introSentence: "Instrumen penelitian yang digunakan terdiri dari perangkat keras, perangkat lunak pengujian, dan instrumen kuesioner terstruktur dengan kisi-kisi sebagai berikut:",
        points: [
          "1. Perangkat Keras & Lunak: Node.js v20, MySQL 8.0, Groq SDK Llama-3.3-70b.",
          "2. Kisi-Kisi Instrumen: Pemetaan Variabel Efisiensi, Akurasi Konteks, dan Usability ke 15 butir kuesioner skala Likert 1-5.",
        ],
        renderedDraft: `Instrumen yang digunakan dalam penelitian ini mencakup perangkat lunak komputasi dan instrumen kuesioner terstruktur:\n\nTabel 3.1 Kisi-Kisi Instrumen Penelitian\n| Variabel | Indikator | No. Butir |\n| Kegunaan (Usefulness) | Membantu penyusunan latar belakang piramida terbalik | 1, 2, 3 |\n| Kemudahan (Ease of Use) | Kemudahan memahami navigasi antarmuka per sub-bab | 4, 5, 6 |\n| Kepuasan (Satisfaction) | Keselarasan rumusan masalah dan tujuan penelitian | 7, 8, 9 |`,
      },
    },
  },

  SUBCHAPTER_3_6: {
    slug: "definisi-operasional",
    code: "SUBCHAPTER_3_6",
    defaultTitle: "Definisi Operasional Variabel [Kuantitatif]",
    cluster: "BAB_3",
    aliases: ["definisi_operasional", "variabel", "indikator_empiris"],
    variables: ["TOPIC", "PRODI"],
    outline: {
      systemPrompt: "Pemetaan konsep teoretis ke indikator empiris terukur dan skala pengukurannya.",
      recipeSteps: [
        "Untuk tiap variabel: definisi operasional, indikator, skala pengukuran (Likert/Nominal/Interval/Rasio).",
      ],
    },
    paper: {
      rules: {
        citationMode: "OPTIONAL",
        introSentenceRequired: true,
        alignmentRule: "Mengubah konsep abstrak menjadi besaran angka/metrik yang dapat dihitung",
        formatStyle: "TABLE",
        badgeText: "Tabel Operasional • Skala Metrik",
        badgeColor: "#D97706",
      },
      previewExample: {
        introSentence: "Definisi operasional variabel dalam penelitian ini dijabarkan pada tabel berikut untuk menghindari ambiguitas pemaknaan istilah:",
        points: [
          "1. Variabel Bebas (X): Dynamic Context Router dengan indikator embedding similarity score (skala rasio 0.0 - 1.0).",
          "2. Variabel Terikat (Y): Kohesi Dokumen Skripsi dengan indikator skor evaluasi kelayakan akademis (skala Likert 1 - 5).",
        ],
        renderedDraft: `Definisi operasional variabel dalam penelitian ini dijabarkan pada tabel berikut guna memperjelas batasan pengukuran empiris:\n\nTabel 3.2 Definisi Operasional Variabel Penelitian\n| Variabel | Definisi Operasional | Indikator Pengukuran | Skala |\n| Latensi Inferensi (X1) | Durasi waktu yang dibutuhkan model sejak instruksi dikirim hingga token pertama diterima | Waktu dalam satuan milidetik (ms) | Rasio |\n| Akurasi Konteks (Y1) | Derajat ketepatan hubungan logika antar-subbab tanpa pengulangan informasi | Skor penilaian rubrik validator ahli (1-100) | Interval |`,
      },
    },
  },

  SUBCHAPTER_3_7: {
    slug: "analisis-data",
    code: "SUBCHAPTER_3_7",
    defaultTitle: "Teknik Analisis Data",
    cluster: "BAB_3",
    aliases: ["analisis_data", "statistik", "uji_hipotesis"],
    variables: ["TOPIC", "PRODI"],
    outline: {
      systemPrompt: "Tahapan pemrosesan data mentah, uji statistik, atau reduksi & penyajian temuan.",
      recipeSteps: [
        "Jelaskan tahapan analisis berurutan (preprocessing → metode inti → evaluasi).",
        "Kuantitatif: Uji statistik yang dipakai & alasannya.",
        "Kualitatif: Teknik analisis (Miles & Huberman: reduksi, penyajian, verifikasi data).",
      ],
    },
    paper: {
      rules: {
        citationMode: "REQUIRED",
        introSentenceRequired: true,
        alignmentRule: "Prosedur analisis harus secara langsung menjawab Rumusan Masalah",
        formatStyle: "PARAGRAPH",
        badgeText: "Tahapan Berurutan • Uji Statistik",
        badgeColor: "#D97706",
      },
      previewExample: {
        introSentence: "Teknik analisis data dalam penelitian ini dilakukan melalui tiga tahapan terstruktur sebagai berikut:",
        points: [
          "1. Pra-pemrosesan Data: Pembersihan teks, parsing struktur bab, dan tokenisasi metadata.",
          "2. Pemodelan Inti: Eksekusi dynamic context routing dengan integrasi basis data MySQL.",
          "3. Uji Statistik & Evaluasi: Uji Wilcoxon Signed-Rank Test untuk membandingkan skor relevansi sebelum dan sesudah intervensi sistem.",
        ],
        renderedDraft: `Teknik analisis data dalam penelitian ini dilakukan melalui tiga tahapan berurutan:\n\n1. Pra-pemrosesan Data (Data Preprocessing): Berkas naskah proposal diekstraksi ke format teks terstruktur, kemudian dilakukan penghilangan karakter noise dan normalisasi tata letak sub-bab.\n\n2. Pemrosesan Inti (Core Modeling): Modul AI Router mengeksekusi sintesis draf dengan parameter suhu rendah (0,25) dan menginjeksikan memori terstruktur dari sub-bab sebelumnya.\n\n3. Evaluasi Metrik dan Uji Hipotesis: Dilakukan perbandingan skor konsistensi menggunakan Paired Sample t-Test pada taraf signifikansi α = 0,05.`,
      },
    },
  },

  SUBCHAPTER_3_8: {
    slug: "uji-keabsahan",
    code: "SUBCHAPTER_3_8",
    defaultTitle: "Uji Validitas & Reliabilitas / Keabsahan Data",
    cluster: "BAB_3",
    aliases: ["validitas", "reliabilitas", "triangulasi"],
    variables: ["TOPIC", "PRODI"],
    outline: {
      systemPrompt: "Prosedur pengujian validitas butir, reliabilitas Cronbach Alpha, atau triangulasi data.",
      recipeSteps: [
        "Kuantitatif: Uji instrumen (validitas Pearson/CFA, reliabilitas Cronbach Alpha > 0.70).",
        "Kualitatif: Teknik triangulasi (sumber, metode, waktu) dan member checking untuk menjamin keabsahan data.",
      ],
    },
    paper: {
      rules: {
        citationMode: "REQUIRED",
        introSentenceRequired: true,
        alignmentRule: "Menjamin instrumen ukur benar-benar mengukur apa yang seharusnya diukur",
        formatStyle: "PARAGRAPH",
        badgeText: "Validitas Pearson • Cronbach Alpha > 0.70",
        badgeColor: "#D97706",
      },
      previewExample: {
        introSentence: "Untuk memastikan bahwa data yang dihimpun memiliki derajat ketepatan dan konsistensi yang tinggi, instrumen penelitian diuji melalui dua tahapan pengujian:",
        points: [
          "1. Uji Validitas: Menggunakan korelasi Product Moment Pearson dengan kriteria r-hitung > r-tabel pada signifikansi 5%.",
          "2. Uji Reliabilitas: Menggunakan koefisien Cronbach's Alpha dengan ambang batas keandalan minimum 0,70.",
        ],
        renderedDraft: `Guna menjamin keabsahan instrumen ukur, dilakukan pengujian validitas dan reliabilitas data:\n\n1. Uji Validitas: Dilakukan dengan membandingkan nilai r-hitung (korelasi Pearson) tiap butir pernyataan dengan nilai r-tabel pada taraf signifikansi 5%. Butir instrumen dinyatakan valid apabila nilai r-hitung > r-tabel.\n\n2. Uji Reliabilitas: Dilakukan terhadap butir-butir yang telah valid dengan mengukur nilai koefisien Cronbach's Alpha (≥ 0,70).`,
      },
    },
  },
};

export function getSubchapterSpec(codeOrSlug: string): SubchapterSpec | undefined {
  if (!codeOrSlug) return undefined;
  if (SUBCHAPTER_SPECS[codeOrSlug]) return SUBCHAPTER_SPECS[codeOrSlug];
  return Object.values(SUBCHAPTER_SPECS).find(
    (s) => s.slug === codeOrSlug || s.code === codeOrSlug || s.aliases.includes(codeOrSlug.toLowerCase())
  );
}
