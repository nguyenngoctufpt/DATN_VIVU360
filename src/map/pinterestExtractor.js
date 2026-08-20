/**
 * Pinterest Image Extractor Utility
 * Tích hợp tính năng trích xuất hình ảnh trực tiếp từ đường dẫn Pinterest
 */

export async function extractPinterestImage(url) {
  if (!url) return null;
  const cleanUrl = url.trim();

  // 1. Nếu đã là link ảnh trực tiếp từ Pinterest CDN (pinimg.com)
  if (cleanUrl.includes('pinimg.com')) {
    return cleanUrl;
  }

  // 2. Nếu là link Pinterest (pinterest.com hoặc link rút gọn pin.it)
  if (cleanUrl.includes('pinterest.com') || cleanUrl.includes('pin.it')) {
    try {
      console.log('Attempting to extract Pinterest image for:', cleanUrl);
      
      // Sử dụng User-Agent bot (Googlebot) để Pinterest trả về thẻ meta Open Graph tĩnh
      const response = await fetch(cleanUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
        }
      });
      const html = await response.text();

      // Trích xuất thẻ og:image hoặc twitter:image
      const ogImageMatch = 
        html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i) ||
        html.match(/<meta[^>]*content="([^"]+)"[^>]*property="og:image"/i) ||
        html.match(/<meta[^>]*name="twitter:image"[^>]*content="([^"]+)"/i) ||
        html.match(/<meta[^>]*property="og:image:secure_url"[^>]*content="([^"]+)"/i);

      if (ogImageMatch && ogImageMatch[1]) {
        const imageUrl = ogImageMatch[1].replace(/&amp;/g, '&');
        console.log('Successfully extracted og:image:', imageUrl);
        return imageUrl;
      }

      // Tìm kiếm dự phòng các mẫu link pinimg.com chất lượng cao
      const pinimgMatch = 
        html.match(/https:\/\/i\.pinimg\.com\/originals\/[a-zA-Z0-9_\/.-]+/i) ||
        html.match(/https:\/\/i\.pinimg\.com\/736x\/[a-zA-Z0-9_\/.-]+/i) ||
        html.match(/https:\/\/i\.pinimg\.com\/564x\/[a-zA-Z0-9_\/.-]+/i);

      if (pinimgMatch) {
        const imageUrl = pinimgMatch[0];
        console.log('Successfully matched fallback pinimg URL:', imageUrl);
        return imageUrl;
      }
    } catch (error) {
      console.log('Error in extractPinterestImage:', error);
    }
  }

  // Nếu không nhận dạng được hoặc không trích xuất được, trả về null
  return null;
}

export function getImageSource(uri) {
  if (!uri) return null;
  const cleanUri = uri.trim();
  if (!cleanUri) return null;
  const headers = {};
  if (cleanUri.includes('wordpress.com') || cleanUri.includes('longvietarch')) {
    headers['Referer'] = 'https://longvietarch.wordpress.com/';
    headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  } else if (cleanUri.includes('pinimg.com')) {
    headers['Referer'] = 'https://www.pinterest.com/';
    headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  } else if (cleanUri.includes('wikimedia.org')) {
    headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  }
  return {
    uri: cleanUri,
    headers: Object.keys(headers).length > 0 ? headers : undefined
  };
}

