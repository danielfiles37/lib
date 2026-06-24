import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Type, Image, Video, Music, Wand2, Clock, Sparkles, AtSign } from 'lucide-react';
import useProjectStore from '@/store/useProjectStore';

const typeIcons: Record<string, React.ReactNode> = {
  text: <Type className="w-5 h-5" />,
  image: <Image className="w-5 h-5" />,
  video: <Video className="w-5 h-5" />,
  audio: <Music className="w-5 h-5" />,
  transition: <Wand2 className="w-5 h-5" />,
};

export default function NodePropertiesPanel() {
  const { selectedNode, project, updateNodeData, setSelectedNode } = useProjectStore();
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [mentionTarget, setMentionTarget] = useState<'content' | 'prompt'>('content');

  if (!project) return null;

  const node = project.nodes.find((n) => n.id === selectedNode);

  if (!node) return null;

  const data = node.data as any;

  // 获取可引用的节点列表（包括连接的节点）
  const getMentionableNodes = () => {
    if (!project) return [];

    // 获取所有连接到当前节点的节点
    const connectedNodeIds = new Set<string>();
    project.edges.forEach(edge => {
      if (edge.target === selectedNode) {
        connectedNodeIds.add(edge.source);
      }
      if (edge.source === selectedNode) {
        connectedNodeIds.add(edge.target);
      }
    });

    return project.nodes
      .filter(n => n.id !== selectedNode) // 排除自己
      .filter(n => {
        if (!mentionFilter) return true;
        return n.data.label?.toLowerCase().includes(mentionFilter.toLowerCase());
      })
      .sort((a, b) => {
        // 连接的节点排在前面
        const aConnected = connectedNodeIds.has(a.id) ? 0 : 1;
        const bConnected = connectedNodeIds.has(b.id) ? 0 : 1;
        return aConnected - bConnected;
      });
  };

  // 处理@引用
  const handleMention = (nodeId: string, nodeLabel: string) => {
    const mentionText = `@[${nodeLabel}](${nodeId})`;
    const currentPrompt = data.prompt || data.content || '';

    // 同时更新 prompt 和 content
    updateNodeData(selectedNode, {
      prompt: currentPrompt + mentionText,
      content: currentPrompt + mentionText,
    });
    setShowMentionMenu(false);
    setMentionFilter('');
  };

  return (
    <AnimatePresence>
      {selectedNode && (
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          className="absolute left-4 top-20 bottom-4 w-80 z-40"
        >
          <div className="h-full bg-dark-800/95 backdrop-blur-xl rounded-2xl border border-dark-600/50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-dark-600/50 bg-gradient-to-r from-dark-800 to-dark-700">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary-600/20 text-primary-400">
                  {typeIcons[data.type]}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{data.label}</h3>
                  <span className="text-xs text-dark-400 capitalize">{data.type} 场景</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-2 hover:bg-dark-600 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-dark-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-72px)]">
              {/* 场景名称 */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-dark-300">场景名称</label>
                <input
                  type="text"
                  value={data.label}
                  onChange={(e) => updateNodeData(selectedNode, { label: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg
                    text-white text-sm focus:outline-none focus:border-primary-500"
                />
              </div>

              {/* AI 提示词（合并内容描述） */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-dark-300 flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-primary-400" />
                    AI 提示词
                  </label>
                  <button
                    onClick={() => {
                      setMentionTarget('prompt');
                      setShowMentionMenu(!showMentionMenu);
                    }}
                    className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
                  >
                    <AtSign className="w-3 h-3" />
                    添加引用
                  </button>
                </div>
                <textarea
                  value={data.prompt || data.content || ''}
                  onChange={(e) => {
                    // 同时更新 prompt 和 content
                    updateNodeData(selectedNode, {
                      prompt: e.target.value,
                      content: e.target.value
                    });
                  }}
                  rows={5}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg
                    text-white text-sm focus:outline-none focus:border-primary-500 resize-none"
                  placeholder="输入用于 AI 生成的提示词...&#10;&#10;例如：大殿门口一群人路过，电影感，自然光"
                />
                <div className="text-[10px] text-dark-500">
                  💡 提示词越详细，生成效果越好。可以包含风格、情绪、镜头等描述。
                </div>
              </div>

              {/* @引用菜单 */}
              {showMentionMenu && (
                <div className="bg-dark-700 border border-dark-600 rounded-lg overflow-hidden">
                  <div className="p-2 border-b border-dark-600">
                    <input
                      type="text"
                      value={mentionFilter}
                      onChange={(e) => setMentionFilter(e.target.value)}
                      placeholder="搜索节点..."
                      className="w-full px-2 py-1 bg-dark-600 border border-dark-500 rounded text-xs
                        text-white placeholder:text-dark-400 focus:outline-none focus:border-primary-500"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {getMentionableNodes().length > 0 ? (
                      <>
                        {/* 连接的节点 */}
                        {getMentionableNodes().filter(n =>
                          project.edges.some(e =>
                            (e.target === selectedNode && e.source === n.id) ||
                            (e.source === selectedNode && e.target === n.id)
                          )
                        ).length > 0 && (
                          <div className="px-3 py-1.5 text-[10px] text-primary-400 bg-primary-500/10 border-b border-dark-600">
                            🔗 已连接的节点
                          </div>
                        )}
                        {getMentionableNodes().map((n) => {
                          const isConnected = project.edges.some(e =>
                            (e.target === selectedNode && e.source === n.id) ||
                            (e.source === selectedNode && e.target === n.id)
                          );
                          return (
                            <button
                              key={n.id}
                              onClick={() => handleMention(n.id, n.data.label || '未命名')}
                              className={`w-full px-3 py-2 text-xs text-left transition-colors flex items-center gap-2
                                ${isConnected
                                  ? 'text-white hover:bg-primary-500/20 bg-primary-500/5'
                                  : 'text-dark-300 hover:bg-dark-600'
                                }`}
                            >
                              <span className={`font-bold ${isConnected ? 'text-primary-400' : 'text-dark-500'}`}>@</span>
                              <span className="truncate flex-1">{n.data.label || '未命名'}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                isConnected ? 'bg-primary-500/30 text-primary-300' : 'bg-dark-600 text-dark-500'
                              }`}>
                                {n.data.type}
                              </span>
                              {isConnected && (
                                <span className="text-[10px] text-primary-400">🔗</span>
                              )}
                            </button>
                          );
                        })}
                      </>
                    ) : (
                      <div className="px-3 py-3 text-xs text-dark-500 text-center">
                        暂无其他节点，请先添加场景
                      </div>
                    )}
                  </div>
                  <div className="p-2 border-t border-dark-600 flex justify-between items-center">
                    <span className="text-[10px] text-dark-500">
                      共 {getMentionableNodes().length} 个节点
                    </span>
                    <button
                      onClick={() => {
                        setShowMentionMenu(false);
                        setMentionFilter('');
                      }}
                      className="px-3 py-1 text-xs text-dark-400 hover:text-white transition-colors bg-dark-600 rounded"
                    >
                      关闭
                    </button>
                  </div>
                </div>
              )}

              {/* 时长设置 */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-dark-300 flex items-center gap-2">
                  <Clock className="w-3 h-3 text-primary-400" />
                  时长（秒）
                </label>
                <input
                  type="range"
                  min={1}
                  max={30}
                  value={data.duration}
                  onChange={(e) =>
                    updateNodeData(selectedNode, { duration: Number(e.target.value) })
                  }
                  className="w-full accent-primary-500"
                />
                <div className="flex justify-between text-xs text-dark-400">
                  <span>1秒</span>
                  <span className="text-primary-400 font-medium">{data.duration}秒</span>
                  <span>30秒</span>
                </div>
              </div>

              {/* 风格设置 */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-dark-300">风格</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'cinematic', label: '电影感' },
                    { id: 'anime', label: '动漫风' },
                    { id: 'realistic', label: '写实风' },
                    { id: 'artistic', label: '艺术风' },
                    { id: 'vintage', label: '复古风' },
                    { id: 'modern', label: '现代风' },
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() =>
                        updateNodeData(selectedNode, {
                          settings: { ...data.settings, style: style.id },
                        })
                      }
                      className={`
                        py-1.5 rounded-lg text-[10px] font-medium transition-colors
                        ${data.settings.style === style.id
                          ? 'bg-primary-600 text-white'
                          : 'bg-dark-700 text-dark-400 hover:bg-dark-600'
                        }
                      `}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 情绪 */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-dark-300">情绪</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'peaceful', label: '平和' },
                    { id: 'dramatic', label: '戏剧性' },
                    { id: 'mysterious', label: '神秘' },
                    { id: 'romantic', label: '浪漫' },
                    { id: 'exciting', label: '刺激' },
                    { id: 'melancholy', label: '忧郁' },
                  ].map((mood) => (
                    <button
                      key={mood.id}
                      onClick={() =>
                        updateNodeData(selectedNode, {
                          settings: { ...data.settings, mood: mood.id },
                        })
                      }
                      className={`
                        py-1.5 rounded-lg text-[10px] font-medium transition-colors
                        ${data.settings.mood === mood.id
                          ? 'bg-primary-600 text-white'
                          : 'bg-dark-700 text-dark-400 hover:bg-dark-600'
                        }
                      `}
                    >
                      {mood.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 镜头 */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-dark-300">镜头</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'wide shot', label: '远景' },
                    { id: 'medium shot', label: '中景' },
                    { id: 'close-up', label: '特写' },
                    { id: 'extreme close-up', label: '大特写' },
                    { id: 'over shoulder', label: '过肩镜头' },
                    { id: 'bird eye', label: '俯瞰' },
                  ].map((camera) => (
                    <button
                      key={camera.id}
                      onClick={() =>
                        updateNodeData(selectedNode, {
                          settings: { ...data.settings, camera: camera.id },
                        })
                      }
                      className={`
                        py-1.5 rounded-lg text-[10px] font-medium transition-colors
                        ${data.settings.camera === camera.id
                          ? 'bg-primary-600 text-white'
                          : 'bg-dark-700 text-dark-400 hover:bg-dark-600'
                        }
                      `}
                    >
                      {camera.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 光照 */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-dark-300">光照</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'natural light', label: '自然光' },
                    { id: 'dramatic lighting', label: '戏剧光' },
                    { id: 'soft light', label: '柔光' },
                    { id: 'backlight', label: '逆光' },
                    { id: 'neon light', label: '霓虹灯' },
                    { id: 'candlelight', label: '烛光' },
                  ].map((lighting) => (
                    <button
                      key={lighting.id}
                      onClick={() =>
                        updateNodeData(selectedNode, {
                          settings: { ...data.settings, lighting: lighting.id },
                        })
                      }
                      className={`
                        py-1.5 rounded-lg text-[10px] font-medium transition-colors
                        ${data.settings.lighting === lighting.id
                          ? 'bg-primary-600 text-white'
                          : 'bg-dark-700 text-dark-400 hover:bg-dark-600'
                        }
                      `}
                    >
                      {lighting.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
