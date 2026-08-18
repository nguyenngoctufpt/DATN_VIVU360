import React, { useRef, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Text, Pressable, SafeAreaView, ActivityIndicator, BackHandler, Platform, StatusBar, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { ChevronLeft, Share2 } from 'lucide-react-native';
import { getHostIp } from '../utils/hostIp';
import ShareLocationModal from '../components/ShareLocationModal';

const generateMapHtml = (targetPlaceName, isDarkMode = false) => `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>Vivu360 - Viet Roadtrips Cẩm Nang Lộ Trình</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body, html, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: ${isDarkMode ? '#0f172a' : '#f8fafc'}; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; overflow: hidden; }
    .leaflet-container { background: ${isDarkMode ? '#0f172a' : '#f8fafc'}; }
    .leaflet-control-zoom { display: none !important; }
    .custom-popup .leaflet-popup-content-wrapper { background: ${isDarkMode ? 'rgba(15, 23, 42, 0.94)' : 'rgba(255, 255, 255, 0.96)'}; color: ${isDarkMode ? '#f8fafc' : '#0f172a'}; border-radius: 16px; padding: 4px; border: 1px solid ${isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(15,23,42,0.12)'}; box-shadow: 0 10px 25px rgba(0,0,0,0.4); backdrop-filter: blur(12px); }
    .custom-popup .leaflet-popup-tip { background: ${isDarkMode ? '#0f172a' : '#ffffff'}; }
    .custom-popup .leaflet-popup-close-button { color: #f43f5e !important; font-size: 18px !important; padding: 4px 8px !important; font-weight: bold !important; }
    .pulse-marker { width: 14px; height: 14px; background: #3b82f6; border: 2px solid #ffffff; border-radius: 50%; box-shadow: 0 0 12px rgba(59, 130, 246, 0.8); }
    .pulse-island { width: 18px; height: 18px; background: #dc2626; border: 2px solid #facc15; border-radius: 50%; box-shadow: 0 0 15px rgba(220, 38, 38, 0.9); display: flex; align-items: center; justify-content: center; font-size: 10px; }
  </style>
</head>
<body class="${isDarkMode ? 'dark' : ''}">

  <div id="map"></div>

  <!-- WEB TOP HEADER NAVIGATION -->
  <div style="position: fixed; top: 12px; left: 12px; right: 12px; z-index: 999; display: flex; justify-content: space-between; align-items: center; gap: 8px; max-width: 1200px; margin: 0 auto; pointer-events: none;">
    <!-- Branding & Back -->
    <div style="display: flex; align-items: center; gap: 8px; pointer-events: auto;">
      <button onclick="postMessageToApp({ type: 'goBack' })" style="display: flex; align-items: center; gap: 4px; background: ${isDarkMode ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.95)'}; color: ${isDarkMode ? '#ffffff' : '#0f172a'}; padding: 8px 12px; border-radius: 14px; border: 1px solid ${isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}; font-weight: 700; font-size: 12px; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.15); backdrop-filter: blur(12px);">
        ← Quay lại
      </button>
      <div style="background: ${isDarkMode ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.95)'}; border: 1px solid ${isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}; padding: 6px 12px; border-radius: 14px; backdrop-filter: blur(12px); box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
        <div style="font-size: 13px; font-weight: 800; color: ${isDarkMode ? '#ffffff' : '#0f172a'};">🧭 Viet Roadtrips</div>
        <div style="font-size: 9px; font-weight: 700; color: #3b82f6; text-transform: uppercase;">Bản Đồ Cẩm Nang Du Lịch</div>
      </div>
    </div>

    <!-- Search Bar -->
    <div style="position: relative; flex: 1; min-width: 140px; max-width: 320px; pointer-events: auto;">
      <div style="display: flex; align-items: center; background: ${isDarkMode ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.95)'}; border: 1px solid ${isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}; border-radius: 14px; padding: 6px 12px; backdrop-filter: blur(12px); box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
        <span style="margin-right: 6px; font-size: 13px;">🔍</span>
        <input id="searchInput" type="text" placeholder="Tìm điểm du lịch..." oninput="handleSearchInput()" style="background: transparent; border: none; outline: none; width: 100%; color: ${isDarkMode ? '#ffffff' : '#0f172a'}; font-size: 12px; font-weight: 600;" />
        <button id="clearSearchBtn" onclick="clearSearch()" style="display: none; background: none; border: none; color: #94a3b8; font-weight: bold; cursor: pointer;">✕</button>
      </div>
      <div id="searchDropdown" style="display: none; position: absolute; top: 44px; left: 0; right: 0; background: ${isDarkMode ? 'rgba(15, 23, 42, 0.98)' : 'rgba(255, 255, 255, 0.98)'}; border: 1px solid ${isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}; border-radius: 14px; max-height: 220px; overflow-y: auto; z-index: 1000; padding: 4px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
      </div>
    </div>
  </div>

  <!-- FLOATING PLACE DETAIL CARD AT BOTTOM RIGHT -->
  <div id="placeCard" style="display: none; position: fixed; bottom: 20px; right: 16px; left: 16px; z-index: 999; max-width: 420px; margin: 0 auto; background: ${isDarkMode ? 'rgba(15, 23, 42, 0.94)' : 'rgba(255, 255, 255, 0.96)'}; border: 1px solid ${isDarkMode ? 'rgba(255,255,255,0.18)' : 'rgba(15,23,42,0.12)'}; border-radius: 20px; padding: 14px; box-shadow: 0 12px 35px rgba(0,0,0,0.4); backdrop-filter: blur(16px);">
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
      <div>
        <div style="font-size: 15px; font-weight: 800; color: ${isDarkMode ? '#ffffff' : '#0f172a'};" id="cardTitle">📍 Địa điểm</div>
        <div style="font-size: 11px; color: #06b6d4; font-weight: 600; margin-top: 2px;" id="cardAddress">Việt Nam</div>
      </div>
      <button onclick="closeCard()" style="background: ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}; border: none; color: #f43f5e; width: 26px; height: 26px; border-radius: 13px; font-weight: bold; cursor: pointer;">✕</button>
    </div>
    <div style="font-size: 12px; color: ${isDarkMode ? '#cbd5e1' : '#475569'}; line-height: 1.4; margin-bottom: 10px;" id="cardDesc">Mô tả thông tin địa điểm...</div>
    
    <div style="margin-bottom: 8px;">
      <button onclick="onCardAction('aiPlanning')" style="width: 100%; background: linear-gradient(90deg, #ec4899, #f43f5e, #f59e0b); color: #fff; border: none; padding: 9px; border-radius: 12px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 12px rgba(236,72,153,0.3);">
        🤖 AI Phân Tích & Lập Lịch Trình 100%
      </button>
    </div>
    
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;">
      <button onclick="onCardAction('openPlaceDetail')" style="background: #3b82f6; color: #fff; border: none; padding: 8px 4px; border-radius: 10px; font-size: 10.5px; font-weight: 700; cursor: pointer;">📖 Cẩm nang</button>
      <button onclick="onCardAction('directions')" style="background: #6366f1; color: #fff; border: none; padding: 8px 4px; border-radius: 10px; font-size: 10.5px; font-weight: 700; cursor: pointer;">🧭 Chỉ đường</button>
      <button onclick="onCardAction('openVR')" style="background: #10b981; color: #fff; border: none; padding: 8px 4px; border-radius: 10px; font-size: 10.5px; font-weight: 700; cursor: pointer;">🌐 VR 360°</button>
      <button onclick="onCardAction('share')" style="background: #f59e0b; color: #fff; border: none; padding: 8px 4px; border-radius: 10px; font-size: 10.5px; font-weight: 700; cursor: pointer;">📤 Chia sẻ</button>
    </div>
  </div>

  <!-- DIRECTIONS MODAL SHEET -->
  <div id="directionsModal" style="display: none; position: fixed; inset: 0; z-index: 2000; background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(8px); flex-direction: column; justify-content: center; align-items: center; padding: 16px;">
    <div style="background: ${isDarkMode ? '#0f172a' : '#ffffff'}; border: 1px solid ${isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}; border-radius: 24px; max-width: 480px; width: 100%; max-height: 85vh; overflow-y: auto; padding: 18px; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="font-size: 20px;">🧭</div>
          <div>
            <div style="font-size: 15px; font-weight: 800; color: ${isDarkMode ? '#ffffff' : '#0f172a'};">Chỉ Đường & Lộ Trình</div>
            <div style="font-size: 10px; color: #94a3b8;">Hướng dẫn di chuyển chi tiết GPS</div>
          </div>
        </div>
        <button onclick="closeDirectionsModal()" style="background: none; border: none; font-size: 18px; color: #f43f5e; font-weight: bold; cursor: pointer;">✕</button>
      </div>

      <!-- Departure origin chips -->
      <div style="font-size: 10px; font-weight: 800; color: #3b82f6; text-transform: uppercase; margin-bottom: 6px;">Nơi bắt đầu (Điểm đi)</div>
      <div style="display: flex; gap: 6px; margin-bottom: 12px;">
        <button onclick="setOrigin('Hà Nội')" style="background: #3b82f6; color: #fff; border: none; padding: 6px 10px; border-radius: 10px; font-size: 11px; font-weight: 700; cursor: pointer;">🏛️ Hà Nội</button>
        <button onclick="setOrigin('Đà Nẵng')" style="background: rgba(148,163,184,0.2); color: ${isDarkMode ? '#fff' : '#0f172a'}; border: none; padding: 6px 10px; border-radius: 10px; font-size: 11px; font-weight: 700; cursor: pointer;">🌉 Đà Nẵng</button>
        <button onclick="setOrigin('TP. HCM')" style="background: rgba(148,163,184,0.2); color: ${isDarkMode ? '#fff' : '#0f172a'}; border: none; padding: 6px 10px; border-radius: 10px; font-size: 11px; font-weight: 700; cursor: pointer;">🏙️ TP. HCM</button>
      </div>

      <!-- Origin & Destination card -->
      <div style="background: ${isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'}; border: 1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}; border-radius: 16px; padding: 12px; margin-bottom: 12px;">
        <div style="font-size: 11px; color: #94a3b8; font-weight: 600;">Điểm đi: <b id="dirOriginText" style="color: ${isDarkMode ? '#fff' : '#0f172a'};">Hà Nội</b></div>
        <div style="font-size: 11px; color: #94a3b8; font-weight: 600; margin-top: 4px;">Điểm đến: <b id="dirDestText" style="color: #06b6d4;">Vịnh Hạ Long</b></div>
      </div>

      <!-- Distance & Time badges -->
      <div style="display: flex; gap: 10px; margin-bottom: 14px;">
        <div style="flex: 1; background: rgba(59,130,246,0.12); border: 1px solid rgba(59,130,246,0.3); border-radius: 14px; padding: 10px; text-align: center;">
          <div style="font-size: 9px; color: #94a3b8; font-weight: 700;">KHOẢNG CÁCH LỘ TRÌNH</div>
          <div style="font-size: 16px; font-weight: 900; color: #3b82f6;" id="dirDistText">12 km</div>
        </div>
        <div style="flex: 1; background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.3); border-radius: 14px; padding: 10px; text-align: center;">
          <div style="font-size: 9px; color: #94a3b8; font-weight: 700;">THỜI GIAN ƯỚC TÍNH</div>
          <div style="font-size: 16px; font-weight: 900; color: #10b981;" id="dirTimeText">0h 12m</div>
        </div>
      </div>

      <!-- Transport Mode selector -->
      <div style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 6px;">Phương tiện di chuyển</div>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 14px;">
        <button onclick="setMode('car')" id="mode-car" style="background: #3b82f6; color: #fff; border: none; padding: 8px 4px; border-radius: 12px; font-size: 10px; font-weight: 800; cursor: pointer; text-align: center;">🚗 Ô tô<br><span style="font-size: 9px; opacity: 0.8;">0h 12m</span></button>
        <button onclick="setMode('motorbike')" id="mode-motorbike" style="background: rgba(148,163,184,0.15); color: ${isDarkMode ? '#fff' : '#0f172a'}; border: 1px solid rgba(255,255,255,0.1); padding: 8px 4px; border-radius: 12px; font-size: 10px; font-weight: 800; cursor: pointer; text-align: center;">🏍️ Xe máy<br><span style="font-size: 9px; opacity: 0.8;">0h 13m</span></button>
        <button onclick="setMode('bus')" id="mode-bus" style="background: rgba(148,163,184,0.15); color: ${isDarkMode ? '#fff' : '#0f172a'}; border: 1px solid rgba(255,255,255,0.1); padding: 8px 4px; border-radius: 12px; font-size: 10px; font-weight: 800; cursor: pointer; text-align: center;">🚌 Xe khách<br><span style="font-size: 9px; opacity: 0.8;">0h 26m</span></button>
        <button onclick="setMode('flight')" id="mode-flight" style="background: rgba(148,163,184,0.15); color: ${isDarkMode ? '#fff' : '#0f172a'}; border: 1px solid rgba(255,255,255,0.1); padding: 8px 4px; border-radius: 12px; font-size: 10px; font-weight: 800; cursor: pointer; text-align: center;">✈️ Máy bay<br><span style="font-size: 9px; opacity: 0.8;">Chưa hỗ trợ</span></button>
      </div>

      <!-- Step-by-Step Guidance -->
      <div style="margin-bottom: 14px;">
        <div style="font-size: 11px; font-weight: 800; color: ${isDarkMode ? '#ffffff' : '#0f172a'}; text-transform: uppercase; margin-bottom: 6px;">Hướng dẫn chi tiết chặng di chuyển</div>
        <div style="background: ${isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'}; border: 1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}; border-radius: 14px; padding: 10px; font-size: 11px; color: ${isDarkMode ? '#cbd5e1' : '#475569'}; line-height: 1.5;" id="dirStepsText">
          1. Xuất phát từ Hà Nội đi thẳng theo hướng đường trục chính GPS.<br>
          2. Di chuyển 12 km hướng về điểm đến.<br>
          3. Đã đến Lăng Chủ tịch Hồ Chí Minh + Chùa Một Cột.
        </div>
      </div>

      <!-- CTA Button -->
      <button onclick="closeDirectionsModal()" style="width: 100%; background: linear-gradient(90deg, #10b981, #06b6d4); color: #ffffff; border: none; padding: 12px; border-radius: 14px; font-weight: 800; font-size: 12.5px; cursor: pointer; box-shadow: 0 4px 14px rgba(16,185,129,0.3);">
        🗺️ Bắt đầu xem lộ trình trên Bản đồ Vivu360
      </button>
    </div>
  </div>

  <script>
    var map = L.map('map', { zoomControl: false }).setView([16.047079, 108.20623], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© Vivu360 OpenStreetMap'
    }).addTo(map);

    function postMessageToApp(obj) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(obj));
      }
    }

    var places = [
      { name: 'Hà Nội', lat: 21.0285, lng: 105.8542, address: 'Thủ đô Hà Nội', desc: 'Thủ đô ngàn năm văn hiến, Hồ Hoàn Kiếm, Phố cổ cổ kính và Lăng Bác.', tourId: 'hanoi' },
      { name: 'Vịnh Hạ Long', lat: 20.9101, lng: 107.1839, address: 'Quảng Ninh', desc: 'Kỳ quan thiên nhiên thế giới với hàng ngàn đảo đá vôi hùng vĩ.', tourId: 'halong' },
      { name: 'Sa Pa', lat: 22.3364, lng: 103.8438, address: 'Lào Cai', desc: 'Thị trấn mờ sương, đỉnh Fansipan nóc nhà Đông Dương.', tourId: 'sapa' },
      { name: 'Tràng An - Ninh Bình', lat: 20.2506, lng: 105.9745, address: 'Ninh Bình', desc: 'Di sản văn hóa và thiên nhiên thế giới, Hạ Long trên cạn.', tourId: 'ninhbinh' },
      { name: 'Cố đô Huế', lat: 16.4637, lng: 107.5909, address: 'Thừa Thiên Huế', desc: 'Di sản văn hóa thế giới với Đại Nội cung điện triều Nguyễn.', tourId: 'hue' },
      { name: 'Đà Nẵng', lat: 16.0544, lng: 108.2022, address: 'Đà Nẵng', desc: 'Thành phố đáng sống nhất Việt Nam, Cầu Vàng Bà Nà Hills.', tourId: 'danang' },
      { name: 'Phố cổ Hội An', lat: 15.8801, lng: 108.3380, address: 'Quảng Nam', desc: 'Phố cổ rực rỡ đèn lồng, di sản văn hóa thế giới UNESCO.', tourId: 'hoian' },
      { name: 'Quy Nhơn', lat: 13.7820, lng: 109.2194, address: 'Bình Định', desc: 'Biển Kỳ Co - Eo Gió hoang sơ xanh trong vắt.', tourId: 'quynhon' },
      { name: 'Nha Trang', lat: 12.2388, lng: 109.1967, address: 'Khánh Hòa', desc: 'Thành phố biển tuyệt đẹp, VinWonders, tháp Bà Ponagar.', tourId: 'nhatrang' },
      { name: 'Đà Lạt', lat: 11.9404, lng: 108.4583, address: 'Lâm Đồng', desc: 'Thành phố ngàn hoa se lạnh, đồi thông thơ mộng.', tourId: 'dalat' },
      { name: 'Mũi Né - Phan Thiết', lat: 10.9333, lng: 108.2833, address: 'Bình Thuận', desc: 'Đồi cát bay tiểu sa mạc rực rỡ và lướt sóng biển.', tourId: 'muine' },
      { name: 'TP. Hồ Chí Minh', lat: 10.8231, lng: 106.6297, address: 'TP. Hồ Chí Minh', desc: 'Đô thị sầm uất, Chợ Bến Thành, Dinh Độc Lập.', tourId: 'hcm' },
      { name: 'Vũng Tàu', lat: 10.3460, lng: 107.0843, address: 'Bà Rịa - Vũng Tàu', desc: 'Bãi Sau, Tượng Chúa Kito Vua, ngọn Hải Đăng.', tourId: 'vungtau' },
      { name: 'Cần Thơ', lat: 10.0452, lng: 105.7469, address: 'Cần Thơ', desc: 'Chợ nổi Cái Răng, bến Ninh Kiều miền Tây sông nước.', tourId: 'cantho' },
      { name: 'Đảo Phú Quốc', lat: 10.2899, lng: 103.9840, address: 'Kiên Giang', desc: 'Đảo ngọc thiên đường biển, Bãi Sao, Grand World.', tourId: 'phuquoc' },
      { name: 'Hà Giang', lat: 22.8233, lng: 104.9836, address: 'Hà Giang', desc: 'Cao nguyên đá Đồng Văn, đèo Mã Pí Lèng hùng vĩ.', tourId: 'hagiang' },
      { name: 'Cao Bằng', lat: 22.6786, lng: 106.2581, address: 'Cao Bằng', desc: 'Thác Bản Giốc hùng vĩ nhất Đông Nam Á, suối Lê Nin.', tourId: 'caobang' },
      { name: 'Hoàng Sa (Việt Nam)', lat: 16.5000, lng: 111.5000, address: 'Quần đảo Hoàng Sa — Việt Nam 🇻🇳', desc: '🇻🇳 Quần đảo Hoàng Sa thuộc chủ quyền không thể tranh cãi của Việt Nam.', isIsland: true },
      { name: 'Trường Sa (Việt Nam)', lat: 9.5000, lng: 112.9000, address: 'Quần đảo Trường Sa — Việt Nam 🇻🇳', desc: '🇻🇳 Quần đảo Trường Sa thuộc chủ quyền không thể tranh cãi của Việt Nam.', isIsland: true }
    ];

    var activePlace = null;
    var activePolyline = null;

    places.forEach(function(p) {
      var iconHtml = p.isIsland ? '<div class="pulse-island">🇻🇳</div>' : '<div class="pulse-marker"></div>';
      var customIcon = L.divIcon({ html: iconHtml, className: '' });
      var marker = L.marker([p.lat, p.lng], { icon: customIcon }).addTo(map);

      marker.on('click', function() {
        selectPlace(p);
      });
    });

    function selectPlace(p) {
      activePlace = p;
      document.getElementById('cardTitle').innerText = (p.isIsland ? '🇻🇳 ' : '📍 ') + p.name;
      document.getElementById('cardAddress').innerText = p.address || 'Việt Nam';
      document.getElementById('cardDesc').innerText = p.desc;
      document.getElementById('placeCard').style.display = 'block';
      map.setView([p.lat, p.lng], p.isIsland ? 7 : 10);
    }

    function closeCard() {
      document.getElementById('placeCard').style.display = 'none';
      if (activePolyline) { map.removeLayer(activePolyline); activePolyline = null; }
    }

    function onCardAction(action) {
      if (!activePlace) return;
      if (action === 'aiPlanning') {
        postMessageToApp({ type: 'aiPlanning', placeName: activePlace.name });
      } else if (action === 'directions') {
        openDirectionsModalForPlace(activePlace);
      } else if (action === 'openVR') {
        postMessageToApp({ type: 'openVR', tourId: activePlace.tourId || 1 });
      } else if (action === 'openPlaceDetail') {
        postMessageToApp({ type: 'openPlaceDetail', placeName: activePlace.name });
      } else if (action === 'share') {
        postMessageToApp({ type: 'shareLocation', locationName: activePlace.name, address: activePlace.address, description: activePlace.desc });
      }
    }

    function openDirectionsModalForPlace(p) {
      if (activePolyline) map.removeLayer(activePolyline);
      var startCoords = [21.0285, 105.8542];
      activePolyline = L.polyline([startCoords, [p.lat, p.lng]], { color: '#6366f1', weight: 5, opacity: 0.85, dashArray: '8, 8' }).addTo(map);
      map.fitBounds(activePolyline.getBounds(), { padding: [60, 60] });

      document.getElementById('dirDestText').innerText = p.name;
      document.getElementById('directionsModal').style.display = 'flex';
    }

    function closeDirectionsModal() {
      document.getElementById('directionsModal').style.display = 'none';
    }

    function setOrigin(city) {
      document.getElementById('dirOriginText').innerText = city;
    }

    function handleSearchInput() {
      var query = document.getElementById('searchInput').value.trim().toLowerCase();
      var dropdown = document.getElementById('searchDropdown');
      var clearBtn = document.getElementById('clearSearchBtn');
      clearBtn.style.display = query ? 'block' : 'none';
      if (!query) { dropdown.style.display = 'none'; return; }
      var matches = places.filter(function(p) {
        return p.name.toLowerCase().includes(query) || (p.address && p.address.toLowerCase().includes(query));
      });
      if (matches.length === 0) { dropdown.style.display = 'none'; return; }
      dropdown.innerHTML = matches.map(function(m) {
        return '<div onclick="onSelectSearchItem(\'' + m.name + '\')" style="padding: 8px 10px; border-bottom: 1px solid rgba(255,255,255,0.06); cursor: pointer; font-size: 12px; font-weight: 600; color: ${isDarkMode ? '#fff' : '#0f172a'};">📍 ' + m.name + ' <span style="font-size: 10px; color: #94a3b8;">(' + m.address + ')</span></div>';
      }).join('');
      dropdown.style.display = 'block';
    }

    function onSelectSearchItem(name) {
      document.getElementById('searchDropdown').style.display = 'none';
      var item = places.find(function(p) { return p.name.toLowerCase() === name.toLowerCase(); });
      if (item) selectPlace(item);
    }

    function clearSearch() {
      document.getElementById('searchInput').value = '';
      document.getElementById('searchDropdown').style.display = 'none';
      document.getElementById('clearSearchBtn').style.display = 'none';
    }

    window.addEventListener('load', function() {
      setTimeout(function() {
        if (map && typeof map.invalidateSize === 'function') {
          map.invalidateSize();
        }
      }, 300);
    });

    var target = ${JSON.stringify(targetPlaceName || '')}.toLowerCase().trim();
    if (target) {
      var found = places.find(function(p) { return p.name.toLowerCase().includes(target) || target.includes(p.name.toLowerCase()); });
      if (found) selectPlace(found);
    }
  </script>
</body>
</html>
`;

export function VietnamTravelWebScreen({ theme, isDarkMode, onBack, onOpenVR, onOpenPlaceDetail, onOpenAIPlanning, onNavigateToProvince, onNavigateToTab, selectedPlaceName, planSlug = 'ha-noi-nghe-an-ninh-binh-ha-long-ha-noi', ownerId, currentUser }) {
  const webViewRef = useRef(null);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareLocationData, setShareLocationData] = useState(null);
  const [useHtmlFallback, setUseHtmlFallback] = useState(false);

  useEffect(() => {
    const backAction = () => {
      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(`
          if (window.alpineApp) {
            window.alpineApp.handleBackButtonClick();
          }
        `);
        return true;
      }
      if (onBack) {
        onBack();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [onBack]);

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'openVR') {
        if (onOpenVR) onOpenVR(data.tourId || 1);
      } else if (data.type === 'aiPlanning') {
        if (onOpenAIPlanning) onOpenAIPlanning(data.placeName);
        else if (onOpenPlaceDetail) onOpenPlaceDetail(data.placeName);
      } else if (data.type === 'openPlaceDetail') {
        if (onOpenPlaceDetail) onOpenPlaceDetail(data.placeName);
      } else if (data.type === 'goBack') {
        if (onBack) onBack();
      } else if (data.type === 'openProvince') {
        if (onNavigateToProvince) onNavigateToProvince(data.provinceName);
      } else if (data.type === 'shareLocation' || data.type === 'sharePlace') {
        setShareLocationData({
          name: data.locationName || data.placeName || data.name || 'Địa điểm du lịch',
          location: data.address || data.viTri || 'Việt Nam',
          description: data.description || data.moTa || '',
        });
        setShareModalVisible(true);
      }
    } catch (err) {
      console.warn('Error parsing webview message:', event.nativeEvent?.data);
    }
  };

  const currentHostIp = useMemo(() => getHostIp(), []);

  const mapUrl = useMemo(() => {
    let url = `http://${currentHostIp}:3005?view=map&isApp=1&theme=${isDarkMode ? 'dark' : 'light'}`;
    if (planSlug) {
      url += `&slug=${planSlug}`;
    }
    if (selectedPlaceName) {
      url += `&search=${encodeURIComponent(selectedPlaceName)}`;
    }
    return url;
  }, [currentHostIp, planSlug, selectedPlaceName, isDarkMode]);

  // Tự động định vị & tìm kiếm địa điểm được chọn trên bản đồ
  useEffect(() => {
    if (selectedPlaceName && webViewRef.current) {
      const cleanPlace = selectedPlaceName.split(',')[0].replace('Lịch trình đi ', '').trim();
      const script = `
        try {
          if (window.searchPlaceFromApp) {
            window.searchPlaceFromApp(${JSON.stringify(cleanPlace)});
          } else if (typeof map !== 'undefined' && typeof places !== 'undefined') {
            var target = ${JSON.stringify(cleanPlace)}.toLowerCase();
            places.forEach(function(p) {
              if (target && (p.name.toLowerCase().includes(target) || target.includes(p.name.toLowerCase()))) {
                map.setView([p.lat, p.lng], 10);
              }
            });
          }
        } catch(e){}
      `;
      webViewRef.current.injectJavaScript(script);
    }
  }, [selectedPlaceName]);

  const webViewSource = useMemo(() => {
    if (useHtmlFallback) {
      return { html: generateMapHtml(selectedPlaceName, isDarkMode), baseUrl: 'https://localhost' };
    }
    return { uri: mapUrl };
  }, [mapUrl, useHtmlFallback, selectedPlaceName, isDarkMode]);

  const containerStyle = useMemo(() => [
    styles.container,
    {
      backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
    }
  ], [isDarkMode]);

  return (
    <View style={containerStyle}>
      {/* WebView Localhost */}
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
        mixedContentMode="always"
        startInLoadingState={true}
        renderLoading={() => (
          <View style={[StyleSheet.absoluteFill, styles.loading, { backgroundColor: isDarkMode ? '#0f172a' : '#ffffff' }]}>
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        )}
        onError={() => setUseHtmlFallback(true)}
        onHttpError={() => setUseHtmlFallback(true)}
      />



      <ShareLocationModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        locationData={shareLocationData}
        ownerId={ownerId}
        currentUser={currentUser}
        onShareSuccess={() => {
          if (onNavigateToTab) onNavigateToTab('chat');
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
    backgroundColor: '#0f172a',
  },
  floatingBackBtn: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 8 : 48,
    left: 12,
    zIndex: 99999,
    padding: 6,
  },
  webview: {
    flex: 1,
  },
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
