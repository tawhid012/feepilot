import { motion } from "framer-motion";
import { UserPlus, Bell, CreditCard, CheckCircle } from "lucide-react";

const steps = [
  { icon: UserPlus, label: "Add Students", desc: "Enter student details & parent phone" },
  { icon: Bell, label: "Auto Reminders", desc: "WhatsApp reminders sent automatically" },
  { icon: CreditCard, label: "UPI Payment", desc: "Parents pay via shared UPI link" },
  { icon: CheckCircle, label: "Track & Receipt", desc: "Payments tracked, receipts sent" },
];

export function SolutionSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">The Solution</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground text-balance">
            Automate the entire fee cycle
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-elevated">
                <s.icon size={28} className="text-primary-foreground" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-1">{s.label}</h3>
              <p className="text-xs text-muted-foreground">{s.desc}</p>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
