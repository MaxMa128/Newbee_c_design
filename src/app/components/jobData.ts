import { Language } from './i18n';

export type JobType = 'full-time' | 'part-time' | 'casual';
export type SalaryPeriod = 'hourly' | 'daily' | 'monthly';

export type CompanyIndustry = '製造業' | 'IT/互聯網' | '餐飲/酒店' | '建築業' | '家政/物業' | '其他';

export const WORK_CATEGORIES = [
  '服務業/零售門市', '餐飲業', '活動推廣', '教育', '物流運輸',
  '客戶服務', '清潔', '推銷和中介', '建造業', '保安及物業', '生產及保障', '維修技術',
] as const;

export interface Job {
  id: number;
  title: Record<Language, string>;
  company: string;
  companyIntro: Record<Language, string>;
  companySize: string;
  companyIndustry: CompanyIndustry;
  workCategory: string;
  store: Record<Language, string>;
  address: Record<Language, string>;
  lat: number;
  lng: number;
  district: Record<Language, string>;
  region: Record<Language, string>;
  mtr: Record<Language, string>;
  salary: number;
  salaryMax?: number;
  salaryPeriod: SalaryPeriod;
  jobType: JobType;
  isUrgent: boolean;
  isDailyPay: boolean;
  postedMinutes: number;
  logo: string;
  logoColor: string;
  category: Record<Language, string>;
  requirements: Record<Language, string[]>;
  certRequirements: Record<Language, string[]>;
  headcount: number;
  remainingSpots: number;
  date: Record<Language, string>;
}

