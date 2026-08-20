import api from "./api";

const CAM_NANG_MOCK_DATABASE = {
  "V?nh H? Long": {
    placeName: "V?nh H? Long",
    provinceName: "Qu?ng Ninh",
    description: "V?nh H? Long là di s?n thiên nhiên th? gi?i du?c UNESCO công nh?n, s? h?u hàng ngàn hòn d?o dá vôi k? vi r?i rác trên làn nu?c xanh ng?c bích.",
    history: "V?nh H? Long mang nhi?u giá tr? d?a ch?t, d?a m?o d?c dáo tr?i qua hàng tri?u nam ki?n t?o. Tên g?i H? Long g?n li?n v?i truy?n thuy?t R?ng m? cùng dàn R?ng con phun châu nh? ng?c t?o nên thành luy b?o v? d?t nu?c.",
    bestTime: "Th?i di?m lý tu?ng nh?t d? tham quan là t? tháng 3 d?n tháng 5 và t? tháng 9 d?n tháng 11, khi ti?t tr?i thu mát m?, n?ng nh?, ít mua bão.",
    itemsToBring: "Mu nón r?ng vành, Kem ch?ng n?ng, Giày th? thao, Ð? boi, Máy ?nh, Gi?y t? tùy thân.",
    ticketPrice: "290.000d - 490.000d / ngu?i (tùy tuy?n tham quan)",
    openingHours: "06:30 - 18:30 hàng ngày",
  },
  "H? Hoàn Ki?m": {
    placeName: "H? Hoàn Ki?m",
    provinceName: "Hà N?i",
    description: "H? Hoàn Ki?m là trái tim c?a th? dô Hà N?i, g?n li?n v?i d?n Ng?c Son, c?u Thê Húc và Tháp Rùa c? kính.",
    history: "G?n li?n v?i truy?n thuy?t Vua Lê L?i tr? guom báu cho R?ng Th?n sau khi dánh du?i quân xâm lu?c. Noi dây là bi?u tu?ng van hóa tâm linh lâu d?i c?a ngu?i Hà N?i.",
    bestTime: "Mùa thu Hà N?i (tháng 9 d?n tháng 11) khi th?i ti?t se l?nh, hoa s?a t?a huong thom ngát xung quanh h?.",
    itemsToBring: "Giày di b?, Máy ?nh, Nu?c u?ng, Qu?n áo g?n gàng khi vào Ð?n Ng?c Son.",
    ticketPrice: "Mi?n phí (Vé vào Ð?n Ng?c Son: 30.000d)",
    openingHours: "M? c?a c? ngày",
  },
  "Sa Pa": {
    placeName: "Sa Pa",
    provinceName: "Lào Cai",
    description: "Sa Pa n?i ti?ng v?i d?nh Fansipan - nóc nhà Ðông Duong, nh?ng th?a ru?ng b?c thang vàng óng và suong mù m? ?o quanh nam.",
    history: "Ðu?c ngu?i Pháp phát hi?n và xây d?ng thành khu ngh? du?ng t? d?u th? k? 20. Noi h?i t? không gian van hóa b?n d?a d?c dáo c?a các dân t?c H'Mông, Dao, Tày.",
    bestTime: "Tháng 9 - 10 (Mùa lúa chín vàng) ho?c Tháng 12 - 1 (Mùa san mây và bang giá).",
    itemsToBring: "Áo ?m dày, Giày leo núi, Thu?c ch?ng côn trùng, Ti?n m?t nh? l?.",
    ticketPrice: "Tùy di?m check-in (Vé cáp treo Fansipan ~800.000d)",
    openingHours: "07:30 - 17:30",
  },
  "H?i An": {
    placeName: "Ph? C? H?i An",
    provinceName: "Qu?ng Nam",
    description: "Ph? c? H?i An gi? tr?n v? d?p hoài c? v?i nh?ng ngôi nhà tu?ng vàng, giàn hoa gi?y và hàng tram ng?n dèn l?ng r?c r? bên sông Thu B?n.",
    history: "T?ng là thuong c?ng s?m u?t b?c nh?t Ðông Nam Á vào th? k? 16-17, noi giao thoa van hóa gi?a Vi?t Nam, Nh?t B?n và Trung Hoa.",
    bestTime: "Tháng 2 d?n tháng 4 hàng nam khi th?i ti?t khô ráo, n?ng nh? d? ch?u.",
    itemsToBring: "Máy ?nh, Trang ph?c hoài c?, Nón lá, Giày b?t di b?.",
    ticketPrice: "120.000d / vé tham quan các ô di tích",
    openingHours: "07:00 - 21:30",
  }
};

export async function getCamNangByLocation(placeName) {
  try {
    const response = await api.get(`/diadiem/guide`, { params: { placeName } });
    if (response?.data?.data) {
      return response.data.data;
    }
  } catch (error) {
    // Fallback to local mock database if offline or API route missing
  }

  const normalized = (placeName || "").trim();
  const matchedKey = Object.keys(CAM_NANG_MOCK_DATABASE).find(
    (k) => k.toLowerCase().includes(normalized.toLowerCase()) || normalized.toLowerCase().includes(k.toLowerCase())
  );

  if (matchedKey) {
    return CAM_NANG_MOCK_DATABASE[matchedKey];
  }

  return {
    placeName: normalized || "Ð?a di?m du l?ch",
    provinceName: "Vi?t Nam",
    description: `${normalized || "Ð?a di?m"} là danh th?ng du l?ch n?i ti?ng v?i nét d?p thiên nhiên và van hóa d?c s?c.`,
    history: `${normalized || "Ð?a di?m"} có b? dày l?ch s? lâu d?i g?n li?n v?i ti?n trình van hóa qua nhi?u th? h?.`,
    bestTime: "Nên di t? tháng 1 d?n tháng 5 và t? tháng 9 d?n tháng 11 khi th?i ti?t ráo mát, thu?n l?i cho tham quan ng?m c?nh.",
    itemsToBring: "Trang ph?c tho?i mái, Nón lá, Kem ch?ng n?ng, Máy ?nh và Ði?n tho?i ch?p hình.",
    ticketPrice: "Tham quan t? do / Mi?n phí",
    openingHours: "M? c?a c? ngày",
  };
}
