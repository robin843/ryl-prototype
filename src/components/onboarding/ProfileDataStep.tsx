import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar, User, ChevronRight } from "lucide-react";

interface ProfileDataStepProps {
  onNext: (data: { birthdate: string; gender: string; age: number }) => void;
  onSkip: () => void;
}

const GENDER_OPTIONS = [
  { value: "female", label: "Weiblich" },
  { value: "male", label: "Männlich" },
  { value: "diverse", label: "Divers" },
  { value: "prefer_not_to_say", label: "Keine Angabe" },
];

function calculateAge(birthdate: string): number {
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function ProfileDataStep({ onNext, onSkip }: ProfileDataStepProps) {
  const [birthdate, setBirthdate] = useState("");
  const [gender, setGender] = useState("");

  const isValid = birthdate && gender;

  const handleSubmit = () => {
    if (!isValid) return;
    const age = calculateAge(birthdate);
    onNext({ birthdate, gender, age });
  };

  // Calculate max date (must be at least 13 years old)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 13);
  const maxDateStr = maxDate.toISOString().split("T")[0];

  // Calculate min date (reasonable limit of 120 years)
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 120);
  const minDateStr = minDate.toISOString().split("T")[0];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <User className="w-8 h-8 text-primary" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2 text-center">
          Erzähl uns mehr über dich
        </h1>
        <p className="text-muted-foreground text-center mb-8 max-w-sm">
          Diese Infos helfen uns, dir passendere Inhalte zu zeigen
        </p>

        <div className="w-full max-w-sm space-y-6">
          {/* Birthdate */}
          <div className="space-y-2">
            <Label htmlFor="birthdate" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Geburtsdatum
            </Label>
            <Input
              id="birthdate"
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              max={maxDateStr}
              min={minDateStr}
              className="bg-background"
            />
          </div>

          {/* Gender */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Geschlecht
            </Label>
            <RadioGroup value={gender} onValueChange={setGender} className="space-y-2">
              {GENDER_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    gender === option.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setGender(option.value)}
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="cursor-pointer flex-1">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-3">
        <Button
          onClick={handleSubmit}
          disabled={!isValid}
          className="w-full"
          size="lg"
        >
          Weiter
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
        <Button
          variant="ghost"
          onClick={onSkip}
          className="w-full text-muted-foreground"
        >
          Überspringen
        </Button>
      </div>
    </div>
  );
}
