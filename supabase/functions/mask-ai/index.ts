import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 브라우저 CORS Preflight (OPTIONS 요청) 완벽 지원
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, text, systemPrompt, userQuery, model } = await req.json()

    // Supabase Secrets 금고에서 안전하게 API Key 가져오기
    const openRouterKey = Deno.env.get('OPENROUTER_API_KEY')
    const openAiKey = Deno.env.get('OPENAI_API_KEY')
    const apiKey = openRouterKey || openAiKey

    if (!apiKey) {
      throw new Error('Supabase 환경 변수(Secrets)에 OPENROUTER_API_KEY 또는 OPENAI_API_KEY가 등록되지 않았습니다. 대시보드 Settings -> Edge Functions 에서 설정해주세요.')
    }

    const isOpenRouter = apiKey.startsWith('sk-or-') || !!openRouterKey

    // 1. 텍스트 임베딩 추출 요청 (action === 'embed')
    if (action === 'embed') {
      const url = isOpenRouter 
        ? "https://openrouter.ai/api/v1/embeddings"
        : "https://api.openai.com/v1/embeddings"
      
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          ...(isOpenRouter ? { "HTTP-Referer": "https://jeong7-ux.github.io", "X-Title": "Mask RAG App" } : {})
        },
        body: JSON.stringify({
          model: isOpenRouter ? "openai/text-embedding-3-small" : "text-embedding-3-small",
          input: text
        })
      })

      const data = await res.json()
      if (data.error) {
        throw new Error(`[임베딩 API 오류] ${data.error.message || JSON.stringify(data.error)}`)
      }
      
      return new Response(JSON.stringify({ embedding: data.data[0].embedding }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 2. LLM 대화 생성 요청 (action === 'chat')
    if (action === 'chat') {
      const url = isOpenRouter 
        ? "https://openrouter.ai/api/v1/chat/completions"
        : "https://api.openai.com/v1/chat/completions"

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          ...(isOpenRouter ? { "HTTP-Referer": "https://jeong7-ux.github.io", "X-Title": "Mask RAG App" } : {})
        },
        body: JSON.stringify({
          model: model || (isOpenRouter ? "openai/gpt-4o-mini" : "gpt-4o-mini"),
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userQuery }
          ],
          temperature: 0.1
        })
      })

      const data = await res.json()
      if (data.error) {
        throw new Error(`[LLM API 오류] ${data.error.message || JSON.stringify(data.error)}`)
      }

      return new Response(JSON.stringify({ content: data.choices[0].message.content }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    throw new Error(`지원하지 않는 action 입니다: ${action}`)

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || String(error) }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
