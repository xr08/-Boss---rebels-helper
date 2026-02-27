import React, { useState } from 'react';
import { 
  CheckCircle, 
  Circle, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  ShieldAlert, 
  Wifi, 
  Server, 
  Video, 
  BatteryCharging, 
  Cable,
  Copy,
  Check,
  Lock,
  Database,
  Radio,
  Camera,
  Cctv,
  ArrowRight,
  RefreshCcw,
  ChevronLeft,
  MapPin,
  Info,
  Plug,
  Users,
  Smartphone,
  Activity,
  type LucideIcon
} from 'lucide-react';

// --- Types ---
interface Diamond {
  id: string;
  title: string;
  desc: string;
  hasPower: boolean;
  recommendedSetup: string;
}

interface Location {
  id: string;
  title: string;
  desc: string;
  diamonds: Diamond[];
}

interface GearConfig {
  gear: {
    brain: string[];
    hub: string[];
    cameras: string[];
    cables: string[];
    bridge: string[];
  };
}

interface ProgressState {
  gear: {
    brain: boolean[];
    hub: boolean[];
    cameras: boolean[];
    cables: boolean[];
    bridge: boolean[];
  };
  dugout: boolean[];
  centerfield: boolean[];
  software: boolean[];
}

// --- Utility: Fallback Copy to Clipboard ---
const copyToClipboard = (text: string, onSuccess?: () => void) => {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      if (onSuccess) onSuccess();
    }).catch(err => {
      console.error('Clipboard API failed, falling back', err);
      fallbackCopy(text, onSuccess);
    });
  } else {
    fallbackCopy(text, onSuccess);
  }
};

const fallbackCopy = (text: string, onSuccess?: () => void) => {
  const el = document.createElement('textarea');
  el.value = text;
  el.setAttribute('readonly', '');
  el.style.position = 'absolute';
  el.style.left = '-9999px';
  document.body.appendChild(el);
  el.select();
  try {
    document.execCommand('copy');
    if (onSuccess) onSuccess();
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
  }
  document.body.removeChild(el);
};

// --- Location & Diamond Database ---
const LOCATIONS: Location[] = [
  {
    id: 'shirley',
    title: 'Shirley Strickland',
    desc: 'Rebels Home Ground',
    diamonds: [
      { id: 'd1', title: 'Diamond 1', desc: 'Main diamond, home run fence, no 240v power.', hasPower: false, recommendedSetup: '3cam_cf' },
      { id: 'd2', title: 'Diamond 2', desc: 'Secondary diamond, home run fence, no 240v power.', hasPower: false, recommendedSetup: '2cam' },
      { id: 'd3', title: 'Diamond 3', desc: 'Permanent backnet, no 240v power.', hasPower: false, recommendedSetup: '1cam' },
      { id: 'd4', title: 'Diamond 4', desc: 'Basic grass diamond, no 240v power.', hasPower: false, recommendedSetup: '1cam' },
    ]
  },
  {
    id: 'mirrabooka',
    title: 'Mirrabooka (Softball WA)',
    desc: 'Softball WA Grounds',
    diamonds: [
      { id: 'd1', title: 'Diamond 1', desc: 'Main diamond, clay infield, rope netting, 240v power.', hasPower: true, recommendedSetup: '3cam_cf' },
      { id: 'd2', title: 'Diamond 2', desc: 'Secondary prime, clay infield, rope netting, 240v power.', hasPower: true, recommendedSetup: '3cam_cf' },
      { id: 'd3', title: 'Diamond 3', desc: 'Grass infield, chain link, 240v power (inside).', hasPower: true, recommendedSetup: '2cam' },
      { id: 'd4', title: 'Diamond 4', desc: 'Grass infield, chain link, 240v power (inside).', hasPower: true, recommendedSetup: '2cam' },
    ]
  },
  {
    id: 'semsa',
    title: 'SEMSA',
    desc: 'SEMSA Grounds (Womens Summer)',
    diamonds: [
      { id: 'd1', title: 'Diamond 1', desc: 'Main diamond, chain link, 240v power (inside).', hasPower: true, recommendedSetup: '2cam' },
      { id: 'other', title: 'Other Diamonds', desc: 'Grass, small portable backnet, no 240v power.', hasPower: false, recommendedSetup: '1cam' },
    ]
  },
  {
    id: 'away',
    title: 'Away Game / Other',
    desc: 'Assume no power, rely on batteries',
    diamonds: [
      { id: 'generic', title: 'Generic Field', desc: 'Standard away field setup.', hasPower: false, recommendedSetup: '1cam' }
    ]
  }
];

