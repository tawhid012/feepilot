import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Math Tutor, Delhi",
    text: "FeePilot saved me 5 hours every month. Parents pay on time now — I don't even have to remind them anymore.",
    rating: 5,
  },
  {
    name: "Rajesh Kumar",
    role: "Coaching Center Owner, Jaipur",
    text: "Managing fees for 80 students was a nightmare. FeePilot made it effortless. The WhatsApp reminders are a game-changer.",
    rating: 5,
  },
  {
    name: "Anita Desai",
    role: "Music Teacher, Mumbai",
    text: "I love how simple it is. Add students, click send — that's it. Parents love the UPI payment links too.",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Testimonials</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground text-balance">
            Loved by tutors across India
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl p-6 shadow-card border border-border"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, si) => (
                  <Star key={si} size={16} className="fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm text-foreground leading-relaxed mb-4">"{t.text}"</p>
              <div>
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
