export interface UniversityItem {
  name: string;
  city?: string;
  province?: string;
  domains?: string[];
}

export const INDONESIAN_UNIVERSITIES: UniversityItem[] = [
  // Jawa Barat & Banten
  { name: "Universitas Terakreditasi", city: "Bandung", province: "Jawa Barat" },
  { name: "Institut Teknologi Bandung (ITB)", city: "Bandung", province: "Jawa Barat" },
  { name: "Universitas Padjadjaran (UNPAD)", city: "Sumedang", province: "Jawa Barat" },
  { name: "Universitas Pendidikan Indonesia (UPI)", city: "Bandung", province: "Jawa Barat" },
  { name: "Universitas Katolik Parahyangan (UNPAR)", city: "Bandung", province: "Jawa Barat" },
  { name: "Universitas Kristen Maranatha", city: "Bandung", province: "Jawa Barat" },
  { name: "Universitas Pasundan (UNPAS)", city: "Bandung", province: "Jawa Barat" },
  { name: "Universitas Islam Bandung (UNISBA)", city: "Bandung", province: "Jawa Barat" },
  { name: "Universitas Komputer Indonesia (UNIKOM)", city: "Bandung", province: "Jawa Barat" },
  { name: "Universitas Widyatama", city: "Bandung", province: "Jawa Barat" },
  { name: "Politeknik Negeri Bandung (POLBAN)", city: "Bandung", province: "Jawa Barat" },
  { name: "Politeknik Manufaktur Bandung (POLMAN)", city: "Bandung", province: "Jawa Barat" },
  { name: "UIN Sunan Gunung Djati", city: "Bandung", province: "Jawa Barat" },
  { name: "Institut Pertanian Bogor (IPB University)", city: "Bogor", province: "Jawa Barat" },
  { name: "Universitas Pakuan", city: "Bogor", province: "Jawa Barat" },
  { name: "Universitas Djuanda", city: "Bogor", province: "Jawa Barat" },
  { name: "Universitas Siliwangi (UNSIL)", city: "Tasikmalaya", province: "Jawa Barat" },
  { name: "Universitas Singaperbangsa Karawang (UNSIKA)", city: "Karawang", province: "Jawa Barat" },
  { name: "Universitas Swadaya Gunung Jati (UGJ)", city: "Cirebon", province: "Jawa Barat" },
  { name: "Universitas Sultan Ageng Tirtayasa (UNTIRTA)", city: "Serang", province: "Banten" },
  { name: "Universitas Multimedia Nusantara (UMN)", city: "Tangerang", province: "Banten" },
  { name: "Universitas Pelita Harapan (UPH)", city: "Tangerang", province: "Banten" },
  { name: "Universitas Pamulang (UNPAM)", city: "Tangerang Selatan", province: "Banten" },
  { name: "Universitas Islam Syekh Yusuf (UNIS)", city: "Tangerang", province: "Banten" },
  { name: "UIN Syarif Hidayatullah", city: "Tangerang Selatan", province: "Banten" },

  // DKI Jakarta
  { name: "Universitas Indonesia (UI)", city: "Depok / Jakarta", province: "DKI Jakarta" },
  { name: "Universitas Negeri Jakarta (UNJ)", city: "Jakarta", province: "DKI Jakarta" },
  { name: "Universitas Bina Nusantara (BINUS)", city: "Jakarta", province: "DKI Jakarta" },
  { name: "Universitas Trisakti", city: "Jakarta", province: "DKI Jakarta" },
  { name: "Universitas Tarumanagara (UNTAR)", city: "Jakarta", province: "DKI Jakarta" },
  { name: "Universitas Katolik Indonesia Atma Jaya", city: "Jakarta", province: "DKI Jakarta" },
  { name: "Universitas Mercu Buana (UMB)", city: "Jakarta", province: "DKI Jakarta" },
  { name: "Universitas Esa Unggul", city: "Jakarta", province: "DKI Jakarta" },
  { name: "Universitas Nasional (UNAS)", city: "Jakarta", province: "DKI Jakarta" },
  { name: "Universitas Pancasila", city: "Jakarta", province: "DKI Jakarta" },
  { name: "Universitas Pembangunan Nasional Veteran Jakarta (UPNVJ)", city: "Jakarta", province: "DKI Jakarta" },
  { name: "Universitas Al-Azhar Indonesia", city: "Jakarta", province: "DKI Jakarta" },
  { name: "Universitas Bakrie", city: "Jakarta", province: "DKI Jakarta" },
  { name: "Universitas Kristen Krida Wacana (UKRIDA)", city: "Jakarta", province: "DKI Jakarta" },
  { name: "Universitas Kristen Indonesia (UKI)", city: "Jakarta", province: "DKI Jakarta" },
  { name: "Universitas Muhammadiyah Prof. DR. HAMKA (UHAMKA)", city: "Jakarta", province: "DKI Jakarta" },
  { name: "Universitas Muhammadiyah Jakarta (UMJ)", city: "Jakarta", province: "DKI Jakarta" },
  { name: "Universitas Indraprasta PGRI (UNINDRA)", city: "Jakarta", province: "DKI Jakarta" },
  { name: "Politeknik Negeri Jakarta (PNJ)", city: "Depok / Jakarta", province: "DKI Jakarta" },

  // D.I. Yogyakarta
  { name: "Universitas Gadjah Mada (UGM)", city: "Yogyakarta", province: "D.I. Yogyakarta" },
  { name: "Universitas Negeri Yogyakarta (UNY)", city: "Yogyakarta", province: "D.I. Yogyakarta" },
  { name: "Universitas Islam Indonesia (UII)", city: "Yogyakarta", province: "D.I. Yogyakarta" },
  { name: "Universitas Muhammadiyah Yogyakarta (UMY)", city: "Yogyakarta", province: "D.I. Yogyakarta" },
  { name: "Universitas Atma Jaya Yogyakarta (UAJY)", city: "Yogyakarta", province: "D.I. Yogyakarta" },
  { name: "Universitas Sanata Dharma (USD)", city: "Yogyakarta", province: "D.I. Yogyakarta" },
  { name: "Universitas Kristen Duta Wacana (UKDW)", city: "Yogyakarta", province: "D.I. Yogyakarta" },
  { name: "Universitas Pembangunan Nasional Veteran Yogyakarta (UPNVY)", city: "Yogyakarta", province: "D.I. Yogyakarta" },
  { name: "Universitas Ahmad Dahlan (UAD)", city: "Yogyakarta", province: "D.I. Yogyakarta" },
  { name: "Universitas 'Aisyiyah Yogyakarta (UNISA)", city: "Yogyakarta", province: "D.I. Yogyakarta" },
  { name: "Universitas AMIKOM Yogyakarta", city: "Yogyakarta", province: "D.I. Yogyakarta" },
  { name: "Universitas Alma Ata", city: "Yogyakarta", province: "D.I. Yogyakarta" },
  { name: "Institut Seni Indonesia Yogyakarta (ISI)", city: "Bantul", province: "D.I. Yogyakarta" },
  { name: "UIN Sunan Kalijaga", city: "Yogyakarta", province: "D.I. Yogyakarta" },

  // Jawa Tengah
  { name: "Universitas Diponegoro (UNDIP)", city: "Semarang", province: "Jawa Tengah" },
  { name: "Universitas Negeri Semarang (UNNES)", city: "Semarang", province: "Jawa Tengah" },
  { name: "Universitas Sebelas Maret (UNS)", city: "Surakarta", province: "Jawa Tengah" },
  { name: "Universitas Jenderal Soedirman (UNSOED)", city: "Purwokerto", province: "Jawa Tengah" },
  { name: "Universitas Dian Nuswantoro (UDINUS)", city: "Semarang", province: "Jawa Tengah" },
  { name: "Universitas Islam Sultan Agung (UNISSULA)", city: "Semarang", province: "Jawa Tengah" },
  { name: "Universitas Katolik Soegijapranata (UNIKA)", city: "Semarang", province: "Jawa Tengah" },
  { name: "Universitas Muhammadiyah Surakarta (UMS)", city: "Surakarta", province: "Jawa Tengah" },
  { name: "Universitas Kristen Satya Wacana (UKSW)", city: "Salatiga", province: "Jawa Tengah" },
  { name: "Universitas Tidar (UNTIDAR)", city: "Magelang", province: "Jawa Tengah" },
  { name: "UIN Walisongo", city: "Semarang", province: "Jawa Tengah" },
  { name: "Politeknik Negeri Semarang (POLINES)", city: "Semarang", province: "Jawa Tengah" },

  // Jawa Timur
  { name: "Institut Teknologi Sepuluh Nopember (ITS)", city: "Surabaya", province: "Jawa Timur" },
  { name: "Universitas Airlangga (UNAIR)", city: "Surabaya", province: "Jawa Timur" },
  { name: "Universitas Brawijaya (UB)", city: "Malang", province: "Jawa Timur" },
  { name: "Universitas Negeri Malang (UM)", city: "Malang", province: "Jawa Timur" },
  { name: "Universitas Negeri Surabaya (UNESA)", city: "Surabaya", province: "Jawa Timur" },
  { name: "Universitas Jember (UNEJ)", city: "Jember", province: "Jawa Timur" },
  { name: "Universitas Trunojoyo Madura (UTM)", city: "Bangkalan", province: "Jawa Timur" },
  { name: "Universitas Pembangunan Nasional Veteran Jawa Timur (UPNVJT)", city: "Surabaya", province: "Jawa Timur" },
  { name: "Universitas Kristen Petra", city: "Surabaya", province: "Jawa Timur" },
  { name: "Universitas Surabaya (UBAYA)", city: "Surabaya", province: "Jawa Timur" },
  { name: "Universitas Katolik Widya Mandala Surabaya (UKWMS)", city: "Surabaya", province: "Jawa Timur" },
  { name: "Universitas Muhammadiyah Malang (UMM)", city: "Malang", province: "Jawa Timur" },
  { name: "Universitas Islam Malang (UNISMA)", city: "Malang", province: "Jawa Timur" },
  { name: "Universitas Ciputra", city: "Surabaya", province: "Jawa Timur" },
  { name: "Politeknik Elektronika Negeri Surabaya (PENS)", city: "Surabaya", province: "Jawa Timur" },
  { name: "Politeknik Perkapalan Negeri Surabaya (PPNS)", city: "Surabaya", province: "Jawa Timur" },
  { name: "Politeknik Negeri Malang (POLINEMA)", city: "Malang", province: "Jawa Timur" },
  { name: "UIN Maulana Malik Ibrahim", city: "Malang", province: "Jawa Timur" },
  { name: "UIN Sunan Ampel", city: "Surabaya", province: "Jawa Timur" },

  // Sumatera
  { name: "Universitas Sumatera Utara (USU)", city: "Medan", province: "Sumatera Utara" },
  { name: "Universitas Negeri Medan (UNIMED)", city: "Medan", province: "Sumatera Utara" },
  { name: "Universitas Muhammadiyah Sumatera Utara (UMSU)", city: "Medan", province: "Sumatera Utara" },
  { name: "Universitas Syiah Kuala (USK)", city: "Banda Aceh", province: "Aceh" },
  { name: "Universitas Andalas (UNAND)", city: "Padang", province: "Sumatera Barat" },
  { name: "Universitas Negeri Padang (UNP)", city: "Padang", province: "Sumatera Barat" },
  { name: "Universitas Riau (UNRI)", city: "Pekanbaru", province: "Riau" },
  { name: "Universitas Sriwijaya (UNSRI)", city: "Palembang", province: "Sumatera Selatan" },
  { name: "Universitas Lampung (UNILA)", city: "Bandar Lampung", province: "Lampung" },
  { name: "Institut Teknologi Sumatera (ITERA)", city: "Lampung Selatan", province: "Lampung" },
  { name: "Universitas Jambi (UNJA)", city: "Jambi", province: "Jambi" },
  { name: "Universitas Bengkulu (UNIB)", city: "Bengkulu", province: "Bengkulu" },
  { name: "Universitas Bangka Belitung (UBB)", city: "Pangkalpinang", province: "Bangka Belitung" },
  { name: "Universitas Maritim Raja Ali Haji (UMRAH)", city: "Tanjungpinang", province: "Kepulauan Riau" },

  // Bali, NTB, NTT
  { name: "Universitas Udayana (UNUD)", city: "Denpasar", province: "Bali" },
  { name: "Universitas Pendidikan Ganesha (UNDIKSHA)", city: "Singaraja", province: "Bali" },
  { name: "Universitas Warmadewa", city: "Denpasar", province: "Bali" },
  { name: "Universitas Mataram (UNRAM)", city: "Mataram", province: "Nusa Tenggara Barat" },
  { name: "Universitas Nusa Cendana (UNDANA)", city: "Kupang", province: "Nusa Tenggara Timur" },

  // Kalimantan
  { name: "Universitas Tanjungpura (UNTAN)", city: "Pontianak", province: "Kalimantan Barat" },
  { name: "Universitas Lambung Mangkurat (ULM)", city: "Banjarmasin", province: "Kalimantan Selatan" },
  { name: "Universitas Mulawarman (UNMUL)", city: "Samarinda", province: "Kalimantan Timur" },
  { name: "Institut Teknologi Kalimantan (ITK)", city: "Balikpapan", province: "Kalimantan Timur" },
  { name: "Universitas Palangka Raya (UPR)", city: "Palangka Raya", province: "Kalimantan Tengah" },
  { name: "Universitas Borneo Tarakan (UBT)", city: "Tarakan", province: "Kalimantan Utara" },

  // Sulawesi & Indonesia Timur
  { name: "Universitas Hasanuddin (UNHAS)", city: "Makassar", province: "Sulawesi Selatan" },
  { name: "Universitas Negeri Makassar (UNM)", city: "Makassar", province: "Sulawesi Selatan" },
  { name: "Universitas Muslim Indonesia (UMI)", city: "Makassar", province: "Sulawesi Selatan" },
  { name: "Universitas Sam Ratulangi (UNSRAT)", city: "Manado", province: "Sulawesi Utara" },
  { name: "Universitas Negeri Manado (UNIMA)", city: "Manado / Tondano", province: "Sulawesi Utara" },
  { name: "Universitas Tadulako (UNTAD)", city: "Palu", province: "Sulawesi Tengah" },
  { name: "Universitas Halu Oleo (UHO)", city: "Kendari", province: "Sulawesi Tenggara" },
  { name: "Universitas Negeri Gorontalo (UNG)", city: "Gorontalo", province: "Gorontalo" },
  { name: "Universitas Pattimura (UNPATTI)", city: "Ambon", province: "Maluku" },
  { name: "Universitas Khairun (UNKHAIR)", city: "Ternate", province: "Maluku Utara" },
  { name: "Universitas Cenderawasih (UNCEN)", city: "Jayapura", province: "Papua" },
  { name: "Universitas Papua (UNIPA)", city: "Manokwari", province: "Papua Barat" },
  { name: "Universitas Terbuka (UT)", city: "Tangerang Selatan / Nasional", province: "Nasional" },
];

