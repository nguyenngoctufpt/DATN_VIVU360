import React, { useRef, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Text, Pressable, SafeAreaView, ActivityIndicator, BackHandler, Platform, StatusBar, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { ChevronLeft, Share2, Send } from 'lucide-react-native';
import Constants from 'expo-constants';
import ShareLocationModal from '../components/ShareLocationModal';
import { LEAFLET_CSS_INLINE, LEAFLET_JS_INLINE } from './leafletInline';


const createLeafletHtml = (isDark = true) => `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>Bản đồ Du lịch Việt Nam - Vivu360</title>
  <style>
    ${LEAFLET_CSS_INLINE}
  </style>
  <script>
    ${LEAFLET_JS_INLINE}
  </script>
  <style>
    html, body, #map {
      width: 100vw;
      height: 100vh;
      margin: 0;
      padding: 0;
      overflow: hidden;
      position: fixed;
      inset: 0;
      background: #0f172a;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .custom-pill-marker {
      background: none !important;
      border: none !important;
      pointer-events: none;
    }
    .custom-pill-marker > div {
      pointer-events: auto;
    }
    @keyframes pillPulse {
      0%, 100% { box-shadow: 0 2px 8px rgba(239,68,68,0.35), 0 0 0 0 rgba(239,68,68,0.4); }
      50% { box-shadow: 0 2px 8px rgba(239,68,68,0.5), 0 0 0 6px rgba(239,68,68,0); }
    }
    .pill-capital {
      animation: pillPulse 2.2s ease-in-out infinite;
    }
    .leaflet-popup-content-wrapper {
      background: #ffffff;
      color: #0f172a;
      border-radius: 10px;
      padding: 3px 5px;
      border: 1px solid rgba(59, 130, 246, 0.3);
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
      max-width: 170px;
    }
    .leaflet-popup-content {
      margin: 4px 6px !important;
      line-height: 1.25 !important;
    }
    .leaflet-popup-tip {
      background: #ffffff;
    }
    .pretty-popup {
      text-align: center;
      padding: 0;
    }
    .pretty-popup h3 {
      margin: 0 0 2px 0;
      color: #0284c7;
      font-size: 11.5px;
      font-weight: 700;
    }
    .pretty-popup p {
      margin: 2px 0 4px 0;
      font-size: 9.5px;
      color: #334155;
      line-height: 1.25;
    }
    .pretty-popup .popup-btn {
      display: inline-block;
      margin-top: 2px;
      padding: 3px 8px;
      background: linear-gradient(135deg, #3b82f6, #0284c7);
      color: #ffffff;
      font-weight: 700;
      font-size: 9px;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(59, 130, 246, 0.25);
    }
    .leaflet-top.leaflet-right {
      top: 10px !important;
      right: 12px !important;
    }
    .top-header-bar {
      position: absolute;
      top: 10px;
      left: 12px;
      right: 60px;
      z-index: 1000;
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }
    .map-back-btn {
      position: relative;
      top: 0;
      left: 0;
      flex-shrink: 0;
      white-space: nowrap;
      height: 34px;
      padding: 0 12px;
      display: flex;
      align-items: center;
      background: rgba(15, 23, 42, 0.92);
      color: #ffffff;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
      transition: all 0.2s ease;
    }
    .map-back-btn:hover {
      background: #0f172a;
      border-color: #3b82f6;
    }
    .map-share-location-btn {
      position: relative;
      flex-shrink: 0;
      white-space: nowrap;
      height: 34px;
      padding: 0 12px;
      display: flex;
      align-items: center;
      gap: 5px;
      background: linear-gradient(135deg, rgba(16,185,129,0.92), rgba(5,150,105,0.95));
      color: #ffffff;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(16,185,129,0.5);
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(16,185,129,0.3);
      transition: all 0.2s ease;
    }
    .map-share-location-btn:hover {
      background: linear-gradient(135deg, #10b981, #047857);
      box-shadow: 0 6px 18px rgba(16,185,129,0.45);
    }
    .search-container {
      position: relative;
      top: 0;
      left: 0;
      transform: none;
      flex: 1;
      width: 100%;
    }
    .search-box {
      display: flex;
      align-items: center;
      background: rgba(255, 255, 255, 0.96);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-radius: 20px;
      padding: 0 12px;
      height: 34px;
      border: 1px solid rgba(59, 130, 246, 0.35);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
      transition: all 0.25s ease;
    }
    .search-box:focus-within {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
    }
    .search-icon {
      font-size: 13px;
      margin-right: 6px;
      color: #3b82f6;
    }
    .search-box input {
      border: none;
      outline: none;
      background: transparent;
      width: 100%;
      font-size: 11.5px;
      font-weight: 600;
      color: #0f172a;
    }
    .search-clear {
      font-size: 12px;
      color: #94a3b8;
      cursor: pointer;
      padding: 2px 4px;
    }
    .search-results {
      margin-top: 6px;
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-radius: 14px;
      border: 1px solid rgba(59, 130, 246, 0.25);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
      max-height: 260px;
      overflow-y: auto;
    }
    .filter-chips {
      display: flex;
      gap: 6px;
      padding: 8px 10px;
      border-bottom: 1px solid #f1f5f9;
      overflow-x: auto;
      white-space: nowrap;
    }
    .chip-btn {
      padding: 3px 9px;
      font-size: 10px;
      font-weight: 700;
      border-radius: 12px;
      border: none;
      background: #f1f5f9;
      color: #475569;
      cursor: pointer;
    }
    .chip-btn.active, .chip-btn:hover {
      background: linear-gradient(135deg, #3b82f6, #0284c7);
      color: #ffffff;
    }
    .search-item {
      padding: 9px 12px;
      border-bottom: 1px solid #f8fafc;
      cursor: pointer;
      font-size: 11.5px;
      color: #0f172a;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .search-item:last-child {
      border-bottom: none;
    }
    .search-item:hover {
      background: #f0f9ff;
    }
    .search-item .item-sub {
      font-size: 9.5px;
      color: #64748b;
      margin-top: 2px;
    }
    .badge-tag {
      font-size: 9px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 8px;
    }
    .badge-prov { background: #e0f2fe; color: #0284c7; }
    .badge-sub { background: #dcfce7; color: #15803d; }
    /* Place Detail Modal CSS */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      animation: fadeIn 0.25s ease;
    }
    .modal-card {
      background: #ffffff;
      border-radius: 24px;
      width: 100%;
      max-width: 440px;
      max-height: 85vh;
      overflow-y: auto;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
      position: relative;
      animation: slideUp 0.3s ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .modal-hero {
      height: 180px;
      background-size: cover;
      background-position: center;
      border-top-left-radius: 24px;
      border-top-right-radius: 24px;
      position: relative;
    }
    .modal-close-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(0, 0, 0, 0.5);
      color: #ffffff;
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      font-size: 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .modal-body {
      padding: 20px;
    }
    .modal-title {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 6px 0;
    }
    .modal-prov-tag {
      display: inline-block;
      background: #e0f2fe;
      color: #0284c7;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 12px;
      margin-bottom: 12px;
    }
    .modal-desc {
      font-size: 13px;
      color: #475569;
      line-height: 1.6;
      margin-bottom: 18px;
    }
    .modal-actions {
      display: flex;
      gap: 10px;
    }
    .btn-vr {
      flex: 1;
      background: linear-gradient(135deg, #8b5cf6, #6d28d9);
      color: #ffffff;
      border: none;
      padding: 10px 14px;
      border-radius: 14px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
    }
    .btn-share {
      flex: 1;
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      color: #ffffff;
      border: none;
      padding: 10px 14px;
      border-radius: 14px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
    .toast-msg {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: #0f172a;
      color: #ffffff;
      padding: 10px 20px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      z-index: 3000;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    }
  </style>
</head>
<body>
  <!-- Synchronized Top Header Bar -->
  <div class="top-header-bar">
    <button id="mapBackBtn" class="map-back-btn" onclick="goBackStep()" style="display:none;">◀ Trở về</button>
    <div class="search-container">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input type="text" id="searchInput" placeholder="Tìm kiếm tỉnh thành, địa danh du lịch..." onfocus="showHotSuggestions()" oninput="handleSearch(this.value)" />
        <span class="search-clear" id="searchClear" onclick="clearSearch()" style="display:none;">✕</span>
      </div>
      <div class="search-results" id="searchResults" style="display:none;"></div>
    </div>
    <button class="map-share-location-btn" onclick="shareCurrentMapView()" title="Chia sẻ vị trí bản đồ vào nhóm">📍 Chia sẻ</button>
  </div>

  <!-- Place Detail Modal -->
  <div id="placeDetailModal" class="modal-overlay" style="display:none;">
    <div class="modal-card">
      <div id="modalHero" class="modal-hero" style="background-image:url('https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80');">
        <button class="modal-close-btn" onclick="closePlaceDetailModal()">✕</button>
      </div>
      <div class="modal-body">
        <h2 id="modalTitle" class="modal-title">Tràng An</h2>
        <span id="modalProvTag" class="modal-prov-tag">📍 Ninh Bình</span>
        <p id="modalDesc" class="modal-desc">Quần thể danh thắng Tràng An là một khu du lịch sinh thái kết hợp tâm linh nổi tiếng tại tỉnh Ninh Bình, được UNESCO công nhận là di sản thế giới đôi.</p>
        <div class="modal-actions">
          <button id="modalVrBtn" class="btn-vr" onclick="triggerVrFromModal()">🥽 Tour VR 360°</button>
          <button id="modalShareBtn" class="btn-share" onclick="triggerShareFromModal()">💬 Chia sẻ vào nhóm</button>
        </div>
      </div>
    </div>
  </div>

  <div id="map"></div>
  <script>
    var map = L.map('map', {
      zoomControl: false,
      attributionControl: false
    }).setView([16.047079, 108.20623], 6);
    window.currentMap = map;

    L.control.zoom({ position: 'topright' }).addTo(map);

    // CARTO Voyager Tiles (Nạp cực mượt trên trình duyệt & WebView)
    var tiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      subdomains: ['a', 'b', 'c', 'd'],
      maxZoom: 19
    }).addTo(map);

    tiles.on('tileerror', function() {
      tiles.setUrl('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
    });

    function createPillIcon(name, isCapital, isSub) {
      var len = name.length;
      var fs = len > 14 ? '8px' : len > 10 ? '9px' : '10px';
      var extraClass = isCapital ? ' pill-capital' : '';
      var dotColor, dotChar, bg, border;
      if (isSub) {
        bg = 'linear-gradient(135deg, rgba(16,185,129,0.92), rgba(5,150,105,0.95))';
        border = '1px solid rgba(16,185,129,0.5)';
        dotColor = '#6ee7b7';
        dotChar = '▲';
      } else if (isCapital) {
        bg = 'linear-gradient(135deg, rgba(239,68,68,0.95), rgba(185,28,28,0.98))';
        border = '1px solid rgba(239,68,68,0.6)';
        dotColor = '#fca5a5';
        dotChar = '★';
      } else {
        bg = 'linear-gradient(135deg, rgba(59,130,246,0.92), rgba(2,132,199,0.95))';
        border = '1px solid rgba(59,130,246,0.5)';
        dotColor = '#93c5fd';
        dotChar = '●';
      }
      var html = '<div class="custom-pill-inner' + extraClass + '" style="' +
        'background:' + bg + ';' +
        'color:#fff;' +
        'padding:3px 9px;' +
        'border-radius:12px;' +
        'font-size:' + fs + ';' +
        'font-weight:700;' +
        'white-space:nowrap;' +
        'display:inline-flex;' +
        'align-items:center;' +
        'letter-spacing:0.1px;' +
        'border:' + border + ';' +
        'backdrop-filter:blur(4px);' +
        '-webkit-backdrop-filter:blur(4px);' +
        'cursor:pointer;' +
        'transition:transform 0.15s,opacity 0.15s;' +
        'text-shadow:0 1px 2px rgba(0,0,0,0.3);' +
        '">' + name + '</div>';
      var w = Math.max(55, len * 6.5 + 28);
      return L.divIcon({
        className: 'custom-pill-marker',
        html: html,
        iconSize: [w, 22],
        iconAnchor: [w / 2, 11]
      });
    }

    var subAttractions = [
      { prov: "Ninh Bình", name: "Tràng An", lat: 20.2506, lng: 105.9083, info: "Quần thể di sản thế giới Tràng An." },
      { prov: "Ninh Bình", name: "Chùa Bái Đính", lat: 20.2747, lng: 105.8670, info: "Ngôi chùa lớn nhất Việt Nam." },
      { prov: "Ninh Bình", name: "Tam Cốc - Bích Động", lat: 20.2178, lng: 105.9392, info: "Nam thiên đệ nhị động." },
      { prov: "Ninh Bình", name: "Hang Múa", lat: 20.2317, lng: 105.9525, info: "Thánh địa check-in đỉnh núi Rồng." },
      { prov: "Quảng Ninh", name: "Vịnh Hạ Long", lat: 20.9101, lng: 107.1839, info: "Kỳ quan thiên nhiên thế giới." },
      { prov: "Quảng Ninh", name: "Đảo Ti Tốp", lat: 20.8594, lng: 107.0784, info: "Bãi tắm tuyệt đẹp trên vịnh." },
      { prov: "Lào Cai", name: "Đỉnh Fansipan", lat: 22.3033, lng: 103.7750, info: "Nóc nhà Đông Dương 3.143m." },
      { prov: "Đà Nẵng", name: "Cầu Vàng Bà Nà", lat: 15.9952, lng: 107.9965, info: "Biểu tượng du lịch quốc tế Đà Nẵng." },
      { prov: "Đà Nẵng", name: "Biển Mỹ Khê", lat: 16.0592, lng: 108.2464, info: "Top bãi biển đẹp nhất hành tinh." },
      { prov: "Quảng Nam", name: "Phố Cổ Hội An", lat: 15.8801, lng: 108.3380, info: "Di sản văn hóa thế giới Hội An." },
      { prov: "Lâm Đồng", name: "Hồ Xuân Hương", lat: 11.9404, lng: 108.4440, info: "Trái tim ngàn hoa Đà Lạt." },
      { prov: "TP.HCM", name: "Chợ Bến Thành", lat: 10.7725, lng: 106.6980, info: "Biểu tượng văn hóa Sài Gòn." },
      { prov: "Kiên Giang", name: "Grand World", lat: 10.3242, lng: 103.8580, info: "Thành phố không ngủ Phú Quốc." }
    ];

    var provinces = [
      { name: "Hà Nội", fullName: "Thủ đô Hà Nội", lat: 21.0285, lng: 105.8542, info: "Hồ Gươm, Phố Cổ, Văn Miếu.", isCapital: true },
      { name: "Hạ Long", fullName: "Quảng Ninh (Vịnh Hạ Long)", lat: 20.9500, lng: 107.0333, info: "Vịnh Hạ Long & Đảo Ti Tốp." },
      { name: "Sa Pa", fullName: "Lào Cai (Sa Pa)", lat: 22.3364, lng: 103.8438, info: "Fansipan & Bản Cát Cát." },
      { name: "Mù Cang Chải", fullName: "Yên Bái (Mù Cang Chải)", lat: 21.8542, lng: 104.0841, info: "Ruộng bậc thang & Đèo Khau Phạ." },
      { name: "Bản Giốc", fullName: "Cao Bằng (Thác Bản Giốc)", lat: 22.8550, lng: 106.6090, info: "Thác Bản Giốc & Động Ngườm Ngao." },
      { name: "Mộc Châu", fullName: "Sơn La (Mộc Châu)", lat: 20.8436, lng: 104.6811, info: "Cao nguyên Mộc Châu & Đồi chè." },
      { name: "Hà Giang", fullName: "Hà Giang", lat: 22.8233, lng: 104.9836, info: "Mã Pí Lèng & Cao nguyên đá." },
      { name: "Ninh Bình", fullName: "Ninh Bình", lat: 20.2525, lng: 105.9750, info: "Tràng An, Bái Đính & Hang Múa." },
      { name: "Pù Luông", fullName: "Thanh Hóa (Pù Luông)", lat: 20.4500, lng: 105.2167, info: "Pù Luông & Biển Sầm Sơn." },
      { name: "Phong Nha", fullName: "Quảng Bình (Phong Nha)", lat: 17.4833, lng: 106.3167, info: "Phong Nha & Động Sơn Đoòng." },
      { name: "Cố Đô Huế", fullName: "Thừa Thiên Huế (Cố Đô Huế)", lat: 16.4637, lng: 107.5908, info: "Đại Nội Huế & Sông Hương." },
      { name: "Đà Nẵng", fullName: "Đà Nẵng", lat: 16.0544, lng: 108.2022, info: "Bà Nà Hills & Biển Mỹ Khê." },
      { name: "Hội An", fullName: "Quảng Nam (Hội An)", lat: 15.8801, lng: 108.3380, info: "Phố cổ Hội An & Chùa Cầu." },
      { name: "Quy Nhơn", fullName: "Bình Định (Quy Nhơn)", lat: 13.7820, lng: 109.2194, info: "Eo Gió & Kỳ Co Quy Nhơn." },
      { name: "Phú Yên", fullName: "Phú Yên (Gành Đá Đĩa)", lat: 13.0882, lng: 109.0924, info: "Gành Đá Đĩa & Tháp Nghinh Phong." },
      { name: "Nha Trang", fullName: "Khánh Hòa (Nha Trang)", lat: 12.2388, lng: 109.1967, info: "Vịnh Nha Trang & VinWonders." },
      { name: "Phan Rang", fullName: "Ninh Thuận (Phan Rang)", lat: 11.5653, lng: 108.9880, info: "Vịnh Vĩnh Hy & Tháp Po Klong." },
      { name: "Phan Thiết", fullName: "Bình Thuận (Phan Thiết)", lat: 10.9333, lng: 108.1000, info: "Mũi Né & Đảo Phú Quý." },
      { name: "Đà Lạt", fullName: "Lâm Đồng (Đà Lạt)", lat: 11.9404, lng: 108.4583, info: "Hồ Xuân Hương & Thung lũng." },
      { name: "Vũng Tàu", fullName: "Vũng Tàu & Côn Đảo", lat: 10.3460, lng: 107.0843, info: "Bãi Sau Vũng Tàu & Côn Đảo." },
      { name: "TP.HCM", fullName: "TP. Hồ Chí Minh", lat: 10.8231, lng: 106.6297, info: "Chợ Bến Thành & Dinh Độc Lập." },
      { name: "Cần Thơ", fullName: "Cần Thơ", lat: 10.0452, lng: 105.7469, info: "Chợ nổi Cái Răng & Ninh Kiều." },
      { name: "An Giang", fullName: "An Giang (Châu Đốc)", lat: 10.7000, lng: 105.1167, info: "Miếu Bà Chúa Xứ & Trà Sư." },
      { name: "Bến Tre", fullName: "Bến Tre", lat: 10.2415, lng: 106.3759, info: "Xứ dừa & Cù lao Thới Sơn." },
      { name: "Phú Quốc", fullName: "Kiên Giang (Đảo Phú Quốc)", lat: 10.2289, lng: 103.9572, info: "Đảo ngọc & Grand World." }
    ];

    var provinceMarkers = [];
    provinces.forEach(function(prov) {
      var m = L.marker([prov.lat, prov.lng], { icon: createPillIcon(prov.name, prov.isCapital, false) });
      var fullName = prov.fullName || prov.name;

      var popupHtml = '<div class="pretty-popup">' +
        '<h3>📍 ' + fullName + '</h3>' +
        '<p>' + prov.info + '</p>' +
        '<div style="display:flex;gap:6px;margin-top:8px;">' +
        '<button class="popup-btn" style="background:linear-gradient(135deg, #0284c7, #0369a1);" onclick="openPlaceDetail(\'' + fullName.replace(/'/g, "\\'") + '\', \'' + prov.name.replace(/'/g, "\\'") + '\')">📖 Chi tiết</button>' +
        '<button class="popup-btn" style="background:linear-gradient(135deg, #3b82f6, #1d4ed8);" onclick="shareLocation(\'' + fullName.replace(/'/g, "\\'") + '\', \'' + prov.name.replace(/'/g, "\\'") + '\')">💬 Chia sẻ</button>' +
        '</div></div>';

      m.bindPopup(popupHtml);

      m.on('click', function() {
        zoomToProvince(prov.lat, prov.lng, fullName);
        setTimeout(function() { m.openPopup(); }, 300);
      });

      provinceMarkers.push(m);
    });

    var subMarkers = [];
    subAttractions.forEach(function(sub) {
      var sm = L.marker([sub.lat, sub.lng], { icon: createPillIcon(sub.name, false, true) });
      var subPopup = '<div class="pretty-popup">' +
        '<h3>📍 ' + sub.name + '</h3>' +
        '<p>' + sub.info + '</p>' +
        '<div style="display:flex;gap:6px;margin-top:8px;">' +
        '<button class="popup-btn" style="background:linear-gradient(135deg, #0284c7, #0369a1);" onclick="openPlaceDetail(\'' + sub.name.replace(/'/g, "\\'") + '\', \'' + sub.prov.replace(/'/g, "\\'") + '\')">📖 Chi tiết</button>' +
        '<button class="popup-btn" style="background:linear-gradient(135deg, #3b82f6, #1d4ed8);" onclick="shareLocation(\'' + sub.name.replace(/'/g, "\\'") + '\', \'' + sub.prov.replace(/'/g, "\\'") + '\')">💬 Chia sẻ</button>' +
        '</div></div>';
      sm.bindPopup(subPopup);

      sm.on('click', function() {
        openPlaceDetail(sub.name, sub.prov);
      });

      subMarkers.push({ prov: sub.prov, marker: sm });
    });

    var currentSelectedPlace = null;

    function openPlaceDetail(placeName, provinceName) {
      currentSelectedPlace = { placeName: placeName, provinceName: provinceName };

      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'openPlaceDetail',
          placeName: placeName,
          provinceName: provinceName
        }));
      }

      var subObj = subAttractions.find(function(s) { return s.name === placeName; }) || { info: 'Điểm du lịch nổi tiếng tại ' + (provinceName || 'Việt Nam') };
      document.getElementById('modalTitle').innerText = placeName;
      document.getElementById('modalProvTag').innerText = '📍 ' + (provinceName || 'Việt Nam');
      document.getElementById('modalDesc').innerText = subObj.info;
      if (subObj.img) {
        document.getElementById('modalHero').style.backgroundImage = 'url("' + subObj.img + '")';
      } else {
        document.getElementById('modalHero').style.backgroundImage = 'url("https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80")';
      }
      document.getElementById('placeDetailModal').style.display = 'flex';
    }

    function closePlaceDetailModal() {
      document.getElementById('placeDetailModal').style.display = 'none';
    }

    function triggerVrFromModal() {
      if (currentSelectedPlace) {
        openVR(1);
      }
    }

    function triggerShareFromModal() {
      if (currentSelectedPlace) {
        shareLocation(currentSelectedPlace.placeName, currentSelectedPlace.provinceName);
      }
    }

    function shareLocation(placeName, provinceName) {
      var lat = currentViewState ? currentViewState.lat : 16.047079;
      var lng = currentViewState ? currentViewState.lng : 108.20623;
      var mapsLink = 'https://maps.google.com/?q=' + lat + ',' + lng;
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'shareLocation',
          placeName: placeName || 'Địa danh du lịch',
          provinceName: provinceName || 'Việt Nam',
          locationName: placeName || 'Địa danh du lịch',
          address: provinceName || 'Việt Nam',
          description: 'Khám phá ' + (placeName || 'địa danh du lịch') + ' tại ' + (provinceName || 'Việt Nam') + ' cùng Vivu360!',
          mapsLink: mapsLink,
          lat: lat,
          lng: lng
        }));
      } else {
        showToast('💬 Đã mở chia sẻ địa danh ' + placeName + ' vào nhóm!');
      }
    }

    function shareCurrentMapView() {
      var lat = currentViewState ? currentViewState.lat : 16.047079;
      var lng = currentViewState ? currentViewState.lng : 108.20623;
      var name = currentViewState ? currentViewState.name : 'Bản đồ Du lịch Việt Nam';
      var mapsLink = 'https://maps.google.com/?q=' + lat + ',' + lng;
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'shareLocation',
          placeName: name,
          provinceName: 'Việt Nam',
          locationName: name,
          address: 'Tọa độ: ' + lat.toFixed(4) + ', ' + lng.toFixed(4),
          description: 'Đang xem vị trí "' + name + '" trên bản đồ Vivu360. Cùng khám phá nhé!',
          mapsLink: mapsLink,
          lat: lat,
          lng: lng
        }));
      } else {
        showToast('💬 Chia sẻ vị trí "' + name + '" vào nhóm!');
      }
    }

    function showToast(msg) {
      var toast = document.createElement('div');
      toast.className = 'toast-msg';
      toast.innerText = msg;
      document.body.appendChild(toast);
      setTimeout(function() {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 3000);
    }

    function updateMarkersVisibility() {
      var currentZoom = map.getZoom();

      provinceMarkers.forEach(function(m) {
        if (currentZoom >= 6.5) {
          if (!map.hasLayer(m)) m.addTo(map);
        } else {
          if (map.hasLayer(m)) map.removeLayer(m);
        }
      });

      subMarkers.forEach(function(item) {
        if (currentZoom >= 8.5) {
          if (!map.hasLayer(item.marker)) item.marker.addTo(map);
        } else {
          if (map.hasLayer(item.marker)) map.removeLayer(item.marker);
        }
      });
    }

    map.on('zoomend', updateMarkersVisibility);
    updateMarkersVisibility();

    function handleSearch(query) {
      var resultsDiv = document.getElementById('searchResults');
      var clearBtn = document.getElementById('searchClear');
      var q = query.trim().toLowerCase();
      
      if (!q) {
        resultsDiv.style.display = 'none';
        clearBtn.style.display = 'none';
        return;
      }
      clearBtn.style.display = 'block';
      
      var matches = [];
      provinces.forEach(function(prov) {
        var fullName = prov.fullName || prov.name;
        if (!q || prov.name.toLowerCase().indexOf(q) !== -1 || fullName.toLowerCase().indexOf(q) !== -1 || prov.info.toLowerCase().indexOf(q) !== -1) {
          matches.push({ name: fullName, info: prov.info, lat: prov.lat, lng: prov.lng, type: 'Tỉnh thành', isSub: false });
        }
      });

      subAttractions.forEach(function(sub) {
        if (sub.name.toLowerCase().indexOf(q) !== -1 || sub.info.toLowerCase().indexOf(q) !== -1) {
          matches.push({ name: sub.name, info: sub.info + ' (' + sub.prov + ')', lat: sub.lat, lng: sub.lng, type: 'Địa danh' });
        }
      });

      if (matches.length === 0) {
        resultsDiv.innerHTML = '<div class="search-item" style="color:#94a3b8;justify-content:center;">Không tìm thấy địa danh</div>';
        resultsDiv.style.display = 'block';
        return;
      }

      var html = '';
      matches.slice(0, 6).forEach(function(item) {
        var cleanName = item.name.replace(/'/g, "\\'");
        html += '<div class="search-item" onclick="selectSearchResult(' + item.lat + ',' + item.lng + ',\'' + cleanName + '\')">' +
          '<div><strong>📍 ' + item.name + '</strong><br/><span class="item-sub">' + item.info + '</span></div>' +
          '<span style="font-size:9px;background:#e0f2fe;color:#0284c7;padding:2px 6px;border-radius:6px;">' + item.type + '</span>' +
          '</div>';
      });
      resultsDiv.innerHTML = html;
      resultsDiv.style.display = 'block';
    }

    function selectSearchResult(lat, lng, name) {
      document.getElementById('searchResults').style.display = 'none';
      zoomToProvince(lat, lng, name);

      var targetMarker = provinceMarkers.find(function(m) {
        return m.getLatLng().lat === lat && m.getLatLng().lng === lng;
      });
      if (!targetMarker) {
        var subItem = subMarkers.find(function(s) {
          return s.marker.getLatLng().lat === lat && s.marker.getLatLng().lng === lng;
        });
        if (subItem) targetMarker = subItem.marker;
      }
      if (targetMarker) {
        if (!map.hasLayer(targetMarker)) targetMarker.addTo(map);
        setTimeout(function() { targetMarker.openPopup(); }, 400);
      }
    }

    function clearSearch() {
      document.getElementById('searchInput').value = '';
      document.getElementById('searchResults').style.display = 'none';
      document.getElementById('searchClear').style.display = 'none';
    }

    var hanoiMarker = L.marker([21.0285, 105.8542], { icon: createPillIcon('Thủ đô Hà Nội', true, false) }).addTo(map);
    hanoiMarker.bindPopup('<div class="pretty-popup"><h3>📍 Thủ đô Hà Nội</h3><p>Hồ Gươm, Phố Cổ, Văn Miếu Quốc Tử Giám.</p><button class="popup-btn" onclick="zoomToProvince(21.0285, 105.8542, \'Thủ đô Hà Nội\')">🔍 Zoom to Hà Nội</button></div>')
      .openPopup();
    var viewHistory = [];
    var currentViewState = { lat: 16.047079, lng: 108.20623, zoom: 6, name: 'Toàn cảnh Việt Nam' };

    function pushViewState(lat, lng, zoom, name) {
      viewHistory.push({ lat: currentViewState.lat, lng: currentViewState.lng, zoom: currentViewState.zoom, name: currentViewState.name });
      currentViewState = { lat: lat, lng: lng, zoom: zoom, name: name };
      updateBackButtonState();
    }

    function goBackStep() {
      if (viewHistory.length > 0) {
        var prevState = viewHistory.pop();
        currentViewState = prevState;
        if (window.currentMap) {
          window.currentMap.flyTo([prevState.lat, prevState.lng], prevState.zoom, { duration: 1.2 });
        }
      } else {
        if (window.currentMap) {
          window.currentMap.flyTo([16.047079, 108.20623], 6, { duration: 1.2 });
        }
      }
      updateBackButtonState();
    }

    function updateBackButtonState() {
      var backBtn = document.getElementById('mapBackBtn');
      if (backBtn) {
        if (viewHistory.length > 0) {
          backBtn.style.display = 'flex';
          var prevName = viewHistory[viewHistory.length - 1].name || 'Bản đồ';
          backBtn.innerHTML = '◀ Trở về (' + prevName + ')';
        } else {
          backBtn.style.display = 'none';
        }
      }
    }

    // Hàm Zoom to cận cảnh tỉnh thành vừa phải (Chỉ Zoom 9.0 trên bản đồ, bao quát toàn tỉnh)
    function zoomToProvince(lat, lng, name) {
      pushViewState(lat, lng, 9.0, name || 'Địa danh');
      if (window.currentMap) {
        window.currentMap.flyTo([lat, lng], 9.0, { duration: 1.2 });
      }
    }

    function openVR(tourId) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'openVR', tourId: tourId }));
      }
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      startMap();
    } else {
      document.addEventListener('DOMContentLoaded', startMap);
    }
    window.onload = startMap;
    setTimeout(startMap, 100);
  </script>
</body>
</html>
`;

export function VietnamTravelWebScreen({ theme, isDarkMode, setIsDarkMode, onBack, onOpenVR, onNavigateToTour, onOpenPlaceDetail, onNavigateToProvince, onNavigateToTab, selectedPlaceName, ownerId, currentUser, onCheckIn }) {
  const webViewRef = useRef(null);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareLocationData, setShareLocationData] = useState(null);

  useEffect(() => {
    const backAction = () => {
      if (onBack) {
        onBack();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [onBack]);

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'openVR') {
        const tourId = data.tourId || 1;
        if (onOpenVR) {
          onOpenVR(tourId);
        } else if (onNavigateToTour) {
          onNavigateToTour(tourId);
        }
      } else if (data.type === 'openPlaceDetail') {
        if (onOpenPlaceDetail) {
          onOpenPlaceDetail(data.placeName);
        }
      } else if (data.type === 'goBack') {
        if (onBack) {
          onBack();
        }
      } else if (data.type === 'shareLocation' || data.type === 'sharePlace') {
        const formattedPrice = data.unitPrice 
          ? (Number(data.unitPrice) > 0 ? `${Number(data.unitPrice).toLocaleString('vi-VN')}đ/người` : 'Miễn phí / Tự túc')
          : 'Miễn phí / Tự túc';

        const lat = data.lat;
        const lng = data.lng;
        const autoMapsLink = (lat && lng)
          ? `https://maps.google.com/?q=${lat},${lng}`
          : '';

        setShareLocationData({
          name: data.locationName || data.placeName || data.name || 'Địa điểm du lịch',
          location: data.address || data.viTri || data.location || 'Việt Nam',
          description: data.description || data.moTa || 'Khám phá vĩ tuyến và danh thắng tuyệt đẹp cùng Vivu360!',
          price: formattedPrice,
          mapsLink: data.mapsLink || autoMapsLink,
        });
        setShareModalVisible(true);
      }
    } catch (err) {
      console.error('Error parsing webview message:', err);
    }
  };

  const expoHost = useMemo(() => {
    const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost || '';
    return hostUri ? hostUri.split(':')[0] : 'localhost';
  }, []);

  const mapServerUrl = useMemo(
    () => process.env.EXPO_PUBLIC_TRAVEL_MAP_URL || `http://${expoHost}:3000/travel-map/?view=map&isApp=1`,
    [expoHost]
  );
  const webViewSource = useMemo(() => ({ uri: mapServerUrl }), [mapServerUrl]);
 
  const containerStyle = useMemo(() => [
    styles.container,
    {
      backgroundColor: theme ? theme.background : '#0f172a',
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : (Platform.OS === 'ios' ? 44 : 0)
    }
  ], [theme]);

  return (
    <View style={containerStyle}>
      {/* Direct Leaflet OpenStreetMap WebView */}
      <WebView
        ref={webViewRef}
        source={webViewSource}
        style={styles.webview}
        onMessage={handleMessage}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        allowFileAccessFromFileURLs={true}
        mixedContentMode="always"
        startInLoadingState={false}
      />

      {/* Floating Share Location to Chat Button */}
      <Pressable
        style={({ pressed }) => [
          styles.floatingShareBtn,
          {
            backgroundColor: '#3b82f6',
            opacity: pressed ? 0.85 : 1,
          },
        ]}
        onPress={() => {
          setShareLocationData({
            name: selectedPlaceName || 'Địa điểm du lịch Việt Nam',
            location: 'Việt Nam',
            description: 'Khám phá vĩ tuyến và danh thắng tuyệt đẹp cùng Vivu360!',
          });
          setShareModalVisible(true);
        }}
      >
        <Send size={16} color="#ffffff" />
        <Text style={styles.floatingShareText}>Chia sẻ vào Chat</Text>
      </Pressable>

      <ShareLocationModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        locationData={shareLocationData}
        ownerId={ownerId}
        currentUser={currentUser}
        onShareSuccess={(groupId) => {
          setShareModalVisible(false);
          if (onNavigateToTab) onNavigateToTab('chat', groupId || null);
        }}
        theme={theme}
        isDarkMode={isDarkMode}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingShareBtn: {
    position: 'absolute',
    bottom: 110,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    zIndex: 9999,
  },
  floatingShareText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
