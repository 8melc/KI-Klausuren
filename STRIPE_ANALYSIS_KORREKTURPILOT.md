# Stripe Integration Analysis: KorrekturPilot → RealityCheck

**Datum:** 2024  
**Zweck:** Wiederverwendbare Patterns für RealityCheck Credit-System extrahieren

---

## 📋 Inhaltsverzeichnis

1. [Stripe Setup & Konfiguration](#1-stripe-setup--konfiguration)
2. [Payment Flow Architecture](#2-payment-flow-architecture)
3. [Produkte & Preise](#3-produkte--preise)
4. [Webhook Handling](#4-webhook-handling)
5. [Database Integration](#5-database-integration)
6. [Frontend Komponenten](#6-frontend-komponenten)
7. [Error Handling & Edge Cases](#7-error-handling--edge-cases)
8. [Testing & Development](#8-testing--development)
9. [Migration Checklist für RealityCheck](#9-migration-checklist-für-realitycheck)
10. [Security Checklist](#10-security-checklist)
11. [Code-Qualität](#11-code-qualität)
12. [Performance](#12-performance)
13. [Differences: KorrekturPilot vs RealityCheck](#13-differences-korrekturpilot-vs-realitycheck)

---

## 1. Stripe Setup & Konfiguration

### 1.1 Stripe Client Initialisierung

**Datei:** `lib/stripe.ts`

```typescript
import Stripe from 'stripe'

// Server-seitiger Stripe Client
export function getStripeServerClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY ist nicht konfiguriert')
  }

  return new Stripe(secretKey, {
    typescript: true,
  })
}

// Preis-IDs (können später in Supabase gespeichert werden)
export const STRIPE_PRICES = {
  // Preis-IDs aus Stripe Dashboard
  PACKAGE_25: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PACKAGE_25 || 'price_package_25',
  ONE_TIME: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ONE_TIME || 'price_one_time',
} as const
```

**Lessons für RealityCheck:**
- ✅ **Zentrale Initialisierung:** Eine Funktion für Server-Side Stripe Client
- ✅ **TypeScript Support:** `typescript: true` aktiviert
- ✅ **Error Handling:** Prüft ob Secret Key vorhanden ist
- ✅ **Environment Variables:** Nutzt `.env.local` für Konfiguration
- ⚠️ **Anpassung:** Für RealityCheck mehrere Credit-Pakete (10/50/100 Credits)

### 1.2 Environment Variables

**Erforderliche Variablen:**

```env
# Stripe Secret Key (Server-Side)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx

# Stripe Webhook Secret (für Webhook-Verifizierung)
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Stripe Price IDs (Client-Side, da NEXT_PUBLIC_)
NEXT_PUBLIC_STRIPE_PRICE_ID_PACKAGE_25=price_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PRICE_ID_ONE_TIME=price_xxxxxxxxxxxxx

# Base URL für Redirects
NEXT_PUBLIC_URL=http://localhost:3000  # Development
# NEXT_PUBLIC_URL=https://yourdomain.com  # Production
```

**Lessons für RealityCheck:**
- ✅ **Secret Keys:** Niemals `NEXT_PUBLIC_` verwenden für Secret Keys
- ✅ **Webhook Secret:** Separates Secret für Webhook-Verifizierung
- ✅ **Price IDs:** Client-Side verfügbar für Frontend
- ⚠️ **RealityCheck:** Benötigt 3 Price IDs (10/50/100 Credits)

### 1.3 Stripe Version

**package.json:**
```json
{
  "dependencies": {
    "stripe": "^20.0.0",
    "@stripe/stripe-js": "^8.5.2"
  }
}
```

**Lessons für RealityCheck:**
- ✅ **Server-Side:** `stripe` Package (v20.0.0)
- ✅ **Client-Side:** `@stripe/stripe-js` für Stripe.js (falls benötigt)
- ✅ **Aktuelle Version:** v20.0.0 ist aktuell (Stand 2024)

---

## 2. Payment Flow Architecture

### 2.1 Checkout Session Erstellung

**Datei:** `app/api/stripe/checkout/route.ts`

```typescript
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getCurrentUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    // 1. Auth-Check - KRITISCH: userId aus Session, nicht aus Body!
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // 2. Prüfe Stripe Secret Key
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'STRIPE_SECRET_KEY ist nicht konfiguriert' },
        { status: 500 }
      )
    }

    // 3. Prüfe Price ID
    if (!process.env.STRIPE_PRICE_ID_25) {
      return NextResponse.json(
        { error: 'STRIPE_PRICE_ID_25 ist nicht konfiguriert' },
        { status: 500 }
      )
    }

    // 4. Prüfe Base URL
    if (!process.env.NEXT_PUBLIC_URL) {
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_URL ist nicht konfiguriert' },
        { status: 500 }
      )
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const supabase = await createClient()

    // 5. Stripe Customer ID Sync
    const { data: userData } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single()

    let customerId = userData?.stripe_customer_id

    // 6. Erstelle Stripe Customer falls nicht vorhanden
    if (!customerId) {
      try {
        const customer = await stripe.customers.create({
          metadata: {
            userId: userId,
          },
        })
        customerId = customer.id

        // Speichere Customer ID in Datenbank
        await supabase
          .from('users')
          .update({ stripe_customer_id: customerId })
          .eq('id', userId)
      } catch (error) {
        console.error('Fehler beim Erstellen des Stripe Customers:', error)
        // Weiterlaufen ohne Customer ID (Stripe erstellt automatisch einen)
      }
    }

    // 7. Erstelle Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',  // One-time payment
      customer: customerId, // Verknüpfe Session mit bestehendem Customer
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID_25,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_URL}/checkout/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/checkout/cancel`,
      metadata: {
        userId,
        type: 'CREDITS_25',
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Checkout-Session konnte nicht erstellt werden',
      },
      { status: 500 }
    )
  }
}
```

**Lessons für RealityCheck:**
- ✅ **Security:** userId aus Session, NICHT aus Request Body
- ✅ **Customer Management:** Erstellt Stripe Customer für Historie
- ✅ **Metadata:** Speichert userId und type für Webhook
- ✅ **Error Handling:** Prüft alle Environment Variables
- ⚠️ **Anpassung:** Für RealityCheck dynamische Price IDs (10/50/100 Credits)

### 2.2 Payment Flow Diagramm

```
User klickt "Credits kaufen"
    ↓
Frontend: POST /api/stripe/checkout
    ↓
Backend: Erstellt Stripe Checkout Session
    ↓
Response: { url: "https://checkout.stripe.com/..." }
    ↓
Frontend: window.location.href = url
    ↓
Stripe Checkout Page (externe Seite)
    ↓
User zahlt mit Kreditkarte
    ↓
Stripe sendet Webhook: checkout.session.completed
    ↓
Backend: /api/stripe/webhook
    ↓
Webhook: Fügt Credits zu User hinzu
    ↓
User wird zu /checkout/success weitergeleitet
```

**Lessons für RealityCheck:**
- ✅ **Externe Checkout:** Stripe Hosted Checkout (keine eigene Payment-UI nötig)
- ✅ **Webhook-basiert:** Credits werden erst nach erfolgreicher Zahlung gutgeschrieben
- ✅ **Redirect URLs:** Success/Cancel URLs müssen konfiguriert sein

### 2.3 Alternative Checkout Route

**Datei:** `app/api/checkout/route.ts` (Alternative Implementierung)

```typescript
export async function POST(req: Request) {
  // ... ähnliche Logik wie oben ...
  
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/dashboard?checkout=cancelled`,
    metadata: {
      userId: user.id,
    },
  })

  return NextResponse.json({ url: session.url })
}
```

**Lessons für RealityCheck:**
- ✅ **Session ID in URL:** Kann für Verifizierung verwendet werden
- ✅ **Query Parameters:** Für Status-Tracking

---

## 3. Produkte & Preise

### 3.1 Preis-Definition

**KorrekturPilot verwendet:**
- **25 Credits Paket:** €7.90 (790 Cent)
- **Einzelkorrektur:** €9.00 (optional)

**RealityCheck benötigt:**
- **10 Credits:** €5.00 (500 Cent)
- **50 Credits:** €20.00 (2000 Cent)
- **100 Credits:** €35.00 (3500 Cent)

### 3.2 Preis-Loading API

**Datei:** `app/api/stripe/prices/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { getStripeServerClient } from '@/lib/stripe'

export async function GET() {
  try {
    const stripe = getStripeServerClient()

    const priceIdPackage25 = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PACKAGE_25
    const priceIdOneTime = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ONE_TIME

    type PriceDetail = {
      id: string
      amount: number | null
      currency: string | null
      formatted: string
    }

    interface PricesResponse {
      package25?: PriceDetail
      oneTime?: PriceDetail
    }

    const prices: PricesResponse = {}

    // Preis für Package 25 laden
    if (priceIdPackage25) {
      try {
        const pricePackage25 = await stripe.prices.retrieve(priceIdPackage25)
        prices.package25 = {
          id: pricePackage25.id,
          amount: pricePackage25.unit_amount,
          currency: pricePackage25.currency ?? null,
          formatted: new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: (pricePackage25.currency ?? 'EUR').toUpperCase(),
          }).format((pricePackage25.unit_amount || 0) / 100),
        }
      } catch (error) {
        console.error('Error fetching package25 price:', error)
      }
    }

    // ... ähnlich für oneTime ...

    return NextResponse.json(prices)
  } catch (error) {
    console.error('Stripe prices error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Preise konnten nicht geladen werden',
      },
      { status: 500 }
    )
  }
}
```

**Lessons für RealityCheck:**
- ✅ **Dynamische Preise:** Lädt Preise aus Stripe API (nicht hardcoded)
- ✅ **Formatierung:** Nutzt `Intl.NumberFormat` für deutsche Währung
- ✅ **Error Handling:** Try/Catch für jeden Preis
- ⚠️ **Anpassung:** Für RealityCheck 3 Preise (10/50/100 Credits)

### 3.3 Pricing Display Component

**Datei:** `app/checkout/page.tsx` (Auszug)

```typescript
// Preise aus Stripe laden
useEffect(() => {
  const fetchPrices = async () => {
    try {
      const response = await fetch('/api/stripe/prices')
      if (!response.ok) {
        throw new Error('Preise konnten nicht geladen werden')
      }

      const prices = await response.json()
      
      // Preise zu den Plänen hinzufügen
      const plansWithPrices: PricingPlan[] = PRICING_PLANS.map((plan) => {
        let price = '0'
        let formattedPrice = '0,00 €'

        if (plan.id === 'package-25' && prices.package25) {
          price = (prices.package25.amount / 100).toString()
          formattedPrice = prices.package25.formatted
        }

        return {
          ...plan,
          price,
          formattedPrice,
        }
      })

      setPlans(plansWithPrices)
    } catch (error) {
      console.error('Error fetching prices:', error)
      // Fallback: Verwende Standard-Preise
    }
  }

  fetchPrices()
}, [])
```

**Lessons für RealityCheck:**
- ✅ **Client-Side Loading:** Preise werden beim Page-Load gefetcht
- ✅ **Fallback:** Standard-Preise wenn API fehlschlägt
- ✅ **Loading State:** Zeigt Spinner während Laden

---

## 4. Webhook Handling

### 4.1 Webhook Route (Haupt-Implementierung)

**Datei:** `app/api/stripe/webhook/route.ts`

```typescript
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Wichtig: Service Role Key!
);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;
  
  let event: Stripe.Event;

  // 1. Webhook Signature Verifizierung
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }

  // 2. Handle checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    console.log('🔍 Session empfangen:', {
      sessionId: session.id,
      customer_email: session.customer_email,
      metadata: session.metadata,
    });

    const userId = session.metadata?.userId;

    if (!userId) {
      console.error('❌ Keine userId in metadata gefunden');
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // 3. Prüfe ob User existiert
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id, credits')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('❌ Fehler beim User-Fetch:', fetchError);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // 4. Erstelle User falls nicht vorhanden
    if (!existingUser) {
      console.log('🆕 User existiert nicht, erstelle neuen User');
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{ 
          id: userId, 
          credits: 1  // 1 Free Credit beim Erstellen
        }])
        .select()
        .single();
        
      if (createError) {
        console.error('❌ Fehler beim User-Erstellen:', createError);
        return NextResponse.json({ received: true }, { status: 200 });
      }
      console.log('✅ Neuer User erstellt:', newUser);
    }

    // 5. Credits hinzufügen (25 für den Kauf)
    const creditsToAdd = 25;
    const currentCredits = existingUser?.credits || 1;
    
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ 
        credits: currentCredits + creditsToAdd 
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Fehler beim Credits-Update:', updateError);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    console.log('✅ Credits erfolgreich hinzugefügt:', {
      userId,
      vorher: currentCredits,
      hinzugefügt: creditsToAdd,
      nachher: updatedUser.credits
    });

    // 6. Erstelle Payment-Eintrag in der payments Tabelle
    try {
      const paymentIntentId = session.payment_intent as string;
      let amount = 790; // Default: 7.90€ in Cents
      let currency = 'eur';

      if (paymentIntentId) {
        try {
          const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
          amount = paymentIntent.amount;
          currency = paymentIntent.currency;
        } catch (err) {
          console.warn('⚠️ Konnte Payment Intent nicht abrufen:', err);
        }
      }

      // Erstelle Payment-Eintrag
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: userId,
          stripe_payment_intent_id: paymentIntentId || session.id,
          amount: amount,
          currency: currency,
          status: 'completed',
        });

      if (paymentError) {
        console.error('❌ Fehler beim Erstellen des Payment-Eintrags:', paymentError);
      } else {
        console.log('✅ Payment-Eintrag erstellt:', {
          userId,
          amount: amount / 100,
          currency,
        });
      }
    } catch (paymentErr) {
      console.error('❌ Unerwarteter Fehler beim Erstellen des Payment-Eintrags:', paymentErr);
    }

    return NextResponse.json({ 
      received: true,
      creditsAdded: creditsToAdd,
      totalCredits: updatedUser.credits
    }, { status: 200 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
```

**Lessons für RealityCheck:**
- ✅ **Signature Verification:** KRITISCH für Sicherheit
- ✅ **Service Role Key:** Nutzt `SUPABASE_SERVICE_ROLE_KEY` (nicht anon key)
- ✅ **Idempotency:** Webhook gibt immer 200 zurück (auch bei Fehlern)
- ✅ **Metadata:** userId aus session.metadata
- ✅ **User Creation:** Erstellt User falls nicht vorhanden
- ✅ **Payment Tracking:** Erstellt Eintrag in payments Tabelle
- ⚠️ **Anpassung:** Für RealityCheck dynamische Credit-Anzahl basierend auf Price ID

### 4.2 Alternative Webhook Route (Vereinfacht)

**Datei:** `app/api/webhooks/stripe/route.ts`

```typescript
export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ received: false, error: 'Keine Signatur' }, { status: 200 })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ received: false, error: 'Webhook Secret fehlt' }, { status: 200 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err: any) {
    console.error('Invalid webhook signature:', err.message)
    return NextResponse.json({ received: false, error: 'Invalid signature' }, { status: 200 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.userId

    if (!userId) {
      return NextResponse.json({ received: true })
    }

    try {
      // Nutze RPC-Funktion für Credits
      const { error } = await supabase.rpc('add_credits', {
        user_id: userId,
        amount: 25,
      })

      if (error) {
        console.error('Error adding credits:', error)
        return NextResponse.json({ received: true, error: 'Fehler beim Hinzufügen der Credits' }, { status: 200 })
      }

      console.log(`Added 25 credits to user ${userId} after payment`)
    } catch (error) {
      console.error('Unexpected error in webhook:', error)
      return NextResponse.json({ received: true, error: 'Unerwarteter Fehler' }, { status: 200 })
    }
  }

  return NextResponse.json({ received: true })
}
```

**Lessons für RealityCheck:**
- ✅ **RPC-Funktion:** Nutzt `add_credits` RPC für atomare Operation
- ✅ **Einfacher:** Weniger Code, aber weniger Details
- ⚠️ **Anpassung:** Für RealityCheck Credit-Anzahl aus Price ID bestimmen

### 4.3 Events Handled

**Aktuell implementiert:**
- ✅ `checkout.session.completed` → Credits hinzufügen

**Nicht implementiert (aber möglich):**
- ⬜ `payment_intent.succeeded` → Alternative zu checkout.session.completed
- ⬜ `customer.subscription.created` → Für Abonnements
- ⬜ `customer.subscription.updated` → Abo-Änderungen
- ⬜ `customer.subscription.deleted` → Abo-Kündigung
- ⬜ `invoice.payment_succeeded` → Rechnungszahlung
- ⬜ `invoice.payment_failed` → Zahlungsfehler

**Lessons für RealityCheck:**
- ✅ **One-Time Payments:** `checkout.session.completed` ist ausreichend
- ✅ **Keine Subscriptions:** RealityCheck braucht keine Abonnements
- ⚠️ **Zukünftig:** Eventuell `payment_intent.succeeded` für zusätzliche Sicherheit

---

## 5. Database Integration

### 5.1 Users Table Schema

**Datei:** `supabase/migrations/004_create_users_table_with_credits.sql`

```sql
-- Users Tabelle mit Credits-System
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  credits INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  stripe_customer_id TEXT  -- Für Customer-Historie
);

-- Index für schnelle Abfragen
CREATE INDEX IF NOT EXISTS idx_users_credits ON public.users(credits);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON public.users(stripe_customer_id);

-- Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policies: SELECT, UPDATE
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- Funktion: Vergibt automatisch 1 kostenloses Credit bei Registrierung
CREATE OR REPLACE FUNCTION public.give_free_test_credit()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, credits)
  VALUES (NEW.id, 1)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Wird ausgelöst, sobald ein neuer Auth-User erzeugt wird
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.give_free_test_credit();

-- RPC-Funktion: Credits hinzufügen (für Stripe-Webhook)
CREATE OR REPLACE FUNCTION public.add_credits(user_id UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
  IF amount IS NULL OR amount = 0 THEN
    RETURN;
  END IF;
  UPDATE public.users
  SET credits = credits + amount,
      updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Lessons für RealityCheck:**
- ✅ **Foreign Key:** Verknüpft mit `auth.users` (Supabase Auth)
- ✅ **RLS Policies:** Users können nur eigene Daten sehen
- ✅ **Auto Credit:** Trigger gibt 1 Credit bei Registrierung
- ✅ **RPC-Funktion:** Atomare Credit-Operation für Webhook
- ✅ **Stripe Customer ID:** Für Payment-Historie
- ⚠️ **Anpassung:** RealityCheck braucht keine Änderungen (gleiche Struktur)

### 5.2 Payments Table Schema

**Datei:** `supabase/migrations/001_create_stripe_tables.sql`

```sql
-- Stripe Payments Tabelle (für einmalige Zahlungen)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE NOT NULL,
  amount BIGINT NOT NULL,  -- In Cents
  currency TEXT NOT NULL DEFAULT 'eur',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indizes für bessere Performance
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Row Level Security (RLS) Policies
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users können nur ihre eigenen Payments sehen
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);
```

**Lessons für RealityCheck:**
- ✅ **Payment Tracking:** Speichert alle Zahlungen
- ✅ **Amount in Cents:** BIGINT für Cent-Beträge
- ✅ **Status:** pending/completed/failed
- ✅ **RLS:** Users sehen nur eigene Payments
- ⚠️ **Optional:** RealityCheck kann diese Tabelle übernehmen oder vereinfachen

### 5.3 Credit Management Functions

**Datei:** `lib/user-credits.ts`

```typescript
import { createClient } from '@/lib/supabase/server';
import { executeWithRetry, isJWTExpiredError } from '@/lib/supabase/error-handler';

/**
 * Server-side: Prüft ob User Credits hat
 */
export async function getUserCredits(userId: string): Promise<number> {
  const supabase = await createClient();
  
  const { data, error } = await executeWithRetry(async () => {
    const result = await supabase
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single();
    return { data: result.data, error: result.error };
  });
  
  if (error || !data) {
    if (isJWTExpiredError(error)) {
      console.warn('Session expired while fetching credits');
    }
    return 0;
  }
  
  return data.credits || 0;
}

/**
 * Server-side: Verbraucht 1 Credit
 */
export async function consumeCredit(userId: string): Promise<boolean> {
  const supabase = await createClient();
  
  // Prüfe ob User genug Credits hat
  const credits = await getUserCredits(userId);
  if (credits < 1) {
    return false;
  }
  
  // Verbrauche 1 Credit
  const { error } = await executeWithRetry(async () => {
    const result = await supabase
      .from('users')
      .update({ 
        credits: credits - 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    return { data: result.data, error: result.error };
  });
  
  if (isJWTExpiredError(error)) {
    console.warn('Session expired while consuming credit');
  }
  
  return !error;
}

/**
 * Server-side: Fügt Credits hinzu (für Stripe-Webhook)
 */
export async function addCredits(userId: string, amount: number): Promise<boolean> {
  const supabase = await createClient();
  
  const { error } = await executeWithRetry(async () => {
    const result = await supabase.rpc('add_credits', {
      user_id: userId,
      amount: amount
    });
    return { data: result.data, error: result.error };
  });
  
  if (isJWTExpiredError(error)) {
    console.warn('Session expired while adding credits');
  }
  
  return !error;
}
```

**Lessons für RealityCheck:**
- ✅ **Retry Logic:** `executeWithRetry` für JWT-Expiry-Handling
- ✅ **Error Handling:** Prüft JWT-Expiry-Fehler
- ✅ **RPC-Funktion:** Nutzt `add_credits` für atomare Operation
- ✅ **Type Safety:** TypeScript für alle Funktionen
- ⚠️ **Anpassung:** RealityCheck kann diese Funktionen 1:1 übernehmen

---

## 6. Frontend Komponenten

### 6.1 Buy Credits Button

**Datei:** `components/BuyCreditsButton.tsx`

```typescript
'use client'

import { useState } from 'react'

export default function BuyCreditsButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleBuyCredits = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Fehler beim Erstellen der Checkout-Session')
      }

      const { url } = await response.json()

      if (!url) {
        throw new Error('Keine Checkout-URL erhalten')
      }

      // Weiterleitung zu Stripe Checkout
      window.location.href = url
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ein unerwarteter Fehler ist aufgetreten'
      setError(errorMessage)
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleBuyCredits}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Wird geladen...' : '25 Credits kaufen (€7.90)'}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
```

**Lessons für RealityCheck:**
- ✅ **Loading State:** Zeigt "Wird geladen..." während Request
- ✅ **Error Handling:** Zeigt Fehlermeldungen
- ✅ **Redirect:** `window.location.href` für Stripe Checkout
- ⚠️ **Anpassung:** Für RealityCheck dynamische Price IDs (10/50/100)

### 6.2 Buy Credits Helper Function

**Datei:** `lib/buy-credits.ts`

```typescript
import { createClient } from '@/lib/supabase/client'

export async function buyCredits(): Promise<void> {
  const supabase = createClient()
  
  // Hole aktuellen User
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError) {
    // Handle JWT expired error
    if (userError.message?.includes('JWT') || userError.message?.includes('expired')) {
      const { error: refreshError } = await supabase.auth.refreshSession()
      if (refreshError) {
        throw new Error('Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.')
      }
      // Retry after refresh
      const { data: { user: retryUser } } = await supabase.auth.getUser()
      if (!retryUser) {
        throw new Error('Bitte melde dich an, um Credits zu kaufen')
      }
    } else {
      throw new Error('Fehler beim Laden der Benutzerdaten')
    }
  }
  
  if (!user) {
    throw new Error('Bitte melde dich an, um Credits zu kaufen')
  }

  try {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(
        typeof errorData.error === 'string'
          ? errorData.error
          : 'Checkout konnte nicht erstellt werden'
      )
    }

    const { url } = await res.json()

    if (!url) {
      throw new Error('Keine Checkout-URL erhalten')
    }

    // Weiterleitung zu Stripe Checkout
    window.location.href = url
  } catch (error) {
    console.error('Buy credits error:', error)
    throw error
  }
}
```

**Lessons für RealityCheck:**
- ✅ **JWT Refresh:** Behandelt abgelaufene Sessions
- ✅ **Error Handling:** Detaillierte Fehlermeldungen
- ✅ **Type Safety:** TypeScript
- ⚠️ **Anpassung:** Für RealityCheck Price ID als Parameter

### 6.3 Credits Display Component

**Datei:** `components/CreditsDisplay.tsx`

```typescript
'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CreditsDisplay() {
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCredits() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setCredits(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select('credits')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Credits fetch error:', error);
          setCredits(null);
        } else {
          setCredits(data?.credits ?? 0);
        }
      } catch (err) {
        console.error('Unexpected error loading credits:', err);
        setCredits(null);
      } finally {
        setLoading(false);
      }
    }

    loadCredits();
  }, []);

  if (loading) {
    return <div>Lädt...</div>;
  }

  if (credits === null) {
    return null;
  }

  const hasCredits = credits > 0;
  const isFreeKlausur = credits === 1;

  return (
    <div className="header-credits">
      {hasCredits ? (
        <>
          <div className={`header-credits__pill ${isFreeKlausur ? 'header-credits__pill-success' : 'header-credits__pill-info'}`}>
            <span>{isFreeKlausur ? '🎁' : '📊'}</span>
            <span>
              {isFreeKlausur ? (
                <>Du hast <strong>{credits} kostenlose Test-Klausur</strong> verfügbar</>
              ) : (
                <><strong>{credits} Klausuren</strong> verfügbar</>
              )}
            </span>
          </div>
          {credits < 5 && (
            <Link href="/checkout" className="header-credits__link">
              Mehr kaufen
            </Link>
          )}
        </>
      ) : (
        <div className="header-credits__pill header-credits__pill-warning">
          <span>⚠️</span>
          <span>
            Keine Credits mehr
            <Link href="/checkout" className="header-credits__link header-credits__link-inline">
              Jetzt 25 Klausuren für €7.90 kaufen →
            </Link>
          </span>
        </div>
      )}
    </div>
  );
}
```

**Lessons für RealityCheck:**
- ✅ **Real-time Display:** Zeigt aktuelle Credits
- ✅ **Conditional Rendering:** Unterschiedliche UI für verschiedene Credit-Levels
- ✅ **Link zum Checkout:** Direkter Link wenn Credits niedrig
- ⚠️ **Anpassung:** RealityCheck kann Text anpassen (z.B. "10 Credits verfügbar")

### 6.4 Checkout Success Page

**Datei:** `app/checkout/success/page.tsx`

```typescript
"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProtectedRoute from '@/components/ProtectedRoute';

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    // Nach 2 Sekunden zum Dashboard weiterleiten
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 2000);
    return () => clearTimeout(timer);
  }, [router, sessionId]);

  return (
    <section className="dashboard-section">
      <div className="container">
        <div className="page-intro">
          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <svg
              style={{ width: '64px', height: '64px', margin: '0 auto', color: 'var(--color-success)' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="page-intro-title">Zahlung erfolgreich</h1>
          <p className="page-intro-text">
            Du wirst gleich zu deinem Dashboard weitergeleitet…
          </p>
        </div>
      </div>
    </section>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div>Lädt...</div>}>
        <CheckoutSuccessContent />
      </Suspense>
    </ProtectedRoute>
  );
}
```

**Lessons für RealityCheck:**
- ✅ **Auto-Redirect:** Weiterleitung nach 2 Sekunden
- ✅ **Session ID:** Kann für Verifizierung verwendet werden
- ✅ **Protected Route:** Nur für eingeloggte User
- ⚠️ **Anpassung:** RealityCheck kann Text anpassen

### 6.5 Checkout Cancel Page

**Datei:** `app/checkout/cancel/page.tsx`

```typescript
'use client'

