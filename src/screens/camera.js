import React, { useState, useEffect } from 'react';
import { View, Text, Image, Pressable, StyleSheet, Dimensions, Modal, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Compass,
  Box,
  Zap,
  RefreshCw,
  Scan,
  CircleCheck,
  ChevronRight,
  Sparkles,
  Camera
} from 'lucide-react-native';


import { styles } from './screens.js';

export function CameraScreen({ isDarkMode, setIsDarkMode, theme, onNavigateToTour, onNavigateToTab, onViewTicket }) {
  const [scanMode, setScanMode] = useState('scene'); // 'scene' | 'object'
  const [flashOn, setFlashOn] = useState(false);
  const [cameraFacing, setCameraFacing] = useState('back');
  const [isCameraTransitioning, setIsCameraTransitioning] = useState(false);
  
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStepText, setScanStepText] = useState('[AR] Hệ thống sẵn sàng');
  const [scanResult, setScanResult] = useState(null);
  
  // Rotating 3D Object Simulator Modal state
  const [showObject3DModal, setShowObject3DModal] = useState(false);
  const [objectRotation, setObjectRotation] = useState(0);
  const [wireframeMode, setWireframeMode] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState(2); // 2 = Hòn Trống Mái, 3 = Chùa Một Cột, 4 = Tháp Rùa
  const [rotationSpeed, setRotationSpeed] = useState(1.5);
  const [isNarrating, setIsNarrating] = useState(false);

  // GPS Coordinates Jitter simulation
  const [gpsCoords, setGpsCoords] = useState({ lat: 20.8497, lng: 107.0563 });

  useEffect(() => {
    const gpsInterval = setInterval(() => {
      setGpsCoords(prev => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.0001,
        lng: prev.lng + (Math.random() - 0.5) * 0.0001
      }));
    }, 1500);
    return () => clearInterval(gpsInterval);
  }, []);

  // 3D Object & Radar rotating animation simulation
  useEffect(() => {
    let animationFrame;
    const rotate = () => {
      setObjectRotation(prev => (prev + rotationSpeed) % 360);
      animationFrame = requestAnimationFrame(rotate);
    };
    animationFrame = requestAnimationFrame(rotate);
    return () => cancelAnimationFrame(animationFrame);
  }, [rotationSpeed]);

  // Flip camera transition simulator
  const handleFlipCamera = () => {
    if (isScanning) return;
    setIsCameraTransitioning(true);
    setTimeout(() => {
      setCameraFacing(prev => prev === 'back' ? 'front' : 'back');
      setIsCameraTransitioning(false);
    }, 400);
  };

  // Toggle flash
  const handleToggleFlash = () => {
    setFlashOn(prev => !prev);
  };

  // Change scan mode
  const handleSelectMode = (mode) => {
    if (isScanning) return;
    setScanMode(mode);
    setScanResult(null);
    setScanProgress(0);
    setScanStepText(mode === 'scene' ? '[AR] Sẵn sàng quét địa danh' : '[AI] Sẵn sàng nhận diện vật thể');
  };

  // Scan simulation action
  const handleStartScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanResult(null);
    setScanProgress(0);
    setScanStepText(scanMode === 'scene' ? 'Đang khởi tạo cảm biến AR...' : 'Đang khởi tạo camera nhận diện...');

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setScanProgress(progress);

      // Update step-by-step description text
      if (scanMode === 'scene') {
        if (progress === 20) setScanStepText('Đang khóa định vị GPS và độ cao...');
        if (progress === 40) setScanStepText('Đang quét cấu trúc bề mặt 3D (LiDAR)...');
        if (progress === 60) setScanStepText('Đang đối chiếu cơ sở dữ liệu di sản Vivu360...');
        if (progress === 80) setScanStepText('Đồng bộ hóa môi trường Virtual Tour 360°...');
      } else { // object
        if (progress === 20) setScanStepText('Đang xác định đám mây điểm đặc trưng...');
        if (progress === 40) setScanStepText('Đang đo đạc tỷ lệ hình học vật thể...');
        if (progress === 60) setScanStepText('Đối chiếu thư viện hiện vật quốc gia...');
        if (progress === 80) setScanStepText('Đang dựng mô hình 3D AR lưới đa giác...');
      }

      if (progress >= 100) {
        clearInterval(interval);
        setIsScanning(false);
        setScanProgress(100);
        
        if (scanMode === 'scene') {
          setScanResult({
            title: 'Vịnh Hạ Long - Động Thiên Cung',
            rating: '4.9/5★',
            distance: '1.2 km cách bạn',
            type: 'scene',
            tourId: 1,
            spotIdx: 0,
            facts: [
              'Hệ thống hang động thạch nhũ kiến tạo hơn 20 triệu năm.',
              'Được UNESCO công nhận là di sản thiên nhiên thế giới.',
              'Diện tích tham quan ảo 360° đã quét: 5.400 m².',
            ]
          });
          setScanStepText('Hoàn tất: Nhận diện Động Thiên Cung');
        } else { // object
          setScanResult({
            title: 'Hòn Trống Mái - Tác phẩm thiên nhiên',
            rating: 'Nhận dạng AI: 98.4%',
            distance: 'Kích thước: ~10m chiều cao',
            type: 'object',
            facts: [
              'Biểu tượng văn hóa nổi tiếng trên Vịnh Hạ Long.',
              'Cặp khối đá hình hai con gà đối diện nhau giữa biển khơi.',
              'Mô hình 3D AR đã được tối ưu hóa với 120,000 đa giác lưới.',
            ]
          });
          setScanStepText('Hoàn tất: Nhận diện Hòn Trống Mái');
        }
      }
    }, 300);
  };

  const MOCK_POINTS_CLOUD = [
    { x: '15%', y: '35%' }, { x: '25%', y: '20%' }, { x: '35%', y: '45%' },
    { x: '45%', y: '15%' }, { x: '55%', y: '50%' }, { x: '65%', y: '25%' },
    { x: '75%', y: '40%' }, { x: '85%', y: '20%' }, { x: '90%', y: '55%' },
    { x: '20%', y: '65%' }, { x: '30%', y: '75%' }, { x: '40%', y: '60%' },
    { x: '50%', y: '80%' }, { x: '60%', y: '70%' }, { x: '70%', y: '85%' },
    { x: '80%', y: '65%' }, { x: '10%', y: '75%' }, { x: '50%', y: '30%' }
  ];

  const scannableTargets = [
    { id: 1, title: 'Động Thiên Cung', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=300&q=80', tourId: 1, spotIdx: 0, type: 'scene', rating: '4.9/5★', distance: '1.2 km cách bạn', facts: ['Hệ thống hang động thạch nhũ kiến tạo hơn 20 triệu năm.', 'Được UNESCO công nhận là di sản thiên nhiên thế giới.', 'Diện tích tham quan ảo 360° đã quét: 5.400 m².'] },
    { id: 2, title: 'Hòn Trống Mái', image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=300&q=80', tourId: 1, spotIdx: 2, type: 'object', rating: 'Nhận dạng AI: 98.4%', distance: 'Kích thước: ~10m chiều cao', facts: ['Biểu tượng văn hóa nổi tiếng trên Vịnh Hạ Long.', 'Cặp khối đá hình hai con gà đối diện nhau giữa biển khơi.', 'Mô hình 3D AR đã được tối ưu hóa với 120,000 đa giác lưới.'] },
    { id: 3, title: 'Phố Cổ Hội An', image: 'https://images.unsplash.com/photo-1555921015-5532091f6026?auto=format&fit=crop&w=300&q=80', tourId: 2, spotIdx: 0, type: 'scene', rating: '4.8/5★', distance: '340 km cách bạn', facts: ['Thương cảng cổ sầm uất thế kỷ 15-19.', 'Lưu giữ hơn 1000 di tích kiến trúc cổ xưa.', 'Hệ thống Virtual Tour 360° chi tiết từng ngõ phố.'] },
    { id: 4, title: 'Đỉnh Fansipan', image: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=300&q=80', tourId: 4, spotIdx: 0, type: 'scene', rating: '4.7/5★', distance: '280 km cách bạn', facts: ['Nóc nhà Đông Dương với độ cao 3.143m.', 'Khu vực tâm linh linh thiêng hùng vĩ.', 'Hỗ trợ AR chỉ hướng đường leo núi.'] },
  ];

  const handleSelectQuickTarget = (target) => {
    if (isScanning) return;
    setScanMode(target.type);
    setIsScanning(true);
    setScanResult(null);
    setScanProgress(0);
    setScanStepText(`[AI] Định vị mục tiêu: ${target.title}...`);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setScanProgress(progress);
      if (progress === 40) setScanStepText('Đang dựng khung lưới LiDAR...');
      if (progress === 80) setScanStepText('Đồng bộ dữ liệu thời gian thực...');
      if (progress >= 100) {
        clearInterval(interval);
        setIsScanning(false);
        setScanProgress(100);
        setScanResult(target);
        setScanStepText(`Hoàn tất: Nhận diện ${target.title}`);
      }
    }, 200);
  };

  const cameraBgImage = scanMode === 'scene' 
    ? 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80'
    : 'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&w=800&q=80';

  return (
    <ScrollView
      style={[styles.tabContainer, { backgroundColor: isDarkMode ? '#000000' : theme.background }]}
      contentContainerStyle={{ paddingBottom: 90 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={localStyles.headerSection}>
        <Text style={[localStyles.titleText, { color: theme.textPrimary }]}>Trợ Lý Quét AR Thông Minh</Text>
        <Text style={[localStyles.subText, { color: theme.textSecondary }]}>Nhận dạng địa danh để vào Tour 360° hoặc tương tác vật thể 3D</Text>
      </View>

      {/* SCAN MODES SEGMENTED TABS */}
      <View style={[localStyles.arModeRow, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.04)', borderColor: theme.border }]}>
        <Pressable 
          style={[localStyles.arModeCell, scanMode === 'scene' && localStyles.arModeCellActive]}
          onPress={() => handleSelectMode('scene')}
        >
          <Compass size={14} color={scanMode === 'scene' ? '#fff' : theme.textSecondary} />
          <Text style={[localStyles.arModeCellText, { color: scanMode === 'scene' ? '#fff' : theme.textSecondary }]}>Địa danh</Text>
        </Pressable>

        <Pressable 
          style={[localStyles.arModeCell, scanMode === 'object' && localStyles.arModeCellActive]}
          onPress={() => handleSelectMode('object')}
        >
          <Box size={14} color={scanMode === 'object' ? '#fff' : theme.textSecondary} />
          <Text style={[localStyles.arModeCellText, { color: scanMode === 'object' ? '#fff' : theme.textSecondary }]}>Vật thể AI</Text>
        </Pressable>
      </View>

      {/* AR VIEWFINDER BOX */}
      <View style={[localStyles.viewfinderContainer, { borderColor: theme.border }]}>
        {/* Mock background placeholder - like camera image */}
        <Image
          source={{ uri: cameraBgImage }}
          blurRadius={isCameraTransitioning ? 15 : 0}
          style={[
            styles.viewfinderBg, 
            cameraFacing === 'front' && { transform: [{ scaleX: -1 }] }
          ]}
          resizeMode="cover"
        />
        
        {/* HUD grid lines */}
        <View style={styles.gridOverlay} />

        {/* L-shaped target brackets */}
        <View style={[styles.viewfinderCornerBracket, { top: 16, left: 16, borderLeftWidth: 3, borderTopWidth: 3, borderColor: '#3b82f6' }]} />
        <View style={[styles.viewfinderCornerBracket, { top: 16, right: 16, borderRightWidth: 3, borderTopWidth: 3, borderColor: '#3b82f6' }]} />
        <View style={[styles.viewfinderCornerBracket, { bottom: 16, left: 16, borderLeftWidth: 3, borderBottomWidth: 3, borderColor: '#3b82f6' }]} />
        <View style={[styles.viewfinderCornerBracket, { bottom: 16, right: 16, borderRightWidth: 3, borderBottomWidth: 3, borderColor: '#3b82f6' }]} />

        {/* COMPASS / RADAR SWEEP ANIMATION OVERLAY */}
        <View style={localStyles.radarOverlay} pointerEvents="none">
          <View style={localStyles.radarCircle} />
          <View style={localStyles.radarCircleInner} />
          <View style={[localStyles.radarSweep, { transform: [{ rotate: `${objectRotation}deg` }] }]} />
        </View>

        {/* POINTS CLOUD OVERLAY (Geo Scene Mode) */}
        {scanMode === 'scene' && (
          <View style={StyleSheet.absoluteFill}>
            {MOCK_POINTS_CLOUD.map((pt, idx) => {
              // Show point gradually based on progress
              const isPointVisible = !isScanning || (idx / MOCK_POINTS_CLOUD.length) < (scanProgress / 100);
              return (
                <View 
                  key={idx} 
                  style={[
                    styles.lidarMeshDot, 
                    { 
                      left: pt.x, 
                      top: pt.y, 
                      opacity: isPointVisible ? (isScanning ? 0.9 : 0.45) : 0,
                      backgroundColor: isScanning ? '#00f2fe' : '#3b82f6',
                    },
                    isScanning && { transform: [{ scale: 1.3 }] }
                  ]} 
                />
              );
            })}
          </View>
        )}

        {/* BOUNDING BOX (Object Recognition Mode) */}
        {scanMode === 'object' && (
          <View style={styles.objectBoundingBox}>
            <View style={styles.boundingBoxLabelContainer}>
              <Text style={styles.boundingBoxLabel}>[ Hòn Trống Mái | Khớp: 98.4% ]</Text>
            </View>
            <View style={styles.boundingBoxTarget} />
          </View>
        )}

        {/* Laser Scanning Line Animation */}
        {isScanning && (
          <View style={[styles.scannerLine, { top: `${scanProgress}%` }]} />
        )}

        {/* HUD UTILITIES OVERLAYS */}
        <View style={styles.hudTopLeftUtils}>
          <Pressable 
            style={[styles.hudUtilBtn, flashOn && { backgroundColor: '#facc15' }]} 
            onPress={handleToggleFlash}
          >
            <Zap size={14} color={flashOn ? '#000' : '#fff'} />
          </Pressable>

          <Pressable 
            style={styles.hudUtilBtn} 
            onPress={handleFlipCamera}
          >
            <RefreshCw size={14} color="#fff" />
          </Pressable>
        </View>

        <View style={styles.hudTopRight}>
          <Text style={styles.hudText}>{scanMode.toUpperCase()} ONLINE</Text>
          <View style={[styles.hudIndicator, flashOn && { backgroundColor: '#facc15' }]} />
        </View>

        <View style={styles.hudBottomLeft}>
          <Text style={styles.hudSubText}>GPS: {gpsCoords.lat.toFixed(6)} N, {gpsCoords.lng.toFixed(6)} E</Text>
          <Text style={styles.hudSubText}>ALT: 124m | TILT: {isScanning ? (12.5 + Math.sin(scanProgress)*3).toFixed(1) : 12.5}°</Text>
          <Text style={styles.hudSubText}>HEADING: 184° S | FPS: 60</Text>
        </View>

        {/* Central target reticle (when not scanning) */}
        <View style={styles.targetReticle}>
          <View style={[styles.reticleCircle, isScanning ? styles.reticleCircleActive : null]} />
          <Scan size={30} color={isScanning ? '#3b82f6' : '#fff'} style={styles.reticleScanIcon} />
        </View>

        {/* Sci-Fi Telemetry Log Console */}
        <View style={localStyles.terminalOverlay} pointerEvents="none">
          <Text style={localStyles.terminalLine}>
            {isScanning ? `[LIDAR] Scanning: ${scanProgress}% | ${scanStepText}` : `[SYS] Sensor status: OK | ${scanStepText}`}
          </Text>
          <Text style={localStyles.terminalLineSub}>
            [GPS] Lock: 3D High Accuracy | Accuracy: ±1.2m
          </Text>
        </View>

        {isScanning && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${scanProgress}%` }]} />
            </View>
          </View>
        )}
      </View>

      {/* ACTIONS */}
      <View style={[styles.cameraActionRow, { marginTop: 0, marginBottom: 24 }]}>
        <Pressable
          style={[styles.scanActionBtn, isScanning ? styles.scanActionBtnDisabled : null]}
          onPress={handleStartScan}
        >
          <LinearGradient
            colors={isScanning ? ['#4b5563', '#1f2937'] : ['#3b82f6', '#1d4ed8']}
            style={styles.scanBtnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Camera size={18} color="#fff" />
            <Text style={styles.scanBtnText}>
              {isScanning ? 'Đang phân tích cấu trúc...' : `Bắt đầu Quét ${scanMode === 'scene' ? 'Địa Danh' : 'Vật Thể AI'}`}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>

      {/* QUICK SCANNABLE TARGET DATABASE */}
      <View style={localStyles.quickScanHeader}>
        <Text style={[localStyles.quickScanTitle, { color: theme.textPrimary }]}>Danh mục di sản có sẵn</Text>
        <Text style={{ fontSize: 11, color: theme.textSecondary, marginTop: 2, fontWeight: '500' }}>
          Nhấp nhanh để mô phỏng quét định vị tự động di sản
        </Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={localStyles.targetsScroll}
      >
        {scannableTargets.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => handleSelectQuickTarget(item)}
            style={({ pressed }) => [
              localStyles.targetCard,
              { borderColor: theme.border, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.02)' },
              pressed && { transform: [{ scale: 0.95 }] }
            ]}
          >
            <Image source={{ uri: item.image }} style={localStyles.targetCardImage} />
            {/* Gradient overlay */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.85)']}
              style={StyleSheet.absoluteFillObject}
            />
            <Text style={localStyles.targetCardTitle}>{item.title}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* SCAN RESULTS DISPLAY */}
      {scanResult && (
        <View style={[styles.scanResultCard, { backgroundColor: theme.cardGlass, borderColor: '#3b82f6', marginHorizontal: 20 }]}>
          <LinearGradient
            colors={isDarkMode ? ['rgba(37, 99, 235, 0.15)', 'rgba(30, 41, 59, 0.7)'] : ['rgba(59, 130, 246, 0.05)', 'rgba(255, 255, 255, 0.95)']}
            style={styles.resultGrad}
          />
          <View style={styles.scanResultInner}>
            <View style={styles.resultHeader}>
              <Sparkles size={16} color="#facc15" />
              <Text style={styles.resultHeaderLabel}>PHÂN TÍCH THÀNH CÔNG</Text>
            </View>

            <Text style={[styles.resultTitle, { color: theme.textPrimary }]}>{scanResult.title}</Text>
            <Text style={[styles.resultDistance, { color: theme.textSecondary }]}>{scanResult.distance} | {scanResult.rating}</Text>

            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />

            <Text style={[styles.sectionFactTitle, { color: theme.textPrimary }]}>Chi tiết kết quả quét:</Text>
            {scanResult.facts.map((fact, idx) => (
              <View key={idx} style={styles.factItemRow}>
                <CircleCheck size={13} color="#10b981" style={{ marginTop: 2 }} />
                <Text style={[styles.factText, { color: theme.textSecondary }]}>{fact}</Text>
              </View>
            ))}

            {scanResult.type === 'scene' && (
              <Pressable 
                style={styles.enterVRBtn}
                onPress={() => onNavigateToTour && onNavigateToTour(scanResult.tourId, scanResult.spotIdx)}
              >
                <Text style={styles.enterVRText}>Vào Tham Quan 3D Virtual Tour</Text>
                <ChevronRight size={16} color="#fff" />
              </Pressable>
            )}

            {scanResult.type === 'object' && (
              <Pressable 
                style={styles.enterVRBtn}
                onPress={() => setShowObject3DModal(true)}
              >
                <Text style={styles.enterVRText}>Tương Tác Mô Hình 3D AR</Text>
                <ChevronRight size={16} color="#fff" />
              </Pressable>
            )}
          </View>
        </View>
      )}

      {/* ROTATING 3D MODEL MODAL */}
      <Modal
        visible={showObject3DModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowObject3DModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.ticketModalContainer, { backgroundColor: isDarkMode ? '#0c0a0f' : '#ffffff', borderColor: theme.border, borderWidth: 1, borderRadius: 28, padding: 20 }]}>
            
            {/* Modal Title */}
            <Text style={{ fontSize: 18, fontWeight: '900', color: theme.textPrimary, textAlign: 'center', marginBottom: 2 }}>
              {selectedModelId === 2 ? 'Hòn Trống Mái' : selectedModelId === 3 ? 'Chùa Một Cột' : 'Tháp Rùa'} (3D Simulator)
            </Text>
            <Text style={{ fontSize: 11, fontWeight: '600', color: theme.textSecondary, textAlign: 'center', marginBottom: 16 }}>
              Khám phá và tương tác mô hình di sản đa giác thời gian thực
            </Text>

            {/* MODEL SELECTOR TAB BAR */}
            <View style={{ flexDirection: 'row', backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.04)', borderRadius: 14, padding: 3, marginBottom: 16 }}>
              <Pressable
                onPress={() => setSelectedModelId(2)}
                style={{ flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 11, backgroundColor: selectedModelId === 2 ? '#3b82f6' : 'transparent' }}
              >
                <Text style={{ fontSize: 10.5, fontWeight: '800', color: selectedModelId === 2 ? '#fff' : theme.textSecondary }}>Trống Mái</Text>
              </Pressable>
              <Pressable
                onPress={() => setSelectedModelId(3)}
                style={{ flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 11, backgroundColor: selectedModelId === 3 ? '#3b82f6' : 'transparent' }}
              >
                <Text style={{ fontSize: 10.5, fontWeight: '800', color: selectedModelId === 3 ? '#fff' : theme.textSecondary }}>Một Cột</Text>
              </Pressable>
              <Pressable
                onPress={() => setSelectedModelId(4)}
                style={{ flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 11, backgroundColor: selectedModelId === 4 ? '#3b82f6' : 'transparent' }}
              >
                <Text style={{ fontSize: 10.5, fontWeight: '800', color: selectedModelId === 4 ? '#fff' : theme.textSecondary }}>Tháp Rùa</Text>
              </Pressable>
            </View>

            {/* Simulated 3D Renderer area */}
            <View style={{ height: 230, backgroundColor: isDarkMode ? '#060408' : '#f8fafc', borderRadius: 20, borderStyle: 'dashed', borderWidth: 1.5, borderColor: wireframeMode ? '#00f2fe' : '#3b82f6', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', marginBottom: 16 }}>
              
              {/* Circular rotation dial bg */}
              <View style={{ width: 180, height: 180, borderRadius: 90, borderWidth: 1.2, borderColor: wireframeMode ? 'rgba(0, 242, 254, 0.12)' : 'rgba(59, 130, 246, 0.12)', position: 'absolute' }} />
              <View style={{ width: 120, height: 120, borderRadius: 60, borderWidth: 1, borderColor: wireframeMode ? 'rgba(0, 242, 254, 0.08)' : 'rgba(59, 130, 246, 0.08)', position: 'absolute', borderStyle: 'dashed' }} />
              
              {/* Rotating Wireframe/Graphic Container */}
              <View style={{ transform: [{ rotate: `${objectRotation}deg` }], alignItems: 'center', justifyContent: 'center' }}>
                {selectedModelId === 2 && (
                  <View style={{ flexDirection: 'row', gap: 16, alignItems: 'flex-end' }}>
                    <View style={[
                      { width: 34, height: 86, borderTopLeftRadius: 10, borderTopRightRadius: 10, transform: [{ skewX: '-8deg' }] },
                      wireframeMode 
                        ? { borderWidth: 1.5, borderColor: '#00f2fe', backgroundColor: 'rgba(0,242,254,0.05)' }
                        : { backgroundColor: '#3b82f6', opacity: 0.85, shadowColor: '#3b82f6', shadowOpacity: 0.5, shadowRadius: 10, elevation: 4 }
                    ]} />
                    <View style={[
                      { width: 40, height: 96, borderTopLeftRadius: 12, borderTopRightRadius: 12, transform: [{ skewX: '8deg' }] },
                      wireframeMode
                        ? { borderWidth: 1.5, borderColor: '#00f2fe', backgroundColor: 'rgba(0,242,254,0.05)' }
                        : { backgroundColor: '#1d4ed8', opacity: 0.85, shadowColor: '#1d4ed8', shadowOpacity: 0.5, shadowRadius: 10, elevation: 4 }
                    ]} />
                  </View>
                )}

                {selectedModelId === 3 && (
                  <View style={{ alignItems: 'center' }}>
                    <View style={[
                      { width: 62, height: 42, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
                      wireframeMode
                        ? { borderWidth: 1.5, borderColor: '#a855f7', backgroundColor: 'rgba(168,85,247,0.05)' }
                        : { backgroundColor: '#a855f7', opacity: 0.85, shadowColor: '#a855f7', shadowOpacity: 0.5, shadowRadius: 10, elevation: 4 }
                    ]} />
                    <View style={[
                      { width: 14, height: 48, marginTop: -2 },
                      wireframeMode
                        ? { borderWidth: 1.5, borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.05)' }
                        : { backgroundColor: '#f59e0b', opacity: 0.9 }
                    ]} />
                  </View>
                )}

                {selectedModelId === 4 && (
                  <View style={{ alignItems: 'center' }}>
                    <View style={[
                      { width: 30, height: 22, borderRadius: 2 },
                      wireframeMode
                        ? { borderWidth: 1.2, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.05)' }
                        : { backgroundColor: '#10b981', opacity: 0.9 }
                    ]} />
                    <View style={[
                      { width: 50, height: 26, borderRadius: 3, marginTop: 2 },
                      wireframeMode
                        ? { borderWidth: 1.2, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.05)' }
                        : { backgroundColor: '#059669', opacity: 0.9 }
                    ]} />
                    <View style={[
                      { width: 72, height: 30, borderRadius: 4, marginTop: 2 },
                      wireframeMode
                        ? { borderWidth: 1.2, borderColor: '#047857', backgroundColor: 'rgba(4,120,87,0.05)' }
                        : { backgroundColor: '#064e3b', opacity: 0.9 }
                    ]} />
                  </View>
                )}

                {/* Horizontal ground/water indicator ring */}
                <View style={{ width: 130, height: 3, backgroundColor: wireframeMode ? '#00f2fe' : '#06b6d4', marginTop: 4, borderRadius: 2, opacity: 0.7 }} />
              </View>

              {/* Wireframe coordinates lock HUD overlays */}
              <View style={{ position: 'absolute', top: 12, left: 12 }}>
                <Text style={{ color: wireframeMode ? '#00f2fe' : '#3b82f6', fontSize: 8.5, fontWeight: '850', fontFamily: 'monospace' }}>
                  POLYS: {selectedModelId === 2 ? '120,000' : selectedModelId === 3 ? '185,000' : '240,000'}
                </Text>
                <Text style={{ color: wireframeMode ? '#00f2fe' : '#3b82f6', fontSize: 8.5, fontWeight: '850', fontFamily: 'monospace' }}>
                  VERTS: {selectedModelId === 2 ? '64,281' : selectedModelId === 3 ? '92,492' : '122,810'}
                </Text>
              </View>
              <View style={{ position: 'absolute', bottom: 12, right: 12 }}>
                <Text style={{ color: wireframeMode ? '#00f2fe' : '#3b82f6', fontSize: 8.5, fontWeight: '850', fontFamily: 'monospace' }}>ROT: {objectRotation.toFixed(0)}°</Text>
                <Text style={{ color: wireframeMode ? '#00f2fe' : '#3b82f6', fontSize: 8.5, fontWeight: '850', fontFamily: 'monospace' }}>SPEED: {rotationSpeed === 0 ? 'PAUSE' : `${rotationSpeed}X`}</Text>
              </View>
            </View>

            {/* INTERACTIVE CONTROLS BAR */}
            <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'space-between', marginBottom: 16 }}>
              <Pressable
                onPress={() => setWireframeMode(!wireframeMode)}
                style={{ flex: 1, height: 38, borderRadius: 12, borderHeight: 1, borderColor: wireframeMode ? '#00f2fe' : theme.border, borderWidth: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: wireframeMode ? 'rgba(0,242,254,0.08)' : 'transparent' }}
              >
                <Text style={{ fontSize: 11, fontWeight: '800', color: wireframeMode ? '#00f2fe' : theme.textPrimary }}>Lưới wireframe</Text>
              </Pressable>

              <Pressable
                onPress={() => setRotationSpeed(prev => prev === 1.5 ? 4 : prev === 4 ? 0 : 1.5)}
                style={{ flex: 1, height: 38, borderRadius: 12, borderWidth: 1, borderColor: theme.border, alignItems: 'center', justifyContent: 'center', backgroundColor: rotationSpeed === 0 ? 'rgba(239,68,68,0.08)' : 'transparent' }}
              >
                <Text style={{ fontSize: 11, fontWeight: '800', color: rotationSpeed === 0 ? '#ef4444' : theme.textPrimary }}>
                  Tốc độ: {rotationSpeed === 0 ? 'Dừng' : rotationSpeed === 1.5 ? 'Thường' : 'Nhanh'}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setIsNarrating(!isNarrating)}
                style={{ flex: 1, height: 38, borderRadius: 12, borderWidth: 1, borderColor: isNarrating ? '#10b981' : theme.border, alignItems: 'center', justifyContent: 'center', backgroundColor: isNarrating ? 'rgba(16,185,129,0.08)' : 'transparent' }}
              >
                <Text style={{ fontSize: 11, fontWeight: '800', color: isNarrating ? '#10b981' : theme.textPrimary }}>Thuyết minh 🔊</Text>
              </Pressable>
            </View>

            {/* Audio Voice Narration Box */}
            {isNarrating && (
              <View style={{ backgroundColor: 'rgba(16,185,129,0.08)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)', padding: 12, marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981' }} />
                  <Text style={{ fontSize: 10, fontWeight: '900', color: '#10b981' }}>GIỌNG THUYẾT MINH AI ĐANG PHÁT...</Text>
                </View>
                <Text style={{ fontSize: 11, fontWeight: '500', color: theme.textSecondary, lineHeight: 16 }}>
                  "{selectedModelId === 2 ? 'Hòn Trống Mái gồm hai đảo đá hình đôi gà cao chừng 10m đối diện nhau giữa biển khơi hoang sơ.' : selectedModelId === 3 ? 'Chùa Một Cột có cấu trúc mô phỏng bông sen nở giữa hồ nước từ kiến trúc Phật giáo thời Lý.' : 'Tháp Rùa cổ kính soi bóng ngàn năm giữa lòng Hồ Gươm, Hà Nội.'}"
                </Text>
              </View>
            )}

            {/* Technical details block */}
            <View style={{ gap: 6, marginBottom: 20 }}>
              <Text style={{ fontSize: 11.5, fontWeight: '700', color: theme.textPrimary }}>
                • Địa điểm: {selectedModelId === 2 ? 'Vịnh Hạ Long, Quảng Ninh' : selectedModelId === 3 ? 'Quận Ba Đình, Hà Nội' : 'Hồ Hoàn Kiếm, Hà Nội'}
              </Text>
              <Text style={{ fontSize: 11, fontWeight: '500', color: theme.textSecondary, lineHeight: 16 }}>
                • Chi tiết: Mô hình 3D AR đã được nén tối ưu hóa và phủ cấu trúc vật liệu bề mặt (texture) độ phân giải cao phục vụ tham quan ảo tương tác đa nền tảng.
              </Text>
            </View>

            {/* Close Button */}
            <Pressable 
              style={[styles.enterVRBtn, { marginTop: 0 }]}
              onPress={() => {
                setShowObject3DModal(false);
                setIsNarrating(false);
              }}
            >
              <Text style={styles.enterVRText}>Đóng Trình Xem 3D AR</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const localStyles = StyleSheet.create({
  headerSection: {
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 20,
  },
  titleText: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  subText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    lineHeight: 18,
  },
  arModeRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    height: 44,
    borderRadius: 22,
    padding: 4,
    borderWidth: 1,
    marginBottom: 20,
  },
  arModeCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 18,
  },
  arModeCellActive: {
    backgroundColor: '#3b82f6',
  },
  arModeCellText: {
    fontSize: 12,
    fontWeight: '800',
  },
  viewfinderContainer: {
    marginHorizontal: 20,
    height: 380,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    position: 'relative',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  radarOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 242, 254, 0.01)',
  },
  radarCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 242, 254, 0.12)',
    borderStyle: 'dashed',
    position: 'absolute',
  },
  radarCircleInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.22)',
    position: 'absolute',
  },
  radarSweep: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(0, 242, 254, 0.08)',
    borderTopLeftRadius: 100,
    position: 'absolute',
  },
  terminalOverlay: {
    position: 'absolute',
    bottom: 30,
    left: 16,
    right: 16,
    height: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.25)',
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  terminalLine: {
    fontSize: 9.5,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    color: '#00f2fe',
    lineHeight: 14,
    fontWeight: '800',
  },
  terminalLineSub: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    color: '#bef264',
    lineHeight: 13,
    fontWeight: '700',
  },
  quickScanHeader: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  quickScanTitle: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: -0.1,
  },
  targetsScroll: {
    paddingLeft: 20,
    paddingRight: 10,
    marginBottom: 24,
  },
  targetCard: {
    width: 110,
    height: 80,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    marginRight: 10,
    justifyContent: 'flex-end',
    padding: 10,
  },
  targetCardImage: {
    ...StyleSheet.absoluteFillObject,
  },
  targetCardTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  }
});

