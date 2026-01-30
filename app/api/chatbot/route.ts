import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Les messages sont requis' },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Cle API OpenAI non configuree' },
        { status: 500 }
      )
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5.2',
        messages: [
          {
            role: 'system',
            content: `Tu es un assistant juridique specialise dans la preparation au CRFPA (examen d'acces a l'ecole d'avocat en France).
Tu aides les etudiants avec leurs questions sur:
- Le droit administratif
- Le droit des obligations
- Le droit prive
- La procedure civile
- La note de synthese

Reponds de maniere claire, structuree et pedagogique. Utilise des exemples concrets quand c'est pertinent.`
          },
          ...messages
        ],
        max_tokens: 2048,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('OpenAI Chat error:', errorData)
      return NextResponse.json(
        { error: 'Erreur lors de la generation de la reponse' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const assistantMessage = data.choices?.[0]?.message?.content

    if (!assistantMessage) {
      return NextResponse.json(
        { error: 'Reponse vide du modele' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: assistantMessage })
  } catch (error) {
    console.error('Chatbot API error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
