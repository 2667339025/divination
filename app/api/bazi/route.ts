import { NextResponse } from "next/server";
import { analyzeBazi } from "@/lib/bazi";

export async function POST(request: Request) {
  try {
    const { name, calendarType, birthDate, birthTime, gender } = await request.json();
    
    // 验证输入
    if (!birthDate || !birthTime || !gender || !calendarType) {
      return NextResponse.json(
        { error: "缺少必要参数" },
        { status: 400 }
      );
    }

    // 调用八字分析逻辑
    const result = await analyzeBazi(name || '', calendarType, birthDate, birthTime, gender);
    
    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('八字分析失败:', error);
    return NextResponse.json(
      { 
        error: "八字分析失败",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}