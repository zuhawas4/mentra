import { NextResponse } from "next/server";
import {
  getRecaptchaSecretKey,
  isRecaptchaConfigured,
  RECAPTCHA_MIN_SCORE,
} from "@/lib/recaptcha/config";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      token?: string;
      action?: string;
    };

    if (!isRecaptchaConfigured()) {
      return NextResponse.json({ ok: true, bypassed: true });
    }

    if (!body.token) {
      return NextResponse.json(
        { ok: false, error: "Missing reCAPTCHA token." },
        { status: 400 },
      );
    }

    const params = new URLSearchParams({
      secret: getRecaptchaSecretKey(),
      response: body.token,
    });

    const googleRes = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      },
    );

    const result = (await googleRes.json()) as {
      success?: boolean;
      score?: number;
      action?: string;
      "error-codes"?: string[];
    };

    if (!result.success) {
      return NextResponse.json(
        {
          ok: false,
          error: "reCAPTCHA rejected this request.",
          codes: result["error-codes"],
        },
        { status: 400 },
      );
    }

    if (
      body.action &&
      result.action &&
      result.action !== body.action
    ) {
      return NextResponse.json(
        { ok: false, error: "reCAPTCHA action mismatch." },
        { status: 400 },
      );
    }

    if ((result.score ?? 0) < RECAPTCHA_MIN_SCORE) {
      return NextResponse.json(
        {
          ok: false,
          error: "reCAPTCHA score too low. Please try again.",
          score: result.score,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      ok: true,
      score: result.score,
      action: result.action,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unable to verify reCAPTCHA." },
      { status: 500 },
    );
  }
}
