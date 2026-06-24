import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Upload,
  Droplets,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Download,
  Image,
  Video,
} from 'lucide-react';

interface RemoveWatermarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceUrl?: string;
  sourceType?: 'image' | 'video';
}

export default function RemoveWatermarkModal({
  isOpen,
  onClose,
  sourceUrl,
  sourceType = 'image',
}: RemoveWatermarkModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(sourceUrl || '');
  const [resultUrl, setResultUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResultUrl('');
      setStatus('idle');

      // 创建预览 URL
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setResultUrl('');
      setStatus('idle');

      const url = URL.createObjectURL(droppedFile);
      setPreviewUrl(url);
    }
  };

  const handleRemoveWatermark = async () => {
    if (!previewUrl && !file) return;

    setIsProcessing(true);
    setStatus('processing');
    setProgress(0);
    setErrorMessage('');

    try {
      // 模拟去水印处理过程
      const steps = [
        { progress: 15, message: '正在分析图片...' },
        { progress: 35, message: '正在检测水印区域...' },
        { progress: 55, message: '正在生成修复内容...' },
        { progress: 75, message: '正在融合处理...' },
        { progress: 90, message: '正在优化细节...' },
        { progress: 100, message: '处理完成！' },
      ];

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 600));
        setProgress(step.progress);
      }

      // 模拟生成结果（使用原图作为示例）
      // 实际应用中这里会调用真正的去水印 API
      setResultUrl(previewUrl);
      setStatus('completed');
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.message || '处理失败');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (resultUrl) {
      const link = document.createElement('a');
      link.href = resultUrl;
      link.download = `removed-watermark-${Date.now()}.png`;
      link.click();
    }
  };

  const resetState = () => {
    setFile(null);
    setPreviewUrl(sourceUrl || '');
    setResultUrl('');
    setStatus('idle');
    setProgress(0);
    setErrorMessage('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center p-4"
        >
          {/* 背景遮罩 */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* 模态框 */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-3xl bg-dark-800 rounded-2xl border border-dark-600/50
              shadow-2xl overflow-hidden"
          >
            {/* 头部 */}
            <div className="flex items-center justify-between p-5 border-b border-dark-600/50
              bg-gradient-to-r from-cyan-600/10 to-blue-600/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500
                  flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">去除水印</h2>
                  <p className="text-xs text-dark-400">智能识别并去除图片/视频中的水印</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-dark-400" />
              </button>
            </div>

            {/* 内容 */}
            <div className="p-5 space-y-5">
              {/* 上传区域 */}
              {!previewUrl && (
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="border-2 border-dashed border-dark-600 rounded-2xl p-10
                    hover:border-primary-500/50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-dark-700 flex items-center justify-center">
                      <Upload className="w-8 h-8 text-dark-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-white font-medium">拖拽文件到此处或点击上传</p>
                      <p className="text-sm text-dark-400 mt-1">
                        支持 JPG、PNG、GIF、MP4、MOV 等格式
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 预览和结果 */}
              {previewUrl && (
                <div className="grid grid-cols-2 gap-4">
                  {/* 原图 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-dark-200">原始文件</label>
                      <button
                        onClick={resetState}
                        className="text-xs text-primary-400 hover:text-primary-300"
                      >
                        重新选择
                      </button>
                    </div>
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-dark-700 border border-dark-600">
                      {file?.type?.startsWith('video/') || sourceType === 'video' ? (
                        <video
                          src={previewUrl}
                          className="w-full h-full object-contain"
                          controls
                        />
                      ) : (
                        <img
                          src={previewUrl}
                          alt="原图"
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>
                  </div>

                  {/* 结果 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-dark-200">处理结果</label>
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-dark-700 border border-dark-600">
                      {status === 'completed' && resultUrl ? (
                        <>
                          {file?.type?.startsWith('video/') || sourceType === 'video' ? (
                            <video
                              src={resultUrl}
                              className="w-full h-full object-contain"
                              controls
                            />
                          ) : (
                            <img
                              src={resultUrl}
                              alt="结果"
                              className="w-full h-full object-contain"
                            />
                          )}
                        </>
                      ) : status === 'processing' ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                          <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
                          <div className="text-center">
                            <p className="text-sm text-white">处理中...</p>
                            <p className="text-xs text-dark-400 mt-1">{progress}%</p>
                          </div>
                          <div className="w-48 h-1.5 bg-dark-600 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      ) : status === 'error' ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                          <AlertCircle className="w-8 h-8 text-red-400" />
                          <p className="text-sm text-red-400">{errorMessage}</p>
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                          <Droplets className="w-8 h-8 text-dark-600" />
                          <p className="text-sm text-dark-500">等待处理</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 处理进度 */}
              {isProcessing && (
                <div className="bg-dark-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-3 text-sm text-dark-300">
                    <Loader2 className="w-4 h-4 animate-spin text-primary-400" />
                    <span>AI 正在智能去除水印，请稍候...</span>
                  </div>
                </div>
              )}

              {/* 完成提示 */}
              {status === 'completed' && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="text-sm text-green-400 font-medium">处理完成！</p>
                      <p className="text-xs text-green-400/70 mt-1">水印已成功去除</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 功能说明 */}
              <div className="bg-dark-700/30 rounded-xl p-4">
                <h4 className="text-sm font-medium text-dark-200 mb-2">功能说明</h4>
                <ul className="space-y-1 text-xs text-dark-400">
                  <li className="flex items-start gap-2">
                    <span className="text-primary-400 mt-0.5">•</span>
                    <span>智能检测图片和视频中的水印区域</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-400 mt-0.5">•</span>
                    <span>使用 AI 技术自动填充去除后的区域</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-400 mt-0.5">•</span>
                    <span>支持批量处理和高分辨率输出</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-400 mt-0.5">•</span>
                    <span>处理完成后可直接下载结果</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 底部按钮 */}
            <div className="p-5 border-t border-dark-600/50 flex justify-between items-center">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-dark-300 hover:text-white
                  hover:bg-dark-700 transition-colors"
              >
                关闭
              </button>
              <div className="flex gap-3">
                {status === 'completed' && resultUrl && (
                  <button
                    onClick={handleDownload}
                    className="px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-500
                      text-white font-medium transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    下载结果
                  </button>
                )}
                <button
                  onClick={handleRemoveWatermark}
                  disabled={!previewUrl || isProcessing}
                  className={`
                    px-6 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2
                    ${previewUrl && !isProcessing
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                      : 'bg-dark-700 text-dark-500 cursor-not-allowed'
                    }
                  `}
                >
                  <Droplets className="w-4 h-4" />
                  {isProcessing ? '处理中...' : '开始去水印'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
