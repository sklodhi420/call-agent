const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxPrU4Eg2wyro9jxDLqmL-RKzsJib_mi2m0eXhVnyO24cXDO4azaMWOFlAmWZBNoqts/exec";

export async function trackGoogleSheetEvent(event, email, callId = '') {
  try {
    console.log(`[GoogleSheetsTracker] Sending event: ${event} for ${email} (CallID: ${callId})`);
    
    // Using mode: 'no-cors' because Google Apps Script redirects omit CORS headers
    // The request will successfully hit Google, but we won't be able to read the response.
    // That's perfectly fine since we just want to insert data.
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({ event, email, callId }),
    });
  } catch (err) {
    console.error('[GoogleSheetsTracker] Failed to log:', err);
  }
}
