// 八字分析核心逻辑
import { SolarDay, LunarHour, DefaultEightCharProvider } from 'tyme4ts';

export interface BaziResult {
  pillars: string[];  // 四柱
  elements: string[]; // 五行
  zodiacs: string[];  // 生肖
  analysis: string;   // 命理分析
}

export async function analyzeBazi(
  name: string,
  calendarType: 'solar' | 'lunar',
  birthDate: string,
  birthTime: string,
  gender: 'male' | 'female'
): Promise<BaziResult> {
  // 解析日期时间
  console.log('输入参数:', {birthDate, birthTime, calendarType});
  
  const [year, month, day] = birthDate.split('-').map(Number);
  const [hour, minute] = birthTime.split(':').map(Number);
  
  // 创建日期对象
  let eightChar;
  if (calendarType === 'lunar') {
    const lunarHour = LunarHour.fromYmdHms(year, month, day, hour, minute, 0);
    console.log('农历日期对象:', lunarHour.toString());
    eightChar = lunarHour.getEightChar();
  } else {
    const solar = SolarDay.fromYmd(year, month, day);
    console.log('阳历日期对象:', solar.toString());
    const lunarHour = LunarHour.fromYmdHms(
      solar.getLunarDay().getYear(),
      solar.getLunarDay().getMonth(),
      solar.getLunarDay().getDay(),
      hour,
      minute,
      0
    );
    eightChar = lunarHour.getEightChar();
  }
  
  // 获取八字四柱
  const pillars = [
    eightChar.getYear().toString(),  // 年柱
    eightChar.getMonth().toString(), // 月柱
    eightChar.getDay().toString(),   // 日柱
    eightChar.getHour().toString(),  // 时柱
  ];
  console.log('八字四柱:', pillars);

  // 计算五行
  const elements = pillars.map(pillar => {
    const [tianGan, diZhi] = pillar.split('');
    return `${getElementFromTianGan(tianGan)}${getElementFromDiZhi(diZhi)}`;
  });

  // 计算生肖
  const zodiacs = pillars.map(pillar => {
    const [_, diZhi] = pillar.split('');
    return getZodiacFromDiZhi(diZhi);
  });

  // 计算纳音和十神
  const naYins = pillars.map(pillar => getNaYin(pillar));
  const shiShens = pillars.map(pillar => getShiShen(pillars[2], pillar)); // 以日柱为基准
  
  // 生成详细分析结果
  const analysis = `${name ? `姓名：${name}\n` : ''}${gender === 'male' ? '男' : '女'}命
出生${calendarType === 'solar' ? '阳历' : '阴历'}：${birthDate} ${birthTime}
八字：${pillars.join(' ')}
五行：${elements.join(' ')}
纳音：${naYins.join(' ')}
十神：${shiShens.join(' ')}
生肖：${zodiacs.join(' ')}
${getFortuneAnalysis(pillars, gender)}`;

  return {
    pillars,
    elements,
    zodiacs,
    analysis
  };
}

// 添加简单的命理分析
function getFortuneAnalysis(pillars: string[], gender: 'male' | 'female'): string {
  const [yearPillar, monthPillar, dayPillar, hourPillar] = pillars;
  const dayGan = dayPillar[0];
  
  // 日主强弱分析
  let strength = '中';
  if (['甲', '丙', '戊', '庚', '壬'].includes(dayGan)) {
    strength = gender === 'male' ? '偏强' : '偏弱';
  } else {
    strength = gender === 'male' ? '偏弱' : '偏强';
  }
  
  return `日主${dayGan}${getElementFromTianGan(dayGan)}，${strength}
${getYearFortune(yearPillar)} ${getMonthFortune(monthPillar)}`;
}

function getYearFortune(pillar: string): string {
  const elements = pillar.split('').map(c => 
    c.length === 1 ? getElementFromTianGan(c) : getElementFromDiZhi(c)
  ).join('');
  return `年柱${pillar}(${elements})主${getFortuneDesc(pillar[1])}`;
}

function getMonthFortune(pillar: string): string {
  return `月柱${pillar}主${getFortuneDesc(pillar[1])}`;
}

function getFortuneDesc(zhi: string): string {
  const map: Record<string, string> = {
    '子': '聪明智慧', '丑': '稳重务实', '寅': '积极进取', '卯': '温和细腻',
    '辰': '包容大度', '巳': '灵活多变', '午': '热情开朗', '未': '踏实可靠',
    '申': '机智敏捷', '酉': '精明能干', '戌': '忠诚可靠', '亥': '感性多情'
  };
  return map[zhi] || '运势平稳';
}

