"""PDF parser — PyMuPDF regex-first, Gemini LLM cleanup if key is present."""
import re
import os

GEMINI_KEY = os.environ.get("GEMINI_API_KEY", "")

VITAL_PATTERNS = {
    "hr":           [r"heart\s*rate[:\s]+(\d{2,3})", r"\bhr[:\s]+(\d{2,3})\b", r"pulse[:\s]+(\d{2,3})"],
    "bp_systolic":  [r"blood\s*pressure[:\s]+(\d{2,3})/(\d{2,3})", r"\bbp[:\s]+(\d{2,3})/(\d{2,3})\b"],
    "bp_diastolic": [],  # extracted together with systolic
    "spo2":         [r"spo2[:\s]+(\d{2,3})\s*%?", r"oxygen\s*sat\w*[:\s]+(\d{2,3})\s*%?", r"o2\s*sat[:\s]+(\d{2,3})\s*%?"],
    "rr":           [r"resp\w*\s*rate[:\s]+(\d{1,2})", r"\brr[:\s]+(\d{1,2})\b"],
    "temp":         [r"temp\w*[:\s]+([\d.]+)\s*°?[cf]?", r"temperature[:\s]+([\d.]+)"],
    "age":          [r"\bage[:\s]+(\d{1,3})\b"],
    "sex":          [r"\bsex[:\s]+(male|female|m|f)\b", r"\bgender[:\s]+(male|female|m|f)\b"],
    "cholesterol":  [r"cholesterol[:\s]+(\d{2,3})\s*mg", r"chol[:\s]+(\d{2,3})"],
}

SEX_MAP = {"male": "M", "m": "M", "female": "F", "f": "F"}


def _extract_with_regex(text: str) -> dict:
    text_lower = text.lower()
    vitals = {}

    for field, patterns in VITAL_PATTERNS.items():
        if field == "bp_diastolic":
            continue
        for pattern in patterns:
            m = re.search(pattern, text_lower)
            if m:
                if field == "bp_systolic":
                    vitals["bp_systolic"] = int(m.group(1))
                    vitals["bp_diastolic"] = int(m.group(2))
                elif field == "sex":
                    vitals["sex"] = SEX_MAP.get(m.group(1).lower(), m.group(1).upper())
                elif field == "temp":
                    vitals["temp"] = float(m.group(1))
                else:
                    try:
                        vitals[field] = int(m.group(1))
                    except ValueError:
                        vitals[field] = float(m.group(1))
                break

    return vitals


async def parse_pdf_vitals(pdf_bytes: bytes) -> dict:
    # Step 1: Extract text with PyMuPDF
    raw_text = ""
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        for page in doc:
            raw_text += page.get_text()
        doc.close()
    except Exception as e:
        return {
            "vitals": {},
            "fields_found": [],
            "fields_missing": list(VITAL_PATTERNS.keys()),
            "confidence": 0.0,
            "method": f"pymupdf-failed ({e})",
            "raw_text_preview": "",
            "error": "Unable to parse medical data",
            "detail": "Document does not appear to contain vital sign measurements.",
        }

    if not raw_text.strip():
        return {
            "vitals": {},
            "fields_found": [],
            "fields_missing": list(VITAL_PATTERNS.keys()),
            "confidence": 0.0,
            "method": "empty-pdf",
            "raw_text_preview": "",
            "error": "Unable to parse medical data",
            "detail": "Document does not appear to contain vital sign measurements.",
        }

    # Step 2: Regex extraction
    vitals = _extract_with_regex(raw_text)
    method = "pymupdf-regex"

    # Step 3: If Gemini key present and regex got < 3 fields, use Gemini to fill gaps
    all_keys = [k for k in VITAL_PATTERNS.keys() if k != "bp_diastolic"] + ["bp_diastolic"]
    if GEMINI_KEY and len(vitals) < 3:
        try:
            from genai.multimodal import embed_pdf_and_extract_vitals
            gemini_result = await embed_pdf_and_extract_vitals(pdf_bytes)
            # Merge: Gemini fills what regex missed
            for k, v in gemini_result.get("vitals", {}).items():
                if k not in vitals:
                    vitals[k] = v
            method = "pymupdf-regex + gemini-flash"
        except Exception:
            pass

    found = [k for k in all_keys if k in vitals]
    missing = [k for k in all_keys if k not in vitals]
    confidence = round(len(found) / max(len(all_keys), 1), 2)

    return {
        "vitals": vitals,
        "fields_found": found,
        "fields_missing": missing,
        "confidence": confidence,
        "method": method,
        "raw_text_preview": raw_text[:200].strip(),
    }
