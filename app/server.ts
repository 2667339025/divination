"use server";
import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createStreamableValue } from "ai/rsc";
import { ERROR_PREFIX } from "@/lib/constant";

const model = process.env.OPENAI_MODEL ?? "qwen-turbo";
const baseURL = process.env.OPENAI_BASE_URL?.replace(/\/chat\/completions$/, '') || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY, baseURL });

const STREAM_INTERVAL = 60;
const MAX_SIZE = 6;

export async function getAnswer(
  prompt: string,
  guaMark: string,
  guaTitle: string,
  guaResult: string,
  guaChange: string,
) {
  // 调试环境变量和参数
console.log('模型配置:', { model, baseURL: process.env.OPENAI_BASE_URL });
console.log('API_KEY是否存在:', !!process.env.OPENAI_API_KEY);
console.log('请求参数:', { prompt, guaTitle, guaResult, guaChange });
console.log(prompt, guaTitle, guaResult, guaChange);
  const stream = createStreamableValue();
  try {
    const res = await fetch(
      `https://raw.githubusercontent.com/sunls2/zhouyi/main/docs/${guaMark}/index.md`,
    );
    const guaDetail = await res.text();
    const explain = guaDetail
      .match(/(\*\*台灣張銘仁[\s\S]*?)(?=周易第\d+卦)/)?.[1]
      .replaceAll("\n\n", "\n");

    const changeList: string[] = [];
    if (guaChange !== "无变爻") {
      guaChange
        .split(":")[1]
        .trim()
        .split(",")
        .forEach((change) => {
          const detail = guaDetail
            .match(`(\\*\\*${change}變卦[\\s\\S]*?)(?=${guaTitle}|$)`)?.[1]
            .replaceAll("\n\n", "\n");
          if (detail) {
            changeList.push(detail.trim());
          }
        });
    }

    const { fullStream } = streamText({
      temperature: 0.5,
      model: openai(model),
      messages: [
        {
          role: "system",
          content: `你是一位精通《周易》的AI助手，根据用户提供的卦象和问题，提供准确的卦象解读和实用建议
任务要求：逻辑清晰，语气得当
1. 解读卦象：分析主卦、变爻及变卦，解读整体趋势和吉凶
2. 关联问题：针对用户问题，结合卦象信息，提供具体分析
3. 提供建议：根据卦象启示，给出切实可行的建议，帮助用户解决实际问题`,
        },
        {
          role: "user",
          content: `我摇到的卦象：${guaTitle} ${guaResult} ${guaChange}
我的问题：${prompt}

${explain || "未找到卦象详细解释"}
${changeList.length > 0 ? changeList.join("\n") : "无变爻信息"}`,
        },
      ],
      maxRetries: 0,
    });

    let buffer = "";
    let done = false;
    const intervalId = setInterval(() => {
      if (done && buffer.length === 0) {
        clearInterval(intervalId);
        stream.done();
        return;
      }
      if (buffer.length <= MAX_SIZE) {
        stream.update(buffer);
        buffer = "";
      } else {
        const chunk = buffer.slice(0, MAX_SIZE);
        buffer = buffer.slice(MAX_SIZE);
        stream.update(chunk);
      }
    }, STREAM_INTERVAL);

    (async () => {
      for await (const part of fullStream) {
        switch (part.type) {
          case "text-delta":
            buffer += part.textDelta;
            break;
          case "error":
            const err = part.error as any;
            // 输出详细错误信息用于调试
            console.error('API Error:', JSON.stringify(err, null, 2));
            const errorDetails = err.message || err.toString();
            const statusCode = err.status || 'Unknown';
            const errorMessage = `${ERROR_PREFIX} (状态码: ${statusCode}) ${errorDetails}`;
            stream.update(errorMessage);
            break;
        }
      }
    })()
      .catch(console.error)
      .finally(() => {
        done = true;
      });

    return { data: stream.value };
  } catch (err: any) {
    console.error('API Request Error:', JSON.stringify(err, null, 2));
    stream.done();
    return { error: `请求失败: ${err.message ?? err.toString()}` };
  }
}
