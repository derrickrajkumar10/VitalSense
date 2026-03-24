"""
Layer 7 — Clinical narrative (SSE) and chat stream via OpenAI.
Falls back to a deterministic template when OpenAI is unavailable.
"""
import os
import asyncio
from typing import AsyncGenerator

OPENAI_KEY = os.environ.get("OPENAI_API_KEY", "")

NARRATIVE_PROMPT = """You are VitalSense AI, a clinical documentation assistant embedded in a hospital vitals monitoring system.

PATIENT VITALS:
- Heart Rate: {hr} bpm
- Blood Pressure: {bp_systolic}/{bp_diastolic} mmHg
- SpO2: {spo2}%
- Respiratory Rate: {rr} breaths/min
- Temperature: {temp}°C
- Age: {age}, Sex: {sex}

ML PREDICTION RESULTS:
Primary condition: {primary_condition} (probability: {primary_prob})
All conditions: {conditions_text}
Overall risk: {risk_label}

KEY DRIVERS (SHAP analysis):
{shap_text}

VITAL SIGN TRENDS:
{trend_text}

Write a clinical summary in exactly 3 paragraphs:
Paragraph 1: Current patient status (2-3 sentences). Plain English. State what the vitals show overall.
Paragraph 2: Key risk factors (2-3 sentences). Name specific vital values that are driving the predictions.
Paragraph 3: Recommended actions (2-3 sentences). What the care team should do now.

Tone: clinical, clear, direct. No jargon. No disclaimers. No "I am an AI" statements.
Length: 150-250 words total."""

CHAT_SYSTEM = (
    "You are VitalSense AI, a clinical assistant. "
    "You have access to the patient's current vitals and ML predictions. "
    "Answer questions clearly, cite specific vital values when relevant, "
    "and always recommend consulting a physician for diagnosis."
)


def _build_narrative_prompt(vitals: dict, conditions: list, shap: list, trend: list, patient_context: dict) -> str:
    primary = conditions[0] if conditions else {}
    conditions_text = ", ".join(
        f"{c.get('name','?')}: {c.get('probability',0):.0%}" for c in conditions
    )
    shap_text = "\n".join(
        f"- {s.get('display_name','?')}: SHAP={s.get('shap_score',0):+.3f}" for s in shap[:4]
    )
    trend_text = "\n".join(
        f"- {t.get('display_name','?')}: {t.get('direction','stable')} (Δ{t.get('delta',0):+.1f})"
        for t in trend
    )
    risk_prob = primary.get("probability", 0)
    risk_label = "High" if risk_prob > 0.70 else "Moderate" if risk_prob > 0.40 else "Low"

    return NARRATIVE_PROMPT.format(
        hr=vitals.get("hr", "?"),
        bp_systolic=vitals.get("bp_systolic", "?"),
        bp_diastolic=vitals.get("bp_diastolic", "?"),
        spo2=vitals.get("spo2", "?"),
        rr=vitals.get("rr", "?"),
        temp=vitals.get("temp", "?"),
        age=patient_context.get("age", "unknown"),
        sex=patient_context.get("sex", "unknown"),
        primary_condition=primary.get("name", "Unknown"),
        primary_prob=f"{risk_prob:.0%}",
        conditions_text=conditions_text,
        risk_label=risk_label,
        shap_text=shap_text or "No SHAP data available.",
        trend_text=trend_text or "No trend data available.",
    )


def _deterministic_narrative(vitals: dict, conditions: list) -> str:
    primary = conditions[0] if conditions else {"name": "elevated risk", "probability": 0.5}
    name = primary.get("name", "elevated risk")
    prob = primary.get("probability", 0.5)
    hr = vitals.get("hr", "N/A")
    bp_s = vitals.get("bp_systolic", "N/A")
    bp_d = vitals.get("bp_diastolic", "N/A")
    spo2 = vitals.get("spo2", "N/A")

    return (
        f"The patient presents with vitals indicating {name.lower()} "
        f"(model probability: {prob:.0%}). Heart rate is {hr} bpm, blood pressure is "
        f"{bp_s}/{bp_d} mmHg, and SpO2 is {spo2}%.\n\n"
        f"The primary risk driver identified by the ensemble model is {name}. "
        f"Key contributing factors include the current blood pressure and heart rate readings, "
        f"which fall outside optimal ranges.\n\n"
        f"The care team should review the patient's medication regimen and recent trend data. "
        f"Consider ordering confirmatory labs and scheduling a follow-up assessment within 24 hours "
        f"if values do not improve."
    )


