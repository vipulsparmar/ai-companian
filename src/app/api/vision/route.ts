import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();
    if (!image) return NextResponse.json({ error: 'No image provided' }, { status: 400 });

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Call OpenAI Vision API (GPT-4o with image)
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Solve the problem shown in this image. If it is a coding problem, provide a complete code solution and a concise explanation in no more than 3-6 lines. If it is a multiple choice question, select the correct answer and explain your reasoning in 3-6 lines.' },
            { type: 'image_url', image_url: { url: `data:image/png;base64,${image}` } },
          ],
        },
      ],
      max_tokens: 512,
    });

    const answer = response.choices?.[0]?.message?.content || 'No answer.';
    return NextResponse.json({ answer });
  } catch (err: any) {
    console.error('Vision API error:', err);
    return NextResponse.json({ error: 'Vision API error', details: err.message }, { status: 500 });
  }
} 