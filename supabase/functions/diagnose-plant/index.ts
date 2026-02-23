import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { imageUrl } = await req.json();
    if (!imageUrl) {
      return new Response(JSON.stringify({ error: "imageUrl required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use Lovable AI with tool calling to get structured diagnosis
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are an expert agricultural plant pathologist trained on the PlantVillage dataset (50,000+ images, 38 crop-disease classes). Given an image of a plant leaf, identify:
1. The plant species (e.g., Tomato, Rice, Cotton, Potato, Corn, Grape, Apple, etc.)
2. The disease (or "Healthy" if no disease detected)
3. A confidence score from 0.0 to 1.0
4. A severity score from 0.0 to 1.0 (0 = no damage, 1 = severe)
5. 3-5 specific treatment recommendations
6. 3-5 prevention steps

Base your analysis on visible symptoms: leaf spots, discoloration, wilting, lesions, mold, powdery coating, curling, necrosis patterns. If the image is unclear or not a plant leaf, still provide your best assessment with low confidence.`,
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this plant leaf image for species identification and disease detection." },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "plant_diagnosis",
              description: "Return structured plant disease diagnosis results",
              parameters: {
                type: "object",
                properties: {
                  plant_species: { type: "string", description: "Plant species name e.g. Tomato, Rice, Cotton" },
                  disease_name: { type: "string", description: "Disease name or 'Healthy'" },
                  confidence: { type: "number", description: "Confidence 0.0-1.0" },
                  severity: { type: "number", description: "Severity 0.0-1.0" },
                  treatments: {
                    type: "array",
                    items: { type: "string" },
                    description: "3-5 treatment recommendations",
                  },
                  prevention_steps: {
                    type: "array",
                    items: { type: "string" },
                    description: "3-5 prevention steps",
                  },
                },
                required: ["plant_species", "disease_name", "confidence", "severity", "treatments", "prevention_steps"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "plant_diagnosis" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI error:", status, errText);
      throw new Error("AI analysis failed");
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    let diagnosis;
    if (toolCall?.function?.arguments) {
      diagnosis = JSON.parse(toolCall.function.arguments);
    } else {
      // Fallback
      diagnosis = {
        plant_species: "Unknown",
        disease_name: "Unable to identify",
        confidence: 0.1,
        severity: 0,
        treatments: ["Please upload a clearer image of the leaf"],
        prevention_steps: ["Ensure good lighting when taking photos"],
      };
    }

    // Clamp values
    diagnosis.confidence = Math.max(0, Math.min(1, diagnosis.confidence));
    diagnosis.severity = Math.max(0, Math.min(1, diagnosis.severity));

    // Save to database
    const { data: scanRecord, error: dbError } = await supabase
      .from("scan_images")
      .insert({
        user_id: user.id,
        image_url: imageUrl,
        plant_species: diagnosis.plant_species,
        disease_name: diagnosis.disease_name,
        severity: diagnosis.severity,
        confidence: diagnosis.confidence,
        treatments: diagnosis.treatments,
        prevention_steps: diagnosis.prevention_steps,
      })
      .select()
      .single();

    if (dbError) {
      console.error("DB error:", dbError);
      throw new Error("Failed to save scan result");
    }

    return new Response(JSON.stringify({ ...diagnosis, id: scanRecord.id, image_url: imageUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("diagnose-plant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