// --- Dynamic Configuration Builder ---
const getSetupConfig = (type: string | null, hasPower: boolean): GearConfig => {
  const config: GearConfig = {
    gear: {
      brain: [
        "Netgear Nighthawk M7 Ultra 5G Modem",
        hasPower 
          ? "USB-C wall charger (Plug into 240v, remove modem battery)" 
          : "High-Capacity USB-C Power Bank (Remove modem battery to stop overheating)"
      ],
      hub: [
        "GL.iNet Slate 7 Router (GL-BE3600)",
        hasPower 
          ? "USB-C Power Adapter for Router (Plug into 240v)" 
          : "Dedicated Power Bank for Router",
        "iPad / Tablet (For Video Streaming)",
        "Smartphone (Dedicated for sidelineHD / iScore)"
      ],
      cameras: [],
      cables: [],
      bridge: []
    }
  };

  if (!type) return config;

  // Build Camera List
  if (type === '1cam') {
    config.gear.cameras.push("Home Plate Camera (NearStream VM46)");
    config.gear.cameras.push("1x Tripod or Fence Mount");
    config.gear.cameras.push("2x High-Capacity Power Banks (e.g. INIU 10000mAh)");
  }
  if (type === '2cam') {
    config.gear.cameras.push("Home Plate Camera (NearStream VM46)");
    config.gear.cameras.push("Baseline/Dugout Camera (NearStream VM46)");
    config.gear.cameras.push("2x Tripods or Fence Mounts");
    config.gear.cameras.push("3x High-Capacity Power Banks (e.g. INIU/UGREEN)");
    config.gear.cameras.push("External Microphone (For crowd/ump audio)");
  }
  if (type === '3cam_nocf') {
    config.gear.cameras.push("Home Plate Camera (NearStream VM46)");
    config.gear.cameras.push("1st Base Camera (NearStream VM46)");
    config.gear.cameras.push("3rd Base Camera (NearStream VM33)");
    config.gear.cameras.push("3x Tripods or Fence Mounts");
    config.gear.cameras.push("3x Power Banks + Projecta Solar Panel");
    config.gear.cameras.push("2x External Microphones");
  }
  if (type === '3cam_cf') {
    config.gear.cameras.push("Centerfield Camera (NearStream VM46)");
    config.gear.cameras.push("Home Plate Camera (NearStream VM46)");
    config.gear.cameras.push("Baseline Camera (NearStream VM33)");
    config.gear.cameras.push("3x Tripods or Fence Mounts");
    config.gear.cameras.push("3x Power Banks + Projecta Solar Panel");
    config.gear.cameras.push("2x External Microphones");
  }

  // Build Cables List
  config.gear.cables.push("Short Ethernet Cable (Modem to Slate 7)");
  if (type === '3cam_cf') {
    config.gear.cables.push("Long Ethernet Cable (Centerfield Camera to Slate AX)");
  }
  config.gear.cables.push("USB-C power / charging leads for all devices");

  // Build Bridge List
  if (type === '3cam_cf') {
    config.gear.bridge = [
      "GL.iNet Slate AX Router (GL-AXT1800)",
      "High-capacity Power Bank (e.g., UGREEN 20000mAh)",
      "Toolpro Protective Carry Box",
      "Router Fence Mount"
    ];
  }

  return config;
};

// --- Components ---

const ProgressBar = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => (
  <div className="w-full bg-slate-800 h-2 mt-4 rounded-full overflow-hidden">
    <div 
      className="bg-emerald-500 h-full transition-all duration-500 ease-out"
      style={{ width: `${(currentStep / totalSteps) * 100}%` }}
    />
  </div>
);

const CheckListItem = ({ title, subtitle, icon: Icon, isChecked, onToggle }: { 
  title: string; 
  subtitle?: string; 
  icon?: any; 
  isChecked: boolean; 
  onToggle: () => void 
}) => (
  <div 
    onClick={onToggle}
    className={`flex items-center p-4 mb-3 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
      isChecked 
        ? 'bg-emerald-900/20 border-emerald-500/50' 
        : 'bg-slate-800 border-slate-700 hover:border-slate-500'
    }`}
  >
    <div className={`flex-shrink-0 mr-4 ${isChecked ? 'text-emerald-400' : 'text-slate-400'}`}>
      {isChecked ? <CheckCircle size={28} /> : <Circle size={28} />}
    </div>
    <div className="flex-grow">
      <h3 className={`font-semibold text-lg ${isChecked ? 'text-emerald-100' : 'text-slate-100'}`}>
        {title}
      </h3>
      {subtitle && (
        <p className={`text-sm mt-1 leading-relaxed ${isChecked ? 'text-emerald-200/70' : 'text-slate-400'}`}>
          {subtitle}
        </p>
      )}
    </div>
    {Icon && (
      <div className={`flex-shrink-0 ml-2 ${isChecked ? 'text-emerald-500/50' : 'text-slate-600'}`}>
        <Icon size={24} />
      </div>
    )}
  </div>
);

