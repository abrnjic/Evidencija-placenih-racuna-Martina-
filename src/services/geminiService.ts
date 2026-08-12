import { GoogleGenerativeAI } from '@google/generative-ai';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const scanReceiptWithAI = async (base64Image: string): Promise<{ amount: string, category: string, note: string, dueDate: string, iban: string, model: string, pozivNaBroj: string } | null> => {
  try {
    const apiKey = await AsyncStorage.getItem('geminiApiKey');
    if (!apiKey) {
      throw new Error('API_KEY_MISSING');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
Analiziraj ovu sliku računa/uplatnice. Pronađi sljedeće informacije i vrati ih ISKLJUČIVO u JSON formatu bez markdown oznaka (bez \`\`\`json):
{
  "amount": "iznos računa (samo broj u EUR formatu, npr 15.50)",
  "category": "Kategorija (jedna od: Struja, Voda, Plin, Smeće, Pričuva, Mobitel, Internet, Ostalo - ovisno tko je izdao račun)",
  "dueDate": "Datum dospijeća plaćanja u ISO formatu (YYYY-MM-DD), ako se ne vidi na računu vrati prazan string",
  "iban": "IBAN broj primatelja (kome se uplaćuje), ako postoji. (Npr. HR1234567890123456789)",
  "model": "Model plaćanja (npr. HR00 ili HR99 ili 00), ako postoji",
  "pozivNaBroj": "Poziv na broj primatelja, ako postoji",
  "note": "Kratka napomena koja uključuje naziv izdavatelja računa (npr. Izdavač: HEP)"
}
`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: "image/jpeg"
        }
      }
    ]);

    const responseText = result.response.text();
    const cleanJsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleanJsonStr);

    return {
      amount: data.amount,
      category: data.category,
      dueDate: data.dueDate || '',
      iban: data.iban || '',
      model: data.model || '',
      pozivNaBroj: data.pozivNaBroj || '',
      note: data.note,
    };
  } catch (error) {
    console.error('Error in scanReceiptWithAI:', error);
    throw error;
  }
};