async def generate_narrative_stream(
    vitals: dict, conditions: list, shap: list, trend: list, patient_context: dict
) -> AsyncGenerator[str, None]:
    if not OPENAI_KEY:
        text = _deterministic_narrative(vitals, conditions)
        for word in text.split(" "):
            yield word + " "
            await asyncio.sleep(0.015)
        return

    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=OPENAI_KEY)
        prompt = _build_narrative_prompt(vitals, conditions, shap, trend, patient_context)

        stream = await client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            stream=True,
            max_tokens=400,
            temperature=0.3,
        )
        async for chunk in stream:
            delta = chunk.choices[0].delta.content
            if delta:
                yield delta

    except Exception:
        text = _deterministic_narrative(vitals, conditions)
        for word in text.split(" "):
            yield word + " "
            await asyncio.sleep(0.015)


RECOMMEND_PROMPT = """You are VitalSense AI, a clinical assistant.

PATIENT VITALS: {vitals_text}
PRIMARY CONDITION: {primary_condition} ({primary_prob})
ALL CONDITIONS: {conditions_text}
TOP SHAP DRIVERS: {shap_text}
{narrative_section}
Generate exactly 3 specific clinical action recommendations tailored to this patient's unique report.
Return ONLY a JSON array — no markdown, no explanation:
[
  {{"label": "concise action (max 7 words)", "badge": "+24% Diagnostic", "type": "urgent"}},
  {{"label": "concise action", "badge": "-18% Risk", "type": "moderate"}},
  {{"label": "concise action", "badge": "-12% Tone", "type": "routine"}}
]
type must be one of: urgent, moderate, routine.
badge must start with + or - and include a % and short descriptor."""


async def generate_recommendations(vitals: dict, conditions: list, shap: list, narrative: str = '') -> list:
    primary = conditions[0] if conditions else {}
    vitals_text = ", ".join(f"{k}: {v}" for k, v in vitals.items() if k in ("hr", "bp_systolic", "bp_diastolic", "spo2", "rr", "temp"))
    conditions_text = ", ".join(f"{c.get('name','?')}: {c.get('probability',0):.0%}" for c in conditions)
    shap_text = "; ".join(f"{s.get('display_name','?')} ({s.get('shap_score',0):+.2f})" for s in shap[:4])
    narrative_section = f"CLINICAL SUMMARY:\n{narrative}" if narrative else ""

    fallback = [
        {"label": "Schedule 12-lead ECG", "badge": "+24% Diagnostic", "type": "urgent"},
        {"label": "Review antihypertensive medication", "badge": "-18% Risk", "type": "moderate"},
        {"label": "Daily aerobic exercise protocol", "badge": "-12% Tone", "type": "routine"},
    ]

    if not OPENAI_KEY:
        return fallback

    try:
        import json as _json
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=OPENAI_KEY)
        prompt = RECOMMEND_PROMPT.format(
            vitals_text=vitals_text,
            primary_condition=primary.get("name", "Unknown"),
            primary_prob=f"{primary.get('probability', 0):.0%}",
            conditions_text=conditions_text,
            shap_text=shap_text or "No SHAP data",
            narrative_section=narrative_section,
        )
        resp = await client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300,
            temperature=0.3,
        )
        raw = resp.choices[0].message.content.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        return _json.loads(raw)
    except Exception:
        return fallback


async def generate_chat_stream(
    messages: list, vitals_context: dict, predictions_context: dict
) -> AsyncGenerator[str, None]:
    if not OPENAI_KEY:
        yield "I'm unable to connect to the AI assistant. Please check that the backend is configured with a valid OpenAI API key."
        return

    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=OPENAI_KEY)

        vitals_str = ", ".join(f"{k}: {v}" for k, v in vitals_context.items()) if vitals_context else "not provided"
        clinical_summary = predictions_context.get('clinical_summary', '') if predictions_context else ''
        pred_str = (
            f"Primary condition: {predictions_context.get('primary_condition', 'unknown')}, "
            f"Risk score: {predictions_context.get('overall_risk_score', 'unknown')}"
            if predictions_context else "not provided"
        )
        system_content = (
            f"{CHAT_SYSTEM}\n\n"
            f"Current vitals: {vitals_str}\n"
            f"Current predictions: {pred_str}\n"
            + (f"Clinical summary report: {clinical_summary}\n" if clinical_summary else "")
        )

        openai_messages = [{"role": "system", "content": system_content}]
        for msg in messages:
            openai_messages.append({"role": msg["role"], "content": msg["content"]})

        stream = await client.chat.completions.create(
            model="gpt-4o",
            messages=openai_messages,
            stream=True,
            max_tokens=600,
            temperature=0.4,
        )
        async for chunk in stream:
            delta = chunk.choices[0].delta.content
            if delta:
                yield delta

    except Exception as e:
        yield f"Chat error: {str(e)}"