import Link from 'next/link'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function CheckoutCancelPage() {
  return (
    <ProtectedRoute>
      <section className="dashboard-section">
        <div className="container">
          <div className="page-intro">
            <h1 className="page-intro-title">Zahlung abgebrochen</h1>
            <p className="page-intro-text">
              Die Zahlung wurde abgebrochen. Sie können es jederzeit erneut versuchen.
            </p>
          </div>
          <div className="cta-actions" style={{ marginTop: 'var(--spacing-xl)' }}>
            <Link href="/checkout" className="primary-button">
              <span>Erneut versuchen</span>
            </Link>
            <Link href="/" className="secondary-button">
              <span>Zur Startseite</span>
            </Link>
          </div>
        </div>
      </section>
    </ProtectedRoute>
  )
}
```

**Lessons für RealityCheck:**
- ✅ **User-Friendly:** Klare Nachricht und Call-to-Action
- ✅ **Retry Option:** Link zurück zum Checkout
- ✅ **Protected Route:** Nur für eingeloggte User

---

## 7. Error Handling & Edge Cases

### 7.1 Webhook Error Handling

**Pattern aus KorrekturPilot:**

```typescript
// Webhook MUSS immer 200 zurückgeben, auch bei Fehlern
// Stripe wiederholt sonst den Webhook

