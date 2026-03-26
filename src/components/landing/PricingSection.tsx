import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Trial",
    price: "₹1",
    period: "for 30 days",
    desc: "Try everything risk-free",
    popular: false,
    features: [
      "Up to 25 students",
      "WhatsApp reminders",
      "UPI link generation",
      "Payment tracking",
      "Auto receipts",
    ],
  },
  {
    name: "Monthly",
    price: "₹299",
    period: "/month",
    desc: "Best for growing tutors",
    popular: true,
    features: [
      "Unlimited students",
      "WhatsApp reminders",
      "UPI link generation",
      "Payment tracking",
      "Auto receipts",
      "Monthly automation",
      "Priority support",
    ],
  },
  {
    name: "Lifetime",
    price: "₹2,499",
    period: "one-time",
    desc: "Pay once, use forever",
    popular: false,
    features: [
      "Everything in Monthly",
      "Unlimited students",
      "Lifetime updates",
      "No recurring charges",
      "Priority support",
    ],
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 md:py-28 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Pricing</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground text-balance">
            Simple pricing, no surprises
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative bg-card rounded-2xl p-6 border transition-all duration-300 ${
                plan.popular
                  ? "border-primary shadow-elevated scale-[1.02]"
                  : "border-border shadow-card hover:shadow-soft"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gradient-primary text-primary-foreground text-xs font-semibold">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-display font-semibold text-lg text-foreground">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.desc}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((f, fi) => (
                  <li key={fi} className="flex items-center gap-2 text-sm text-foreground">
                    <Check size={16} className="text-primary flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link to="/login">
                <Button
                  className={`w-full ${
                    plan.popular
                      ? "gradient-primary text-primary-foreground border-0 shadow-elevated hover:opacity-90"
                      : ""
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  Get Started
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
