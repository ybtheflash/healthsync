// /cloudflare-worker/whisper-worker.js
export default {
    async fetch(request, env) {
      // Handle CORS preflight request
      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "86400",
          },
        });
      }
  
      // Only allow POST requests
      if (request.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
      }
  
      try {
        // Get the audio data from the request
        const formData = await request.formData();
        const audioFile = formData.get("audio");
        
        if (!audioFile) {
          return new Response("No audio file provided", { status: 400 });
        }
  
        // Create a new request to the OpenAI API
        const openaiResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
          },
          body: formData,
        });
  
        if (!openaiResponse.ok) {
          const errorText = await openaiResponse.text();
          return new Response(`OpenAI API error: ${errorText}`, { 
            status: openaiResponse.status,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Content-Type": "application/json",
            }
          });
        }
  
        const result = await openaiResponse.json();
  
        return new Response(JSON.stringify(result), {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
        return new Response(`Error: ${error.message}`, { 
          status: 500,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          }
        });
      }
    },
  };
  