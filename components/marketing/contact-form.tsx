"use client";

import { CheckCircle2, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const inquiryTypes = [
  { value: "university", label: "University Global Distribution" },
  { value: "audit", label: "Free Postage Cost Audit" },
  { value: "warehouse", label: "Virtual Warehouse Demo" },
  { value: "corporate", label: "Corporate Event Logistics" },
];

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    org: "",
    email: "",
    subject: "university",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Mock network request delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="p-8 rounded-2xl border border-primary/20 bg-primary/5 text-center flex flex-col items-center justify-center min-h-[350px]">
        <div className="p-3 bg-primary/10 text-primary rounded-full mb-4 animate-bounce">
          <CheckCircle2 className="size-8" />
        </div>
        <h3 className="font-bold text-lg text-foreground mb-2">
          Inquiry Submitted!
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm leading-relaxed mb-6">
          Thank you for reaching out to PDi UK. Our logistics consultants will
          review your request and contact you within 1 business day.
        </p>
        <Button
          onClick={() => setIsSubmitted(false)}
          variant="outline"
          size="sm"
        >
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8 rounded-2xl border border-border bg-card/50">
      <h2 className="text-xl font-bold mb-6">Request a Quote or Audit</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label
              className="text-xs font-semibold text-muted-foreground"
              htmlFor="name"
            >
              Full Name
            </label>
            <Input
              id="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-1.5">
            <label
              className="text-xs font-semibold text-muted-foreground"
              htmlFor="org"
            >
              Organization / University
            </label>
            <Input
              id="org"
              placeholder="e.g. University of Aylesbury"
              value={formData.org}
              onChange={(e) =>
                setFormData({ ...formData, org: e.target.value })
              }
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            className="text-xs font-semibold text-muted-foreground"
            htmlFor="email"
          >
            Work Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.edu.uk"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
        </div>

        <div className="space-y-1.5 font-sans">
          <label
            className="text-xs font-semibold text-muted-foreground"
            htmlFor="subject"
          >
            Inquiry Type
          </label>
          <Select
            items={inquiryTypes}
            value={formData.subject}
            onValueChange={(val) =>
              setFormData({ ...formData, subject: val ?? "" })
            }
          >
            <SelectTrigger
              id="subject"
              className="w-full h-9 bg-transparent border-input text-foreground font-sans text-left"
            >
              <SelectValue placeholder="Select inquiry type" />
            </SelectTrigger>
            <SelectContent className="w-full bg-popover border border-border text-popover-foreground">
              <SelectGroup>
                <SelectLabel>Inquiry Type</SelectLabel>
                {inquiryTypes.map((type) => (
                  <SelectItem
                    key={type.value}
                    value={type.value}
                    className="hover:bg-muted focus:bg-muted text-foreground cursor-pointer"
                  >
                    {type.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label
            className="text-xs font-semibold text-muted-foreground"
            htmlFor="message"
          >
            Message / Campaign Details
          </label>
          <Textarea
            id="message"
            placeholder="Provide details about your mailing volumes, destinations, or event schedule..."
            className="min-h-[120px]"
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full flex items-center justify-center gap-2"
          variant="hero"
          disabled={isSubmitting}
        >
          <Send className="size-4" />
          {isSubmitting ? "Sending..." : "Send Inquiry"}
        </Button>
      </form>
    </div>
  );
}