const Accordion = ({ title, children, icon: Icon, type = "info" }: { 
  title: string; 
  children: React.ReactNode; 
  icon?: any; 
  type?: "info" | "warning" | "success" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const colors = {
    info: "bg-slate-800 border-slate-700 text-slate-200",
    warning: "bg-amber-950/30 border-amber-800/50 text-amber-200",
    success: "bg-emerald-950/30 border-emerald-800/50 text-emerald-200"
  };

  return (
    <div className={`mb-4 rounded-xl border ${colors[type]} overflow-hidden`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between text-left focus:outline-none"
      >
        <div className="flex items-center font-bold">
          {Icon && <Icon size={20} className="mr-3 opacity-80" />}
          {title}
        </div>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isOpen && (
        <div className="p-4 pt-0 text-sm border-t border-black/10 leading-relaxed space-y-2">
          {children}
        </div>
      )}
    </div>
  );
};

const GearCategoryCard = ({ title, icon: Icon, items, categoryKey, progressState, onToggle }: {
  title: string;
  icon: any;
  items: string[];
  categoryKey: keyof ProgressState['gear'];
  progressState: boolean[];
  onToggle: (category: keyof ProgressState['gear'], index: number) => void;
}) => {
  if (!items || items.length === 0) return null; 
  const allChecked = progressState && progressState.length > 0 && progressState.every(Boolean);
  
  return (
    <div className={`mb-4 rounded-xl border-2 transition-all duration-200 ${allChecked ? 'bg-emerald-900/20 border-emerald-500/50' : 'bg-slate-800 border-slate-700'}`}>
      <div className="p-4 border-b border-black/20 flex items-center">
         <div className={`flex-shrink-0 mr-3 ${allChecked ? 'text-emerald-400' : 'text-slate-400'}`}>
            <Icon size={24} />
         </div>
         <h3 className={`font-semibold text-lg ${allChecked ? 'text-emerald-100' : 'text-slate-100'}`}>{title}</h3>
         {allChecked && <CheckCircle size={24} className="ml-auto text-emerald-500" />}
      </div>
      <div className="p-2 space-y-1">
        {items.map((item, index) => (
          <div 
            key={index} 
            onClick={() => onToggle(categoryKey, index)} 
            className="flex items-start p-3 cursor-pointer hover:bg-slate-700/50 rounded-lg transition-colors"
          >
             <div className={`flex-shrink-0 mr-4 mt-0.5 ${progressState[index] ? 'text-emerald-400' : 'text-slate-500'}`}>
               {progressState[index] ? <CheckCircle size={24}/> : <Circle size={24}/>}
             </div>
             <span className={`text-sm font-medium ${progressState[index] ? 'text-emerald-200/50 line-through' : 'text-slate-300'}`}>
               {item}
             </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const SelectionOption = ({ title, desc, icon: Icon, onClick, highlight = false, badge = null }: {
  title: string;
  desc: string;
  icon: any;
  onClick: () => void;
  highlight?: boolean;
  badge?: string | null;
  key?: any;
}) => (
  <div 
    onClick={onClick}
    className={`bg-slate-800 border-2 ${highlight ? 'border-amber-500 shadow-amber-900/20' : 'border-slate-700 hover:border-emerald-500'} rounded-2xl p-5 cursor-pointer transition-all hover:bg-slate-800/80 active:scale-95 flex items-center mb-4 shadow-lg shadow-black/20`}
  >
     <div className={`p-3 rounded-full mr-4 flex-shrink-0 ${highlight ? 'bg-amber-900 text-amber-400' : 'bg-slate-900 text-emerald-400'}`}>
       <Icon size={28} />
     </div>
     <div className="flex-grow">
       <h3 className="text-white font-bold text-lg flex items-center">
         {title}
       </h3>
       <p className="text-slate-400 text-sm mt-1">{desc}</p>
       {badge && (
         <div className="mt-2 inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-900 text-slate-300">
           <Users size={12} className="mr-1" /> Staff needed: {badge}
         </div>
       )}
     </div>
     <div className="ml-auto text-slate-500 pl-2">
       <ArrowRight />
     </div>
  </div>
);

// --- CONFIRM RESET MODAL ---
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 w-full max-w-sm rounded-2xl border border-slate-600 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
          <p className="text-slate-400 text-sm mb-6">{message}</p>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-bold bg-slate-700 text-slate-200 hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm}
              className="flex-1 py-3 rounded-xl font-bold bg-amber-500 text-amber-950 hover:bg-amber-400 transition-colors"
            >
              Yes, Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- EMERGENCY VAULT MODAL ---
const VaultModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (label: string, text: string) => {
    copyToClipboard(text, () => {
      setCopiedItem(label);
      setTimeout(() => setCopiedItem(null), 2000);
    });
  };

  const VaultItem = ({ label, value, isPlaceholder = false }: { label: string; value: string; isPlaceholder?: boolean }) => (
    <div className="flex justify-between items-center p-3 bg-slate-900 rounded-lg mb-2">
      <div className="overflow-hidden mr-2">
        <p className="text-xs text-slate-400 mb-1">{label}</p>
        {isPlaceholder ? (
          <p className="font-mono text-sm text-slate-500 italic truncate">{value}</p>
        ) : (
          <p className="font-mono text-sm text-slate-200 truncate">{value}</p>
        )}
      </div>
      {!isPlaceholder && (
        <button 
          onClick={() => handleCopy(label, value)}
          className="p-2 bg-slate-800 hover:bg-slate-700 rounded-md text-emerald-400 transition-colors flex-shrink-0"
        >
          {copiedItem === label ? <Check size={18} /> : <Copy size={18} />}
        </button>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 pb-24">
      <div className="bg-slate-800 w-full max-w-md rounded-2xl border border-slate-600 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8">
        <div className="p-4 bg-slate-900 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-lg font-bold flex items-center text-amber-400">
            <Lock size={20} className="mr-2" /> Emergency Vault
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white">✕</button>
        </div>
        
        <div className="p-4 max-h-[65vh] overflow-y-auto space-y-6">
          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
              <Database size={14} className="mr-2" /> Global Accounts
            </h3>
            <VaultItem label="Rebels Universal Email" value="fremantlerebels@gmail.com" />
            <VaultItem label="Rebels Universal Password" value="rebels1984" />
          </section>

          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
              <Server size={14} className="mr-2" /> Hardware & IPs
            </h3>
            <VaultItem label="Dugout Router (Slate 7) IP" value="192.168.8.2" />
            <VaultItem label="Dugout Router Admin PW" value="GL-BE3600-cfd" />
            <VaultItem label="Dugout Wi-Fi PW" value="JK64ZKJPET" />
            <div className="h-2"></div>
            <VaultItem label="Centerfield Router (AX) IP" value="192.168.8.1" />
            <VaultItem label="Centerfield Router Admin PW" value="GL-AXT1800-f41" />
            <VaultItem label="Centerfield Wi-Fi PW" value="9NK74DR5JN" />
            <div className="h-2"></div>
            <VaultItem label="Netgear M7 IP" value="192.168.1.1" />
            <VaultItem label="Netgear M7 Wi-Fi" value="REBELS M7" />
            <VaultItem label="Netgear M7 PW" value="19841984" />
            <div className="h-2"></div>
            <VaultItem label="Nearstream VM46 (4k)" value="192.168.8.143" />
            <VaultItem label="Nearstream VM46 NEW (4k)" value="192.168.8.188" />
            <VaultItem label="Nearstream VM33 (2k)" value="192.168.8.178" />
          </section>

          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
              <Radio size={14} className="mr-2" /> Stream Setup
            </h3>
            <VaultItem label="RTMP Stream URL" value="rtmps://e07.sidelinehd.com:443/shd03" />
            <VaultItem label="Stream Key" value="s03-wr0h-ypvz-uewk-4zxq-7ztj" />
          </section>

        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [locationId, setLocationId] = useState<string | null>(null);
  const [diamondId, setDiamondId] = useState<string | null>(null);
  const [setupType, setSetupType] = useState<string | null>(null); 
  const [currentScreen, setCurrentScreen] = useState(0);
  
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [confirmModalData, setConfirmModalData] = useState<{ isOpen: boolean; type: 'location' | 'plan' | null }>({ isOpen: false, type: null }); 
  const [progress, setProgress] = useState<ProgressState | null>(null);

  const activeLocation = LOCATIONS.find(l => l.id === locationId);
  const activeDiamond = activeLocation?.diamonds.find(d => d.id === diamondId);

  const handleSelectLocation = (id: string) => {
    setLocationId(id);
    setDiamondId(null);
    setSetupType(null);
  };

  const handleSelectDiamond = (id: string) => {
    setDiamondId(id);
    setSetupType(null);
  };

  const handleSelectSetup = (type: string) => {
    const hasPower = activeDiamond?.hasPower || false;
    const config = getSetupConfig(type, hasPower);
    
    const newProgress: ProgressState = {
      gear: {
        brain: Array(config.gear.brain.length).fill(false),
        hub: Array(config.gear.hub.length).fill(false),
        cameras: Array(config.gear.cameras.length).fill(false),
        cables: Array(config.gear.cables.length).fill(false),
        bridge: Array(config.gear.bridge ? config.gear.bridge.length : 0).fill(false)
      },
      dugout: Array(4).fill(false), 
      centerfield: Array(4).fill(false),
      software: Array(2).fill(false) 
    };

    setSetupType(type);
    setProgress(newProgress);
    setCurrentScreen(0);
  };

  const executeReset = () => {
    if (confirmModalData.type === 'location') {
      setLocationId(null);
      setDiamondId(null);
      setSetupType(null);
      setProgress(null);
    } else if (confirmModalData.type === 'plan') {
      setSetupType(null);
      setProgress(null);
    }
    setCurrentScreen(0);
    setConfirmModalData({ isOpen: false, type: null });
  };

  const toggleProgress = (section: keyof Omit<ProgressState, 'gear'>, index: number) => {
    if (!progress) return;
    setProgress(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [section]: prev[section].map((item, i) => i === index ? !item : item)
      };
    });
  };

  const toggleGearProgress = (category: keyof ProgressState['gear'], index: number) => {
    if (!progress) return;
    setProgress(prev => {
      if (!prev) return null;
      return {
        ...prev,
        gear: {
          ...prev.gear,
          [category]: prev.gear[category].map((item, i) => i === index ? !item : item)
        }
      };
    });
  };

  const isSectionComplete = (section: keyof ProgressState) => {
    if (!progress) return false;
    if (section === 'gear') {
      return Object.keys(progress.gear).every(key => {
        const arr = progress.gear[key as keyof ProgressState['gear']];
        return arr.length === 0 || arr.every(v => v === true);
      });
    }
    return progress[section as keyof Omit<ProgressState, 'gear'>].length === 0 || progress[section as keyof Omit<ProgressState, 'gear'>].every(v => v === true);
  };

  const activeScreens: string[] = ['gear', 'dugout'];
  if (setupType === '3cam_cf') activeScreens.push('centerfield');
  if (setupType) {
    activeScreens.push('software');
    activeScreens.push('troubleshooting');
  }

  const nextScreen = () => setCurrentScreen(prev => Math.min(prev + 1, activeScreens.length - 1));
  const prevScreen = () => setCurrentScreen(prev => Math.max(prev - 1, 0));


  // --- VIEW 1: LOCATION SELECTION ---
  if (!locationId) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 pb-24 selection:bg-emerald-500/30">
        <div className="max-w-md mx-auto pt-8">
          <div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-4">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <img 
                src="/rebels logo.png" 
                alt="Rebels Logo" 
                className="w-full h-full object-contain relative z-10"
                onError={(e) => (e.currentTarget.style.opacity = '0')}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-emerald-900/20 rounded-full border-2 border-emerald-500/30">
                <span className="text-4xl font-black text-emerald-500">R</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-amber-400 bg-clip-text text-transparent mb-2">
              Rebels Broadcast Hub
            </h1>
            <p className="text-slate-400">Professional setup guide for Rebels Softball Club live streams.</p>
          </div>

          <div className="mb-6 p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl text-center">
            <p className="text-emerald-400 font-medium text-sm">Select your location to begin the setup wizard.</p>
          </div>

          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-8 delay-100">
            {LOCATIONS.map(loc => (
              <SelectionOption 
                key={loc.id}
                title={loc.title} 
                desc={loc.desc}
                icon={MapPin}
                onClick={() => handleSelectLocation(loc.id)}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 2: DIAMOND SELECTION ---
  if (!diamondId) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 pb-24 selection:bg-emerald-500/30">
        <div className="max-w-md mx-auto pt-4">
          <button 
            onClick={() => setLocationId(null)}
            className="flex items-center text-slate-400 hover:text-white text-sm mb-6 transition-colors"
          >
            <ChevronLeft size={16} className="mr-1" /> Change Location
          </button>

          <div className="mb-8 animate-in fade-in">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-amber-400 bg-clip-text text-transparent mb-2">
              Select Diamond
            </h1>
            <p className="text-slate-400">Which diamond at <strong>{activeLocation?.title}</strong> are you using?</p>
          </div>

          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-8">
            {activeLocation?.diamonds.map(diamond => (
              <SelectionOption 
                key={diamond.id}
                title={diamond.title} 
                desc={diamond.desc}
                icon={diamond.hasPower ? Plug : MapPin}
                highlight={diamond.hasPower}
                onClick={() => handleSelectDiamond(diamond.id)}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 3: SETUP SELECTION (WITH ADVISORY) ---
  if (!setupType) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 pb-24 selection:bg-emerald-500/30">
        <div className="max-w-md mx-auto pt-4">
          
          <button 
            onClick={() => setDiamondId(null)}
            className="flex items-center text-slate-400 hover:text-white text-sm mb-6 transition-colors"
          >
            <ChevronLeft size={16} className="mr-1" /> Change Diamond
          </button>

          <div className="mb-6 animate-in fade-in">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-amber-400 bg-clip-text text-transparent mb-2">
              Game Plan
            </h1>
            <p className="text-slate-400">Select the camera configuration for today's stream at <strong>{activeLocation?.title} - {activeDiamond?.title}</strong>.</p>
          </div>

          {/* Location Advisory Banner */}
          <div className="bg-amber-950/40 border border-amber-800/50 rounded-xl p-4 mb-6 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-amber-400 font-bold flex items-center mb-2">
              <Info size={18} className="mr-2" /> Diamond Advisory
            </h3>
            <p className="text-amber-100/80 text-sm mb-2">
              {activeDiamond?.desc}
            </p>
            {activeDiamond?.hasPower ? (
              <p className="text-emerald-400/90 text-sm">
                This diamond has <strong>240v power access</strong>! You can use wall chargers for the main hub.
              </p>
            ) : (
              <p className="text-amber-100/80 text-sm">
                No 240v power at the backnet. <strong>Power banks are required</strong> for all devices.
              </p>
            )}
            <div className="mt-3 p-2 bg-slate-900/50 rounded-lg border border-slate-700">
              <p className="text-xs text-slate-400 uppercase font-bold">Recommended Setup</p>
              <p className="text-emerald-400 font-bold">
                {activeDiamond?.recommendedSetup === '3cam_cf' ? '3-Camera PRO (Centerfield)' : 
                 activeDiamond?.recommendedSetup === '2cam' ? '2-Camera Standard' : '1-Camera Basic'}
              </p>
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-8">
            <SelectionOption 
              title="1-Camera Basic" 
              desc="Home plate view only. Fast, simple, dugout setup."
              icon={Camera}
              badge="2-3 People"
              highlight={activeDiamond?.recommendedSetup === '1cam'}
              onClick={() => handleSelectSetup('1cam')}
            />
            <SelectionOption 
              title="2-Camera Standard" 
              desc="Home plate + 1 baseline camera. Dugout setup."
              icon={Video}
              badge="3-4 People"
              highlight={activeDiamond?.recommendedSetup === '2cam'}
              onClick={() => handleSelectSetup('2cam')}
            />
            <SelectionOption 
              title="3-Camera (All Local)" 
              desc="Home plate + 2 baselines. No centerfield bridge."
              icon={Cctv}
              badge="4+ People"
              onClick={() => handleSelectSetup('3cam_nocf')}
            />
            <SelectionOption 
              title="3-Camera PRO (Centerfield)" 
              desc="Full broadcast featuring the VM46 and long-range wireless bridge."
              icon={Radio}
              badge="5+ People"
              highlight={activeDiamond?.recommendedSetup === '3cam_cf'}
              onClick={() => handleSelectSetup('3cam_cf')}
            />
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 4: MAIN APP & CHECKLISTS ---
  const config = getSetupConfig(setupType, activeDiamond?.hasPower || false);
  const currentScreenName = activeScreens[currentScreen];
  const totalSteps = activeScreens.length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-24 selection:bg-emerald-500/30">
      
      {/* Header */}
      <header className="bg-slate-950 border-b border-slate-800 p-4 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setConfirmModalData({ isOpen: true, type: 'plan' })} 
              className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
              aria-label="Go Back"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8">
                <img 
                  src="/rebels logo.png" 
                  alt="Rebels Logo" 
                  className="w-full h-full object-contain relative z-10"
                  onError={(e) => (e.currentTarget.style.opacity = '0')}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-emerald-900/20 rounded border border-emerald-500/30">
                  <span className="text-xs font-black text-emerald-500">R</span>
                </div>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-amber-400 bg-clip-text text-transparent">
                Setup Guide
              </h1>
            </div>
          </div>
        </div>
        <div className="max-w-md mx-auto flex items-center justify-between mt-3">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Step {currentScreen + 1} of {totalSteps}
          </span>
          <ProgressBar currentStep={currentScreen + 1} totalSteps={totalSteps} />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-md mx-auto p-4 animate-in fade-in duration-300">
        
        {/* SCREEN: Gear Checklist */}
        {currentScreenName === 'gear' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">The Gear Checklist</h2>
              <p className="text-slate-400">Let's make sure you have everything out of the bag before we start plugging things in.</p>
            </div>

            <div className="space-y-2">
              <GearCategoryCard title="The Internet Brain" icon={Wifi} categoryKey="brain" items={config.gear.brain} progressState={progress?.gear.brain || []} onToggle={toggleGearProgress} />
              <GearCategoryCard title="The Dugout Command Hub" icon={Server} categoryKey="hub" items={config.gear.hub} progressState={progress?.gear.hub || []} onToggle={toggleGearProgress} />
              <GearCategoryCard title="The Centerfield Bridge" icon={Radio} categoryKey="bridge" items={config.gear.bridge} progressState={progress?.gear.bridge || []} onToggle={toggleGearProgress} />
              <GearCategoryCard title="Cameras & Mounts" icon={Video} categoryKey="cameras" items={config.gear.cameras} progressState={progress?.gear.cameras || []} onToggle={toggleGearProgress} />
              <GearCategoryCard title="Cables" icon={Cable} categoryKey="cables" items={config.gear.cables} progressState={progress?.gear.cables || []} onToggle={toggleGearProgress} />
            </div>

            <button 
              onClick={nextScreen}
              disabled={!isSectionComplete('gear')}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                isSectionComplete('gear') 
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20' 
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isSectionComplete('gear') ? "All set! Next Step" : "Check all items to continue"}
            </button>
          </div>
        )}

        {/* SCREEN: Dugout Hub */}
        {currentScreenName === 'dugout' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Step 1: Dugout Hub</h2>
              <p className="text-slate-400">Setting up the main control station at the dugout.</p>
            </div>

            <Accordion title="The Heat Pitfall (Crucial!)" icon={AlertTriangle} type="warning">
              <p className="mb-2"><strong>5G modems overheat in the sun!</strong> If it overheats, it will shut down mid-game and kill the broadcast.</p>
              <p>Take the battery <strong>OUT</strong> of the Netgear M7 modem. Plug it directly into your {activeDiamond?.hasPower ? 'USB-C Wall Charger' : 'Power Bank'}. It will run perfectly without the battery.</p>
            </Accordion>

            <div className="space-y-1 mt-4">
              <CheckListItem title="Action 1: Battery Removed" subtitle="Netgear M7 battery is out, plugged into external power." icon={BatteryCharging} isChecked={progress?.dugout[0] || false} onToggle={() => toggleProgress('dugout', 0)} />
              <CheckListItem title="Action 2: Mount the Modem" subtitle="Mount the Netgear M7 high on the dugout fence, ideally under a shade hood." isChecked={progress?.dugout[1] || false} onToggle={() => toggleProgress('dugout', 1)} />
              <CheckListItem title="Action 3: Wire the Brains" subtitle="Plug an Ethernet cable from the Netgear M7 directly into the port labeled '2.5G WAN' on the Slate 7 router." icon={Cable} isChecked={progress?.dugout[2] || false} onToggle={() => toggleProgress('dugout', 2)} />
              <CheckListItem title="Action 4: Connect iPad" subtitle="Connect your iPad/Tablet to the Slate 7's 5GHz Wi-Fi network." icon={Wifi} isChecked={progress?.dugout[3] || false} onToggle={() => toggleProgress('dugout', 3)} />
            </div>

            <Accordion title="Tech Details & IP Info" icon={Server} type="info">
              <p className="mb-3"><strong>Slate 7 Router IP:</strong> <span className="font-mono text-emerald-400 bg-slate-900 px-1 py-0.5 rounded">192.168.8.2</span></p>
              <button 
                onClick={() => { copyToClipboard('192.168.8.2'); alert('IP copied to clipboard!'); }}
                className="mb-4 bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-md text-sm font-medium flex items-center transition-colors"
              >
                <Copy size={16} className="mr-2" /> Copy IP Address
              </button>
              <div className="p-3 bg-amber-900/20 border border-amber-700/50 rounded-lg text-amber-200">
                <p className="font-bold flex items-center mb-1"><ShieldAlert size={16} className="mr-1" /> Privacy Setting Warning</p>
                <p>Ensure <strong>"Randomized MAC/BSSID"</strong> is turned <strong>OFF</strong> in your iPad's Wi-Fi settings.</p>
              </div>
            </Accordion>

            <div className="flex gap-3 pt-4">
              <button onClick={prevScreen} className="w-1/3 py-4 rounded-xl font-bold bg-slate-800 text-slate-300">Back</button>
              <button 
                onClick={nextScreen}
                disabled={!isSectionComplete('dugout')}
                className={`w-2/3 py-4 rounded-xl font-bold text-lg transition-all ${
                  isSectionComplete('dugout') 
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {/* SCREEN: Centerfield Camera (Conditional) */}
        {currentScreenName === 'centerfield' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Step 2: Centerfield</h2>
              <p className="text-slate-400">Extending the network across the field.</p>
            </div>

            <Accordion title="The Distance Pitfall" icon={AlertTriangle} type="warning">
              <p>The Slate AX router out here acts as an <strong>"invisible bridge"</strong> (WDS Mode).</p>
              <p className="mt-2">It communicates with the dugout using the <strong>5 GHz</strong> Wi-Fi band locked to Channel 149 and 40MHz to punch through 200 feet of open air.</p>
            </Accordion>

            <div className="space-y-1 mt-4">
              <CheckListItem title="Action 1: Walk it out" subtitle="Walk the GL.iNet Slate AX router, a power bank, and a camera out to centerfield." isChecked={progress?.centerfield[0] || false} onToggle={() => toggleProgress('centerfield', 0)} />
              <CheckListItem title="Action 2: Wire the VM46" subtitle="Plug the NearStream VM46 directly into the Slate AX 'LAN' port using an Ethernet cable." icon={Cable} isChecked={progress?.centerfield[1] || false} onToggle={() => toggleProgress('centerfield', 1)} />
              <CheckListItem title="Action 3: Placement" subtitle="Mount the router so it has a clear line of sight back to the dugout. Mount it HIGH so spectators walking by don't block the signal." isChecked={progress?.centerfield[2] || false} onToggle={() => toggleProgress('centerfield', 2)} />
              <CheckListItem title="Action 4: Power Up" subtitle="Plug the Slate AX and the VM46 into the portable power bank and turn them on." icon={BatteryCharging} isChecked={progress?.centerfield[3] || false} onToggle={() => toggleProgress('centerfield', 3)} />
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={prevScreen} className="w-1/3 py-4 rounded-xl font-bold bg-slate-800 text-slate-300">Back</button>
              <button 
                onClick={nextScreen}
                disabled={!isSectionComplete('centerfield')}
                className={`w-2/3 py-4 rounded-xl font-bold text-lg transition-all ${
                  isSectionComplete('centerfield') 
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {/* SCREEN: Software Integrations */}
        {currentScreenName === 'software' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Software & Integrations</h2>
              <p className="text-slate-400">Syncing sidelineHD and the Radar Gun.</p>
            </div>

            <Accordion title="How to pull SidelineHD Stream Keys" icon={Database} type="success">
              <ol className="list-decimal pl-5 space-y-2 text-slate-300">
                <li>Log in to your account at sidelineHD.com</li>
                <li>Select the specific <strong>Team Card</strong> for the team you are about to stream.</li>
                <li>Go to <strong>Settings</strong> (top right), then navigate to <strong>Stream Settings &gt; Camera Settings</strong>.</li>
                <li>Click the three dots (advanced settings) next to your camera preset to find and copy the unique <strong>Stream URL</strong> and <strong>Stream Key</strong> for that team.</li>
              </ol>
            </Accordion>

            <Accordion title="How to link Pocket Radar to SidelineHD" icon={Activity} type="success">
              <ol className="list-decimal pl-5 space-y-2 text-slate-300">
                <li>Ensure you have the <strong>Pocket Radar Sports App</strong> downloaded on your phone.</li>
                <li>Create/Log in to a Pocket Radar Account.</li>
                <li>In the app, click the <strong>MORE</strong> button and select <strong>Pocket Radar Connect</strong>.</li>
                <li>Tap <strong>AGREE</strong> to initiate the connection.</li>
                <li>Background the app (leave it running), open the sidelineHD platform and allow Pocket Radar access.</li>
              </ol>
              <p className="mt-2 text-xs italic opacity-70">Issues? Reach out to Info@pocketradar.com</p>
            </Accordion>

            <div className="space-y-1 mt-4">
              <CheckListItem title="Stream Key Inputted" subtitle="Copied from SidelineHD and pasted into the Nearstream app." icon={Video} isChecked={progress?.software[0] || false} onToggle={() => toggleProgress('software', 0)} />
              <CheckListItem title="Radar Linked (Optional)" subtitle="Pocket radar connection authorized in sidelineHD." icon={Smartphone} isChecked={progress?.software[1] || false} onToggle={() => toggleProgress('software', 1)} />
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={prevScreen} className="w-1/3 py-4 rounded-xl font-bold bg-slate-800 text-slate-300">Back</button>
              <button 
                onClick={nextScreen}
                disabled={!isSectionComplete('software')}
                className={`w-2/3 py-4 rounded-xl font-bold text-lg transition-all ${
                  isSectionComplete('software') 
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {/* SCREEN: Troubleshooting & Reset */}
        {currentScreenName === 'troubleshooting' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Troubleshooting</h2>
              <p className="text-slate-400">Common issues and how to fix them instantly.</p>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <h3 className="font-bold text-amber-400 mb-2 flex items-start">
                  <AlertTriangle size={18} className="mr-2 mt-0.5 flex-shrink-0" /> 
                  "My stream is buffering or dropping frames."
                </h3>
                <div className="text-slate-300 text-sm pl-6">
                  <p><strong>Fix:</strong> Check the Netgear M7 modem. Is it in direct sunlight? Is it overheating? Did you run a speed test? Ensure your camera upload bitrate is set to only half of your available upload speed.</p>
                </div>
              </div>

              {setupType === '3cam_cf' && (
                <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                  <h3 className="font-bold text-amber-400 mb-2 flex items-start">
                    <AlertTriangle size={18} className="mr-2 mt-0.5 flex-shrink-0" /> 
                    "The iPad in the dugout can't find the centerfield camera."
                  </h3>
                  <div className="text-slate-300 text-sm pl-6">
                    <p><strong>Fix:</strong> Check the power bank at centerfield. Ensure the Slate AX is not blocked by a metal pole or walking spectators. Remember: Because the Slate AX is in 'WDS Bridge Mode,' you cannot log into it using its default IP address—it acts like an invisible cable.</p>
                  </div>
                </div>
              )}

              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <h3 className="font-bold text-amber-400 mb-2 flex items-start">
                  <AlertTriangle size={18} className="mr-2 mt-0.5 flex-shrink-0" /> 
                  "The dugout Wi-Fi keeps disconnecting my iPad."
                </h3>
                <div className="text-slate-300 text-sm pl-6">
                  <p><strong>Fix:</strong> Ensure 'Auto Channel' is turned off on the Slate 7 router. If the channel changes mid-game to dodge interference (like DFS radar), your devices will temporarily drop connection. Lock it to 149.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4 border-t border-slate-800 mt-8">
               <button onClick={prevScreen} className="w-full py-4 rounded-xl font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors">Back to Checklist</button>
               <div className="flex gap-3">
                 <button 
                   onClick={() => setConfirmModalData({ isOpen: true, type: 'plan' })}
                   className="flex-1 py-4 rounded-xl font-bold text-sm bg-slate-700 text-white hover:bg-slate-600 transition-colors flex justify-center items-center"
                 >
                   <RefreshCcw size={16} className="mr-2" /> Change Setup
                 </button>
                 <button 
                   onClick={() => setConfirmModalData({ isOpen: true, type: 'location' })}
                   className="flex-1 py-4 rounded-xl font-bold text-sm bg-slate-700 text-white hover:bg-slate-600 transition-colors flex justify-center items-center"
                 >
                   <MapPin size={16} className="mr-2" /> Change Location
                 </button>
               </div>
            </div>
          </div>
        )}
      </main>

      {/* Persistent Emergency Vault Button */}
      <div className="fixed bottom-4 left-0 right-0 px-4 z-40 max-w-md mx-auto">
        <button 
          onClick={() => setIsVaultOpen(true)}
          className="w-full bg-slate-800/90 backdrop-blur border border-slate-600 shadow-xl shadow-black/50 text-white p-4 rounded-2xl flex items-center justify-center font-bold text-lg active:scale-95 transition-transform"
        >
          <Lock className="text-amber-400 mr-2" size={24} />
          Emergency Vault
        </button>
      </div>

      {/* Modals */}
      <VaultModal isOpen={isVaultOpen} onClose={() => setIsVaultOpen(false)} />
      
      <ConfirmModal 
        isOpen={confirmModalData.isOpen} 
        onClose={() => setConfirmModalData({ isOpen: false, type: null })} 
        onConfirm={executeReset} 
        title={confirmModalData.type === 'location' ? "Change Location?" : "Change Game Plan?"}
        message={confirmModalData.type === 'location' 
          ? "This will wipe your current checklist and take you back to the very first screen. Are you sure?" 
          : "Going back to the setup screen will reset your current checklist. Are you sure you want to proceed?"}
      />

    </div>
  );
}
