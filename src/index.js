export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/chat" && request.method === "POST") {
      try {
        const body = await request.json();
        const message = body.message?.trim();

        if (!message) {
          return Response.json(
            { error: "Mensaje vacío" },
            { status: 400 }
          );
        }

        if (!env.OPENAI_API_KEY) {
          return Response.json(
            { error: "OPENAI_API_KEY no configurada" },
            { status: 500 }
          );
        }

        const response = await fetch(
          "https://api.openai.com/v1/responses",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
              model: "gpt-5",
              instructions:
                "Tu nombre es ADAM. Eres un asistente inteligente personal. Responde en español de forma clara, natural y útil.",
              input: message
            })
          }
        );

        const data = await response.json();

        if (!response.ok) {
          return Response.json(
            {
              error: data.error?.message || "Error de OpenAI"
            },
            { status: response.status }
          );
        }

        return Response.json({
          reply: data.output_text || "No he podido generar una respuesta."
        });

      } catch (error) {
        return Response.json(
          { error: "Error interno del servidor" },
          { status: 500 }
        );
      }
    }

    return env.ASSETS.fetch(request);
  }
};
