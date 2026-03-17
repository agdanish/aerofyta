import { Fragment } from "react";
import { useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const labels: Record<string, string> = {
  dashboard: "Dashboard",
  wallets: "Wallets",
  creators: "Creators",
  tips: "Tips",
  escrow: "Escrow",
  reasoning: "Reasoning",
  demo: "Demo",
  security: "Security",
  payments: "Payments",
  defi: "DeFi",
  analytics: "Analytics",
  explorer: "Explorer",
};

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard" className="text-muted-foreground hover:text-foreground text-xs">
            AeroFyta
          </BreadcrumbLink>
        </BreadcrumbItem>
        {segments.map((seg, i) => (
          <Fragment key={seg}>
            <BreadcrumbSeparator className="text-muted-foreground/40" />
            <BreadcrumbItem>
              {i === segments.length - 1 ? (
                <BreadcrumbPage className="text-foreground text-xs font-medium">
                  {labels[seg] || seg}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  href={`/${segments.slice(0, i + 1).join("/")}`}
                  className="text-muted-foreground hover:text-foreground text-xs"
                >
                  {labels[seg] || seg}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