export const jobs: Job[] = [
  {
    id: 1,
    title: { 'zh-HK': '展覽場地助理', 'zh-CN': '展览场地助理', en: 'Exhibition Hall Assistant' },
    company: 'HK Convention & Exhibition Centre',
    companyIndustry: '其他' as const,
    workCategory: '活動推廣',
    companyIntro: {
      'zh-HK': '香港會議展覽中心是亞洲最具規模的會議展覽場地之一，承辦各類國際展覽、會議及企業活動，每年接待逾百萬訪客。',
      'zh-CN': '香港会议展览中心是亚洲最具规模的会议展览场地之一，承办各类国际展览、会议及企业活动，每年接待逾百万访客。',
      en: 'HKCEC is one of Asia\'s premier convention and exhibition venues, hosting international exhibitions, conferences and corporate events welcoming over a million visitors annually.',
    },
    companySize: '500–1000人',
    store: { 'zh-HK': '灣仔會展中心', 'zh-CN': '湾仔会展中心', en: 'HKCEC Wan Chai' },
    address: { 'zh-HK': '香港灣仔博覽道1號香港會議展覽中心', 'zh-CN': '香港湾仔博览道1号香港会议展览中心', en: '1 Expo Drive, Wan Chai, Hong Kong' },
    lat: 22.2830,
    lng: 114.1733,
    district: { 'zh-HK': '灣仔', 'zh-CN': '湾仔', en: 'Wan Chai' },
    region: { 'zh-HK': '香港島 · 灣仔區', 'zh-CN': '香港岛 · 湾仔区', en: 'HK Island · Wan Chai District' },
    mtr: { 'zh-HK': '灣仔站', 'zh-CN': '湾仔站', en: 'Wan Chai MTR' },
    salary: 80,
    salaryMax: 90,
    salaryPeriod: 'hourly',
    jobType: 'casual',
    isUrgent: true,
    isDailyPay: true,
    postedMinutes: 30,
    logo: 'H',
    logoColor: '#0F1623',
    category: { 'zh-HK': '展覽活動', 'zh-CN': '展览活动', en: 'Exhibition' },
    requirements: {
      'zh-HK': ['懂廣東話', '可即時上工', '有禮貌、主動積極', '需長時間站立'],
      'zh-CN': ['懂粤语', '可即时上岗', '有礼貌、主动积极', '需长时间站立'],
      en: ['Cantonese speaker', 'Immediate start', 'Polite and proactive', 'Able to stand for long hours'],
    },
    certRequirements: {
      'zh-HK': ['無特定要求'],
      'zh-CN': ['无特定要求'],
      en: ['No specific certificate required'],
    },
    headcount: 8,
    remainingSpots: 5,
    date: { 'zh-HK': '6月12日', 'zh-CN': '6月12日', en: 'Jun 12' },
  },
  {
    id: 2,
    title: { 'zh-HK': '餐飲服務員', 'zh-CN': '餐饮服务员', en: 'Restaurant Server' },
    company: '美食集團',
    companyIndustry: '餐飲/酒店' as const,
    workCategory: '餐飲業',
    companyIntro: {
      'zh-HK': '美食集團旗下經營多間香港特色茶餐廳及中式餐廳，致力提供地道港式飲食體驗，於港九新界設有逾30間分店。',
      'zh-CN': '美食集团旗下经营多间香港特色茶餐厅及中式餐厅，致力提供地道港式饮食体验，于港九新界设有逾30间分店。',
      en: 'MeiShek Group operates a chain of authentic Hong Kong-style cafes and Chinese restaurants, with over 30 locations across HK Island, Kowloon and NT.',
    },
    companySize: '100–500人',
    store: { 'zh-HK': '銅鑼灣時代廣場', 'zh-CN': '铜锣湾时代广场', en: 'Times Square Causeway Bay' },
    address: { 'zh-HK': '香港銅鑼灣勿地臣街1號時代廣場3樓', 'zh-CN': '香港铜锣湾勿地臣街1号时代广场3楼', en: 'Times Square, 1 Matheson St, Causeway Bay, HK, 3/F' },
    lat: 22.2797,
    lng: 114.1826,
    district: { 'zh-HK': '銅鑼灣', 'zh-CN': '铜锣湾', en: 'Causeway Bay' },
    region: { 'zh-HK': '香港島 · 灣仔區', 'zh-CN': '香港岛 · 湾仔区', en: 'HK Island · Wan Chai District' },
    mtr: { 'zh-HK': '銅鑼灣站', 'zh-CN': '铜锣湾站', en: 'Causeway Bay MTR' },
    salary: 80,
    salaryMax: 90,
    salaryPeriod: 'hourly',
    jobType: 'part-time',
    isUrgent: false,
    isDailyPay: false,
    postedMinutes: 120,
    logo: '美',
    logoColor: '#E5A00D',
    category: { 'zh-HK': '飲食', 'zh-CN': '餐饮', en: 'F&B' },
    requirements: {
      'zh-HK': ['今日 18:00–23:00', '懂廣東話或普通話', '有餐飲經驗優先', '可獨立當值'],
      'zh-CN': ['今日 18:00–23:00', '懂粤语或普通话', '有餐饮经验优先', '可独立当值'],
      en: ['Today 18:00–23:00', 'Cantonese or Mandarin speaker', 'F&B experience preferred', 'Able to work independently'],
    },
    certRequirements: {
      'zh-HK': ['食物衛生證（優先）'],
      'zh-CN': ['食物卫生证（优先）'],
      en: ['Food Hygiene Certificate (preferred)'],
    },
    headcount: 3,
    remainingSpots: 2,
    date: { 'zh-HK': '今日', 'zh-CN': '今日', en: 'Today' },
  },
  {
    id: 3,
    title: { 'zh-HK': '店舖理貨員', 'zh-CN': '店铺理货员', en: 'Stock Replenisher' },
    company: '零售連鎖',
    companyIndustry: '其他' as const,
    workCategory: '服務業/零售門市',
    companyIntro: {
      'zh-HK': '零售連鎖是本港領先的生活百貨零售商，產品涵蓋日用品、食品、家居用品等，在全港設有逾80間門店。',
      'zh-CN': '零售连锁是本港领先的生活百货零售商，产品涵盖日用品、食品、家居用品等，在全港设有逾80间门店。',
      en: 'A leading Hong Kong lifestyle retailer with over 80 stores offering household goods, food and daily necessities.',
    },
    companySize: '1000人以上',
    store: { 'zh-HK': '沙田新城市廣場', 'zh-CN': '沙田新城市广场', en: 'New Town Plaza Sha Tin' },
    address: { 'zh-HK': '新界沙田正街18–24號新城市廣場一期地下', 'zh-CN': '新界沙田正街18–24号新城市广场一期地下', en: 'New Town Plaza Phase 1, 18-24 Shatin Centre St, Sha Tin, NT' },
    lat: 22.3816,
    lng: 114.1879,
    district: { 'zh-HK': '沙田', 'zh-CN': '沙田', en: 'Sha Tin' },
    region: { 'zh-HK': '新界 · 沙田區', 'zh-CN': '新界 · 沙田区', en: 'New Territories · Sha Tin District' },
    mtr: { 'zh-HK': '沙田站', 'zh-CN': '沙田站', en: 'Sha Tin MTR' },
    salary: 2500,
    salaryMax: 3000,
    salaryPeriod: 'monthly',
    jobType: 'full-time',
    isUrgent: false,
    isDailyPay: false,
    postedMinutes: 360,
    logo: '零',
    logoColor: '#374151',
    category: { 'zh-HK': '零售', 'zh-CN': '零售', en: 'Retail' },
    requirements: {
      'zh-HK': ['每週五天', '能搬運貨品', '有零售或貨倉經驗優先', '需體力充沛'],
      'zh-CN': ['每周五天', '能搬运货品', '有零售或货仓经验优先', '需体力充沛'],
      en: ['5 days/week', 'Able to handle goods', 'Retail/warehouse experience preferred', 'Good physical fitness'],
    },
    certRequirements: {
      'zh-HK': ['無特定要求'],
      'zh-CN': ['无特定要求'],
      en: ['No specific certificate required'],
    },
    headcount: 2,
    remainingSpots: 1,
    date: { 'zh-HK': '長期', 'zh-CN': '长期', en: 'Ongoing' },
  },
  {
    id: 4,
    title: { 'zh-HK': '倉務員（散工）', 'zh-CN': '仓务员（散工）', en: 'Warehouse Picker (Casual)' },
    company: 'SF Express 順豐速運',
    companyIndustry: '其他' as const,
    workCategory: '物流運輸',
    companyIntro: {
      'zh-HK': '順豐速運是中國最具規模的快遞物流企業之一，在香港設有完善的配送網絡及多個分揀中心，提供本地及跨境速遞服務。',
      'zh-CN': '顺丰速运是中国最具规模的快递物流企业之一，在香港设有完善的配送网络及多个分拣中心，提供本地及跨境速递服务。',
      en: 'SF Express is one of China\'s leading courier and logistics companies, operating an extensive delivery network and sorting centers in Hong Kong.',
    },
    companySize: '1000人以上',
    store: { 'zh-HK': '荃灣倉庫', 'zh-CN': '荃湾仓库', en: 'Tsuen Wan Warehouse' },
    address: { 'zh-HK': '新界荃灣楊屋道28號順豐中心', 'zh-CN': '新界荃湾杨屋道28号顺丰中心', en: '28 Yeung Uk Rd, Tsuen Wan, NT (SF Centre)' },
    lat: 22.3707,
    lng: 114.1121,
    district: { 'zh-HK': '荃灣', 'zh-CN': '荃湾', en: 'Tsuen Wan' },
    region: { 'zh-HK': '新界 · 荃灣區', 'zh-CN': '新界 · 荃湾区', en: 'New Territories · Tsuen Wan District' },
    mtr: { 'zh-HK': '荃灣站', 'zh-CN': '荃湾站', en: 'Tsuen Wan MTR' },
    salary: 950,
    salaryPeriod: 'daily',
    jobType: 'casual',
    isUrgent: true,
    isDailyPay: true,
    postedMinutes: 15,
    logo: 'S',
    logoColor: '#E85D04',
    category: { 'zh-HK': '物流倉務', 'zh-CN': '物流仓储', en: 'Logistics' },
    requirements: {
      'zh-HK': ['能搬運重物（30kg以上）', '自備安全鞋', '守時可靠', '可配合輪班'],
      'zh-CN': ['能搬运重物（30kg以上）', '自备安全鞋', '守时可靠', '可配合轮班'],
      en: ['Heavy lifting (30kg+)', 'Safety shoes required', 'Punctual and reliable', 'Shift flexibility'],
    },
    certRequirements: {
      'zh-HK': ['地盤安全卡（優先）'],
      'zh-CN': ['地盘安全卡（优先）'],
      en: ['CIC Safety Card (preferred)'],
    },
    headcount: 10,
    remainingSpots: 8,
    date: { 'zh-HK': '明日', 'zh-CN': '明日', en: 'Tomorrow' },
  },
  {
    id: 5,
    title: { 'zh-HK': '零售店員（兼職）', 'zh-CN': '零售店员（兼职）', en: 'Retail Assistant (Part-time)' },
    company: 'Uniqlo 優衣庫',
    companyIndustry: '其他' as const,
    workCategory: '服務業/零售門市',
    companyIntro: {
      'zh-HK': 'Uniqlo優衣庫是日本迅銷集團旗下的全球連鎖服裝品牌，以高品質日常基本款服飾見稱，在香港設有多間旗艦店及分店。',
      'zh-CN': 'Uniqlo优衣库是日本迅销集团旗下的全球连锁服装品牌，以高品质日常基本款服饰见称，在香港设有多间旗舰店及分店。',
      en: 'Uniqlo is a global casualwear brand under Fast Retailing, known for high-quality everyday basics, operating multiple flagship stores in Hong Kong.',
    },
    companySize: '500–1000人',
    store: { 'zh-HK': '觀塘apm', 'zh-CN': '观塘apm', en: 'Kwun Tong apm' },
    address: { 'zh-HK': '九龍觀塘道418號apm購物中心L2', 'zh-CN': '九龙观塘道418号apm购物中心L2', en: 'apm, 418 Kwun Tong Rd, Kwun Tong, Kowloon, L2' },
    lat: 22.3124,
    lng: 114.2257,
    district: { 'zh-HK': '觀塘', 'zh-CN': '观塘', en: 'Kwun Tong' },
    region: { 'zh-HK': '九龍 · 觀塘區', 'zh-CN': '九龙 · 观塘区', en: 'Kowloon · Kwun Tong District' },
    mtr: { 'zh-HK': '觀塘站', 'zh-CN': '观塘站', en: 'Kwun Tong MTR' },
    salary: 72,
    salaryPeriod: 'hourly',
    jobType: 'part-time',
    isUrgent: false,
    isDailyPay: false,
    postedMinutes: 240,
    logo: 'U',
    logoColor: '#CC0000',
    category: { 'zh-HK': '零售', 'zh-CN': '零售', en: 'Retail' },
    requirements: {
      'zh-HK': ['英文流利', '週末可上班', '有零售經驗優先', '親切有禮'],
      'zh-CN': ['英文流利', '周末可上班', '有零售经验优先', '亲切有礼'],
      en: ['Fluent English', 'Weekend availability', 'Retail experience preferred', 'Friendly attitude'],
    },
    certRequirements: {
      'zh-HK': ['無特定要求'],
      'zh-CN': ['无特定要求'],
      en: ['No specific certificate required'],
    },
    headcount: 4,
    remainingSpots: 3,
    date: { 'zh-HK': '週末', 'zh-CN': '周末', en: 'Weekend' },
  },
  {
    id: 6,
    title: { 'zh-HK': '保安員（夜班）', 'zh-CN': '保安员（夜班）', en: 'Security Guard (Night Shift)' },
    company: 'Galaxy Security',
    companyIndustry: '家政/物業' as const,
    workCategory: '保安及物業',
    companyIntro: {
      'zh-HK': 'Galaxy Security是本港具實力的保安服務公司，為商業大廈、住宅及商場提供專業保安服務，持有保安行業監管局認可牌照。',
      'zh-CN': 'Galaxy Security是本港具实力的保安服务公司，为商业大厦、住宅及商场提供专业保安服务，持有保安行业监管局认可牌照。',
      en: 'Galaxy Security is a reputable Hong Kong security services company, providing licensed professional security for commercial buildings, residences and shopping malls.',
    },
    companySize: '100–500人',
    store: { 'zh-HK': '將軍澳商業中心', 'zh-CN': '将军澳商业中心', en: 'TKO Commercial Centre' },
    address: { 'zh-HK': '新界將軍澳唐賢街23號新都城中心第二期', 'zh-CN': '新界将军澳唐贤街23号新都城中心第二期', en: 'Metro City II, 23 Tong Yin St, Tseung Kwan O, NT' },
    lat: 22.3078,
    lng: 114.2596,
    district: { 'zh-HK': '將軍澳', 'zh-CN': '将军澳', en: 'Tseung Kwan O' },
    region: { 'zh-HK': '新界 · 西貢區', 'zh-CN': '新界 · 西贡区', en: 'New Territories · Sai Kung District' },
    mtr: { 'zh-HK': '坑口站', 'zh-CN': '坑口站', en: 'Hang Hau MTR' },
    salary: 16800,
    salaryPeriod: 'monthly',
    jobType: 'full-time',
    isUrgent: true,
    isDailyPay: false,
    postedMinutes: 60,
    logo: 'G',
    logoColor: '#1A3A6B',
    category: { 'zh-HK': '保安', 'zh-CN': '保安', en: 'Security' },
    requirements: {
      'zh-HK': ['可輪班（夜班為主）', '體格良好', '守紀律有責任心', '有保安工作經驗優先'],
      'zh-CN': ['可轮班（夜班为主）', '体格良好', '守纪律有责任心', '有保安工作经验优先'],
      en: ['Shift work (mainly night)', 'Good physical condition', 'Disciplined and responsible', 'Security experience preferred'],
    },
    certRequirements: {
      'zh-HK': ['保安員牌照（丙類）— 必須持有'],
      'zh-CN': ['保安员牌照（丙类）— 必须持有'],
      en: ['Security Personnel Permit (Cat C) — mandatory'],
    },
    headcount: 3,
    remainingSpots: 2,
    date: { 'zh-HK': '長期', 'zh-CN': '长期', en: 'Ongoing' },
  },
  {
    id: 7,
    title: { 'zh-HK': '地盤雜工（散工）', 'zh-CN': '地盘杂工（散工）', en: 'Construction Labourer' },
    company: 'Hip Hing Construction',
    companyIndustry: '建築業' as const,
    workCategory: '建造業',
    companyIntro: {
      'zh-HK': '協興建築是香港具規模的承建商之一，承接各類公私營建築工程，旗下工地分布全港各區，注重安全管理及員工福利。',
      'zh-CN': '协兴建筑是香港具规模的承建商之一，承接各类公私营建筑工程，旗下工地分布全港各区，注重安全管理及员工福利。',
      en: 'Hip Hing Construction is a major Hong Kong contractor handling public and private building projects across all districts, prioritising site safety and staff welfare.',
    },
    companySize: '500–1000人',
    store: { 'zh-HK': '元朗工地', 'zh-CN': '元朗工地', en: 'Yuen Long Site' },
    address: { 'zh-HK': '新界元朗錦田公路旁元朗工業邨', 'zh-CN': '新界元朗锦田公路旁元朗工业邨', en: 'Yuen Long Industrial Estate, Kam Tin Rd, Yuen Long, NT' },
    lat: 22.4452,
    lng: 114.0338,
    district: { 'zh-HK': '元朗', 'zh-CN': '元朗', en: 'Yuen Long' },
    region: { 'zh-HK': '新界 · 元朗區', 'zh-CN': '新界 · 元朗区', en: 'New Territories · Yuen Long District' },
    mtr: { 'zh-HK': '元朗站', 'zh-CN': '元朗站', en: 'Yuen Long MTR' },
    salary: 1200,
    salaryPeriod: 'daily',
    jobType: 'casual',
    isUrgent: false,
    isDailyPay: true,
    postedMinutes: 360,
    logo: '協',
    logoColor: '#374151',
    category: { 'zh-HK': '建築', 'zh-CN': '建筑', en: 'Construction' },
    requirements: {
      'zh-HK': ['體力充沛，能搬重物', '遵守地盤安全守則', '準時上班', '有建築工作經驗優先'],
      'zh-CN': ['体力充沛，能搬重物', '遵守地盘安全守则', '准时上班', '有建筑工作经验优先'],
      en: ['Good physical fitness, heavy lifting', 'Follow site safety rules', 'Punctual', 'Construction experience preferred'],
    },
    certRequirements: {
      'zh-HK': ['建造業安全卡 — 必須持有', '升降機安全操作證（優先）'],
      'zh-CN': ['建造业安全卡 — 必须持有', '升降机安全操作证（优先）'],
      en: ['CIC Safety Card — mandatory', 'Lift operator cert (preferred)'],
    },
    headcount: 6,
    remainingSpots: 4,
    date: { 'zh-HK': '本週', 'zh-CN': '本周', en: 'This Week' },
  },
  {
    id: 8,
    title: { 'zh-HK': '派傳單推廣員', 'zh-CN': '派传单推广员', en: 'Promoter' },
    company: 'MediaLink Promotions',
    companyIndustry: '其他' as const,
    workCategory: '推銷和中介',
    companyIntro: {
      'zh-HK': 'MediaLink是香港本地市場推廣公司，專注於地推活動、品牌推廣及戶外宣傳，服務涵蓋各類消費品及零售品牌。',
      'zh-CN': 'MediaLink是香港本地市场推广公司，专注于地推活动、品牌推广及户外宣传，服务涵盖各类消费品及零售品牌。',
      en: 'MediaLink is a Hong Kong marketing agency specialising in ground promotions, brand activations and outdoor campaigns for consumer and retail brands.',
    },
    companySize: '50–100人',
    store: { 'zh-HK': '深水埗黃金商場', 'zh-CN': '深水埗黄金商场', en: 'Golden Centre Sham Shui Po' },
    address: { 'zh-HK': '九龍深水埗黃金商場旁（基隆街與桂林街交界）', 'zh-CN': '九龙深水埗黄金商场旁（基隆街与桂林街交界）', en: 'Near Golden Centre, junction of Ki Lung St & Kweilin St, Sham Shui Po, Kowloon' },
    lat: 22.3295,
    lng: 114.1628,
    district: { 'zh-HK': '深水埗', 'zh-CN': '深水埗', en: 'Sham Shui Po' },
    region: { 'zh-HK': '九龍 · 深水埗區', 'zh-CN': '九龙 · 深水埗区', en: 'Kowloon · Sham Shui Po District' },
    mtr: { 'zh-HK': '深水埗站', 'zh-CN': '深水埗站', en: 'Sham Shui Po MTR' },
    salary: 700,
    salaryPeriod: 'daily',
    jobType: 'casual',
    isUrgent: true,
    isDailyPay: true,
    postedMinutes: 20,
    logo: 'M',
    logoColor: '#9333EA',
    category: { 'zh-HK': '推廣活動', 'zh-CN': '推广活动', en: 'Promotions' },
    requirements: {
      'zh-HK': ['開朗有禮', '可即日上工', '普通話或廣東話流利', '有推廣經驗優先'],
      'zh-CN': ['开朗有礼', '可即日上岗', '普通话或粤语流利', '有推广经验优先'],
      en: ['Outgoing and polite', 'Immediate start', 'Cantonese or Mandarin fluent', 'Promotions experience preferred'],
    },
    certRequirements: {
      'zh-HK': ['無特定要求'],
      'zh-CN': ['无特定要求'],
      en: ['No specific certificate required'],
    },
    headcount: 8,
    remainingSpots: 6,
    date: { 'zh-HK': '今日', 'zh-CN': '今日', en: 'Today' },
  },
];

export function formatTime(minutes: number, lang: Language): string {
  if (lang === 'en') {
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return `${Math.floor(minutes / 1440)}d ago`;
  }
  if (minutes < 60) return `${minutes}分鐘前`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}小時前`;
  return `${Math.floor(minutes / 1440)}天前`;
}
