import React, { useState, useMemo } from 'react';
import { Search, Check, Sliders, Palette, Type, Sparkles, RotateCcw } from 'lucide-react';
import { useVideoStore } from '../store/useVideoStore';
import { SubtitlePreset } from '../types';
import templatesData from '../data/templates.json';
import { formatCasing } from '../utils/styleHelper';

const CATEGORIES = ["All", "Viral Shorts", "Neon & Gaming", "Documentary & Clean", "Karaoke Sweep"];

export const TemplateSelector: React.FC = () => {
  const {
    activeTemplateId,
    setActiveTemplate,
    customStyleOverrides,
    updateCustomStyle,
    resetCustomStyle
  } = useVideoStore();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showTweaks, setShowTweaks] = useState(false);

  const presets = templatesData as SubtitlePreset[];

  // Filtered preset cards
  const filteredPresets = useMemo(() => {
    return presets.filter(p => {
      const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.fontFamily.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [presets, selectedCategory, searchQuery]);

  // Active preset object with overrides
  const activePreset = useMemo(() => {
    const found = presets.find(p => p.id === activeTemplateId) || presets[0];
    return { ...found, ...customStyleOverrides };
  }, [presets, activeTemplateId, customStyleOverrides]);

  return (
    <div className="flex flex-col h-full bg-zinc-950/60 select-none">
      {/* Search & Category Tabs */}
      <div className="p-3 border-b border-zinc-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
              100+ Subtitle Presets
            </h3>
          </div>
          <button
            onClick={() => setShowTweaks(!showTweaks)}
            className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors ${
              showTweaks ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            <Sliders className="w-3 h-3" />
            <span>Tweak Style</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search 100+ styles (e.g. MrBeast, Cyberpunk, Vox)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/90 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-0.5 no-scrollbar">
          {CATEGORIES.map(cat => {
            const count = cat === "All" ? presets.length : presets.filter(p => p.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800/80'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Style Customization Drawer (if toggled) */}
      {showTweaks && (
        <div className="p-3 bg-zinc-900/95 border-b border-zinc-800 space-y-3 animate-fade text-xs">
          <div className="flex items-center justify-between text-zinc-300 font-semibold border-b border-zinc-800/80 pb-1.5">
            <span>Custom Adjustments: {activePreset.name}</span>
            <button
              onClick={resetCustomStyle}
              className="text-[10px] text-zinc-400 hover:text-indigo-400 flex items-center space-x-1"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Reset</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Primary & Highlight Color */}
            <div>
              <label className="text-[10px] text-zinc-400 block mb-1">Primary Color</label>
              <div className="flex items-center space-x-2 bg-zinc-950 p-1 rounded border border-zinc-800">
                <input
                  type="color"
                  value={activePreset.primaryColor}
                  onChange={(e) => updateCustomStyle({ primaryColor: e.target.value })}
                  className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="font-mono text-[10px] text-zinc-300">{activePreset.primaryColor}</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-zinc-400 block mb-1">Highlight Color</label>
              <div className="flex items-center space-x-2 bg-zinc-950 p-1 rounded border border-zinc-800">
                <input
                  type="color"
                  value={activePreset.highlightColor}
                  onChange={(e) => updateCustomStyle({ highlightColor: e.target.value })}
                  className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="font-mono text-[10px] text-zinc-300">{activePreset.highlightColor}</span>
              </div>
            </div>

            {/* Font Size */}
            <div>
              <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                <span>Font Size</span>
                <span>{activePreset.fontSize}px</span>
              </div>
              <input
                type="range"
                min="24"
                max="72"
                value={activePreset.fontSize}
                onChange={(e) => updateCustomStyle({ fontSize: parseInt(e.target.value) })}
                className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Outline Stroke */}
            <div>
              <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                <span>Outline Width</span>
                <span>{activePreset.outlineWidth}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                step="0.5"
                value={activePreset.outlineWidth}
                onChange={(e) => updateCustomStyle({ outlineWidth: parseFloat(e.target.value) })}
                className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Position */}
            <div>
              <label className="text-[10px] text-zinc-400 block mb-1">Position</label>
              <select
                value={activePreset.position}
                onChange={(e) => updateCustomStyle({ position: e.target.value as any })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded p-1 text-[11px] text-zinc-200"
              >
                <option value="bottom-center">Bottom Center (Standard)</option>
                <option value="middle-center">Middle Center (Punch)</option>
                <option value="top-center">Top Center</option>
              </select>
            </div>

            {/* Casing */}
            <div>
              <label className="text-[10px] text-zinc-400 block mb-1">Text Casing</label>
              <select
                value={activePreset.textCasing}
                onChange={(e) => updateCustomStyle({ textCasing: e.target.value as any })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded p-1 text-[11px] text-zinc-200"
              >
                <option value="UPPERCASE">UPPERCASE</option>
                <option value="Title Case">Title Case</option>
                <option value="Default">Default</option>
                <option value="lowercase">lowercase</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Preset Card Gallery Grid */}
      <div className="flex-1 overflow-y-auto p-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {filteredPresets.map((preset) => {
          const isSelected = preset.id === activeTemplateId;

          const outlineCss = preset.outlineWidth > 0
            ? `${Math.max(1, preset.outlineWidth * 0.7)}px ${preset.outlineColor}`
            : 'none';

          const shadowCss = preset.shadowDepth > 0
            ? `0px ${preset.shadowDepth}px ${preset.shadowDepth * 1.5}px ${preset.shadowColor}`
            : 'none';

          return (
            <div
              key={preset.id}
              onClick={() => setActiveTemplate(preset.id)}
              className={`relative flex flex-col justify-between p-3 rounded-xl border transition-all duration-150 cursor-pointer text-left ${
                isSelected
                  ? 'bg-zinc-900 border-indigo-500 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500'
                  : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900'
              }`}
            >
              {/* Selected Badge */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                  <Check className="w-2.5 h-2.5" />
                </div>
              )}

              {/* Title & Category */}
              <div className="mb-2">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">
                  {preset.category}
                </span>
                <h4 className="text-xs font-bold text-zinc-200 truncate pr-5">
                  {preset.name}
                </h4>
              </div>

              {/* Styled Visual Typography Preview */}
              <div
                className="h-14 rounded-lg bg-zinc-950 flex items-center justify-center px-2 text-center border border-zinc-800/60 overflow-hidden"
              >
                <div
                  className={`inline-block font-black tracking-tight leading-none ${
                    preset.bgBox ? 'px-2 py-0.5 rounded' : ''
                  }`}
                  style={{
                    backgroundColor: preset.bgBox ? preset.bgBoxColor : 'transparent',
                    fontFamily: preset.fontFamily,
                    fontSize: '17px',
                    fontWeight: preset.fontWeight,
                    WebkitTextStroke: outlineCss !== 'none' ? outlineCss : undefined,
                    paintOrder: 'stroke fill',
                    textShadow: shadowCss !== 'none' ? shadowCss : undefined,
                  }}
                >
                  <span style={{ color: preset.highlightColor }}>
                    {formatCasing("VIRAL", preset.textCasing)}{" "}
                  </span>
                  <span style={{ color: preset.primaryColor }}>
                    {formatCasing("CAPTIONS", preset.textCasing)}
                  </span>
                </div>
              </div>

              {/* Footer Meta */}
              <div className="mt-2 flex items-center justify-between text-[9px] text-zinc-500 font-mono">
                <span>{preset.fontFamily}</span>
                <span className="capitalize">{preset.animationTrigger}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
