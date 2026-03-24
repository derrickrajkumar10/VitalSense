"""MedGemma layer — backed by OpenAI GPT-4o with a clinical system prompt."""
import os
from typing import AsyncGenerator

OPENAI_KEY = os.environ.get("OPENAI_API_KEY", "")

MEDGEMMA_SYSTEM = (
    "You are VitalSense MedAI, an advanced clinical assistant. "
    "You have deep knowledge of internal medicine, cardiology, pulmonology, and emergency care. "
    "You have access to the patient's current vitals and ML predictions. "
    "Answer questions clearly and concisely. Always cite specific vital values when relevant. "
    "Provide evidence-based clinical reasoning. "
    "Always remind the clinician to verify AI-assisted findings with their clinical judgment."
)


def is_available() -> bool:
    return bool(OPENAI_KEY)


async def medgemma_chat_stream(
    messages: list,
    vitals_context: dict = {},
    predictions_context: dict = {},
) -> AsyncGenerator[str, None]:
    if not OPENAI_KEY:
        yield "MedAI is unavailable: OpenAI API key not configured."
        return

    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=OPENAI_KEY)

        vitals_str = ", ".join(f"{k}: {v}" for k, v in vitals_context.items()) if vitals_context else "not provided"
        pred_str = (
            f"Primary condition: {predictions_context.get('primary_condition', 'unknown')}, "
            f"Risk score: {predictions_context.get('overall_risk_score', 'unknown')}"
            if predictions_context else "not provided"
        )
        system_content = (
            f"{MEDGEMMA_SYSTEM}\n\n"
            f"Current vitals: {vitals_str}\n"
            f"Current predictions: {pred_str}"
        )

        openai_messages = [{"role": "system", "content": system_content}]
        for msg in messages:
            openai_messages.append({"role": msg["role"], "content": msg["content"]})

        stream = await client.chat.completions.create(
            model="gpt-4o",
            messages=openai_messages,
            stream=True,
            max_tokens=800,
            temperature=0.3,
        )
        async for chunk in stream:
            delta = chunk.choices[0].delta.content
            if delta:
                yield delta

    except Exception as e:
        yield f"MedAI error: {str(e)}"


# Legacy stub — kept so existing imports don't break
def load_medgemma(model_path: str = ""):
    return True if OPENAI_KEY else None


def get_pipe():
    return None
