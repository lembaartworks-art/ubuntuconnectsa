import { Link } from "@tanstack/react-router";
import logoAsset from "@/assets/logo.png.asset.json";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t bg-primary text-primary-foreground">
      <div className="container mx-auto grid gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <img src={logoAsset.url} alt="Ubuntu Connect SA" className="h-10 w-10 rounded-full bg-white" />
            <span className="font-display text-lg font-bold">Ubuntu Connect SA</span>
          </div>
          <p className="mt-3 text-sm text-primary-foreground/80">
            Connecting hearts. Changing lives. Together, we can make a difference.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:underline">About</Link></li>
            <li><Link to="/how-it-works" className="hover:underline">How It Works</Link></li>
            <li><Link to="/contact" className="hover:underline">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider">Get involved</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/donate" className="hover:underline">Donate</Link></li>
            <li><Link to="/request-support" className="hover:underline">Request Support</Link></li>
            <li><Link to="/register-ngo" className="hover:underline">Register your NGO</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider">Contact</h4>
          <p className="text-sm text-primary-foreground/80">
            ubuntusaconnect@gmail.com
          </p>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 py-4 text-center text-xs text-primary-foreground/70">
        © {new Date().getFullYear()} Ubuntu Connect SA. All rights reserved.
      </div>
    </footer>
  );
}