function removeVietnameseTones(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

function isScenicImage(url, pageTitle) {
  if (!url) return false;
  
  const rawUrl = url.toLowerCase();
  const rawTitle = pageTitle ? pageTitle.toLowerCase() : '';
  
  const lowercaseUrl = removeVietnameseTones(rawUrl);
  const lowercaseTitle = removeVietnameseTones(rawTitle);
  
  if (lowercaseUrl.endsWith('.svg') || lowercaseUrl.includes('.svg.png') || lowercaseUrl.includes('.svg/')) {
    return false;
  }
  
  const nonScenicKeywords = [
    'flag', 'emblem', 'logo', 'map', 'locator', 'coat_of_arms', 'shield', 
    'quoc_ky', 'quoc_huy', 'ban_do', 'bieu_trung', 'con_dau', 'huy_hieu',
    'location', 'vi_tri', 'gioi_han', 'phan_chia', 'hanh_chinh', 'dinh_huong'
  ];
  if (nonScenicKeywords.some(kw => lowercaseUrl.includes(kw) || lowercaseTitle.includes(kw))) {
    return false;
  }
  
  const portraitKeywords = [
    'portrait', 'chan_dung', 'anh_the', 'passport',
    'deputy', 'minister', 'secretary', 'chairman', 'president', 'general',
    'chinh_tri_gia', 'dai_bieu', 'bo_truong', 'thu_tuong', 'bi_thu', 'chu_tich',
    'tong_thong', 'tuong', 'nha_tho', 'ca_si', 'ca_sy', 'dien_vien', 'nghe_si', 'nghe_sy',
    'mr.', 'mrs.', 'ms.', 'dr.', 'prof.', 'nguyen_tan_dung', 'nguyen_thanh_nghi', 
    'le_hong_anh', 'cris_phan', 'chi_dan', 'lien_binh_phat', 'nguyen_xuan_phuc',
    'tran_dai_quang', 'le_dai_hanh', 'vu_manh_ha', 'pham_minh_chinh', 'le_manh_hung', 'nhac_si', 'nhac_sy'
  ];
  if (portraitKeywords.some(kw => lowercaseUrl.includes(kw) || lowercaseTitle.includes(kw))) {
    return false;
  }
  
  // Filter out articles that represent people by checking if the page title starts with a Vietnamese surname
  const surnames = ['nguyen', 'tran', 'le', 'pham', 'hoang', 'huynh', 'phan', 'vu', 'vo', 'dang', 'bui', 'do', 'ho', 'ngo', 'duong', 'ly'];
  const landmarkTitleKeywords = ['tinh', 'huyen', 'xa', 'thanh pho', 'thi xa', 'dao', 'chua', 'den', 'vinh', 'thac', 'ho', 'deo', 'song', 'nui', 'bai', 'du lich', 'di tich', 'nha tho', 'truong', 'cau', 'ga ', 'san bay', 'cot co', 'quoc lo', 'ai ', 'cua ', 'tran ', 'lich su', 'chien ', 'doan ', 'to chuc', 'don vi', 'uy ban', 'tinh uy', 'quan khu', 'bo ', 'so ', 'cuc ', 'tong cong ty', 'cong ty', 'zalo', 'tuong dai', 'den tho', 'lang mo', 'khu mo'];
  
  if (surnames.some(sur => lowercaseTitle.startsWith(sur + ' ') || lowercaseTitle.includes(' ' + sur + ' '))) {
    if (!landmarkTitleKeywords.some(kw => lowercaseTitle.includes(kw))) {
      // It's a page named after a person, e.g. "Nguyễn Thanh Nghị" or "Lê Mạnh Hùng"
      return false;
    }
  }

  // Portrait detection on filename as fallback
  const filename = lowercaseUrl.substring(lowercaseUrl.lastIndexOf('/') + 1);
  if (surnames.some(sur => filename.includes(sur))) {
    const landmarkKeywords = ['chua', 'den', 'ui', 'song', 'ho', 'vi', 'bai', 'thac', 'ruong', 'deo', 'cat', 'bien', 'vinh', 'tuyet', 'cau', 'nha', 'cho', 'pho', 'dinh', 'thanh_pho', 'lang', 'dong', 'hang', 'nho_que', 'ma_pi_leng', 'cot_co', 'lung_cu', 'dong_van', 'meo_vac', 'yen_minh', 'quan_ba', 'tam_son', 'hoang_su_phi', 'xin_man', 'bac_me', 'vi_xuyen', 'mui_ca_mau', 'rach_gia', 'phu_quoc', 'da_lat', 'da_nang'];
    
    if (!landmarkKeywords.some(lm => filename.includes(lm))) {
      const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
      const parts = nameWithoutExt.split(/[-_\.]/);
      const nameParts = parts.filter(p => p.length > 1 && isNaN(p) === false && p !== 'in');
      const namePartsCount = nameParts.length;
      
      if (namePartsCount >= 2 && namePartsCount <= 4) {
        return false;
      }
    }
  }
  
  return true;
}

export async function fetchRealProvinceImages(provinceName, count = 8) {
  const images = [];
  
  // 1. Try Wikimedia API (CORS-friendly, works on Web & Mobile, high-res 800px)
  try {
    let queryName = provinceName || '';
    if (queryName.startsWith('Thủ đô ')) queryName = queryName.replace('Thủ đô ', '');
    if (queryName.startsWith('Tỉnh ')) queryName = queryName.replace('Tỉnh ', '');
    if (queryName.startsWith('Thành phố ')) queryName = queryName.replace('Thành phố ', '');
    
    const queries = [
      queryName,
      `${queryName} Việt Nam`,
      `Cảnh đẹp ${queryName}`
    ];
    
    for (const query of queries) {
      if (images.length >= count) break;
      const url = `https://vi.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&generator=search&piprop=thumbnail&pithumbsize=800&gsrsearch=${encodeURIComponent(query)}&gsrlimit=30&origin=*`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Vivu360/1.0 (contact@example.com)'
        }
      });
      const data = await response.json();
      
      if (data && data.query && data.query.pages) {
        const pages = Object.values(data.query.pages);
        pages.sort((a, b) => (a.index || 0) - (b.index || 0));
        
        for (const page of pages) {
          if (page.thumbnail && page.thumbnail.source) {
            const imgUrl = page.thumbnail.source;
            if (isScenicImage(imgUrl, page.title)) {
              if (!images.includes(imgUrl)) {
                images.push(imgUrl);
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.log('Wikimedia fetch failed, trying fallback:', error);
  }

  // 2. If we got enough images, return them
  if (images.length >= count) {
    return images.slice(0, count);
  }

  // 3. Try Google Images scraping (very fast, works on native mobile, fallback if Wikimedia is scarce)
  try {
    const searchUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(provinceName + ' du lịch cảnh đẹp')}`;
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const html = await response.text();
    
    const tbnRegex = /https:\/\/encrypted-tbn[0-9]\.gstatic\.com\/images\?q=tbn:[^"'\s&]+/g;
    let match;
    while ((match = tbnRegex.exec(html)) !== null && images.length < count) {
      const imgUrl = match[0];
      if (!images.includes(imgUrl)) {
        images.push(imgUrl);
      }
    }
  } catch (error) {
    console.log('Google Images fetch failed:', error);
  }

  // 4. Return whatever we gathered, or null if empty
  return images.length > 0 ? images.slice(0, count) : null;
}



