/**
 * Call the voice prediction API with a Supabase audio URL
 * @param audioUrl - Public URL of the audio file in Supabase
 * @returns Prediction results from the API
 */
export async function predictVoiceFromUrl(audioUrl: string): Promise<any> {
  try {
    const apiUrl = import.meta.env.VITE_VOICE_API_URL || 'http://localhost:8000';
    const endpoint = `${apiUrl}/predict/url`;
    
    console.log('Calling voice prediction API...', { endpoint, audioUrl });
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: audioUrl,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Voice prediction result:', result);
    
    return result;
  } catch (error) {
    console.error('Error calling voice prediction API:', error);
    throw error;
  }
}

