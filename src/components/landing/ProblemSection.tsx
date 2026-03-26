import { motion } from "framer-motion";
import { Clock, AlertTriangle, FileSpreadsheet } from "lucide-react";

const problems = [
  {
    icon: Clock,
    title: "Manual reminders waste hours",
    description: "You spend more time chasing payments than teaching. Every month, same calls, same messages.",
  },
  {
    icon: AlertTriangle,
    title: "Late payments pile up",
    description: "Parents forget, delay, or miss payments. Without a system, fees slip through the cracks.",
  },
  {
    icon: FileSpreadsheet,
    title: "Tracking is a nightmare",
    description: "Notebooks, spreadsheets, memory — nothing gives you a clear picture of who paid and who didn't.",
  },
];

export function ProblemSection() {
  return (
    <section className="py-20 md:py-28 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">The Problem</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground text-balance">
            Fee collection shouldn't be this painful
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {problems.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl p-6 shadow-card border border-border hover:shadow-soft transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-4">
                <p.icon size={22} className="text-destructive" />
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