// 天干五行映射
function getElementFromTianGan(gan: string): string {
  const map: Record<string, string> = {
    '甲': '木', '乙': '木',
    '丙': '火', '丁': '火',
    '戊': '土', '己': '土',
    '庚': '金', '辛': '金',
    '壬': '水', '癸': '水'
  };
  return map[gan] || '';
}

// 地支五行映射
function getElementFromDiZhi(zhi: string): string {
  const map: Record<string, string> = {
    '子': '水', '丑': '土', '寅': '木', '卯': '木',
    '辰': '土', '巳': '火', '午': '火', '未': '土',
    '申': '金', '酉': '金', '戌': '土', '亥': '水'
  };
  return map[zhi] || '';
}

// 地支生肖映射
function getZodiacFromDiZhi(zhi: string): string {
  const map: Record<string, string> = {
    '子': '鼠', '丑': '牛', '寅': '虎', '卯': '兔',
    '辰': '龙', '巳': '蛇', '午': '马', '未': '羊',
    '申': '猴', '酉': '鸡', '戌': '狗', '亥': '猪'
  };
  return map[zhi] || '';
}

// 纳音五行映射
function getNaYin(pillar: string): string {
  const [tianGan, diZhi] = pillar.split('');
  const ganIndex = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'].indexOf(tianGan);
  const zhiIndex = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'].indexOf(diZhi);
  
  console.log(`计算纳音: ${pillar}, 天干索引: ${ganIndex}, 地支索引: ${zhiIndex}`);
  
  // 修正后的纳音五行表 (60甲子纳音)
  const naYinTable = [
    // 甲子乙丑海中金, 丙寅丁卯炉中火...
    ['海中金','炉中火','大林木','路旁土','剑锋金','山头火'],
    ['涧下水','城头土','白蜡金','杨柳木','泉中水','屋上土'],
    ['霹雳火','松柏木','长流水','砂中金','山下火','平地木'],
    ['壁上土','金箔金','覆灯火','天河水','大驿土','钗钏金'],
    ['桑柘木','大溪水','沙中土','天上火','石榴木','大海水']
  ];
  
  // 每对天干对应6种纳音（每个地支）
  const index = Math.floor(zhiIndex / 2);
  const result = naYinTable[Math.floor(ganIndex / 2)]?.[index] || '';
  console.log(`纳音结果: ${result}`);
  return result;
}

// 十神计算
function getShiShen(dayPillar: string, pillar: string): string {
  const [dayGan] = dayPillar.split('');
  const [gan, zhi] = pillar.split('');
  
  console.log(`计算十神: 日柱${dayPillar}, 当前柱${pillar}`);
  
  const ganOrder = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  const dayIndex = ganOrder.indexOf(dayGan);
  const ganIndex = ganOrder.indexOf(gan);
  
  // 天干五行属性
  const elementMap: Record<string, string> = {
    '甲': '木', '乙': '木',
    '丙': '火', '丁': '火',
    '戊': '土', '己': '土',
    '庚': '金', '辛': '金',
    '壬': '水', '癸': '水'
  };
  
  const dayElement = elementMap[dayGan];
  const ganElement = elementMap[gan];
  
  // 五行生克关系
  const elementRelation = (e1: string, e2: string) => {
    if (e1 === e2) return '同我';
    const cycle = ['木','火','土','金','水'];
    const i1 = cycle.indexOf(e1);
    const i2 = cycle.indexOf(e2);
    if ((i1 + 1) % 5 === i2) return '我生';
    if ((i2 + 1) % 5 === i1) return '生我';
    if ((i1 + 2) % 5 === i2) return '我克';
    return '克我';
  };
  
  const relation = elementRelation(dayElement, ganElement);
  const yinYangSame = (dayIndex % 2) === (ganIndex % 2);
  
  // 根据五行关系和阴阳属性确定十神
  let result = '';
  switch (relation) {
    case '同我':
      result = yinYangSame ? '比肩' : '劫财';
      break;
    case '我生':
      result = yinYangSame ? '食神' : '伤官';
      break;
    case '生我':
      result = yinYangSame ? '偏印' : '正印';
      break;
    case '我克':
      result = yinYangSame ? '偏财' : '正财';
      break;
    case '克我':
      result = yinYangSame ? '七杀' : '正官';
      break;
    default:
      result = '';
  }
  
  console.log(`十神计算: ${dayGan}(${dayElement}) vs ${gan}(${ganElement}) => ${relation}, 阴阳${yinYangSame ? '同' : '异'} => ${result}`);
  return result;
}
