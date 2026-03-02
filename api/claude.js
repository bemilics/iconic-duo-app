/**
 * Vercel Serverless Function - Proxy a Claude API
 * Endpoint: /api/claude
 */

export default async function handler(req, res) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { systemPrompt, messages, maxTokens = 2048 } = req.body

  // Validar parámetros requeridos
  if (!systemPrompt || !messages || !Array.isArray(messages)) {
    return res.status(400).json({
      error: 'Missing required parameters: systemPrompt and messages are required'
    })
  }

  // Verificar API key
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('Missing ANTHROPIC_API_KEY environment variable')
    return res.status(500).json({
      error: 'Server configuration error: Missing API key'
    })
  }

  try {
    // Llamar a Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: messages
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Claude API error:', error)
      return res.status(response.status).json({
        error: error.error?.message || 'Error calling Claude API'
      })
    }

    const data = await response.json()

    // Extraer el contenido de texto
    const textContent = data.content.find(block => block.type === 'text')
    if (!textContent) {
      return res.status(500).json({
        error: 'No text content in Claude response'
      })
    }

    // Retornar solo el texto
    return res.status(200).json({
      text: textContent.text
    })

  } catch (error) {
    console.error('Error in Claude API handler:', error)
    return res.status(500).json({
      error: 'Internal server error'
    })
  }
}