try {
  // ... Credit-Operation ...
} catch (error) {
  console.error('Error:', error);
  // WICHTIG: Immer 200 zurückgeben
  return NextResponse.json({ received: true, error: 'Fehler' }, { status: 200 });
}
```

**Lessons für RealityCheck:**
- ✅ **Idempotency:** Webhook sollte mehrmals aufrufbar sein
- ✅ **200 Response:** Immer 200 zurückgeben (auch bei Fehlern)
- ✅ **Logging:** Fehler loggen für Debugging
- ⚠️ **Idempotency Check:** RealityCheck sollte prüfen ob Payment bereits verarbeitet wurde

### 7.2 Checkout Error Handling

**Pattern aus KorrekturPilot:**

```typescript
export async function POST(req: Request) {
  try {
    // ... Checkout-Logik ...
  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    
    const message =
      (error as any)?.message ||
      (typeof error === 'string' ? error : null) ||
      'Checkout-Session konnte nicht erstellt werden'

    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
```

**Lessons für RealityCheck:**
- ✅ **User-Friendly Messages:** Keine technischen Fehler an User
- ✅ **Error Logging:** Console.error für Debugging
- ✅ **Fallback Message:** Standard-Fehlermeldung wenn keine vorhanden

### 7.3 JWT Expiry Handling

**Pattern aus KorrekturPilot:**

```typescript
import { executeWithRetry, isJWTExpiredError } from '@/lib/supabase/error-handler';

const { data, error } = await executeWithRetry(async () => {
  const result = await supabase
    .from('users')
    .select('credits')
    .eq('id', userId)
    .single();
  return { data: result.data, error: result.error };
});

if (isJWTExpiredError(error)) {
  console.warn('Session expired while fetching credits');
  return 0;
}
```

**Lessons für RealityCheck:**
- ✅ **Retry Logic:** Automatischer Retry bei JWT-Expiry
- ✅ **Error Detection:** `isJWTExpiredError` für spezifische Behandlung
- ✅ **Graceful Degradation:** Gibt 0 zurück statt Crash

### 7.4 Duplicate Payment Prevention

**Nicht implementiert in KorrekturPilot, aber empfohlen:**

```typescript
// In Webhook: Prüfe ob Payment bereits verarbeitet wurde
const { data: existingPayment } = await supabase
  .from('payments')
  .select('id')
  .eq('stripe_payment_intent_id', paymentIntentId)
  .single();

if (existingPayment) {
  console.log('Payment bereits verarbeitet:', paymentIntentId);
  return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
}
```

**Lessons für RealityCheck:**
- ⚠️ **Idempotency:** RealityCheck sollte Duplicate-Check implementieren
- ✅ **Payment Tracking:** Nutze `payments` Tabelle für Duplicate-Check
- ✅ **Unique Constraint:** `stripe_payment_intent_id` sollte UNIQUE sein

---

## 8. Testing & Development

### 8.1 Stripe Test Cards

**KorrekturPilot verwendet:**

```typescript
// Erfolgreiche Zahlung
4242 4242 4242 4242

// Abgelehnte Zahlung
4000 0000 0000 0002

// Weitere Test-Karten: https://stripe.com/docs/testing
```

**Lessons für RealityCheck:**
- ✅ **Test Mode:** Immer Test-Mode für Development
- ✅ **Test Cards:** Verwende Stripe Test-Karten
- ✅ **Webhook Testing:** Nutze Stripe CLI für lokale Webhooks

### 8.2 Stripe CLI für Local Webhooks

**Nicht dokumentiert in KorrekturPilot, aber empfohlen:**

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward Webhooks zu localhost
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Trigger Test Event
stripe trigger checkout.session.completed
```

**Lessons für RealityCheck:**
- ⚠️ **Local Testing:** RealityCheck sollte Stripe CLI Setup dokumentieren
- ✅ **Webhook Secret:** Stripe CLI gibt Webhook Secret aus
- ✅ **Test Events:** Trigger Events für Testing

### 8.3 Environment Variables für Testing

```env
# Development (Test Mode)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx  # Von Stripe CLI
NEXT_PUBLIC_STRIPE_PRICE_ID_PACKAGE_25=price_test_xxxxxxxxxxxxx

# Production (Live Mode)
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx  # Von Stripe Dashboard
NEXT_PUBLIC_STRIPE_PRICE_ID_PACKAGE_25=price_live_xxxxxxxxxxxxx
```

**Lessons für RealityCheck:**
- ✅ **Separate Keys:** Test vs. Live Keys
- ✅ **Webhook Secrets:** Unterschiedliche Secrets für Test/Live
- ✅ **Price IDs:** Test Price IDs beginnen mit `price_test_`

---

## 9. Migration Checklist für RealityCheck

### 9.1 Stripe Account Setup

- [ ] Stripe Account erstellen (falls nicht vorhanden)
- [ ] Test Mode aktivieren
- [ ] API Keys kopieren (Test + Live)
- [ ] Webhook Secret generieren (Test + Live)

### 9.2 Products in Stripe Dashboard erstellen

- [ ] **10 Credits** - €5.00 (500 Cent)
  - [ ] Product Name: "RealityCheck 10 Credits"
  - [ ] Price Type: One-time
  - [ ] Price ID kopieren: `NEXT_PUBLIC_STRIPE_PRICE_ID_10`
  
- [ ] **50 Credits** - €20.00 (2000 Cent)
  - [ ] Product Name: "RealityCheck 50 Credits"
  - [ ] Price Type: One-time
  - [ ] Price ID kopieren: `NEXT_PUBLIC_STRIPE_PRICE_ID_50`
  
- [ ] **100 Credits** - €35.00 (3500 Cent)
  - [ ] Product Name: "RealityCheck 100 Credits"
  - [ ] Price Type: One-time
  - [ ] Price ID kopieren: `NEXT_PUBLIC_STRIPE_PRICE_ID_100`

### 9.3 Code-Übernahme

- [ ] Kopiere `lib/stripe.ts` → RealityCheck
- [ ] Adaptiere `app/api/stripe/checkout/route.ts`:
  - [ ] Dynamische Price ID als Parameter
  - [ ] Credit-Anzahl basierend auf Price ID
- [ ] Adaptiere `app/api/stripe/webhook/route.ts`:
  - [ ] Credit-Anzahl aus Price ID bestimmen
  - [ ] Mapping: Price ID → Credits (10/50/100)
- [ ] Kopiere `lib/user-credits.ts` → RealityCheck
- [ ] Kopiere `lib/buy-credits.ts` → RealityCheck (mit Price ID Parameter)

### 9.4 Database Schema

- [ ] Führe Migration `004_create_users_table_with_credits.sql` aus
- [ ] Führe Migration `001_create_stripe_tables.sql` aus (optional)
- [ ] Führe Migration `007_add_stripe_customer_id.sql` aus

### 9.5 Frontend Components

- [ ] Kopiere `components/BuyCreditsButton.tsx` → RealityCheck
- [ ] Adaptiere für 3 Credit-Pakete (10/50/100)
- [ ] Kopiere `components/CreditsDisplay.tsx` → RealityCheck
- [ ] Erstelle Pricing Page mit 3 Paketen
- [ ] Kopiere `app/checkout/success/page.tsx` → RealityCheck
- [ ] Kopiere `app/checkout/cancel/page.tsx` → RealityCheck

### 9.6 Environment Variables

- [ ] Erstelle `.env.local`:
  ```env
  STRIPE_SECRET_KEY=sk_test_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  NEXT_PUBLIC_STRIPE_PRICE_ID_10=price_...
  NEXT_PUBLIC_STRIPE_PRICE_ID_50=price_...
  NEXT_PUBLIC_STRIPE_PRICE_ID_100=price_...
  NEXT_PUBLIC_URL=http://localhost:3000
  ```

### 9.7 Webhook Konfiguration

- [ ] **Development:**
  - [ ] Stripe CLI installieren
  - [ ] `stripe listen --forward-to localhost:3000/api/stripe/webhook`
  - [ ] Webhook Secret kopieren → `.env.local`
  
- [ ] **Production:**
  - [ ] Webhook Endpoint in Stripe Dashboard: `https://yourdomain.com/api/stripe/webhook`
  - [ ] Event: `checkout.session.completed` auswählen
  - [ ] Webhook Secret kopieren → Vercel Environment Variables

### 9.8 Testing

- [ ] Test-Zahlung mit Test-Karte: `4242 4242 4242 4242`
- [ ] Prüfe: Credits werden hinzugefügt
- [ ] Prüfe: Payment-Eintrag in `payments` Tabelle
- [ ] Prüfe: Webhook-Logs in Stripe Dashboard
- [ ] Prüfe: Success/Cancel Pages funktionieren

### 9.9 Production Deployment

- [ ] Stripe auf Live Mode umschalten
- [ ] Live API Keys in Vercel Environment Variables
- [ ] Live Price IDs in Vercel Environment Variables
- [ ] Live Webhook Secret in Vercel Environment Variables
- [ ] Webhook Endpoint in Stripe Dashboard konfigurieren
- [ ] Test-Zahlung mit Live-Mode (kleiner Betrag)

---

## 10. Security Checklist

### 10.1 API Keys

- [x] ✅ **Secret Keys in .env.local:** `STRIPE_SECRET_KEY` nicht in Code
- [x] ✅ **Keine NEXT_PUBLIC_ für Secrets:** Nur Price IDs sind public
- [x] ✅ **Gitignore:** `.env.local` in `.gitignore`
- [x] ✅ **Vercel Environment Variables:** Secrets in Vercel Dashboard

### 10.2 Webhook Security

- [x] ✅ **Signature Verification:** `stripe.webhooks.constructEvent()` verwendet
- [x] ✅ **Webhook Secret:** Separate Secret für Webhooks
- [x] ✅ **Service Role Key:** Nutzt `SUPABASE_SERVICE_ROLE_KEY` (nicht anon key)

### 10.3 User Validation

- [x] ✅ **userId aus Session:** Nicht aus Request Body
- [x] ✅ **Auth-Check:** `getCurrentUser()` vor Checkout
- [x] ✅ **RLS Policies:** Users können nur eigene Daten sehen

### 10.4 Rate Limiting

- [ ] ⚠️ **Nicht implementiert:** RealityCheck sollte Rate Limiting hinzufügen
  - [ ] Rate Limit auf `/api/stripe/checkout` (z.B. 5 Requests/Minute)
  - [ ] Nutze Vercel Edge Middleware oder Upstash

### 10.5 Payment Validation

- [x] ✅ **Metadata:** userId in Checkout Session Metadata
- [x] ✅ **Customer ID:** Verknüpfung mit Stripe Customer
- [ ] ⚠️ **Amount Verification:** RealityCheck sollte Payment Amount verifizieren
  - [ ] Prüfe ob Payment Amount mit erwartetem Betrag übereinstimmt

---

## 11. Code-Qualität

### 11.1 TypeScript

- [x] ✅ **Strict Mode:** TypeScript strict mode aktiviert
- [x] ✅ **Type Definitions:** Stripe Types aus `stripe` Package
- [x] ✅ **Type Safety:** Alle Funktionen typisiert

### 11.2 Validation

- [ ] ⚠️ **Zod Schemas:** Nicht verwendet, aber empfohlen für RealityCheck
  ```typescript
  import { z } from 'zod';
  
  const CheckoutRequestSchema = z.object({
    priceId: z.string().startsWith('price_'),
  });
  ```

### 11.3 Error Handling

- [x] ✅ **Try/Catch:** Alle async Funktionen haben Try/Catch
- [x] ✅ **Error Messages:** User-friendly Fehlermeldungen
- [x] ✅ **Logging:** Console.error für Debugging

### 11.4 Documentation

- [x] ✅ **Comments:** Wichtige Code-Stellen kommentiert
- [x] ✅ **README:** Stripe Setup dokumentiert
- [ ] ⚠️ **JSDoc:** RealityCheck sollte JSDoc hinzufügen

---

## 12. Performance

### 12.1 Caching

- [ ] ⚠️ **Price Caching:** Preise werden bei jedem Request geladen
  - [ ] RealityCheck sollte Preise cachen (z.B. 5 Minuten)
  - [ ] Nutze Next.js Cache oder Redis

### 12.2 Database Queries

- [x] ✅ **Indizes:** `idx_users_credits`, `idx_payments_user_id`
- [x] ✅ **Single Query:** Credits werden mit einem Query geladen
- [x] ✅ **RPC-Funktion:** Atomare Credit-Operation

### 12.3 Optimistic UI

- [ ] ⚠️ **Nicht implementiert:** RealityCheck könnte Optimistic UI hinzufügen
  - [ ] Zeige "Credits werden hinzugefügt..." während Webhook verarbeitet wird

---

## 13. Differences: KorrekturPilot vs RealityCheck

| Feature | KorrekturPilot | RealityCheck |
|---------|----------------|--------------|
| **Payment Type** | One-Time (25 Credits) | One-Time (10/50/100 Credits) |
| **Products** | 1 Paket (25 Credits für €7.90) | 3 Pakete (10/50/100 Credits) |
| **Recurring** | Nein | Nein |
| **Customer Portal** | Nein | Optional (für zukünftige Features) |
| **Free Tier** | Ja (1 Credit bei Registrierung) | Ja (0 Credits start) |
| **Credit Packages** | Fest (25 Credits) | Flexibel (10/50/100) |
| **Price IDs** | 1 Price ID | 3 Price IDs |
| **Webhook Logic** | Fest (25 Credits) | Dynamisch (basierend auf Price ID) |

### 13.1 Anpassungen für RealityCheck

**1. Dynamische Credit-Anzahl im Webhook:**

```typescript
// Mapping: Price ID → Credits
const PRICE_TO_CREDITS: Record<string, number> = {
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_10!]: 10,
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_50!]: 50,
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_100!]: 100,
};

// Im Webhook:
const priceId = session.line_items?.data[0]?.price?.id;
const creditsToAdd = PRICE_TO_CREDITS[priceId] || 0;
```

**2. Checkout Route mit Price ID Parameter:**

```typescript
export async function POST(req: Request) {
  const { priceId } = await req.json();
  
  // Validiere Price ID
  const validPriceIds = [
    process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_10,
    process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_50,
    process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_100,
  ];
  
  if (!validPriceIds.includes(priceId)) {
    return NextResponse.json({ error: 'Ungültige Price ID' }, { status: 400 });
  }
  
  // ... Rest der Checkout-Logik ...
}
```

**3. Pricing Page mit 3 Paketen:**

```typescript
const CREDIT_PACKAGES = [
  { id: '10', priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_10, credits: 10, price: 5.00 },
  { id: '50', priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_50, credits: 50, price: 20.00 },
  { id: '100', priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_100, credits: 100, price: 35.00 },
];
```

---

## 📝 Zusammenfassung

### Was RealityCheck übernehmen sollte:

1. ✅ **Stripe Client Setup** (`lib/stripe.ts`)
2. ✅ **Checkout Route Pattern** (`app/api/stripe/checkout/route.ts`)
3. ✅ **Webhook Route Pattern** (`app/api/stripe/webhook/route.ts`)
4. ✅ **Database Schema** (Users + Payments Tables)
5. ✅ **Credit Management Functions** (`lib/user-credits.ts`)
6. ✅ **Frontend Components** (BuyCreditsButton, CreditsDisplay)
7. ✅ **Success/Cancel Pages**
8. ✅ **Error Handling Patterns**
9. ✅ **Security Best Practices**

### Was RealityCheck anpassen muss:

1. ⚠️ **3 Credit-Pakete** statt 1 (10/50/100 Credits)
2. ⚠️ **Dynamische Price IDs** im Checkout
3. ⚠️ **Dynamische Credit-Anzahl** im Webhook
4. ⚠️ **Pricing Page** mit 3 Paketen
5. ⚠️ **Price ID Mapping** (Price ID → Credits)

### Was RealityCheck zusätzlich implementieren sollte:

1. ⚠️ **Rate Limiting** auf Checkout Route
2. ⚠️ **Idempotency Check** im Webhook
3. ⚠️ **Price Caching** (5 Minuten)
4. ⚠️ **Zod Validation** für Request Bodies
5. ⚠️ **Payment Amount Verification** im Webhook

---

## 🚀 Nächste Schritte für RealityCheck

1. **Stripe Account Setup** (Test + Live)
2. **Products erstellen** (10/50/100 Credits)
3. **Code übernehmen** (siehe Migration Checklist)
4. **Anpassungen** (dynamische Price IDs, Credit-Mapping)
5. **Testing** (Stripe Test Cards, Stripe CLI)
6. **Production Deployment** (Live Keys, Webhook Setup)

---

**Erstellt:** 2024  
**Basierend auf:** KorrekturPilot Codebase  
**Zweck:** Wiederverwendbare Patterns für RealityCheck Credit-System

