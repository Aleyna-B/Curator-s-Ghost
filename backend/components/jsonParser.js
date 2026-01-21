function extractJSON(rawContent) {
    if (!rawContent) throw new Error("Empty response from AI");

    const jsonStart = rawContent.indexOf('{');
    const jsonEnd = rawContent.lastIndexOf('}');

    if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonString = rawContent.substring(jsonStart, jsonEnd + 1);
        return JSON.parse(jsonString);
    }

    // Fallback: Try cleaning markdown code blocks
    const cleanContent = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanContent);
}

module.exports = { extractJSON };