// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - lucide is deprecating all brand icons; no non-deprecated alternative exists yet
import { Linkedin, Mail, MapPin, Github, Phone, Globe, ArrowLeft } from "lucide-react";
import GeometricBackground from "@/components/GeometricBackground";
import { useNavigate } from "react-router-dom";
import { useCVGeneralInfo } from "@/hooks/use-cv-data";
import { trackClick } from "@/lib/analytics";

const Contact = () => {
  const navigate = useNavigate();
  const { data: generalInfo, isLoading } = useCVGeneralInfo();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const contactItems = [
    generalInfo?.email && {
      icon: Mail,
      label: generalInfo.email,
      href: `mailto:${generalInfo.email}`,
      trackLabel: "email",
    },
    generalInfo?.phone_number && {
      icon: Phone,
      label: generalInfo.phone_number,
      href: `tel:${generalInfo.phone_number.replace(/\s/g, "")}`,
      trackLabel: "phone",
    },
    generalInfo?.linkedin && {
      icon: Linkedin,
      label: generalInfo.linkedin.replace(/^https?:\/\//, ""),
      href: `https://${generalInfo.linkedin.replace(/^https?:\/\//, "")}`,
      trackLabel: "linkedin",
    },
    generalInfo?.github && {
      icon: Github,
      label: generalInfo.github.replace(/^https?:\/\//, ""),
      href: `https://${generalInfo.github.replace(/^https?:\/\//, "")}`,
      trackLabel: "github",
    },
    generalInfo?.location && {
      icon: MapPin,
      label: generalInfo.location,
      href: null,
      trackLabel: null,
    },
    ...(generalInfo?.other_websites ?? []).map((site) => ({
      icon: Globe,
      label: site.replace(/^https?:\/\//, ""),
      href: `https://${site.replace(/^https?:\/\//, "")}`,
      trackLabel: site.replace(/^https?:\/\//, ""),
    })),
  ].filter(Boolean) as {
    icon: typeof Mail;
    label: string;
    href: string | null;
    trackLabel: string | null;
  }[];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <GeometricBackground />
      <main className="relative max-w-4xl mx-auto px-6 py-20 md:py-28">

        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-16"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex flex-col sm:flex-row gap-12 sm:gap-20 items-start fade-in-section">
          <div className="flex-1">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-3">
              Get in touch
            </h1>
            <p className="text-base text-primary font-medium tracking-widest uppercase mb-14">
              {generalInfo?.title ?? "Software Engineer"}
            </p>

            <div className="space-y-7">
              {contactItems.map((item) => {
                const Icon = item.icon;
                const inner = (
                  <div className="flex items-center gap-4 group">
                    <Icon className="w-4 h-4 text-muted-foreground/60 group-hover:text-primary transition-colors flex-shrink-0" />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      {item.label}
                    </span>
                  </div>
                );

                return item.href ? (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="block"
                    onClick={() => item.trackLabel && trackClick(item.trackLabel)}
                  >
                    {inner}
                  </a>
                ) : (
                  <div key={item.label}>{inner}</div>
                );
              })}
            </div>
          </div>

          <img
            src="/profilePicture.jpeg"
            alt="Andreas Plenge"
            className="w-32 h-32 rounded-full object-cover flex-shrink-0 opacity-90"
          />
        </div>

        <footer className="mt-24 pt-8 border-t border-border flex justify-center fade-in-section">
          <img src="/sign.png" alt="Signature" className="h-14 opacity-40 hover:opacity-60 transition-opacity duration-500" />
        </footer>
      </main>
    </div>
  );
};

export default Contact;
