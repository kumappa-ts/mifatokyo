import React, { useState, useCallback, useEffect, useRef } from 'react';
import { encode as encodeAvif } from '@jsquash/avif';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 10; // 10枚まで

export default function ImageConverter() {
  const [files, setFiles] = useState([]);
  const [targetFormat, setTargetFormat] = useState('webp');
  const [quality, setQuality] = useState(0.75);
  const [convertedImages, setConvertedImages] = useState([]);
  const [isConverting, setIsConverting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const canvasRef = useRef(null);

  // リサイズオプション
  const [resizeOptions, setResizeOptions] = useState({
    mode: 'none',
    width: 800,
    height: 600,
    percent: 100,
    maintainAspect: true,
  });

  // フィルターオプション
  const [filterOptions, setFilterOptions] = useState({
    grayscale: 0,
    sepia: 0,
    brightness: 100,
    contrast: 100,
    blur: 0,
    saturate: 100,
  });

  // 変形オプション
  const [transformOptions, setTransformOptions] = useState({
    rotation: 0,
    flipHorizontal: false,
    flipVertical: false,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const allFiles = Array.from(e.dataTransfer.files);
    const validFiles = allFiles.filter(file =>
      file.type.startsWith('image/') && file.size <= MAX_FILE_SIZE
    ).slice(0, MAX_FILES);

    if (validFiles.length === 0 && allFiles.length > 0) {
      alert('10MB以下の画像ファイルを選択してください');
      return;
    }

    if (allFiles.length > MAX_FILES) {
      alert(`最大${MAX_FILES}枚まで選択できます。最初の${MAX_FILES}枚のみ処理します。`);
    }

    setFiles(validFiles);
    if (validFiles.length > 0) {
      loadPreviewImage(validFiles[0]);
    }
  }, []);

  const handleFileInput = (e) => {
    if (e.target.files) {
      const allFiles = Array.from(e.target.files);
      const validFiles = allFiles.filter(file =>
        file.type.startsWith('image/') && file.size <= MAX_FILE_SIZE
      ).slice(0, MAX_FILES);

      if (validFiles.length === 0 && allFiles.length > 0) {
        alert('10MB以下の画像ファイルを選択してください');
        return;
      }

      if (allFiles.length > MAX_FILES) {
        alert(`最大${MAX_FILES}枚まで選択できます。最初の${MAX_FILES}枚のみ処理します。`);
      }

      setFiles(validFiles);
      if (validFiles.length > 0) {
        loadPreviewImage(validFiles[0]);
      }
    }
  };

  const loadPreviewImage = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setPreviewImage(img);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  // プレビューを更新
  useEffect(() => {
    if (!previewImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = calculateDimensions(previewImage.width, previewImage.height);

    // 回転を考慮したキャンバスサイズ
    if (transformOptions.rotation === 90 || transformOptions.rotation === 270) {
      canvas.width = height;
      canvas.height = width;
    } else {
      canvas.width = width;
      canvas.height = height;
    }

    // 変形の適用
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((transformOptions.rotation * Math.PI) / 180);
    ctx.scale(
      transformOptions.flipHorizontal ? -1 : 1,
      transformOptions.flipVertical ? -1 : 1
    );

    // フィルターの適用
    applyFilters(ctx);

    // 画像を描画
    if (transformOptions.rotation === 90 || transformOptions.rotation === 270) {
      ctx.drawImage(previewImage, -height / 2, -width / 2, height, width);
    } else {
      ctx.drawImage(previewImage, -width / 2, -height / 2, width, height);
    }

    ctx.restore();
  }, [previewImage, resizeOptions, filterOptions, transformOptions]);

  const applyFilters = (ctx) => {
    const filters = [];

    if (filterOptions.grayscale > 0) {
      filters.push(`grayscale(${filterOptions.grayscale}%)`);
    }
    if (filterOptions.sepia > 0) {
      filters.push(`sepia(${filterOptions.sepia}%)`);
    }
    if (filterOptions.brightness !== 100) {
      filters.push(`brightness(${filterOptions.brightness}%)`);
    }
    if (filterOptions.contrast !== 100) {
      filters.push(`contrast(${filterOptions.contrast}%)`);
    }
    if (filterOptions.blur > 0) {
      filters.push(`blur(${filterOptions.blur}px)`);
    }
    if (filterOptions.saturate !== 100) {
      filters.push(`saturate(${filterOptions.saturate}%)`);
    }

    ctx.filter = filters.length > 0 ? filters.join(' ') : 'none';
  };

  const calculateDimensions = (originalWidth, originalHeight) => {
    if (resizeOptions.mode === 'none') {
      return { width: originalWidth, height: originalHeight };
    }

    if (resizeOptions.mode === 'percent') {
      const scale = resizeOptions.percent / 100;
      return {
        width: Math.round(originalWidth * scale),
        height: Math.round(originalHeight * scale),
      };
    }

    // pixel mode
    if (resizeOptions.maintainAspect) {
      const aspectRatio = originalWidth / originalHeight;
      if (resizeOptions.width && !resizeOptions.height) {
        return {
          width: resizeOptions.width,
          height: Math.round(resizeOptions.width / aspectRatio),
        };
      }
      if (resizeOptions.height && !resizeOptions.width) {
        return {
          width: Math.round(resizeOptions.height * aspectRatio),
          height: resizeOptions.height,
        };
      }
    }

    return {
      width: resizeOptions.width || originalWidth,
      height: resizeOptions.height || originalHeight,
    };
  };

  const convertImage = async (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result;
      };

      img.onload = async () => {
        const { width, height } = calculateDimensions(img.width, img.height);

        const canvas = document.createElement('canvas');

        // 回転を考慮したキャンバスサイズ
        if (transformOptions.rotation === 90 || transformOptions.rotation === 270) {
          canvas.width = height;
          canvas.height = width;
        } else {
          canvas.width = width;
          canvas.height = height;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // 変形の適用
        ctx.save();

        // 回転の中心を設定
        ctx.translate(canvas.width / 2, canvas.height / 2);

        // 回転
        ctx.rotate((transformOptions.rotation * Math.PI) / 180);

        // 反転
        ctx.scale(
          transformOptions.flipHorizontal ? -1 : 1,
          transformOptions.flipVertical ? -1 : 1
        );

        // フィルターの適用
        applyFilters(ctx);

        // 画像を描画
        if (transformOptions.rotation === 90 || transformOptions.rotation === 270) {
          ctx.drawImage(img, -height / 2, -width / 2, height, width);
        } else {
          ctx.drawImage(img, -width / 2, -height / 2, width, height);
        }

        ctx.restore();

        const originalName = file.name.replace(/\.[^/.]+$/, '');
        const newFileName = `${originalName}.${targetFormat === 'jpeg' ? 'jpg' : targetFormat}`;

        try {
          if (targetFormat === 'avif') {
            // AVIFの場合は@jsquash/avifを使用
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const avifData = await encodeAvif(imageData, { quality: quality * 100 });
            const blob = new Blob([avifData], { type: 'image/avif' });
            const convertedFile = new File([blob], newFileName, { type: 'image/avif' });

            resolve({
              file: convertedFile,
              url: URL.createObjectURL(blob),
              originalName: file.name,
              originalSize: file.size,
              convertedSize: blob.size,
              format: targetFormat,
              dimensions: `${canvas.width} × ${canvas.height}`,
            });
          } else {
            // その他のフォーマットはCanvas APIを使用
            const mimeType = `image/${targetFormat}`;

            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error('Conversion failed'));
                  return;
                }

                const convertedFile = new File([blob], newFileName, { type: mimeType });

                resolve({
                  file: convertedFile,
                  url: URL.createObjectURL(blob),
                  originalName: file.name,
                  originalSize: file.size,
                  convertedSize: blob.size,
                  format: targetFormat,
                  dimensions: `${canvas.width} × ${canvas.height}`,
                });
              },
              mimeType,
              quality
            );
          }
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      reader.readAsDataURL(file);
    });
  };

  const handleConvert = async () => {
    if (files.length === 0) return;

    setIsConverting(true);
    try {
      const results = await Promise.all(files.map(convertImage));
      setConvertedImages(results);
    } catch (error) {
      console.error('Conversion error:', error);
      alert('画像の変換中にエラーが発生しました');
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = (image) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = image.file.name;
    link.click();
  };

  const handleDownloadAll = () => {
    convertedImages.forEach((image, index) => {
      setTimeout(() => handleDownload(image), index * 100);
    });
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const calculateReduction = (original, converted) => {
    const reduction = ((original - converted) / original) * 100;
    return reduction > 0 ? `${reduction.toFixed(1)}% 削減` : `${Math.abs(reduction).toFixed(1)}% 増加`;
  };

  const resetOptions = () => {
    setResizeOptions({
      mode: 'none',
      width: 800,
      height: 600,
      percent: 100,
      maintainAspect: true,
    });
    setFilterOptions({
      grayscale: 0,
      sepia: 0,
      brightness: 100,
      contrast: 100,
      blur: 0,
      saturate: 100,
    });
    setTransformOptions({
      rotation: 0,
      flipHorizontal: false,
      flipVertical: false,
    });
    setQuality(0.75);
  };

  return (
    <div className="bg-gray-50 py-8 px-4">
      <div className="mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">画像変換ツール</h1>
          <p className="text-gray-600">
            画像の形式変換、リサイズ、フィルター適用、回転・反転が可能です。ファイル名はそのまま、拡張子のみ変更されます。
          </p>
          <p className="text-lg text-gray-500 mt-2">
            ※ 1ファイル10MB以下、最大10枚まで処理できます
          </p>
        </header>

        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
            }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-input"
            className="hidden"
            multiple
            accept="image/*"
            onChange={handleFileInput}
          />
          <label htmlFor="file-input" className="cursor-pointer">
            <div className="text-gray-500">
              <svg
                className="mx-auto h-12 w-12 mb-4"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="text-lg mb-2">画像をドラッグ&ドロップ</p>
              <p className="text-lg">または クリックして選択</p>
            </div>
          </label>
        </div>

        {files.length > 0 && (
          <div className="mt-6 bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">選択されたファイル ({files.length})</h2>
            <div className="space-y-2 mb-6">
              {files.map((file, index) => (
                <div key={index} className="flex justify-between items-center text-lg py-2 border-b">
                  <span className="text-gray-700">{file.name}</span>
                  <span className="text-gray-500">{formatBytes(file.size)}</span>
                </div>
              ))}
            </div>

            {/* プレビューと設定エリア */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* プレビューエリア */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  プレビュー {files.length > 1 && '(最初のファイル)'}
                </h3>
                <div className="border rounded-lg p-4 bg-gray-50 flex items-center justify-center min-h-[300px]">
                  {previewImage ? (
                    <canvas
                      ref={canvasRef}
                      className="max-w-full max-h-[500px] h-auto border bg-white shadow-sm"
                    />
                  ) : (
                    <p className="text-gray-400">読み込み中...</p>
                  )}
                </div>
              </div>

              {/* 設定エリア */}
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    変換先フォーマット
                  </label>
                  <div className="flex gap-4 flex-wrap">
                    {['png', 'jpeg', 'webp', 'avif'].map((format) => (
                      <label key={format} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="format"
                          value={format}
                          checked={targetFormat === format}
                          onChange={(e) => setTargetFormat(e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-lg uppercase">{format}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {targetFormat !== 'png' && (
                  <div>
                    <label className="block text-lg font-medium text-gray-700 mb-2">
                      品質: {Math.round(quality * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={quality}
                      onChange={(e) => setQuality(parseFloat(e.target.value))}
                      className="w-full"
                    />
                    {targetFormat === 'avif' && (
                      <p className="text-lg text-gray-500 mt-1">
                        推奨: 70-80%（高品質で圧縮率も良好）
                      </p>
                    )}
                  </div>
                )}

                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-blue-600 hover:text-blue-700 text-lg font-medium flex items-center gap-2"
                >
                  {showAdvanced ? '詳細設定を閉じる' : '詳細設定を開く'}
                  <svg
                    className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showAdvanced && (
                  <div className="space-y-6 border-t pt-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">リサイズ</h3>
                      <div className="space-y-3">
                        <div className="flex gap-4 flex-wrap">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name="resize-mode"
                              checked={resizeOptions.mode === 'none'}
                              onChange={() => setResizeOptions({ ...resizeOptions, mode: 'none' })}
                              className="mr-2"
                            />
                            <span className="text-lg">リサイズしない</span>
                          </label>
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name="resize-mode"
                              checked={resizeOptions.mode === 'percent'}
                              onChange={() => setResizeOptions({ ...resizeOptions, mode: 'percent' })}
                              className="mr-2"
                            />
                            <span className="text-lg">パーセント指定</span>
                          </label>
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name="resize-mode"
                              checked={resizeOptions.mode === 'pixel'}
                              onChange={() => setResizeOptions({ ...resizeOptions, mode: 'pixel' })}
                              className="mr-2"
                            />
                            <span className="text-lg">ピクセル指定</span>
                          </label>
                        </div>

                        {resizeOptions.mode === 'percent' && (
                          <div>
                            <label className="block text-lg text-gray-700 mb-1">
                              サイズ: {resizeOptions.percent}%
                            </label>
                            <input
                              type="range"
                              min="10"
                              max="200"
                              step="10"
                              value={resizeOptions.percent}
                              onChange={(e) => setResizeOptions({ ...resizeOptions, percent: parseInt(e.target.value) })}
                              className="w-full"
                            />
                          </div>
                        )}

                        {resizeOptions.mode === 'pixel' && (
                          <div className="space-y-2">
                            <label className="flex items-center text-lg">
                              <input
                                type="checkbox"
                                checked={resizeOptions.maintainAspect}
                                onChange={(e) => setResizeOptions({ ...resizeOptions, maintainAspect: e.target.checked })}
                                className="mr-2"
                              />
                              アスペクト比を維持
                            </label>
                            <div className="flex gap-4">
                              <div className="flex-1">
                                <label className="block text-lg text-gray-700 mb-1">幅 (px)</label>
                                <input
                                  type="number"
                                  value={resizeOptions.width}
                                  onChange={(e) => setResizeOptions({ ...resizeOptions, width: parseInt(e.target.value) || 0 })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded"
                                  min="1"
                                />
                              </div>
                              <div className="flex-1">
                                <label className="block text-lg text-gray-700 mb-1">高さ (px)</label>
                                <input
                                  type="number"
                                  value={resizeOptions.height}
                                  onChange={(e) => setResizeOptions({ ...resizeOptions, height: parseInt(e.target.value) || 0 })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded"
                                  min="1"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">回転・反転</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-lg text-gray-700 mb-2">回転: {transformOptions.rotation}°</label>
                          <div className="flex gap-2">
                            {[0, 90, 180, 270].map((deg) => (
                              <button
                                key={deg}
                                onClick={() => setTransformOptions({ ...transformOptions, rotation: deg })}
                                className={`px-4 py-2 rounded border ${transformOptions.rotation === deg
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                  }`}
                              >
                                {deg}°
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={transformOptions.flipHorizontal}
                              onChange={(e) => setTransformOptions({ ...transformOptions, flipHorizontal: e.target.checked })}
                              className="mr-2"
                            />
                            <span className="text-lg">水平反転</span>
                          </label>
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={transformOptions.flipVertical}
                              onChange={(e) => setTransformOptions({ ...transformOptions, flipVertical: e.target.checked })}
                              className="mr-2"
                            />
                            <span className="text-lg">垂直反転</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">フィルター</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-lg text-gray-700 mb-1">
                            グレースケール: {filterOptions.grayscale}%
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={filterOptions.grayscale}
                            onChange={(e) => setFilterOptions({ ...filterOptions, grayscale: parseInt(e.target.value) })}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-lg text-gray-700 mb-1">
                            セピア: {filterOptions.sepia}%
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={filterOptions.sepia}
                            onChange={(e) => setFilterOptions({ ...filterOptions, sepia: parseInt(e.target.value) })}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-lg text-gray-700 mb-1">
                            明度: {filterOptions.brightness}%
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="200"
                            value={filterOptions.brightness}
                            onChange={(e) => setFilterOptions({ ...filterOptions, brightness: parseInt(e.target.value) })}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-lg text-gray-700 mb-1">
                            コントラスト: {filterOptions.contrast}%
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="200"
                            value={filterOptions.contrast}
                            onChange={(e) => setFilterOptions({ ...filterOptions, contrast: parseInt(e.target.value) })}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-lg text-gray-700 mb-1">
                            彩度: {filterOptions.saturate}%
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="200"
                            value={filterOptions.saturate}
                            onChange={(e) => setFilterOptions({ ...filterOptions, saturate: parseInt(e.target.value) })}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-lg text-gray-700 mb-1">
                            ぼかし: {filterOptions.blur}px
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="20"
                            value={filterOptions.blur}
                            onChange={(e) => setFilterOptions({ ...filterOptions, blur: parseInt(e.target.value) })}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={resetOptions}
                      className="text-lg text-gray-600 hover:text-gray-800 underline"
                    >
                      設定をリセット
                    </button>
                  </div>
                )}

                <button
                  onClick={handleConvert}
                  disabled={isConverting}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isConverting ? '変換中...' : '変換する'}
                </button>
              </div>
            </div>
          </div>
        )}

        {convertedImages.length > 0 && (
          <div className="mt-6 bg-white rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">変換完了 ({convertedImages.length})</h2>
              {convertedImages.length > 1 && (
                <button
                  onClick={handleDownloadAll}
                  className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors text-lg font-medium"
                >
                  すべてダウンロード
                </button>
              )}
            </div>

            <div className="space-y-4">
              {convertedImages.map((image, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{image.file.name}</p>
                      <p className="text-lg text-gray-500 mt-1">
                        元: {image.originalName} ({formatBytes(image.originalSize)})
                      </p>
                      <p className="text-lg text-gray-500">
                        変換後: {image.dimensions} • {formatBytes(image.convertedSize)} ({calculateReduction(image.originalSize, image.convertedSize)})
                      </p>
                    </div>
                    <img
                      src={image.url}
                      alt={image.file.name}
                      className="w-24 h-24 object-cover rounded ml-4 border"
                    />
                  </div>
                  <button
                    onClick={() => handleDownload(image)}
                    className="w-full mt-3 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                  >
                    ダウンロード
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}