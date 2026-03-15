export const getClinicalSummary = async (text) => {
    if (!text || text.trim().length < 10) return "";

    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    // ✅ Modelo corregido: gemini-2.0-flash
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `Sos un asistente médico. Resume esta nota clínica en 2 frases claras y objetivas, sin inventar información: ${text}` }]
                }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("❌ Error API Gemini:", data);
            return "";
        }

        return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } catch (error) {
        console.error("❌ Error de red con Gemini:", error);
        return "";
    }
};