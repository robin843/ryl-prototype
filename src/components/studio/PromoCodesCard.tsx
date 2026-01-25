import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Ticket, Plus, Copy, Trash2, TrendingUp } from "lucide-react";
import { usePromoCodes, PromoCode } from "@/hooks/usePromoCodes";
import { toast } from "sonner";

export function PromoCodesCard() {
  const { codes, stats, isLoading, createCode, updateCode, deleteCode } = usePromoCodes();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [formCode, setFormCode] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "amount">("percent");
  const [discountValue, setDiscountValue] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [campaignName, setCampaignName] = useState("");

  const resetForm = () => {
    setFormCode("");
    setDiscountType("percent");
    setDiscountValue("");
    setUsageLimit("");
    setCampaignName("");
  };

  const handleCreate = async () => {
    setIsCreating(true);

    const result = await createCode({
      code: formCode,
      discount_percent: discountType === "percent" ? parseInt(discountValue) : undefined,
      discount_amount_cents: discountType === "amount" ? parseInt(discountValue) * 100 : undefined,
      usage_limit: usageLimit ? parseInt(usageLimit) : undefined,
      campaign_name: campaignName || undefined,
    });

    setIsCreating(false);

    if (result) {
      toast.success(`Promo Code ${result.code} erstellt!`);
      setIsCreateOpen(false);
      resetForm();
    } else {
      toast.error("Code konnte nicht erstellt werden");
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code kopiert!");
  };

  const handleToggleStatus = async (code: PromoCode) => {
    const newStatus = code.status === "active" ? "disabled" : "active";
    const success = await updateCode(code.id, { status: newStatus });
    if (success) {
      toast.success(`Code ${newStatus === "active" ? "aktiviert" : "deaktiviert"}`);
    }
  };

  const handleDelete = async (code: PromoCode) => {
    if (!confirm(`Code "${code.code}" wirklich löschen?`)) return;
    const success = await deleteCode(code.id);
    if (success) {
      toast.success("Code gelöscht");
    }
  };

  const formatDiscount = (code: PromoCode) => {
    if (code.discount_percent) return `${code.discount_percent}%`;
    if (code.discount_amount_cents) return `€${(code.discount_amount_cents / 100).toFixed(2)}`;
    return "-";
  };

  return (
    <Card className="border-border/50 overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center shrink-0">
            <Ticket className="h-5 w-5 text-gold" />
          </div>
          <div>
            <CardTitle className="text-lg">Promo Codes</CardTitle>
            <CardDescription className="text-sm mt-0.5">
              Erstelle Rabattcodes für deine Produkte
            </CardDescription>
          </div>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="shrink-0">
              <Plus className="h-4 w-4 mr-1" />
              Neuer Code
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neuen Promo Code erstellen</DialogTitle>
              <DialogDescription>
                Erstelle einen Rabattcode, den Käufer beim Checkout eingeben können.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code (4-12 Zeichen)</Label>
                <Input
                  id="code"
                  placeholder="z.B. SOMMER25"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  maxLength={12}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rabatt-Typ</Label>
                  <Select value={discountType} onValueChange={(v) => setDiscountType(v as "percent" | "amount")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">Prozent (%)</SelectItem>
                      <SelectItem value="amount">Fixbetrag (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount">
                    {discountType === "percent" ? "Prozent (1-50)" : "Betrag in €"}
                  </Label>
                  <Input
                    id="discount"
                    type="number"
                    placeholder={discountType === "percent" ? "15" : "5"}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    min={discountType === "percent" ? 1 : 1}
                    max={discountType === "percent" ? 50 : undefined}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="usageLimit">Max. Nutzungen (optional)</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    placeholder="Unbegrenzt"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    min={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="campaign">Kampagne (optional)</Label>
                  <Input
                    id="campaign"
                    placeholder="z.B. Instagram Story"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Abbrechen
              </Button>
              <Button
                onClick={handleCreate}
                disabled={isCreating || !formCode || !discountValue}
              >
                {isCreating ? "Erstelle..." : "Code erstellen"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="text-center p-4 bg-muted/30 rounded-xl border border-border/30">
            <div className="text-2xl font-bold text-foreground">{stats.totalCodes}</div>
            <div className="text-xs text-muted-foreground mt-1">Codes</div>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-xl border border-border/30">
            <div className="text-2xl font-bold text-gold">{stats.activeCodes}</div>
            <div className="text-xs text-muted-foreground mt-1">Aktiv</div>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-xl border border-border/30">
            <div className="text-2xl font-bold text-foreground">{stats.totalUsages}</div>
            <div className="text-xs text-muted-foreground mt-1">Eingelöst</div>
          </div>
        </div>

        {/* Code List */}
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Lade Codes...</div>
        ) : codes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="w-12 h-12 rounded-xl bg-muted/50 mx-auto mb-3 flex items-center justify-center">
              <Ticket className="h-6 w-6 opacity-50" />
            </div>
            <p className="font-medium">Noch keine Promo Codes erstellt</p>
            <p className="text-sm mt-1">Erstelle deinen ersten Code, um Käufer zu incentivieren!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {codes.map((code) => (
              <div
                key={code.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <code className="font-mono font-bold text-lg">{code.code}</code>
                      <Badge
                        variant={code.status === "active" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {code.status === "active" ? "Aktiv" : "Deaktiviert"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {formatDiscount(code)} Rabatt
                      </span>
                      <span>
                        {code.used_count}
                        {code.usage_limit ? `/${code.usage_limit}` : ""} genutzt
                      </span>
                      {code.campaign_name && (
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {code.campaign_name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(code.code)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Switch
                    checked={code.status === "active"}
                    onCheckedChange={() => handleToggleStatus(code)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(code)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
