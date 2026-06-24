import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Cpu,
  Key,
  Globe,
  Settings,
  TestTube,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Video,
  Image,
  Wand2,
  Eye,
  EyeOff,
  Copy,
  Check,
} from 'lucide-react';
import useProjectStore from '@/store/useProjectStore';
import { createAIService } from '@/services/aiService';
import type { AIModelConfig } from '@/types';

// 预设模型
const presetModels = {
  video: [
    { id: 'hongniao-seedance', name: '红鸟AI Seedance', provider: '红鸟AI', baseUrl: '/api/hongniaoai', description: '🔥 推荐 - 第三方接入' },
    { id: 'seedance-2.0', name: 'Seedance 2.0', provider: 'Seedance', baseUrl: '/api/seedance', description: 'Seedance 官方' },
    { id: 'seedream', name: 'Seedream', provider: 'Seedream', baseUrl: 'https://api.seedream.com', description: '创意视频生成' },
    { id: 'gemini-video', name: 'Gemini Video', provider: 'Google', baseUrl: 'https://generativelanguage.googleapis.com', description: 'Google 视频生成' },
    { id: 'runway-gen-3', name: 'Runway Gen-3', provider: 'Runway', baseUrl: 'https://api.runway.com', description: '专业级视频生成' },
    { id: 'kling', name: 'Kling', provider: 'Kuaishou', baseUrl: 'https://api.kling.com', description: '快手视频生成' },
    { id: 'pika-labs', name: 'Pika Labs', provider: 'Pika', baseUrl: 'https://api.pika.art', description: '快速视频生成' },
    { id: 'sora', name: 'Sora', provider: 'OpenAI', baseUrl: 'https://api.openai.com', description: 'OpenAI 视频生成' },
    { id: 'custom', name: '自定义模型', provider: 'Custom', baseUrl: '', description: '自定义 API 接口' },
  ],
  image: [
    { id: 'hongniao-seedance', name: '红鸟AI Seedance', provider: '红鸟AI', baseUrl: '/api/hongniaoai', description: '🔥 推荐 - 第三方接入' },
    { id: 'seedance-2.0', name: 'Seedance 2.0', provider: 'Seedance', baseUrl: '/api/seedance', description: 'Seedance 官方' },
    { id: 'seedream', name: 'Seedream', provider: 'Seedream', baseUrl: 'https://api.seedream.com', description: '创意图片生成' },
    { id: 'gemini-image', name: 'Gemini Image', provider: 'Google', baseUrl: 'https://generativelanguage.googleapis.com', description: 'Google 图片生成' },
    { id: 'imagen-3', name: 'Imagen 3', provider: 'Google', baseUrl: 'https://generativelanguage.googleapis.com', description: 'Google 最新图片模型' },
    { id: 'dall-e-3', name: 'DALL-E 3', provider: 'OpenAI', baseUrl: 'https://api.openai.com', description: 'OpenAI 图片生成' },
    { id: 'midjourney', name: 'Midjourney', provider: 'Midjourney', baseUrl: 'https://api.midjourney.com', description: '艺术风格图片' },
    { id: 'stable-diffusion', name: 'Stable Diffusion', provider: 'Stability', baseUrl: 'https://api.stability.ai', description: '开源图片生成' },
    { id: 'custom', name: '自定义模型', provider: 'Custom', baseUrl: '', description: '自定义 API 接口' },
  ],
};

type ModelCategory = 'video' | 'image';

