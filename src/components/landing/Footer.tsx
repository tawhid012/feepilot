import logo from "@/assets/logo.png";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <img src={logo} alt="FeePilot" className="w-8 h-8 object-contain" />
              <span className="font-display font-bold text-lg text-foreground">FeePilot</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              WhatsApp-based fee collection for tutors and coaching centers.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm text-foreground mb-4">Product</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a></li>
              <li><a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a></li>
              <li><a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How it Works</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm text-foreground mb-4">Company</h4>
            <ul className="space-y-2">
              <li><span className="text-sm text-muted-foreground">About</span></li>
              <li><span className="text-sm text-muted-foreground">Privacy Policy</span></li>
              <li><span className="text-sm text-muted-foreground">Terms of Service</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm text-foreground mb-4">Contact</h4>
            <ul className="space-y-2">
              <li><span className="text-sm text-muted-foreground">support@feepilot.in</span></li>
              <li><span className="text-sm text-muted-foreground">+91 98765 43210</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">© 2026 FeePilot. All rights reserved.</p>
          <p className="text-xs text-muted-foreground">Made with ❤️ for Indian educators</p>
        </div>
      </div>
    </footer>
  );
}
