import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MessageSquare, ArrowRight, Smartphone, CreditCard } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center gradient-hero overflow-hidden pt-16">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6 py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-medium mb-6">
              <MessageSquare size={14} />
              WhatsApp + UPI Automation
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight text-balance mb-6">
              Stop chasing fees.{" "}
              <span className="text-primary">Get paid automatically.</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-lg mb-8 leading-relaxed">
              Send fee reminders via WhatsApp, share UPI payment links, and track
              every payment — all on autopilot. Built for tutors and coaching centers.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/login">
                <Button
                  size="lg"
                  className="gradient-primary text-primary-foreground border-0 shadow-elevated hover:opacity-90 transition-opacity text-base px-8 h-12"
                >
                  Start for ₹1
                  <ArrowRight className="ml-2" size={18} />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-base h-12 px-8"
                >
                  See how it works
                </Button>
              </a>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              30-day trial • No credit card required • Cancel anytime
            </p>
          </motion.div>

          {/* Right — glass card mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="animate-float">
              {/* Main card */}
              <div className="glass rounded-2xl p-6 shadow-elevated max-w-sm mx-auto">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                    <MessageSquare size={18} className="text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Fee Reminder Sent</p>
                    <p className="text-xs text-muted-foreground">via WhatsApp • just now</p>
                  </div>
                </div>
                <div className="bg-accent/50 rounded-xl p-4 text-sm text-foreground space-y-1">
                  <p className="font-medium">Hi! Fee reminder from Sharma Coaching</p>
                  <p className="text-muted-foreground">Student: Aarav Patel</p>
                  <p className="text-muted-foreground">Amount: <span className="font-semibold text-foreground">₹2,500</span></p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone size={14} className="text-primary" />
                    <span className="text-xs text-muted-foreground">UPI Link Included</span>
                  </div>
                  <span className="text-xs font-medium text-primary">✓ Delivered</span>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 glass rounded-xl px-4 py-2 shadow-card">
                <div className="flex items-center gap-2">
                  <CreditCard size={16} className="text-primary" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">₹47,500</p>
                    <p className="text-[10px] text-muted-foreground">Collected this month</p>
                  </div>
                </div>
              </div>

              {/* Floating badge 2 */}
              <div className="absolute -bottom-4 -left-4 glass rounded-xl px-4 py-2 shadow-card">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <p className="text-xs font-medium text-foreground">23 of 25 paid</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
