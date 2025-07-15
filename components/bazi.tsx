"use client";
import { useState } from "react";
import { Button } from "./ui/button";
import { Calendar } from "lucide-react";

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
      <div className="mx-auto max-w-md space-y-6 py-2 flex-grow">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold">生辰八字分析</h1>
          <p className="text-gray-500">输入您的出生信息进行八字排盘</p>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">姓名</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="请输入姓名"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
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

            <div className="space-y-2">
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
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
            
            <div className="space-y-2">
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
            className="w-full"
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
              <div className="bg-sidebar flex flex-col gap-3 rounded-sm border p-3 animate-in fade-in slide-in-from-bottom-30 fill-mode-backwards duration-300">
                <span className="text-muted-foreground mx-auto">{result.split('\n').find(l => l.includes('出生')) || '八字分析结果'}</span>
                <div className="z-10 flex justify-around delay-75 animate-in fade-in slide-in-from-bottom-30 fill-mode-backwards duration-300">
                  {result.split('\n')
                    .filter(l => l.includes('八字：'))
                    .flatMap(l => l.replace('八字：','').split(' '))
                    .slice(0,4)
                    .map((pillar, i) => (
                    <div key={i} className="bg-background flex flex-col items-center rounded-sm border shadow-xs">
                      <div className="w-full border-b text-center font-semibold">{['年柱','月柱','日柱','时柱'][i]}</div>
                      <div className="relative flex items-end gap-1 border-b p-3">
                        <div className={`rounded-sm px-1 text-center sm:px-2 ${
                          pillar.includes('甲') || pillar.includes('乙') ? 'bg-green-200 dark:bg-green-600' : 
                          pillar.includes('丙') || pillar.includes('丁') ? 'bg-red-200 dark:bg-red-600' :
                          pillar.includes('戊') || pillar.includes('己') ? 'bg-stone-500 text-background dark:bg-stone-300' :
                          pillar.includes('庚') || pillar.includes('辛') ? 'bg-yellow-200 dark:bg-yellow-600' :
                          'bg-blue-200 dark:bg-blue-600'
                        }`}>
                          {pillar}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {result.split('\n').filter(l => l.includes('五行统计')).length > 0 && (
                  <div className="mt-4 space-y-2">
                    {result.split('\n').filter(l => l.includes('五行统计')).map((line, i) => (
                      <div key={`wuxing-${i}`} className="text-sm">
                        {line}
                      </div>
                    ))}
                  </div>
                )}
                {result.split('\n').filter(l => l.includes('纳音')).length > 0 && (
                  <div className="mt-4 space-y-2">
                    {result.split('\n').filter(l => l.includes('纳音')).map((line, i) => (
                      <div key={`nayin-${i}`} className="text-sm">
                        {line}
                      </div>
                    ))}
                  </div>
                )}
                {result.split('\n').filter(l => l.includes('十神')).length > 0 && (
                  <div className="mt-4 space-y-2">
                    {result.split('\n').filter(l => l.includes('十神')).map((line, i) => (
                      <div key={`shishen-${i}`} className="text-sm">
                        {line}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-auto"></div>
    </div>
  );
}

export default Bazi;