export default function ModelConfigPanel() {
  const { showModelConfig, toggleModelConfig, project, updateProjectSettings } = useProjectStore();
  const [activeTab, setActiveTab] = useState<ModelCategory>('video');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!project) return null;

  // 获取当前多模型配置
  const multiModel = project.settings.multiModel || {
    textModel: {
      id: 'seedance-2.0',
      name: 'Seedance 2.0',
      provider: 'Seedance',
      apiKey: '',
      baseUrl: 'https://api.seedance.com/v1',
      modelId: 'seedance-2.0',
      parameters: { quality: 'high', style: 'cinematic' },
    },
    videoModel: {
      id: 'seedance-2.0',
      name: 'Seedance 2.0',
      provider: 'Seedance',
      apiKey: '',
      baseUrl: 'https://api.seedance.com/v1',
      modelId: 'seedance-2.0',
      parameters: { quality: 'high', style: 'cinematic' },
    },
    imageModel: {
      id: 'seedance-2.0',
      name: 'Seedance 2.0',
      provider: 'Seedance',
      apiKey: '',
      baseUrl: 'https://api.seedance.com/v1',
      modelId: 'seedance-2.0',
      parameters: { quality: 'high', style: 'cinematic' },
    },
  };

  // 获取当前活跃的模型配置
  const activeModel = activeTab === 'video' ? multiModel.videoModel : multiModel.imageModel;

  // 更新当前活跃的模型配置
  const updateActiveModel = (updates: Partial<AIModelConfig>) => {
    const newMultiModel = { ...multiModel };

    // 同时更新所有模型，确保配置一致
    if (activeTab === 'video') {
      newMultiModel.videoModel = { ...newMultiModel.videoModel, ...updates };
      newMultiModel.textModel = { ...newMultiModel.textModel, ...updates };
      // 也同步到 imageModel（使用相同的 API Key 和 baseUrl）
      newMultiModel.imageModel = { ...newMultiModel.imageModel, ...updates };
    } else {
      newMultiModel.imageModel = { ...newMultiModel.imageModel, ...updates };
      // 也同步到 videoModel 和 textModel
      newMultiModel.videoModel = { ...newMultiModel.videoModel, ...updates };
      newMultiModel.textModel = { ...newMultiModel.textModel, ...updates };
    }

    console.log('更新多模型配置（同步所有模型）:', {
      activeTab,
      updates,
      newMultiModel,
    });

    updateProjectSettings({ multiModel: newMultiModel });
  };

  // 选择预设模型
  const handleSelectPreset = (preset: { id: string; name: string; provider: string; baseUrl: string }) => {
    console.log('选择预设模型:', preset);
    updateActiveModel({
      id: preset.id,
      name: preset.name,
      provider: preset.provider,
      baseUrl: preset.baseUrl,
      modelId: preset.id,
    });
    setTestStatus('idle');
    setTestMessage('');
  };

  // 复制 API Key
  const handleCopyApiKey = async () => {
    try {
      await navigator.clipboard.writeText(activeModel.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  // 测试连接
  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('正在测试连接...');

    try {
      const aiService = createAIService(activeModel);
      const result = await aiService.testConnection();

      if (result.success) {
        setTestStatus('success');
        setTestMessage(result.message);
      } else {
        setTestStatus('error');
        setTestMessage(result.message);
      }
    } catch (error: any) {
      setTestStatus('error');
      setTestMessage(error.message || '连接测试失败');
    }
  };

  // 标签页配置
  const tabs = [
    { id: 'video' as ModelCategory, label: '视频生成', icon: <Video className="w-4 h-4" />, description: '文本生成视频' },
    { id: 'image' as ModelCategory, label: '图片生成', icon: <Image className="w-4 h-4" />, description: '文本生成图片 / 图生图' },
  ];

  return (
    <AnimatePresence>
      {showModelConfig && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          className="absolute right-0 top-0 bottom-0 w-96 z-50"
        >
          <div className="h-full bg-dark-800/95 backdrop-blur-xl border-l border-dark-600/50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-dark-600/50">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-primary-400" />
                AI 模型配置
              </h2>
              <button
                onClick={toggleModelConfig}
                className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-dark-400" />
              </button>
            </div>

            {/* 标签页 */}
            <div className="flex border-b border-dark-600/50">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setTestStatus('idle');
                    setTestMessage('');
                  }}
                  className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 text-sm font-medium transition-colors
                    ${activeTab === tab.id
                      ? 'text-primary-400 border-b-2 border-primary-400 bg-primary-400/5'
                      : 'text-dark-400 hover:text-dark-200'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    {tab.icon}
                    {tab.label}
                  </div>
                  <span className="text-[10px] opacity-70">{tab.description}</span>
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 p-4 space-y-5 overflow-y-auto">
              {/* 预设模型 */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-dark-200">选择模型</h3>
                <div className="grid grid-cols-2 gap-2">
                  {presetModels[activeTab].map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-3 rounded-lg text-left transition-all
                        ${activeModel.id === preset.id
                          ? 'bg-primary-600/20 border border-primary-500 text-white'
                          : 'bg-dark-700 border border-dark-600 text-dark-300 hover:border-dark-400'
                        }`}
                    >
                      <div className="text-sm font-medium">{preset.name}</div>
                      <div className="text-[10px] text-dark-400 mt-0.5">{preset.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* API Key */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-dark-200 flex items-center gap-2">
                  <Key className="w-4 h-4 text-primary-400" />
                  API Key
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={activeModel.apiKey}
                    onChange={(e) => updateActiveModel({ apiKey: e.target.value })}
                    placeholder="输入你的 API Key"
                    className="w-full px-3 py-2 pr-20 bg-dark-700 border border-dark-600 rounded-lg
                      text-white text-sm focus:outline-none focus:border-primary-500
                      placeholder:text-dark-500"
                  />
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {/* 查看/隐藏按钮 */}
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="p-1.5 text-dark-400 hover:text-white transition-colors"
                      title={showApiKey ? '隐藏 API Key' : '查看 API Key'}
                    >
                      {showApiKey ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    {/* 复制按钮 */}
                    <button
                      onClick={handleCopyApiKey}
                      disabled={!activeModel.apiKey}
                      className={`p-1.5 transition-colors ${
                        activeModel.apiKey
                          ? 'text-dark-400 hover:text-white'
                          : 'text-dark-600 cursor-not-allowed'
                      }`}
                      title="复制 API Key"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                {/* API Key 显示状态 */}
                {activeModel.apiKey && (
                  <div className="text-[10px] text-dark-500">
                    {showApiKey ? (
                      <span>完整 Key: {activeModel.apiKey}</span>
                    ) : (
                      <span>已输入 {activeModel.apiKey.length} 个字符</span>
                    )}
                  </div>
                )}
              </div>

              {/* Base URL */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-dark-200 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary-400" />
                  API 地址
                </label>
                <input
                  type="text"
                  value={activeModel.baseUrl}
                  onChange={(e) => updateActiveModel({ baseUrl: e.target.value })}
                  placeholder="https://api.example.com/v1"
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg
                    text-white text-sm focus:outline-none focus:border-primary-500
                    placeholder:text-dark-500"
                />
              </div>

              {/* Model ID */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-dark-200 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-primary-400" />
                  模型 ID
                </label>
                <input
                  type="text"
                  value={activeModel.modelId}
                  onChange={(e) => updateActiveModel({ modelId: e.target.value })}
                  placeholder="模型标识符"
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg
                    text-white text-sm focus:outline-none focus:border-primary-500
                    placeholder:text-dark-500"
                />
              </div>

              {/* 配置状态提示 */}
              {(!activeModel.apiKey || !activeModel.baseUrl) && (
                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-yellow-300">
                      <p className="font-medium mb-1">配置不完整</p>
                      <ul className="space-y-0.5 text-yellow-400/70">
                        {!activeModel.apiKey && <li>• 请输入 API Key</li>}
                        {!activeModel.baseUrl && <li>• 请设置 API 地址</li>}
                      </ul>
                      <p className="mt-2 text-yellow-400/50">
                        未配置时将使用演示模式
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 当前配置信息 */}
              {activeModel.apiKey && activeModel.baseUrl && (
                <div className="p-3 rounded-lg bg-dark-700/50 border border-dark-600">
                  <div className="text-xs text-dark-400 space-y-1">
                    <div className="flex justify-between">
                      <span>模型:</span>
                      <span className="text-dark-200">{activeModel.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>API 地址:</span>
                      <span className="text-dark-200 truncate ml-2" title={activeModel.baseUrl}>
                        {activeModel.baseUrl}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>API Key:</span>
                      <span className="text-dark-200">
                        {showApiKey ? activeModel.apiKey : `${activeModel.apiKey.substring(0, 8)}...`}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 测试连接 */}
              <div className="space-y-2">
                <button
                  onClick={handleTestConnection}
                  disabled={testStatus === 'testing' || !activeModel.apiKey}
                  className={`w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2
                    ${testStatus === 'testing'
                      ? 'bg-dark-700 text-dark-400 cursor-not-allowed'
                      : !activeModel.apiKey
                      ? 'bg-dark-700 text-dark-500 cursor-not-allowed'
                      : testStatus === 'success'
                      ? 'bg-green-600 text-white'
                      : testStatus === 'error'
                      ? 'bg-red-600 text-white'
                      : 'bg-dark-700 text-dark-200 hover:bg-dark-600'
                    }`}
                >
                  <TestTube className="w-4 h-4" />
                  {testStatus === 'testing'
                    ? '测试中...'
                    : testStatus === 'success'
                    ? '连接成功'
                    : testStatus === 'error'
                    ? '连接失败'
                    : !activeModel.apiKey
                    ? '请先输入 API Key'
                    : '测试连接'}
                </button>

                {/* 测试结果消息 */}
                {testMessage && testStatus !== 'idle' && (
                  <div className={`p-3 rounded-lg text-xs ${
                    testStatus === 'success'
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                      : testStatus === 'error'
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                      : 'bg-dark-700 text-dark-400'
                  }`}>
                    <div className="flex items-start gap-2">
                      {testStatus === 'success' && <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                      {testStatus === 'error' && <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                      <pre className="whitespace-pre-wrap font-sans">{testMessage}</pre>
                    </div>
                  </div>
                )}
              </div>

              {/* 保存配置按钮 */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    console.log('当前配置状态:', {
                      multiModel: project.settings.multiModel,
                      aiModel: project.settings.aiModel,
                    });
                    alert('配置已打印到控制台（F12）');
                  }}
                  className="flex-1 py-2 rounded-lg text-sm font-medium
                    bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-white
                    transition-colors"
                >
                  查看配置
                </button>
                <button
                  onClick={() => {
                    // 强制同步：将 videoModel 的配置同步到所有模型
                    const videoModel = project.settings.multiModel?.videoModel;
                    if (videoModel && videoModel.apiKey) {
                      const newMultiModel = {
                        videoModel: { ...videoModel },
                        textModel: { ...videoModel },
                        imageModel: { ...videoModel },
                      };
                      updateProjectSettings({ multiModel: newMultiModel });
                      console.log('已强制同步配置:', newMultiModel);
                      alert('配置已同步！所有模型现在使用相同的 API Key');
                    } else {
                      alert('请先配置 videoModel 的 API Key');
                    }
                  }}
                  className="flex-1 py-2 rounded-lg text-sm font-medium
                    bg-primary-600 hover:bg-primary-500 text-white
                    transition-colors"
                >
                  强制同步配置
                </button>
              </div>

              {/* 提示信息 */}
              <div className="p-3 rounded-lg bg-dark-700/30 border border-dark-600">
                <div className="flex items-start gap-2">
                  <Wand2 className="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-dark-400 leading-relaxed">
                    <p className="font-medium text-dark-300 mb-1">使用说明</p>
                    <ul className="space-y-1">
                      <li>• <span className="text-primary-400">视频生成</span>：输入文字描述，AI 生成视频</li>
                      <li>• <span className="text-primary-400">图片生成</span>：输入文字描述或上传原图，AI 生成图片</li>
                      <li>• 点击 <Eye className="w-3 h-3 inline" /> 可查看完整 API Key</li>
                      <li>• 点击 <Copy className="w-3 h-3 inline" /> 可复制 API Key</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
