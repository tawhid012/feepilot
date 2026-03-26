import { motion } from "framer-motion";
import { MessageSquare, CreditCard, BarChart3, FileText, Zap, Shield } from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "WhatsApp Automation",
    desc: "Send fee reminders directly to parents' WhatsApp. No app download needed.",
  },
  {
    icon: CreditCard,
    title: "UPI Payment Links",
    desc: "Generate instant UPI payment links. Parents pay in one tap.",
  },
  {
    icon: BarChart3,
    title: "Payment Tracking",
    desc: "Real-time dashboard showing paid, pending, and overdue fees.",
  },
  {
    icon: FileText,
    title: "Auto Receipts",
    desc: "Automatic receipt sent via WhatsApp when payment is marked received.",
  },
  {
    icon: Zap,
    title: "Monthly Automation",
    desc: "Payment records and reminders auto-generated every month.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    desc: "Your data stays safe. Student info is encrypted and never shared.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-28 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Features</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground text-balance">
            Everything you need to collect fees effortlessly
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group bg-card rounded-2xl p-6 shadow-card border border-border hover:shadow-elevated hover:border-primary/20 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4 group-hover:gradient-primary group-hover:shadow-elevated transition-all duration-300">
                <f.icon size={22} className="text-primary group-hover:text-primary-foreground transition-colors duration-300" />
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