/**
 * Real-time fuzzy query search with offline dataset + free online API integration
 */
export async function searchUniversities(query: string): Promise<UniversityItem[]> {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return INDONESIAN_UNIVERSITIES.slice(0, 15);

  // 1. Search local offline indexed universities first (super fast)
  const localMatches = INDONESIAN_UNIVERSITIES.filter((u) => {
    return (
      u.name.toLowerCase().includes(cleanQuery) ||
      (u.city && u.city.toLowerCase().includes(cleanQuery)) ||
      (u.province && u.province.toLowerCase().includes(cleanQuery))
    );
  });

  // 2. Try fetching from free Hipolabs Universities API if query is >= 3 chars
  if (cleanQuery.length >= 3) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout

      const res = await fetch(
        `http://universities.hipolabs.com/search?country=Indonesia&name=${encodeURIComponent(cleanQuery)}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const apiData: Array<{ name: string; domains?: string[] }> = await res.json();
        const apiMatches: UniversityItem[] = apiData.map((d) => ({
          name: d.name,
          domains: d.domains,
        }));

        // Merge without duplicate names
        const mergedNames = new Set(localMatches.map((m) => m.name.toLowerCase()));
        for (const item of apiMatches) {
          if (!mergedNames.has(item.name.toLowerCase())) {
            localMatches.push(item);
            mergedNames.add(item.name.toLowerCase());
          }
        }
      }
    } catch (e) {
      // Offline / API error fallback: continue with local matches
    }
  }

  return localMatches.slice(0, 20);
}
