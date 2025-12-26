// app/api/analyze/route.ts

import { NextRequest, NextResponse } from "next/server";

import { analyzeKlausur, analyzeKlausurUniversal } from "@/lib/openai";

import { getCurrentUser } from "@/lib/auth";

import { createClientFromRequest } from "@/lib/supabase/server";

import { executeWithRetry, isJWTExpiredError } from "@/lib/supabase/error-handler";

import type { MasterAnalysisInput } from "@/lib/analysis/types";



type UserRow = { credits: number };



type CorrectionRow = {

  id: string;

  status: string | null;

  analysis: any | null;

};



export async function POST(request: NextRequest) {

  // 1. User prüfen

  const user = await getCurrentUser();

  if (!user) {

    return NextResponse.json(

      { error: "Nicht eingeloggt. Bitte melde dich an." },

      { status: 401 },

    );

  }



  const supabase = createClientFromRequest(request);



  // 2. Body EINMAL lesen

  let body: any;

  try {

    body = await request.json();

  } catch {

    return NextResponse.json(

      { error: "Ungültiger Request-Body (kein gültiges JSON)." },

      { status: 400 },

    );

  }



  const {

    klausurText,

    erwartungshorizont,

    subject,

    studentName,

    className,

    useUniversal,

    correctionId,

  } = body ?? {};



  // 3. RESULT FREEZING – nie doppelt analysieren

  if (typeof correctionId === "string" && correctionId.trim().length > 0) {

    const { data: existingCorrection, error: checkError } =

      await executeWithRetry<CorrectionRow | null>(async (client) => {

        const sb = client ?? supabase;

        return await sb

          .from("corrections")

          .select("id,status,analysis")

          .eq("id", correctionId)

          .eq("user_id", user.id)

          .maybeSingle();

      }, supabase);



    if (!checkError && existingCorrection) {

      const status = existingCorrection.status ?? "";

      const isReady =

        status === "Bereit" || status === "completed" || status === "Completed";



      if (isReady && existingCorrection.analysis) {

        console.log(

          "Result Freezing: Verwende gespeichertes Ergebnis für",

          correctionId,

        );

        return NextResponse.json({

          ...existingCorrection.analysis,

          reused: true,

          creditUsed: false,

        });

      }

    } else if (checkError) {

      console.warn(

        "Result Freezing: Fehler beim Prüfen vorhandener Ergebnisse",

        checkError,

      );

      // Weiterlaufen, Analyse darf trotzdem stattfinden

    }

  }



  // 4. Credits prüfen – ABER noch NICHT abziehen

  const {

    data: userData,

    error: userError,

  } = await executeWithRetry<UserRow | null>(async (client) => {

    const sb = client ?? supabase;

    return await sb

      .from("users")

      .select("credits")

      .eq("id", user.id)

      .single();

  }, supabase);



  if (userError || !userData) {

    if (isJWTExpiredError(userError)) {

      return NextResponse.json(

        { error: "Deine Sitzung ist abgelaufen. Bitte melde dich erneut an." },

        { status: 401 },

      );

    }

    return NextResponse.json(

      { error: "Fehler beim Laden der Credits." },

      { status: 500 },

    );

  }



  if (userData.credits < 1) {

    return NextResponse.json(

      {

        error: "Nicht genug Credits",

        credits: userData.credits,

        message:

          "Du hast keine Credits mehr. Bitte kaufe ein Paket mit 25 Klausuren für 7,90 €.",

      },

      { status: 402 },

    );

  }



  try {

    // 5. Eingaben validieren

    if (!klausurText) {

      return NextResponse.json(

        {

          error:

            "Klausur-Text fehlt. Die PDF-Extraktion war möglicherweise nicht erfolgreich.",

          details:

            "Bitte prüfe, ob die PDF-Datei lesbar ist und Text enthält.",

        },

        { status: 400 },

      );

    }

    if (typeof klausurText !== "string" || klausurText.trim().length === 0) {

      return NextResponse.json(

        {

          error:

            "Klausur-Text ist leer. Die PDF-Extraktion hat keinen Text gefunden.",

          details:

            "Bitte prüfe, ob die PDF-Datei Text enthält oder ob es sich um ein gescanntes Bild handelt.",

        },

        { status: 400 },

      );

    }

    if (!erwartungshorizont) {

      return NextResponse.json(

        {

          error:

            "Erwartungshorizont fehlt. Bitte lade zuerst den Erwartungshorizont hoch.",

          details:

            "Der Erwartungshorizont ist erforderlich, um die Klausur zu bewerten.",

        },

        { status: 400 },

      );

    }

    if (

      typeof erwartungshorizont !== "string" ||

      erwartungshorizont.trim().length === 0

    ) {

      return NextResponse.json(

        {

          error:

            "Erwartungshorizont ist leer. Bitte lade einen gültigen Erwartungshorizont hoch.",

          details: "Der Erwartungshorizont muss Text enthalten.",

        },

        { status: 400 },

      );

    }

    if (klausurText.trim().length < 10) {

      return NextResponse.json(

        {

          error:

            "Klausur-Text ist zu kurz. Die PDF-Extraktion hat möglicherweise nicht funktioniert.",

          details: "Bitte prüfe, ob die PDF-Datei korrekt ist.",

        },

        { status: 400 },

      );

    }

    if (erwartungshorizont.trim().length < 10) {

      return NextResponse.json(

        {

          error:

            "Erwartungshorizont ist zu kurz. Bitte lade einen vollständigen Erwartungshorizont hoch.",

          details: "Der Erwartungshorizont muss ausreichend Inhalt enthalten.",

        },

        { status: 400 },

      );

    }



    console.log("Starte Analyse...", {

      klausurTextLength: klausurText.length,

      erwartungshorizontLength: erwartungshorizont.length,

      useUniversal: !!useUniversal,

      studentName: studentName ?? "Unbekannt",

      correctionId: correctionId ?? null,

    });



    // 6. Analyse (mit Retry-Wrapper in lib/openai)

    let analysis: any;

    try {

      if (useUniversal) {

        const input: MasterAnalysisInput = {

          klausurText,

          erwartungshorizont,

          subject,

          studentName,

          className,

        };

        console.log("Verwende universelle Analyse...");

        analysis = await analyzeKlausurUniversal(input);

      } else {

        console.log("Verwende alte Analyse-Funktion...");

        analysis = await analyzeKlausur(klausurText, erwartungshorizont);

      }

    } catch (analysisError: any) {

      console.error("Fehler während der Analyse", analysisError);

      throw analysisError;

    }



    // 7. Logging (Anzahl Aufgaben/Punkte; tolerant für beide Typen)

    let aufgabenAnzahl = 0;

    let erreichtePunkte = 0;

    let maxPunkte = 0;



    if ("aufgaben" in analysis) {

      aufgabenAnzahl = analysis.aufgaben?.length ?? 0;

      erreichtePunkte = analysis.erreichtePunkte ?? 0;

      maxPunkte = analysis.gesamtpunkte ?? 0;

    } else if ("tasks" in analysis) {

      aufgabenAnzahl = analysis.tasks?.length ?? 0;

      erreichtePunkte = analysis.meta?.achievedPoints ?? 0;

      maxPunkte = analysis.meta?.maxPoints ?? 0;

    }



    console.log(

      "Analyse erfolgreich abgeschlossen:",

      aufgabenAnzahl,

      erreichtePunkte,

      maxPunkte,

    );



    // 8. Credits NUR JETZT, nach Erfolg, einmalig abziehen

    let creditDeducted = false;

    const { error: creditError } = await executeWithRetry(async (client) => {

      const sb = client ?? supabase;

      return await sb.rpc("add_credits", {

        user_id: user.id,

        amount: -1,

      });

    }, supabase);



    if (creditError) {

      if (isJWTExpiredError(creditError)) {

        console.warn(

          "Session expired after analysis, but analysis was successful",

        );

        // Analyse war erfolgreich, Credit evtl. nicht abgezogen -> creditUsed bleibt false

      } else {

        console.error("Fehler beim Verbrauchen des Credits", creditError);

      }

    } else {

      creditDeducted = true;

    }



    // 9. Aktuelle Credits holen

    const {

      data: updatedUser,

      error: updatedError,

    } = await executeWithRetry<UserRow | null>(async (client) => {

      const sb = client ?? supabase;

      return await sb

        .from("users")

        .select("credits")

        .eq("id", user.id)

        .single();

    }, supabase);



    const remainingCredits =

      !updatedError && updatedUser ? updatedUser.credits : userData.credits;



    return NextResponse.json({

      ...analysis,

      credits: remainingCredits,

      creditUsed: creditDeducted,

    });

  } catch (error: any) {

    // 10. Bei Fehlern KEIN Credit-Abzug, klarer Fehler-Response

    console.error("Analyze error", error);

    console.error("Error details", {

      message: error instanceof Error ? error.message : String(error),

      stack: error instanceof Error ? error.stack : undefined,

      name: error instanceof Error ? error.name : undefined,

    });



    const isRateLimitError =

      (error as any)?.status === 429 ||

      (error as any)?.code === "rate_limit_exceeded" ||

      (error as any)?.message?.toLowerCase?.().includes("rate limit");



    const errorMessage =

      error instanceof Error ? error.message : "Failed to analyze";



    const userFriendlyMessage = isRateLimitError

      ? "OpenAI ist gerade überlastet. Bitte versuche es in ein paar Minuten erneut."

      : errorMessage;



    return NextResponse.json(

      {

        error: userFriendlyMessage,

        details:

          process.env.NODE_ENV === "development"

            ? error instanceof Error

              ? error.stack

              : String(error)

            : undefined,

        creditUsed: false,

      },

      { status: isRateLimitError ? 429 : 500 },

    );

  }

}
