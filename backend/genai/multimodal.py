"""Layer 8 — OpenAI multimodal extraction for PDF and audio."""
import os
import base64
import json

OPENAI_KEY = os.environ.get("OPENAI_API_KEY", "")

VITALS_KEYS = ["hr", "bp_systolic", "bp_diastolic", "spo2", "rr", "temp", "age", "sex", "cholesterol", "max_hr"]

PDF_EXTRACTION_PROMPT = """This is a medical report. Extract any vital signs, lab values, or patient demographics present.

Return ONLY a JSON object with these exact keys (use null for missing values):
{
  "hr": number or null,
  "bp_systolic": number or null,
  "bp_diastolic": number or null,
  "spo2": number or null,
  "rr": number or null,
  "temp": number or null,
  "age": number or null,
  "sex": "M" or "F" or null,
  "cholesterol": number or null,
  "max_hr": number or null
}

Nothing else. No explanation. No markdown. Only the JSON object."""

VOICE_PROMPT = """This is a voice recording of a clinician dictating patient vital signs.
Transcribe what you hear, then extract the vital signs into JSON.

Return ONLY:
{
  "transcript": "full transcription",
  "vitals": {
    "hr": number or null,
    "bp_systolic": number or null,
    "bp_diastolic": number or null,
    "spo2": number or null,
    "rr": number or null,
    "temp": number or null
  }
}"""


async def embed_pdf_and_extract_vitals(pdf_bytes: bytes) -> dict:
    if not OPENAI_KEY:
        return _pdf_fallback("OpenAI API key not configured.")

    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=OPENAI_KEY)

        b64_pdf = base64.b64encode(pdf_bytes).decode()

        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[{
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": PDF_EXTRACTION_PROMPT,
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:application/pdf;base64,{b64_pdf}",
                        },
                    },
                ],
            }],
            max_tokens=300,
        )

        raw_text = response.choices[0].message.content.strip()
        if raw_text.startswith("```"):
            raw_text = raw_text.split("```")[1]
            if raw_text.startswith("json"):
                raw_text = raw_text[4:]

        vitals_raw = json.loads(raw_text)
        vitals = {k: v for k, v in vitals_raw.items() if v is not None}
        found = list(vitals.keys())
        missing = [k for k in VITALS_KEYS if k not in vitals]

        return {
            "vitals": vitals,
            "fields_found": found,
            "fields_missing": missing,
            "confidence": round(len(found) / len(VITALS_KEYS), 2),
            "method": "gpt-4o extraction",
            "raw_text_preview": "",
        }

    except json.JSONDecodeError:
        return _pdf_fallback("Could not parse extraction response as JSON.")
    except Exception as e:
        return _pdf_fallback(str(e))


def _pdf_fallback(reason: str) -> dict:
    return {
        "vitals": {},
        "fields_found": [],
        "fields_missing": VITALS_KEYS,
        "confidence": 0.0,
        "method": f"fallback ({reason})",
        "raw_text_preview": "",
    }


async def voice_to_vitals(audio_bytes: bytes, mime_type: str) -> dict:
    if not OPENAI_KEY:
        return {
            "vitals": {},
            "transcript": "",
            "fields_found": [],
            "confidence": 0.0,
            "error": "OpenAI API key not configured.",
        }

    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=OPENAI_KEY)

        # Step 1 — transcribe audio with Whisper
        transcript_response = await client.audio.transcriptions.create(
            model="whisper-1",
            file=("recording.webm", audio_bytes, mime_type),
        )
        transcript = transcript_response.text

        # Step 2 — extract vitals from transcript with GPT-4o
        extraction_response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[{
                "role": "user",
                "content": (
                    f"Extract vital signs from this clinical dictation as JSON.\n"
                    f"Transcript: {transcript}\n\n"
                    f"Return ONLY JSON with keys: hr, bp_systolic, bp_diastolic, spo2, rr, temp (numbers or null)."
                ),
            }],
            max_tokens=200,
        )

        raw = extraction_response.choices[0].message.content.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]

        vitals_raw = json.loads(raw)
        vitals = {k: v for k, v in vitals_raw.items() if v is not None}
        found = list(vitals.keys())

        return {
            "vitals": vitals,
            "transcript": transcript,
            "fields_found": found,
            "confidence": round(len(found) / 6, 2),
        }

    except Exception as e:
        return {
            "vitals": {},
            "transcript": "",
            "fields_found": [],
            "confidence": 0.0,
            "error": str(e),
        }
