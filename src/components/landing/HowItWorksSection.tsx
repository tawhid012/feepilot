import { motion } from "framer-motion";
import { UserPlus, Send, CreditCard, BarChart } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Add your students",
    desc: "Enter student name, parent phone number, and monthly fee. Takes 30 seconds per student.",
  },
  {
    icon: Send,
    step: "02",
    title: "Send fee reminders",
    desc: "With one click, send a WhatsApp message to parents with the fee amount and UPI payment link.",
  },
  {
    icon: CreditCard,
    step: "03",
    title: "Parents pay via UPI",
    desc: "Parents tap the link, pay through any UPI app (GPay, PhonePe, Paytm) — done in seconds.",
  },
  {
    icon: BarChart,
    step: "04",
    title: "Track everything",
    desc: "See who paid, who didn't, and how much you've collected — all in one clean dashboard.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">How It Works</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground text-balance">
            Four simple steps to automate fees
          </h2>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-8">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-6 items-start"
            >
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-elevated">
                <s.icon size={24} className="text-primary-foreground" />
              </div>
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Step {s.step}</p>
                <h3 className="font-display font-semibold text-lg text-foreground mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
