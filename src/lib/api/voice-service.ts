// /lib/api/voice-service.ts
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      formData.append("model", "whisper-1");
      formData.append("language", "en");
      
      // Use your deployed Cloudflare worker URL
      const response = await fetch("https://whisper.your-domain.com", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.text;
    } catch (error) {
      console.error("Error transcribing audio:", error);
      throw error;
    }
  }
  