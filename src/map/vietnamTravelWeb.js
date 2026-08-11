import React, { useRef, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Text, Pressable, SafeAreaView, ActivityIndicator, BackHandler, Platform, StatusBar, Alert, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { ChevronLeft } from 'lucide-react-native';
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
      height: 200px;
      background-size: cover;
      background-position: center;
      border-top-left-radius: 24px;
      border-top-right-radius: 24px;
      position: relative;
    }
    .modal-hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.45) 60%, transparent 100%);
      border-top-left-radius: 24px;
      border-top-right-radius: 24px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    }
    .modal-hero-tag {
      color: #34d399 !important;
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 2px;
      text-transform: uppercase;
      text-shadow: 0 1px 4px rgba(0,0,0,0.8);
      margin-bottom: 2px;
    }
    .modal-hero-title {
      color: #ffffff !important;
      font-size: 22px;
      font-weight: 900;
      line-height: 1.2;
      margin: 0;
      text-shadow: 0 2px 6px rgba(0,0,0,0.85);
    }
    .modal-hero-sub {
      color: rgba(255,255,255,0.9) !important;
      font-size: 12px;
      font-weight: 600;
      margin-top: 4px;
      text-shadow: 0 1px 3px rgba(0,0,0,0.8);
    }
    .modal-close-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(0, 0, 0, 0.55);
      color: #ffffff;
      border: 1px solid rgba(255,255,255,0.2);
      width: 34px;
      height: 34px;
      border-radius: 50%;
      font-size: 18px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
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
    <button class="map-share-location-btn" style="background:linear-gradient(135deg,#0284c7,#0369a1);" onclick="openCustomRoutePlanner()" title="Chọn điểm đi điểm đến">🛣️ Tìm đường</button>
    <button class="map-share-location-btn" onclick="shareCurrentMapView()" title="Chia sẻ vị trí bản đồ vào nhóm">📍 Chia sẻ</button>
  </div>

  <!-- Custom Route Planner Modal -->
  <div id="customRouteModal" class="modal-overlay" style="display:none;">
    <div class="modal-card" style="max-width:440px;padding:20px;border-radius:24px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
        <h3 style="margin:0;font-size:17px;font-weight:900;color:#0f172a;display:flex;align-items:center;gap:6px;">
          <span>🛣️</span><span>Chọn Tuyến Đường Tìm Kiếm</span>
        </h3>
        <button class="modal-close-btn" style="position:static;background:#cbd5e1;color:#334155;" onclick="closeCustomRoutePlanner()">✕</button>
      </div>

      <div style="display:flex;flex-direction:column;gap:14px;">
        <!-- Origin Selection -->
        <div>
          <label style="font-size:11px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;display:block;margin-bottom:6px;">
            🚩 1. Chọn Điểm Xuất Phát (Origin):
          </label>
          <select id="routeOriginSelect" style="width:100%;padding:10px 12px;border-radius:14px;border:1px solid #cbd5e1;font-size:13px;font-weight:700;color:#0f172a;background:#f8fafc;outline:none;">
            <option value="CURRENT">📍 Vị trí hiện tại của tôi</option>
          </select>
        </div>

        <!-- Destination Selection -->
        <div>
          <label style="font-size:11px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;display:block;margin-bottom:6px;">
            🏁 2. Chọn Điểm Đến (Destination):
          </label>
          <select id="routeDestSelect" style="width:100%;padding:10px 12px;border-radius:14px;border:1px solid #cbd5e1;font-size:13px;font-weight:700;color:#0f172a;background:#f8fafc;outline:none;">
          </select>
        </div>

        <div style="position:relative;text-align:center;margin:4px 0;">
          <span style="background:#fff;padding:0 8px;font-size:11px;font-weight:800;color:#94a3b8;position:relative;z-index:1;">HOẶC CHỌN TRỰC TIẾP</span>
          <div style="position:absolute;top:50%;left:0;right:0;height:1px;background:#e2e8f0;z-index:0;"></div>
        </div>

        <button onclick="startOnMapRoutePicker()" style="padding:11px;background:#f0fdf4;color:#15803d;border:1.5px dashed #4ade80;border-radius:16px;font-size:12.5px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:all;">
          <span>👉</span><span>Click Chọn 2 Điểm Trực Tiếp Trên Bản Đồ</span>
        </button>

        <!-- Submit Button -->
        <button onclick="submitCustomRoutePlan()" style="margin-top:4px;padding:12px;background:linear-gradient(135deg,#0284c7,#0369a1);color:#fff;border:none;border-radius:16px;font-size:13.5px;font-weight:900;cursor:pointer;box-shadow:0 4px 14px rgba(2,132,199,0.4);display:flex;align-items:center;justify-content:center;gap:6px;">
          <span>🚀</span><span>Vẽ Tuyến Đường Đã Chọn</span>
        </button>
      </div>
    </div>
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
          <button id="modalVrBtn" class="btn-vr" onclick="triggerVrFromModal()">🥽 Tour VR</button>
          <button id="modalGuideBtn" class="btn-vr" style="background:linear-gradient(135deg,#8b5cf6,#6d28d9);" onclick="triggerCamNangFromModal()">📖 Cẩm nang</button>
          <button id="modalShareBtn" class="btn-share" onclick="triggerShareFromModal()">💬 Chia sẻ</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Cam Nang Handbook Modal -->
  <div id="camNangModal" class="modal-overlay" style="display:none;">
    <div class="modal-card" style="max-width:480px;padding:0;">
      <div id="cnHero" class="modal-hero" style="background-image:url('https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80');">
        <button class="modal-close-btn" onclick="closeCamNangModal()">✕</button>
        <div class="modal-hero-overlay">
          <div class="modal-hero-tag">CẨM NANG ĐỊA ĐIỂM</div>
          <h3 id="cnTitle" class="modal-hero-title">Hồ Hoàn Kiếm</h3>
          <div id="cnSubtitle" class="modal-hero-sub">Hà Nội</div>
        </div>
      </div>
      <div id="cnContent" style="padding:16px 20px 20px 20px;max-height:400px;overflow-y:auto;font-size:13px;color:#334155;line-height:1.6;">
        <!-- Content inserted dynamically -->
      </div>
      <div style="padding:12px 16px 20px 16px;border-top:1px solid #f1f5f9;background:#f8fafc;display:flex;gap:8px;border-bottom-left-radius:24px;border-bottom-right-radius:24px;">
        <button id="cnDirectionsBtn" style="flex:1;padding:12px;background:linear-gradient(135deg,#10b981,#059669);color:#ffffff;border:none;border-radius:16px;font-size:13px;font-weight:800;cursor:pointer;box-shadow:0 4px 12px rgba(16,185,129,0.3);display:flex;align-items:center;justify-content:center;gap:6px;">
          <span>🚗</span><span>Chỉ đường</span>
        </button>
        <button onclick="closeCamNangModal()" style="flex:1;padding:12px;background:#e2e8f0;color:#334155;border:none;border-radius:16px;font-size:13px;font-weight:800;cursor:pointer;">
          Đóng cẩm nang
        </button>
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

    // CARTO Voyager Tiles (Nạp mượt trên trình duyệt & WebView)
    var tiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
      subdomains: ['a', 'b', 'c', 'd'],
      maxZoom: 19
    }).addTo(map);

    tiles.on('tileerror', function() {
      tiles.setUrl('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
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
      { prov: "Quảng Ninh", name: "Danh thắng Yên Tử", lat: 21.1565, lng: 106.7196, info: "Đất tổ Phật giáo Trúc Lâm." },
      { prov: "Lào Cai", name: "Đỉnh Fansipan", lat: 22.3033, lng: 103.7750, info: "Nóc nhà Đông Dương 3.143m." },
      { prov: "Lào Cai", name: "Bản Cát Cát", lat: 22.3312, lng: 103.8324, info: "Ngôi bản cổ đẹp nhất Sa Pa." },
      { prov: "Yên Bái", name: "Mù Cang Chải", lat: 21.8542, lng: 104.0841, info: "Kiệt tác ruộng bậc thang hùng vĩ." },
      { prov: "Yên Bái", name: "Đèo Khau Phạ", lat: 21.7644, lng: 104.1485, info: "Tứ đại đỉnh đèo điểm nhảy dù." },
      { prov: "Cao Bằng", name: "Thác Bản Giốc", lat: 22.8550, lng: 106.6090, info: "Thác nước biên giới hùng vĩ." },
      { prov: "Cao Bằng", name: "Động Ngườm Ngao", lat: 22.8427, lng: 106.6006, info: "Kiệt tác thạch nhũ kỳ vĩ." },
      { prov: "Sơn La", name: "Mộc Châu", lat: 20.8436, lng: 104.6811, info: "Cao nguyên đồi chè trái tim." },
      { prov: "Hà Giang", name: "Mã Pí Lèng", lat: 22.7933, lng: 105.4101, info: "Hẻm vực Tu Sản sông Nho Quý." },
      { prov: "Hà Giang", name: "Cột cờ Lũng Cú", lat: 23.3601, lng: 105.3164, info: "Điểm cực Bắc thiêng liêng Tổ quốc." },
      { prov: "Hà Nội", name: "Hồ Hoàn Kiếm", lat: 21.0285, lng: 105.8542, info: "Trái tim ngàn năm văn hiến." },
      { prov: "Hà Nội", name: "Văn Miếu Quốc Tử Giám", lat: 21.0293, lng: 105.8361, info: "Trường đại học đầu tiên Việt Nam." },
      { prov: "Thanh Hóa", name: "Pù Luông", lat: 20.4500, lng: 105.2167, info: "Khu sinh thái mây phủ thơ mộng." },
      { prov: "Quảng Bình", name: "Phong Nha - Kẻ Bàng", lat: 17.4833, lng: 106.3167, info: "Vương quốc hang động thế giới." },
      { prov: "Thừa Thiên Huế", name: "Đại Nội Huế", lat: 16.4695, lng: 107.5776, info: "Quần thể di tích Cố đô Huế." },
      { prov: "Đà Nẵng", name: "Cầu Vàng Bà Nà", lat: 15.9952, lng: 107.9965, info: "Biểu tượng du lịch quốc tế Đà Nẵng." },
      { prov: "Đà Nẵng", name: "Biển Mỹ Khê", lat: 16.0592, lng: 108.2464, info: "Top bãi biển đẹp nhất hành tinh." },
      { prov: "Quảng Nam", name: "Phố Cổ Hội An", lat: 15.8801, lng: 108.3380, info: "Di sản văn hóa thế giới Hội An." },
      { prov: "Bình Định", name: "Kỳ Co - Eo Gió", lat: 13.8872, lng: 109.2882, info: "Thiên đường biển xanh Quy Nhơn." },
      { prov: "Phú Yên", name: "Gành Đá Đĩa", lat: 13.3364, lng: 109.3031, info: "Tuyệt tác đá bazan hình lục giác." },
      { prov: "Khánh Hòa", name: "VinWonders Nha Trang", lat: 12.2173, lng: 109.2179, info: "Công viên giải trí đỉnh cao." },
      { prov: "Ninh Thuận", name: "Vịnh Vĩnh Hy", lat: 11.7088, lng: 109.1912, info: "Vịnh biển hoang sơ nồng nàn." },
      { prov: "Bình Thuận", name: "Đồi cát Mũi Né", lat: 10.9548, lng: 108.2934, info: "Thủ đô resort & Đồi cát bay." },
      { prov: "Lâm Đồng", name: "Hồ Xuân Hương", lat: 11.9404, lng: 108.4440, info: "Trái tim ngàn hoa Đà Lạt." },
      { prov: "Vũng Tàu", name: "Tượng Chúa Kito", lat: 10.3267, lng: 107.0850, info: "Tượng Chúa giang tay núi Nhỏ." },
      { prov: "TP.HCM", name: "Chợ Bến Thành", lat: 10.7725, lng: 106.6980, info: "Biểu tượng văn hóa Sài Gòn." },
      { prov: "Cần Thơ", name: "Chợ nổi Cái Răng", lat: 10.0058, lng: 105.7461, info: "Chợ nổi sầm uất Tây Đô." },
      { prov: "An Giang", name: "Rừng tràm Trà Sư", lat: 10.5050, lng: 105.0538, info: "Thánh địa bèo xanh miền Tây." },
      { prov: "Bến Tre", name: "Cù lao Thới Sơn", lat: 10.3341, lng: 106.3385, info: "Miệt vườn dừa nước sông nước." },
      { prov: "Kiên Giang", name: "Grand World Phú Quốc", lat: 10.3242, lng: 103.8580, info: "Thành phố không ngủ Phú Quốc." }
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
      { name: "TP.HCM", fullName: "TP. Hồ Chí Minh", lat: 10.7769, lng: 106.7009, info: "Chợ Bến Thành & Dinh Độc Lập." },
      { name: "Cần Thơ", fullName: "Cần Thơ", lat: 10.0452, lng: 105.7469, info: "Chợ nổi Cái Răng & Ninh Kiều." },
      { name: "An Giang", fullName: "An Giang", lat: 10.5216, lng: 105.1258, info: "Trà Sư & Miếu Bà Chúa Xứ." },
      { name: "Bến Tre", fullName: "Bến Tre", lat: 10.2432, lng: 106.3758, info: "Xứ dừa & Cù lao Thới Sơn." },
      { name: "Phú Quốc", fullName: "Kiên Giang (Phú Quốc)", lat: 10.2289, lng: 103.9572, info: "Đảo Ngọc & Grand World." }
    ];

    var currentRouteLine = null;
    var userStartMarker = null;
    var destEndMarker = null;
    var routeBannerEl = null;

    function clearDirectionsRoute() {
      if (currentRouteLine) { map.removeLayer(currentRouteLine); currentRouteLine = null; }
      if (userStartMarker) { map.removeLayer(userStartMarker); userStartMarker = null; }
      if (destEndMarker) { map.removeLayer(destEndMarker); destEndMarker = null; }
      if (routeBannerEl) { routeBannerEl.style.display = 'none'; }
    }

    var isRoutePickerMode = false;
    var routePickerStep = 1;
    var pickedStartPlace = null;
    var routePickerBannerEl = null;

    function startOnMapRoutePicker() {
      closeCustomRoutePlanner();
      clearDirectionsRoute();
      isRoutePickerMode = true;
      routePickerStep = 1;
      pickedStartPlace = null;

      showRoutePickerBanner('👆 Click vào <b>điểm xuất phát</b> trên bản đồ');
    }

    function cancelOnMapRoutePicker() {
      isRoutePickerMode = false;
      routePickerStep = 1;
      pickedStartPlace = null;
      if (routePickerBannerEl) routePickerBannerEl.style.display = 'none';
      clearDirectionsRoute();
    }

    function showRoutePickerBanner(htmlMsg) {
      if (!routePickerBannerEl) {
        routePickerBannerEl = document.createElement('div');
        routePickerBannerEl.style.cssText = 'position:fixed;bottom:100px;left:12px;right:12px;z-index:2800;background:rgba(15,23,42,0.96);backdrop-filter:blur(16px);color:#fff;padding:14px 16px;border-radius:20px;box-shadow:0 -4px 30px rgba(0,0,0,0.4);border:1px solid rgba(56,189,248,0.4);display:flex;justify-content:space-between;align-items:center;gap:10px;';
        document.body.appendChild(routePickerBannerEl);
      }
      routePickerBannerEl.innerHTML =
        '<div style="display:flex;flex-direction:column;gap:2px;">' +
          '<div style="font-size:13px;font-weight:900;color:#60a5fa;">🗺️ Chọn Điểm Trực Tiếp Trên Bản Đồ</div>' +
          '<div style="font-size:12px;font-weight:600;color:#e2e8f0;">' + htmlMsg + '</div>' +
        '</div>' +
        '<button onclick="cancelOnMapRoutePicker()" style="background:#ef4444;color:#fff;border:none;padding:8px 14px;border-radius:14px;font-size:12px;font-weight:800;cursor:pointer;box-shadow:0 2px 8px rgba(239,68,68,0.5);flex-none;">✕ Hủy</button>';
      routePickerBannerEl.style.display = 'flex';
    }

    function handleLocationTapForRoute(lat, lng, name) {
      if (!isRoutePickerMode) return false;

      if (routePickerStep === 1) {
        pickedStartPlace = { lat: lat, lng: lng, name: name };
        routePickerStep = 2;

        userStartMarker = L.marker([lat, lng], {
          icon: L.divIcon({
            className: 'custom-start-icon',
            html: '<div style="background:#10b981;color:#fff;padding:6px 12px;border-radius:20px;font-weight:800;font-size:11px;box-shadow:0 4px 12px rgba(16,185,129,0.4);border:2px solid #fff;white-space:nowrap;">🚩 ' + name + '</div>',
            iconSize: [140, 36],
            iconAnchor: [70, 18]
          })
        }).addTo(map);

        showRoutePickerBanner('👆 Click vào <b>điểm đến</b> trên bản đồ');
        return true;
      } else if (routePickerStep === 2) {
        isRoutePickerMode = false;
        if (routePickerBannerEl) routePickerBannerEl.style.display = 'none';

        renderDirectionsRoute(pickedStartPlace.lat, pickedStartPlace.lng, pickedStartPlace.name, lat, lng, name);
        return true;
      }
      return false;
    }

    function openCustomRoutePlanner() {
      populateRoutePlannerDropdowns();
      var modal = document.getElementById('customRouteModal');
      if (modal) modal.style.display = 'flex';
    }

    function closeCustomRoutePlanner() {
      var modal = document.getElementById('customRouteModal');
      if (modal) modal.style.display = 'none';
    }

    function swapRoutePoints() {
      var originSel = document.getElementById('routeOriginSelect');
      var destSel = document.getElementById('routeDestSelect');
      if (originSel && destSel) {
        var temp = originSel.value;
        originSel.value = destSel.value || 'CURRENT';
        destSel.value = temp === 'CURRENT' ? '' : temp;
      }
    }

    function populateRoutePlannerDropdowns() {
      var originSel = document.getElementById('routeOriginSelect');
      var destSel = document.getElementById('routeDestSelect');
      if (!originSel || !destSel) return;

      var optionsHtml = '<option value="CURRENT">📍 Vị trí hiện tại của tôi</option>';
      var destHtml = '';

      var allPlaces = [];
      provinces.forEach(function(p) {
        allPlaces.push({ name: p.fullName || p.name, lat: p.lat, lng: p.lng, type: 'Province' });
      });
      subAttractions.forEach(function(s) {
        allPlaces.push({ name: s.name, lat: s.lat, lng: s.lng, type: 'Attraction' });
      });

      allPlaces.forEach(function(item) {
        var opt = '<option value="' + item.lat + ',' + item.lng + '|' + item.name.replace(/"/g, '&quot;') + '">' + (item.type === 'Province' ? '🏛️ ' : '🏞️ ') + item.name + '</option>';
        optionsHtml += opt;
        destHtml += opt;
      });

      originSel.innerHTML = optionsHtml;
      destSel.innerHTML = destHtml;
    }

    function submitCustomRoutePlan() {
      var originSel = document.getElementById('routeOriginSelect');
      var destSel = document.getElementById('routeDestSelect');
      if (!originSel || !destSel) return;

      var originVal = originSel.value;
      var destVal = destSel.value;

      if (!destVal) {
        alert('Vui lòng chọn Điểm Đến!');
        return;
      }

      closeCustomRoutePlanner();

      var destParts = destVal.split('|');
      var destCoords = (destParts[0] || '').split(',');
      var destLat = parseFloat(destCoords[0]);
      var destLng = parseFloat(destCoords[1]);
      var destName = destParts[1] || 'Điểm đến';

      if (isNaN(destLat) || isNaN(destLng)) {
        alert('Tọa độ điểm đến không hợp lệ!');
        return;
      }

      if (originVal === 'CURRENT') {
        getDirectionsTo(destLat, destLng, destName);
      } else {
        var origParts = originVal.split('|');
        var origCoords = (origParts[0] || '').split(',');
        var origLat = parseFloat(origCoords[0]);
        var origLng = parseFloat(origCoords[1]);
        var origName = origParts[1] || 'Điểm xuất phát';

        if (isNaN(origLat) || isNaN(origLng)) {
          getDirectionsTo(destLat, destLng, destName);
        } else {
          renderDirectionsRoute(origLat, origLng, origName, destLat, destLng, destName);
        }
      }
    }

    var outerRouteGlowLine = null;

    function clearDirectionsRoute() {
      if (currentRouteLine) { map.removeLayer(currentRouteLine); currentRouteLine = null; }
      if (outerRouteGlowLine) { map.removeLayer(outerRouteGlowLine); outerRouteGlowLine = null; }
      if (userStartMarker) { map.removeLayer(userStartMarker); userStartMarker = null; }
      if (destEndMarker) { map.removeLayer(destEndMarker); destEndMarker = null; }
      if (routeBannerEl) { routeBannerEl.style.display = 'none'; }

      // Restore all map markers when ending directions
      provinceMarkers.forEach(function(m) { if (!map.hasLayer(m)) map.addLayer(m); });
    }

    function renderDirectionsRoute(startLat, startLng, startName, destLat, destLng, destName, travelMode) {
      clearDirectionsRoute();

      // Clean Focus Mode: Hide all clutter markers on map while navigating
      provinceMarkers.forEach(function(m) { map.removeLayer(m); });
      subMarkers.forEach(function(item) { map.removeLayer(item.marker); });
      if (droppedPinMarker) { map.removeLayer(droppedPinMarker); droppedPinMarker = null; }

      travelMode = travelMode || 'driving';
      var modeIcon = travelMode === 'walking' ? '🚶' : (travelMode === 'biking' ? '🏍️' : '🚗');

      // Prevent 0 km flag overlap if start and end are exact same coordinates
      if (Math.abs(startLat - destLat) < 0.005 && Math.abs(startLng - destLng) < 0.005) {
        startLat = 21.0285;
        startLng = 105.8542;
        if (Math.abs(destLat - 21.0285) < 0.005) {
          startLat = 20.8436;
          startLng = 104.6811;
          startName = 'Mộc Châu (Vùng ven)';
        }
      }

      // 1. Start Marker
      userStartMarker = L.marker([startLat, startLng], {
        icon: L.divIcon({
          className: 'custom-start-icon',
          html: '<div style="background:#2563eb;color:#fff;padding:6px 14px;border-radius:20px;font-weight:900;font-size:11px;box-shadow:0 4px 14px rgba(37,99,235,0.4);border:2px solid #fff;white-space:nowrap;">🔵 ' + startName + '</div>',
          iconSize: [140, 36],
          iconAnchor: [70, 18]
        })
      }).addTo(map);

      // 2. Destination Marker
      destEndMarker = L.marker([destLat, destLng], {
        icon: L.divIcon({
          className: 'custom-dest-icon',
          html: '<div style="background:#ef4444;color:#fff;padding:6px 14px;border-radius:20px;font-weight:900;font-size:11px;box-shadow:0 4px 14px rgba(239,68,68,0.4);border:2px solid #fff;white-space:nowrap;">🔴 ' + destName + '</div>',
          iconSize: [140, 36],
          iconAnchor: [70, 18]
        })
      }).addTo(map);

      if (!routeBannerEl) {
        routeBannerEl = document.createElement('div');
        routeBannerEl.style.cssText = 'position:fixed;bottom:100px;left:12px;right:12px;z-index:2500;background:rgba(15,23,42,0.96);backdrop-filter:blur(16px);color:#fff;padding:14px 16px;border-radius:20px;box-shadow:0 -4px 30px rgba(0,0,0,0.4);border:1px solid rgba(56,189,248,0.25);display:flex;flex-direction:column;gap:8px;';
        document.body.appendChild(routeBannerEl);
      }
      routeBannerEl.innerHTML = '<div style="display:flex;align-items:center;gap:8px;"><span style="color:#60a5fa;font-size:13px;font-weight:700;">⏳ Đang tìm tuyến đường...</span></div>';
      routeBannerEl.style.display = 'flex';

      var profile = travelMode === 'walking' ? 'foot' : (travelMode === 'biking' ? 'bike' : 'driving');
      var osrmUrl = 'https://router.project-osrm.org/route/v1/' + profile + '/' + startLng + ',' + startLat + ';' + destLng + ',' + destLat + '?overview=full&geometries=geojson';

      fetch(osrmUrl)
        .then(function(res) { return res.json(); })
        .then(function(data) {
          var routeCoords = [];
          var distKmStr = '';
          var durStr = '';

          if (data && data.routes && data.routes.length > 0) {
            var route = data.routes[0];
            routeCoords = route.geometry.coordinates.map(function(c) { return [c[1], c[0]]; });
            var km = (route.distance / 1000).toFixed(1);
            var mins = Math.round(route.duration / 60);
            distKmStr = km + ' km';
            durStr = mins >= 60 ? (Math.floor(mins / 60) + ' giờ ' + (mins % 60) + ' phút') : (mins + ' phút');
          } else {
            routeCoords = [[startLat, startLng], [destLat, destLng]];
            distKmStr = 'Thẳng';
            durStr = '--';
          }

          outerRouteGlowLine = L.polyline(routeCoords, {
            color: '#60a5fa',
            weight: 10,
            opacity: 0.5,
            lineCap: 'round',
            lineJoin: 'round'
          }).addTo(map);

          currentRouteLine = L.polyline(routeCoords, {
            color: '#2563eb',
            weight: 6,
            opacity: 0.95,
            lineCap: 'round',
            lineJoin: 'round'
          }).addTo(map);

          routeBannerEl.innerHTML =
            '<div style="display:flex;justify-content:space-between;align-items:center;">' +
              '<div>' +
                '<div style="font-size:15px;font-weight:900;color:#fff;letter-spacing:-0.2px;">' + modeIcon + ' ' + durStr + ' &nbsp;<span style="font-size:12px;font-weight:700;color:#93c5fd;">(' + distKmStr + ')</span></div>' +
                '<div style="font-size:11px;font-weight:600;color:#94a3b8;margin-top:2px;">' + startName + ' → ' + destName + '</div>' +
              '</div>' +
              '<button onclick="clearDirectionsRoute()" style="background:#ef4444;color:#fff;border:none;padding:8px 14px;border-radius:14px;font-size:12px;font-weight:800;cursor:pointer;box-shadow:0 2px 8px rgba(239,68,68,0.5);flex-none;white-space:nowrap;">✕ Hủy</button>' +
            '</div>';

          var bounds = L.latLngBounds(routeCoords);
          map.fitBounds(bounds, { padding: [80, 80], animate: true });
        })
        .catch(function(err) {
          console.warn('OSRM route error, fallback to straight line:', err);
          var fallbackCoords = [[startLat, startLng], [destLat, destLng]];

          currentRouteLine = L.polyline(fallbackCoords, {
            color: '#2563eb',
            weight: 6,
            opacity: 0.9,
            dashArray: '10, 10'
          }).addTo(map);

          routeBannerEl.innerHTML =
            '<div style="display:flex;justify-content:space-between;align-items:center;">' +
              '<div>' +
                '<div style="font-size:15px;font-weight:900;color:#fff;">' + modeIcon + ' ' + startName + ' → ' + destName + '</div>' +
                '<div style="font-size:11px;font-weight:600;color:#f87171;margin-top:2px;">⚠️ Không lấy được đường đi thực tế - hiển thị đường thẳng</div>' +
              '</div>' +
              '<button onclick="clearDirectionsRoute()" style="background:#ef4444;color:#fff;border:none;padding:8px 14px;border-radius:14px;font-size:12px;font-weight:800;cursor:pointer;box-shadow:0 2px 8px rgba(239,68,68,0.5);flex-none;">✕ Hủy</button>' +
            '</div>';

          var bounds = L.latLngBounds(fallbackCoords);
          map.fitBounds(bounds, { padding: [80, 80], animate: true });
        });
    }

    function getDirectionsTo(targetLat, targetLng, placeName) {
      if (!targetLat || !targetLng) return;

      closeCamNangModal();
      closePlaceDetailModal();

      var defaultStartLat = 21.0285;
      var defaultStartLng = 105.8542;
      var defaultStartName = 'Hà Nội';

      if (Math.abs(targetLat - 21.0285) < 0.005 && Math.abs(targetLng - 105.8542) < 0.005) {
        defaultStartLat = 20.8436;
        defaultStartLng = 104.6811;
        defaultStartName = 'Mộc Châu';
      }

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          function(pos) {
            renderDirectionsRoute(pos.coords.latitude, pos.coords.longitude, 'Vị trí của bạn', targetLat, targetLng, placeName || 'Điểm đến', 'driving');
          },
          function() {
            renderDirectionsRoute(defaultStartLat, defaultStartLng, defaultStartName, targetLat, targetLng, placeName || 'Điểm đến', 'driving');
          },
          { timeout: 3000 }
        );
      } else {
        renderDirectionsRoute(defaultStartLat, defaultStartLng, defaultStartName, targetLat, targetLng, placeName || 'Điểm đến', 'driving');
      }
    }

    var provinceMarkers = [];
    provinces.forEach(function(prov) {
      var fullName = prov.fullName || prov.name;
      var m = L.marker([prov.lat, prov.lng], { icon: createPillIcon(fullName, prov.isCapital) }).addTo(map);

      var popupHtml = '<div class="pretty-popup">' +
        '<h3>' + fullName + '</h3>' +
        '<p>' + prov.info + '</p>' +
        '<div style="display:flex;gap:4px;margin-top:8px;">' +
        '<button class="popup-btn" style="background:linear-gradient(135deg, #0284c7, #0369a1);" onclick="fetchAndOpenCamNang(\'' + fullName.replace(/'/g, "\\'") + '\')">📖 Cẩm nang</button>' +
        '<button class="popup-btn" style="background:linear-gradient(135deg, #10b981, #059669);" onclick="getDirectionsTo(' + prov.lat + ', ' + prov.lng + ', \'' + fullName.replace(/'/g, "\\'") + '\')">🚗 Chỉ đường</button>' +
        '<button class="popup-btn" style="background:linear-gradient(135deg, #3b82f6, #1d4ed8);" onclick="shareLocation(\'' + fullName.replace(/'/g, "\\'") + '\', \'' + prov.name.replace(/'/g, "\\'") + '\')">💬 Chia sẻ</button>' +
        '</div></div>';

      m.bindPopup(popupHtml);

      m.on('click', function(e) {
        if (handleLocationTapForRoute(prov.lat, prov.lng, fullName)) return;
        zoomToProvince(prov.lat, prov.lng, fullName);
        setTimeout(function() { m.openPopup(); }, 300);
      });

      provinceMarkers.push(m);
    });

    var subMarkers = [];
    subAttractions.forEach(function(sub) {
      var sm = L.marker([sub.lat, sub.lng], { icon: createPillIcon(sub.name, false, true) }).addTo(map);
      var subPopup = '<div class="pretty-popup">' +
        '<h3>' + sub.name + '</h3>' +
        '<p>' + sub.info + '</p>' +
        '<div style="display:flex;gap:4px;margin-top:8px;">' +
        '<button class="popup-btn" style="background:linear-gradient(135deg, #0284c7, #0369a1);" onclick="fetchAndOpenCamNang(\'' + sub.name.replace(/'/g, "\\'") + '\')">📖 Cẩm nang</button>' +
        '<button class="popup-btn" style="background:linear-gradient(135deg, #10b981, #059669);" onclick="getDirectionsTo(' + sub.lat + ', ' + sub.lng + ', \'' + sub.name.replace(/'/g, "\\'") + '\')">🚗 Chỉ đường</button>' +
        '<button class="popup-btn" style="background:linear-gradient(135deg, #3b82f6, #1d4ed8);" onclick="shareLocation(\'' + sub.name.replace(/'/g, "\\'") + '\', \'' + sub.prov.replace(/'/g, "\\'") + '\')">💬 Chia sẻ</button>' +
        '</div></div>';
      sm.bindPopup(subPopup);

      sm.on('click', function(e) {
        if (handleLocationTapForRoute(sub.lat, sub.lng, sub.name)) return;
        zoomToProvince(sub.lat, sub.lng, sub.name);
        setTimeout(function() { sm.openPopup(); }, 300);
      });

      subMarkers.push({ prov: sub.prov, marker: sm });
    });

    var droppedPinMarker = null;

    map.on('click', function(e) {
      if (isRoutePickerMode) {
        var lat = e.latlng.lat;
        var lng = e.latlng.lng;
        var name = 'Vị trí đã chọn';
        handleLocationTapForRoute(lat, lng, name);
        return;
      }

      var lat = e.latlng.lat;
      var lng = e.latlng.lng;

      if (droppedPinMarker) map.removeLayer(droppedPinMarker);

      droppedPinMarker = L.marker([lat, lng], {
        icon: L.divIcon({
          className: 'custom-dropped-pin',
          html: '<div style="background:#ef4444;color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(239,68,68,0.5);border:2.5px solid #fff;font-weight:900;font-size:12px;">📍</div>',
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        })
      }).addTo(map);

      var coordStr = lat.toFixed(4) + ', ' + lng.toFixed(4);
      var popupContent = '<div class="pretty-popup" style="min-width:210px;padding:4px;">' +
        '<div style="font-size:9.5px;font-weight:900;color:#0284c7;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:2px;">📍 VỊ TRÍ ĐÃ CHỌN TRÊN BẢN ĐỒ</div>' +
        '<h3 id="droppedPinTitle" style="margin:0 0 8px 0;font-size:13.5px;font-weight:900;color:#0f172a;">Tọa độ: ' + coordStr + '</h3>' +
        '<div style="display:flex;gap:6px;margin-top:8px;">' +
        '<button class="popup-btn" style="background:linear-gradient(135deg,#2563eb,#1d4ed8);flex:1;padding:7px;border-radius:10px;font-size:11px;font-weight:800;color:#fff;border:none;cursor:pointer;" onclick="setRouteOriginFromMap(' + lat + ', ' + lng + ', \'Vị trí ' + coordStr + '\')">🚩 Chọn Điểm Đi</button>' +
        '<button class="popup-btn" style="background:linear-gradient(135deg,#10b981,#059669);flex:1;padding:7px;border-radius:10px;font-size:11px;font-weight:800;color:#fff;border:none;cursor:pointer;" onclick="setRouteDestFromMap(' + lat + ', ' + lng + ', \'Vị trí ' + coordStr + '\')">🏁 Chọn Điểm Đến</button>' +
        '</div></div>';

      droppedPinMarker.bindPopup(popupContent).openPopup();

      fetch('https://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lng)
        .then(function(res) { return res.json(); })
        .then(function(data) {
          if (data && data.display_name) {
            var shortAddress = (data.address.road || data.address.suburb || data.address.city || data.address.state || data.display_name.split(',')[0]).trim();
            var el = document.getElementById('droppedPinTitle');
            if (el) el.innerText = shortAddress;
          }
        })
        .catch(function(err) {});
    });

    function setRouteOriginFromMap(lat, lng, name) {
      populateRoutePlannerDropdowns();
      var originSel = document.getElementById('routeOriginSelect');
      if (originSel) {
        var opt = document.createElement('option');
        opt.value = lat + ',' + lng + '|' + name;
        opt.innerText = '📍 ' + name;
        opt.selected = true;
        originSel.insertBefore(opt, originSel.firstChild);
      }
      openCustomRoutePlanner();
    }

    function setRouteDestFromMap(lat, lng, name) {
      populateRoutePlannerDropdowns();
      var destSel = document.getElementById('routeDestSelect');
      if (destSel) {
        var opt = document.createElement('option');
        opt.value = lat + ',' + lng + '|' + name;
        opt.innerText = '📍 ' + name;
        opt.selected = true;
        destSel.insertBefore(opt, destSel.firstChild);
      }
      openCustomRoutePlanner();
    }

    var currentSelectedPlace = null;

    function openPlaceDetail(placeName, provinceName) {
      currentSelectedPlace = { placeName: placeName, provinceName: provinceName };

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

    var currentGuideData = null;

    function triggerCamNangFromModal() {
      if (currentSelectedPlace) {
        fetchAndOpenCamNang(currentSelectedPlace.placeName);
      }
    }

    function fetchAndOpenCamNang(placeName) {
      var subObj = subAttractions.find(function(s) { return s.name === placeName; });
      var provObj = provinces.find(function(p) { return p.name === placeName || p.fullName === placeName; });
      var provName = subObj ? subObj.prov : (provObj ? provObj.name : 'Việt Nam');
      
      document.getElementById('cnTitle').innerText = placeName;
      document.getElementById('cnSubtitle').innerText = '📍 ' + provName;

      var heroImg = (subObj && subObj.img) ? subObj.img : 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80';
      document.getElementById('cnHero').style.backgroundImage = 'url("' + heroImg + '")';

      var targetLat = subObj ? subObj.lat : (provObj ? provObj.lat : 21.0285);
      var targetLng = subObj ? subObj.lng : (provObj ? provObj.lng : 105.8542);

      document.getElementById('cnDirectionsBtn').onclick = function() {
        getDirectionsTo(targetLat, targetLng, placeName);
      };

      document.getElementById('cnContent').innerHTML = '<div style="text-align:center;padding:30px;color:#64748b;font-weight:700;">Đang tải cẩm nang từ API...</div>';
      document.getElementById('camNangModal').style.display = 'flex';

      fetch('/api/camnang/location/' + encodeURIComponent(placeName))
        .then(function(res) { return res.json(); })
        .then(function(data) {
          currentGuideData = data;
          renderCamNangModalContent(data);
        })
        .catch(function(err) {
          console.warn('API fetch failed, loading default guide', err);
          currentGuideData = {
            locationName: placeName,
            description: placeName + ' là điểm đến du lịch tuyệt vời với cảnh quan thiên nhiên trù phú và bản sắc văn hóa độc đáo.',
            openingHours: '07:30',
            closingHours: '17:30',
            ticketPrice: 'Miễn phí / Vé dịch vụ',
            areaSize: 'Quy mô địa phương',
            history: placeName + ' có lịch sử hình thành lâu đời, trải qua nhiều thăng trầm phát triển cùng con người và vùng đất văn hóa Việt Nam.',
            itemsToBring: ['Trang phục phù hợp thời tiết', 'Kem chống nắng & kính râm', 'Máy ảnh & sạc dự phòng']
          };
          renderCamNangModalContent(currentGuideData);
        });
    }

    function closeCamNangModal() {
      document.getElementById('camNangModal').style.display = 'none';
    }

    function renderCamNangModalContent(data) {
      if (!data) return;
      var html = '<div style="display:flex;flex-direction:column;gap:14px;color:#334155;">' +
        /* 1. Stat Grid */
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;background:#f8fafc;padding:12px;border-radius:16px;border:1px solid #e2e8f0;">' +
        '<div style="background:#ffffff;padding:10px;border-radius:12px;border:1px solid #f1f5f9;">' +
        '<div style="font-size:9.5px;color:#94a3b8;font-weight:800;letter-spacing:0.5px;text-transform:uppercase;">DIỆN TÍCH</div>' +
        '<div style="font-weight:800;color:#0f172a;margin-top:2px;font-size:12px;">' + (data.areaSize || 'Quy mô vùng') + '</div>' +
        '</div>' +
        '<div style="background:#ffffff;padding:10px;border-radius:12px;border:1px solid #f1f5f9;">' +
        '<div style="font-size:9.5px;color:#94a3b8;font-weight:800;letter-spacing:0.5px;text-transform:uppercase;">GIÁ VÉ</div>' +
        '<div style="font-weight:800;color:#10b981;margin-top:2px;font-size:12px;">' + (data.ticketPrice || 'Miễn phí') + '</div>' +
        '</div>' +
        '<div style="background:#ffffff;padding:10px;border-radius:12px;border:1px solid #f1f5f9;grid-column:span 2;">' +
        '<div style="font-size:9.5px;color:#94a3b8;font-weight:800;letter-spacing:0.5px;text-transform:uppercase;">THỜI GIAN MỞ CỬA</div>' +
        '<div style="font-weight:800;color:#0f172a;margin-top:2px;font-size:12px;">' + (data.openingHours || '07:00') + ' - ' + (data.closingHours || '18:00') + '</div>' +
        '</div>' +
        '</div>' +

        /* 2. Overview */
        '<div>' +
        '<h4 style="font-size:14px;font-weight:800;color:#0f172a;margin:0 0 6px 0;">Thông tin địa điểm</h4>' +
        '<p style="font-size:13px;color:#475569;line-height:1.6;margin:0;">' + (data.description || '') + '</p>' +
        '</div>' +

        /* 3. History Amber Box */
        '<div style="background:#fffbeb;border:1px solid #fef3c7;padding:14px;border-radius:16px;">' +
        '<h4 style="font-size:14px;font-weight:800;color:#92400e;margin:0 0 6px 0;">Lịch sử hình thành</h4>' +
        '<p style="font-size:13px;color:#78350f;line-height:1.6;margin:0;">' + (data.history || 'Thông tin lịch sử đang được cập nhật.') + '</p>' +
        '</div>' +

        /* 4. Essentials List */
        '<div>' +
        '<h4 style="font-size:14px;font-weight:800;color:#0f172a;margin:0 0 8px 0;">Đồ dùng thiết yếu nên mang theo</h4>' +
        '<div style="display:flex;flex-direction:column;gap:6px;">';

      var items = Array.isArray(data.itemsToBring) ? data.itemsToBring : [];
      if (items.length === 0 && typeof data.itemsToBring === 'string') {
        try { items = JSON.parse(data.itemsToBring); } catch (e) {}
      }
      if (items.length === 0) items = ['Trang phục thoải mái', 'Kem chống nắng & mũ râm', 'Máy ảnh & sạc dự phòng'];

      items.forEach(function(item) {
        html += '<div style="display:flex;align-items:flex-start;gap:8px;font-size:13px;color:#475569;line-height:1.5;">' +
          '<span style="width:6px;height:6px;border-radius:50%;background:#10b981;margin-top:7px;flex-shrink:0;"></span>' +
          '<span>' + item + '</span>' +
          '</div>';
      });

      html += '</div></div>' +

        /* 5. Sky Blue Best Time Box */
        '<div style="background:#f0f9ff;border:1px solid #e0f2fe;padding:14px;border-radius:16px;">' +
        '<h4 style="font-size:14px;font-weight:800;color:#0369a1;margin:0 0 6px 0;">Thời điểm nên đi</h4>' +
        '<p style="font-size:13px;color:#075985;line-height:1.6;margin:0;">' + (data.bestTime || 'Nên đi từ tháng 1 đến tháng 5 và tháng 9 đến tháng 11 khi thời tiết khô ráo, thoáng mát.') + '</p>' +
        '</div>' +
        '</div>';

      document.getElementById('cnContent').innerHTML = html;
    }

    function switchCnTab(tab) {
      if (currentGuideData) renderCamNangModalContent(currentGuideData);
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

    window.addEventListener('resize', function() {
      if (window.currentMap) window.currentMap.invalidateSize(true);
    });
    setTimeout(function() {
      if (window.currentMap) window.currentMap.invalidateSize(true);
    }, 200);
    setTimeout(function() {
      if (window.currentMap) window.currentMap.invalidateSize(true);
    }, 600);
  </script>
</body>
</html>
`;

export function VietnamTravelWebScreen({ theme, isDarkMode, setIsDarkMode, onBack, onOpenVR, onNavigateToTour, onOpenPlaceDetail, onNavigateToCamNang, onNavigateToProvince, onNavigateToTab, selectedPlaceRequest, onSelectedPlaceRequestHandled, ownerId, currentUser, onCheckIn }) {
  const webViewRef = useRef(null);
  const pendingPlaceRequestRef = useRef(null);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareLocationData, setShareLocationData] = useState(null);
  const [webViewReady, setWebViewReady] = useState(false);

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

  const flushPendingPlaceRequest = () => {
    const nextRequest = pendingPlaceRequestRef.current;
    if (!nextRequest?.placeName || !webViewRef.current || !webViewReady) return false;

    const payload = JSON.stringify({
      placeName: nextRequest.placeName,
      address: nextRequest.address || '',
      mapsLink: nextRequest.mapsLink || '',
      openGuide: nextRequest.openGuide !== false,
    });

    webViewRef.current.injectJavaScript(`
      (function() {
        window.__pendingVivu360PlaceGuide = ${payload};
        if (typeof window.openPlaceGuideFromApp === 'function') {
          window.openPlaceGuideFromApp(window.__pendingVivu360PlaceGuide);
        }
      })();
      true;
    `);

    pendingPlaceRequestRef.current = null;
    if (onSelectedPlaceRequestHandled && nextRequest.requestId) {
      onSelectedPlaceRequestHandled(nextRequest.requestId);
    }
    return true;
  };

  const requestPlaceGuide = (request) => {
    if (!request?.placeName) return false;
    pendingPlaceRequestRef.current = {
      requestId: request.requestId || Date.now(),
      placeName: request.placeName,
      address: request.address || '',
      mapsLink: request.mapsLink || '',
      openGuide: request.openGuide !== false,
    };
    flushPendingPlaceRequest();
    return true;
  };

  useEffect(() => {
    if (selectedPlaceRequest?.placeName) {
      requestPlaceGuide(selectedPlaceRequest);
    }
  }, [selectedPlaceRequest?.requestId, selectedPlaceRequest?.placeName, webViewReady]);
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
      } else if (data.type === 'openProvince') {
        const provName = data.provinceName || data.placeName || data.address || 'Hà Nội';
        if (onNavigateToProvince) {
          onNavigateToProvince(provName);
        }
      } else if (data.type === 'openDirections') {
        const url = data.url || `https://www.google.com/maps/dir/?api=1&destination=${data.lat},${data.lng}`;
        Linking.openURL(url).catch(err => console.warn('Cannot open directions URL:', err));
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
          description: data.description || data.moTa || 'Khám phá vị trí và danh thắng tuyệt đẹp cùng Vivu360!',
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

  const [useFallbackHtml, setUseFallbackHtml] = useState(false);

  const htmlContent = useMemo(() => createLeafletHtml(isDarkMode), [isDarkMode]);
  const webViewSource = useMemo(() => {
    if (useFallbackHtml) {
      return { html: htmlContent, baseUrl: 'https://unpkg.com/' };
    }
    if (process.env.EXPO_PUBLIC_TRAVEL_MAP_URL) {
      return { uri: process.env.EXPO_PUBLIC_TRAVEL_MAP_URL };
    }
    return { uri: `http://${expoHost}:3005?view=map&isApp=1` };
  }, [expoHost, htmlContent, useFallbackHtml, isDarkMode]);

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
        onLoadStart={() => setWebViewReady(false)}
        onLoadEnd={() => { setWebViewReady(true); flushPendingPlaceRequest(); }}
        onError={() => {
          console.warn('Cannot reach Web Map server at port 3005, falling back to offline HTML map');
          setUseFallbackHtml(true);
        }}
        onHttpError={() => {
          setUseFallbackHtml(true);
        }}
      />

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
});
