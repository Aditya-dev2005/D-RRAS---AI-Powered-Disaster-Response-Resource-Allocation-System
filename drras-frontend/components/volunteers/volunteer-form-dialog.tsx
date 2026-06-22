"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRegisterVolunteer } from "@/hooks/use-volunteers";
import { getApiErrorMessage } from "@/lib/api-client";
import { titleCase } from "@/lib/utils";
import type { SkillType } from "@/lib/types";

const SKILLS: SkillType[] = ["doctor", "driver", "engineer", "rescue_worker"];

const EMPTY_FORM = { name: "", phone: "", email: "", skill_type: "doctor" as SkillType, city: "" };

export function VolunteerFormDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const registerVolunteer = useRegisterVolunteer();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    registerVolunteer.mutate(form, {
      onSuccess: () => {
        toast.success(`${form.name} registered as a volunteer`);
        onOpenChange(false);
        setForm(EMPTY_FORM);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Register a volunteer</DialogTitle>
          <DialogDescription>
            They&apos;ll be eligible for greedy matching against open requests in their city.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                minLength={10}
                maxLength={15}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="skill">Skill</Label>
              <Select
                value={form.skill_type}
                onValueChange={(v) => setForm({ ...form, skill_type: v as SkillType })}
              >
                <SelectTrigger id="skill">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SKILLS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {titleCase(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={registerVolunteer.isPending}>
              {registerVolunteer.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Register
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
