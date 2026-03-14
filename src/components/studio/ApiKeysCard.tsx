import { useState, useEffect, useCallback } from "react";
import { Key, Plus, Copy, Trash2, Loader2, Webhook, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  is_active: boolean;
  is_global: boolean;
  last_used_at: string | null;
  created_at: string;
}

interface WebhookSub {
  id: string;
  url: string;
  events: string[];
  is_active: boolean;
  created_at: string;
}

export function ApiKeysCard() {
  const { user } = useAuth();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookSub[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [showWebhookForm, setShowWebhookForm] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookEvents, setWebhookEvents] = useState<string[]>(["episode_uploaded"]);
  const [revealedSecret, setRevealedSecret] = useState<string | null>(null);

  const AVAILABLE_EVENTS = [
    "episode_uploaded",
    "episode_published",
    "purchase_made",
    "series_created",
    "video_processed",
  ];

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [keysRes, webhooksRes] = await Promise.all([
        supabase.functions.invoke("api-manage-keys", { method: "GET" }),
        supabase.functions.invoke("api-webhooks", { method: "GET" }),
      ]);
      if (keysRes.data?.keys) setKeys(keysRes.data.keys);
      if (webhooksRes.data?.webhooks) setWebhooks(webhooksRes.data.webhooks);
    } catch (e) {
      console.error("Failed to load API data", e);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const createKey = async () => {
    if (!newKeyName.trim()) {
      toast.error("Bitte einen Namen eingeben");
      return;
    }
    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("api-manage-keys", {
        method: "POST",
        body: { name: newKeyName.trim() },
      });
      if (error) throw error;
      setRevealedKey(data.api_key);
      setNewKeyName("");
      loadData();
      toast.success("API Key erstellt!");
    } catch (e) {
      toast.error("Fehler beim Erstellen");
    }
    setCreating(false);
  };

  const revokeKey = async (id: string) => {
    try {
      await supabase.functions.invoke(`api-manage-keys?id=${id}`, { method: "DELETE" });
      loadData();
      toast.success("API Key widerrufen");
    } catch {
      toast.error("Fehler beim Widerrufen");
    }
  };

  const createWebhook = async () => {
    if (!webhookUrl.trim() || webhookEvents.length === 0) {
      toast.error("URL und mindestens ein Event erforderlich");
      return;
    }
    try {
      const { data, error } = await supabase.functions.invoke("api-webhooks", {
        method: "POST",
        body: { url: webhookUrl.trim(), events: webhookEvents },
      });
      if (error) throw error;
      setRevealedSecret(data.secret);
      setWebhookUrl("");
      setShowWebhookForm(false);
      loadData();
      toast.success("Webhook erstellt!");
    } catch {
      toast.error("Fehler beim Erstellen");
    }
  };

  const deleteWebhook = async (id: string) => {
    try {
      await supabase.functions.invoke(`api-webhooks?id=${id}`, { method: "DELETE" });
      loadData();
      toast.success("Webhook gelöscht");
    } catch {
      toast.error("Fehler beim Löschen");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Kopiert!");
  };

  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const baseUrl = `https://${projectId}.supabase.co/functions/v1`;

  if (loading) {
    return (
      <div className="p-4 rounded-xl bg-card border border-border/30 flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* API Keys Section */}
      <div className="p-4 rounded-xl bg-card border border-border/30">
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-4 h-4 text-gold" />
          <h3 className="text-title">API Keys</h3>
        </div>

        {/* API Docs hint */}
        <div className="mb-4 p-3 rounded-lg bg-gold/5 border border-gold/10 text-xs text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Upload-Endpoint:</p>
          <code className="text-[10px] break-all">POST {baseUrl}/api-upload-episode</code>
          <p className="mt-2">Header: <code>Authorization: Bearer {"<API_KEY>"}</code></p>
          <p className="mt-1">Body: <code>multipart/form-data</code> mit <code>video_file</code>, <code>series_name</code>, <code>title</code>, etc.</p>
        </div>

        {/* Revealed key */}
        {revealedKey && (
          <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <p className="text-xs text-green-400 mb-1 font-medium">⚠️ Diesen Key sicher speichern — er wird nur einmal angezeigt:</p>
            <div className="flex items-center gap-2">
              <code className="text-xs break-all flex-1 text-green-300">{revealedKey}</code>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyToClipboard(revealedKey)}>
                <Copy className="w-3 h-3" />
              </Button>
            </div>
            <Button size="sm" variant="ghost" className="mt-2 text-xs" onClick={() => setRevealedKey(null)}>
              Verstanden, schließen
            </Button>
          </div>
        )}

        {/* Create form */}
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Key-Name (z.B. Make Automation)"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            className="text-sm"
          />
          <Button size="sm" onClick={createKey} disabled={creating}>
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          </Button>
        </div>

        {/* Key list */}
        {keys.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">Noch keine API Keys erstellt.</p>
        ) : (
          <div className="space-y-2">
            {keys.map((k) => (
              <div key={k.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 text-xs">
                <div>
                  <p className="font-medium">{k.name}</p>
                  <p className="text-muted-foreground">{k.key_prefix} • {k.is_active ? "Aktiv" : "Widerrufen"}</p>
                  {k.last_used_at && (
                    <p className="text-muted-foreground text-[10px]">
                      Zuletzt: {new Date(k.last_used_at).toLocaleDateString("de")}
                    </p>
                  )}
                </div>
                {k.is_active && (
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => revokeKey(k.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Webhooks Section */}
      <div className="p-4 rounded-xl bg-card border border-border/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Webhook className="w-4 h-4 text-gold" />
            <h3 className="text-title">Webhooks</h3>
          </div>
          <Button size="sm" variant="subtle" onClick={() => setShowWebhookForm(!showWebhookForm)}>
            <Plus className="w-4 h-4 mr-1" />
            Neu
          </Button>
        </div>

        {/* Revealed secret */}
        {revealedSecret && (
          <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <p className="text-xs text-green-400 mb-1 font-medium">⚠️ Signing Secret sicher speichern:</p>
            <div className="flex items-center gap-2">
              <code className="text-xs break-all flex-1 text-green-300">{revealedSecret}</code>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyToClipboard(revealedSecret)}>
                <Copy className="w-3 h-3" />
              </Button>
            </div>
            <Button size="sm" variant="ghost" className="mt-2 text-xs" onClick={() => setRevealedSecret(null)}>
              Verstanden, schließen
            </Button>
          </div>
        )}

        {/* Create webhook form */}
        {showWebhookForm && (
          <div className="mb-4 p-3 rounded-lg bg-secondary/30 space-y-3">
            <Input
              placeholder="https://hook.integromat.com/..."
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="text-sm"
            />
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_EVENTS.map((evt) => (
                <button
                  key={evt}
                  onClick={() => setWebhookEvents(prev =>
                    prev.includes(evt) ? prev.filter(e => e !== evt) : [...prev, evt]
                  )}
                  className={`px-2 py-1 rounded-full text-[10px] border transition-colors ${
                    webhookEvents.includes(evt)
                      ? "bg-gold/20 border-gold/40 text-gold"
                      : "border-border/30 text-muted-foreground"
                  }`}
                >
                  {evt}
                </button>
              ))}
            </div>
            <Button size="sm" onClick={createWebhook}>Webhook erstellen</Button>
          </div>
        )}

        {/* Webhook list */}
        {webhooks.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">Keine Webhooks konfiguriert.</p>
        ) : (
          <div className="space-y-2">
            {webhooks.map((wh) => (
              <div key={wh.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 text-xs">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{wh.url}</p>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {wh.events.map((e) => (
                      <span key={e} className="px-1.5 py-0.5 rounded bg-gold/10 text-gold text-[9px]">{e}</span>
                    ))}
                  </div>
                </div>
                <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive flex-shrink-0" onClick={() => deleteWebhook(wh.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
