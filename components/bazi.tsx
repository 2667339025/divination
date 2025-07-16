"use client";
import { useState } from "react";
import { Button } from "./ui/button";
import { Calendar } from "lucide-react";

function getElementFromTianGan(tianGan: string): string {
  switch(tianGan) {
    case '甲':
    case '乙': return '木';
    case '丙':
    case '丁': return '火';
    case '戊':
    case '己': return '土';
    case '庚':
    case '辛': return '金';
    case '壬':
    case '癸': return '水';
    default: return '';
  }
}

function getElementFromDiZhi(diZhi: string): string {
  switch(diZhi) {
    case '寅':
    case '卯': return '木';
    case '巳':
    case '午': return '火';
    case '辰':
    case '戌':
    case '丑':
    case '未': return '土';
    case '申':
    case '酉': return '金';
    case '亥':
    case '子': return '水';
    default: return '';
  }
}

function Bazi() {
  const [name, setName] = useState("");
  const [calendarType, setCalendarType] = useState<"solar" | "lunar">("solar");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState("");

  const handleSubmit = async () => {
    if (!birthDate || !birthTime) {
      setResult("请填写完整的出生信息");
      return;
    }

    setResult("");
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/bazi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          calendarType,
          birthDate,
          birthTime,
          gender,
        }),
      });

      if (!response.ok) throw new Error("分析失败");
      const data = await response.json();
      setResult(data.data?.analysis || "分析完成");
    } catch (error) {
      setResult("分析失败，请重试");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="mx-auto max-w-2xl space-y-6 py-0 flex-grow">
          <div className="space-y-4">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">姓名</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="请输入姓名"
              />
            </div>
            <div className="w-40 space-y-2">
              <label className="text-sm font-medium">性别</label>
              <div className="flex space-x-2">
                <Button
                  variant={gender === "male" ? "default" : "outline"}
                  onClick={() => setGender("male")}
                  className="flex-1"
                >
                  男
                </Button>
                <Button
                  variant={gender === "female" ? "default" : "outline"}
                  onClick={() => setGender("female")}
                  className="flex-1"
                >
                  女
                </Button>
              </div>
            </div>
          </div>


          <div className="flex gap-4">
            <div className="w-32 space-y-2">
              <label className="text-sm font-medium">日历类型</label>
              <div className="flex space-x-2">
                <Button
                  variant={calendarType === "solar" ? "default" : "outline"}
                  onClick={() => setCalendarType("solar")}
                  className="flex-1"
                >
                  阳历
                </Button>
                <Button
                  variant={calendarType === "lunar" ? "default" : "outline"}
                  onClick={() => setCalendarType("lunar")}
                  className="flex-1"
                >
                  阴历
                </Button>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">
                {calendarType === "solar" ? "阳历日期" : "阴历日期"}
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="w-32 space-y-2">
              <label className="text-sm font-medium">出生时间</label>
              <input
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={isAnalyzing}
            className="w-48 mx-auto block flex items-center justify-center py-2"
          >
            <Calendar className="mr-2 h-4 w-4" />
            {isAnalyzing ? "分析中..." : "开始分析"}
          </Button>

          {result && (
            <div className="flex flex-col gap-3 mt-4">
              <div className="mb-1 flex w-fit items-center gap-1 border-b pr-1 pb-2 animate-in fade-in slide-in-from-bottom-30 fill-mode-backwards duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-blend" aria-hidden="true">
                  <circle cx="9" cy="9" r="7"></circle>
                  <circle cx="15" cy="15" r="7"></circle>
                </svg>
                四柱八字
              </div>
              <div className="bg-sidebar flex flex-col gap-3 rounded-sm border p-4 animate-in fade-in slide-in-from-bottom-30 fill-mode-backwards duration-300">
                <span className="text-muted-foreground mx-auto">{result.split('\n').find(l => l.includes('出生')) || '八字分析结果'}</span>
                <div className="bg-background p-4 rounded shadow-md">
                  <div className="z-10 flex justify-around gap-8 delay-75 animate-in fade-in slide-in-from-bottom-30 fill-mode-backwards duration-300">
                  {result.split('\n')
                    .filter(l => l.includes('八字：'))
                    .flatMap(l => l.replace('八字：','').split(' '))
                    .slice(0,4)
                    .map((pillar, i) => {
                      const [tianGan, diZhi] = pillar.split('');
                      const elementTianGan = getElementFromTianGan(tianGan);
                      const elementDiZhi = getElementFromDiZhi(diZhi);
                      return (
                        <div key={i} className="bg-background flex flex-col items-center rounded-sm border shadow-xs mx-2 w-[100px]">
                          <div className="w-full border-b text-center font-semibold">{['年柱','月柱','日柱','时柱'][i]}</div>
                          <div className="relative flex flex-col items-center p-3 gap-1">
                            <div className="relative px-8 py-2 text-center">
                                <span className={`rounded-sm px-2 py-1 ${tianGan === '甲' || tianGan === '乙' ? 'bg-[#B9F8CF] dark:bg-green-900 text-black' : tianGan === '丙' || tianGan === '丁' ? 'bg-[#FFC9C9] dark:bg-pink-600 text-black' : tianGan === '戊' || tianGan === '己' ? 'bg-[#79716B] dark:bg-stone-500 text-white' : tianGan === '庚' || tianGan === '辛' ? 'bg-[#FFF085] dark:bg-yellow-600 text-black' : 'bg-[#BEDBFF] dark:bg-blue-600 text-black'}`}>{tianGan}</span>
                                <span className={`absolute top-[65%] right-3 text-[12px] transform -translate-y-1/2 ${tianGan === '甲' || tianGan === '乙' ? 'text-black' : tianGan === '丙' || tianGan === '丁' ? 'text-black' : tianGan === '戊' || tianGan === '己' ? 'text-white' : tianGan === '庚' || tianGan === '辛' ? 'text-black' : 'text-black'}`}>{elementTianGan}</span>
                                <span className="text-muted-foreground absolute top-0 right-1 text-[16px] opacity-30">天</span>
                                </div>
                            <div className="relative px-8 py-2 text-center">
                                <span className={`rounded-sm px-2 py-1 ${diZhi === '甲' || diZhi === '乙' ? 'bg-[#B9F8CF] dark:bg-green-900 text-black' : diZhi === '丙' || diZhi === '丁' ? 'bg-[#FFC9C9] dark:bg-pink-600 text-black' : diZhi === '戊' || diZhi === '己' ? 'bg-[#79716B] dark:bg-stone-500 text-white' : diZhi === '庚' || diZhi === '辛' ? 'bg-[#FFF085] dark:bg-yellow-600 text-black' : 'bg-[#BEDBFF] dark:bg-blue-600 text-black'}`}>{diZhi}</span>
                                <span className={`absolute top-[65%] right-3 text-[12px] transform -translate-y-1/2 ${diZhi === '子' || diZhi === '亥' ? 'text-black' : diZhi === '寅' || diZhi === '卯' ? 'text-black' : diZhi === '巳' || diZhi === '午' ? 'text-black' : diZhi === '申' || diZhi === '酉' ? 'text-black' : diZhi === '辰' || diZhi === '戌' || diZhi === '丑' || diZhi === '未' ? 'text-white' : 'text-black'}`}>{elementDiZhi}</span>
                                <span className="text-muted-foreground absolute top-0 right-1 text-[16px] opacity-30">地</span>
                              </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
                <div className="relative">
                  <div className="bg-primary/10 absolute left-0 right-0 h-px mx-8 top-1/2 -translate-y-1/2 z-0"></div>
                </div>
                <div className="bg-[#FAFAF9] relative z-10 mx-4 sm:mx-4 rounded-sm border py-2 text-center whitespace-break-spaces shadow-xs delay-100 animate-in fade-in slide-in-from-bottom-30 fill-mode-backwards duration-300">
                  <span className="absolute left-2 flex items-center gap-1 font-semibold">五行<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right" aria-hidden="true"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg></span>
                  <div className="flex justify-center gap-4">
                    {['金','木','水','火','土'].map((element) => {
                      const count = result.split('\n').filter(line => line.includes(element)).length;
                      return (
                        <span key={element} className="flex items-center gap-1">
                          <span>{element}:</span>
                          <span className="font-semibold">{count}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
                <div className="relative">
                  <div className="bg-primary/10 absolute left-0 right-0 h-px mx-8 top-1/2 -translate-y-1/2 z-0"></div>
                </div>
                <div className="bg-background/50 z-10 ml-4 flex w-fit items-center gap-1 rounded-sm border px-2 py-1 font-semibold shadow-xs delay-150 sm:ml-4 animate-in fade-in slide-in-from-bottom-30 fill-mode-backwards duration-300">
                  纳音<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right" aria-hidden="true"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                </div>
                <div className="z-10 flex justify-around gap-8 delay-200 animate-in fade-in slide-in-from-bottom-30 fill-mode-backwards duration-300">
                  {result.split('\n')
                    .filter(l => l.includes('纳音：'))
                    .flatMap(l => l.replace('纳音：','').split(' '))
                    .slice(0,4)
                    .map((nayin, i) => (
                      <div key={`nayin-${i}`} className="bg-background/50 text-muted-foreground relative rounded-sm border px-4 py-0.5 shadow-xs mx-2">
                        {nayin}
                      </div>
                    ))
                    }
                </div>
              </div>
        </div>
        </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Bazi;