exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Método no permitido. Usa POST." })
    };
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const message = String(body.message || "").trim();

    if (!message) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Falta el texto del mensaje." })
      };
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "No está configurada OPENAI_API_KEY en Netlify. Añádela en Site settings > Environment variables para habilitar la IA."
        })
      };
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Eres ADAM, un asistente útil, claro y directo en español. Responde con brevedad y claridad."
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 250
      })
    });

    const data = await response.json();

    if (!response.ok) {
      const errorText = data?.error?.message || "Error de la API de OpenAI.";
      return {
        statusCode: response.status || 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: errorText,
          details: data
        })
      };
    }

    const reply = data?.choices?.[0]?.message?.content?.trim();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reply: reply || "No he recibido respuesta.",
        memory: body.memory || {}
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Error interno del backend: " + (error && error.message ? error.message : String(error))
      })
    };
  }
};
