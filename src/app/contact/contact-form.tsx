"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  BadgeCheck,
  MessageCircleHeart,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const contactSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Please enter your name (min 2 chars)." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z
    .string()
    .min(10, { message: "Please enter a valid BD phone number." })
    .regex(/^(?:\+8801|01)[3-9]\d{8}$/, {
      message: "Use BD format: 01XXXXXXXXX or +8801XXXXXXXXX",
    }),
  topic: z.enum(
    [
      "general",
      "business",
      "courier",
      "tracking",
      "payment",
      "complaint",
    ],
    { message: "Please select a topic." },
  ),
  message: z
    .string()
    .min(10, { message: "Message should be at least 10 characters." })
    .max(2000, { message: "Message is too long (max 2000 chars)." }),
});

type ContactSchema = z.infer<typeof contactSchema>;

const topicLabels: Record<ContactSchema["topic"], string> = {
  general: "General enquiry",
  business: "Business / Corporate account",
  courier: "Become a courier",
  tracking: "Tracking / shipment issue",
  payment: "Payment / refund",
  complaint: "Complaint / escalation",
};

export default function ContactForm() {
  const form = useForm<ContactSchema>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      topic: "general",
      message: "",
    },
  });

  const onSubmit = (values: ContactSchema) => {
    // Demo mode — no backend yet. Wire up to POST /contact later when needed.
    // eslint-disable-next-line no-console
    console.info("Contact form submitted", values);
    toast.success(
      `Thanks, ${values.name.split(" ")[0]}! We received your message — our ${
        topicLabels[values.topic]
      } team will reply within 3 minutes (business hours).`,
      {
        description: `We sent a confirmation to ${values.email}. Save ref #CFY-${Math.floor(
          100000 + Math.random() * 900000,
        )}.`,
      },
    );
    form.reset();
  };

  return (
    <Card className="border-muted bg-card/70 backdrop-blur">
      <CardHeader>
        <div className="flex items-center gap-2 text-primary">
          <MessageCircleHeart className="h-5 w-5" />
          <Badge variant="secondary" className="gap-1">
            Send us a message
          </Badge>
        </div>
        <CardTitle className="text-2xl font-bold pt-2">
          Tell us what you need
        </CardTitle>
        <CardDescription>
          Fill the form below — choose a topic so the right team picks it up.
          We respond within 3 minutes (business hours) and reply to every
          single message.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5"
          >
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Md. Rakib Hasan"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bangladesh phone</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="01712 345678"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select topic" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="general">General enquiry</SelectItem>
                        <SelectItem value="business">
                          Business / Corporate account
                        </SelectItem>
                        <SelectItem value="courier">
                          Become a courier (APPROVED onboarding)
                        </SelectItem>
                        <SelectItem value="tracking">
                          Shipment / tracking issue
                        </SelectItem>
                        <SelectItem value="payment">
                          Payment / refund question
                        </SelectItem>
                        <SelectItem value="complaint">
                          Complaint / escalation
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your message</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={6}
                      placeholder="Tell us what you need — e.g. 'I run a clothing shop in Uttara and send ~350 parcels/month. I want to know about EXPRESS corporate pricing, CSV import and bKash COD payout...'"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <span>
                      Tip: include your tracking ID or corporate name if
                      applicable.
                    </span>
                    <span>{field.value?.length ?? 0}/2000</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              size="lg"
              className="gap-2 w-full sm:w-auto"
              disabled={form.formState.isSubmitting}
            >
              <Send className="h-4 w-4" />
              {form.formState.isSubmitting ? "Sending..." : "Send message"}
            </Button>

            <p className="text-xs text-muted-foreground flex items-start gap-2 pt-2">
              <BadgeCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              Your details are used solely to reply to this enquiry. We never
              share or sell your phone or email.
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
