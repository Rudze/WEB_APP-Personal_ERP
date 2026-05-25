import { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSettings } from "@/context/SettingsContext";

function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("is-visible")),
      { threshold: 0.06, rootMargin: "0px 0px -40px 0px" }
    );
    const els = document.querySelectorAll(".reveal");
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

export function LandingPage() {
  const { appName, landingContent = {} } = useSettings();
  const content = landingContent.content || "";

  useScrollReveal();

  return (
    <div className="min-h-full overflow-y-auto" style={{ background: "hsl(0,0%,7%)" }}>
      <div className="max-w-3xl mx-auto px-6 py-12">
        {content ? (
          <div className="prose-erp reveal is-visible">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        ) : (
          <div className="text-center py-32 reveal is-visible">
            <h1
              className="text-3xl font-bold mb-4"
              style={{ color: "hsl(0,0%,98%)", fontFamily: "'Poppins', sans-serif" }}
            >
              {appName || "Personal ERP"}
            </h1>
            <p className="text-sm" style={{ color: "hsl(0,0%,45%)" }}>
              Connectez-vous en tant qu'administrateur pour configurer le contenu de cette page.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
