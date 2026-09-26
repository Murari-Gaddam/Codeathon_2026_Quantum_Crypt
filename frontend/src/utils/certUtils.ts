export interface ParsedDN {
  cn: string;
  o?: string;
  ou?: string;
  l?: string;
  st?: string;
  c?: string;
  location?: string;
  raw: string;
}

export function parseDN(dn: string): ParsedDN {
  if (!dn) return { cn: "Unknown Subject", raw: "" };

  const parsed: Record<string, string> = {};
  // Handle comma-separated or slash-separated LDAP DN components
  const parts = dn.split(/[,/]+/).map((p) => p.trim()).filter(Boolean);

  for (const part of parts) {
    const eqIdx = part.indexOf("=");
    if (eqIdx !== -1) {
      const key = part.slice(0, eqIdx).trim().toUpperCase();
      const val = part.slice(eqIdx + 1).trim();
      parsed[key] = val;
    }
  }

  const cn = parsed["CN"] || parsed["COMMONNAME"] || dn;
  const o = parsed["O"] || parsed["ORGANIZATION"];
  const ou = parsed["OU"] || parsed["ORGANIZATIONALUNIT"];
  const l = parsed["L"] || parsed["LOCALITY"];
  const st = parsed["ST"] || parsed["STATE"];
  const c = parsed["C"] || parsed["COUNTRY"];

  const locParts = [l, st, c].filter(Boolean);
  const location = locParts.length > 0 ? locParts.join(", ") : undefined;

  return {
    cn,
    o,
    ou,
    l,
    st,
    c,
    location,
    raw: dn,
  };
}

export function isSelfSigned(subject: string, issuer: string): boolean {
  if (!subject || !issuer) return false;
  const sub = parseDN(subject);
  const iss = parseDN(issuer);
  return sub.cn === iss.cn && (sub.o === iss.o || !sub.o || !iss.o);
}

export function formatSigAlg(sigAlg: string): string {
  if (!sigAlg) return "Unknown";
  const lower = sigAlg.toLowerCase();
  if (lower.includes("sha256withrsa")) return "SHA-256 + RSA PKCS#1 v1.5";
  if (lower.includes("sha384withrsa")) return "SHA-384 + RSA PKCS#1 v1.5";
  if (lower.includes("sha512withrsa")) return "SHA-512 + RSA PKCS#1 v1.5";
  if (lower.includes("ecdsa-with-sha256") || lower.includes("ecdsa-sha256")) return "SHA-256 + ECDSA";
  if (lower.includes("ecdsa-with-sha384") || lower.includes("ecdsa-sha384")) return "SHA-384 + ECDSA";
  if (lower.includes("ecdsa-with-sha512") || lower.includes("ecdsa-sha512")) return "SHA-512 + ECDSA";
  if (lower.includes("ed25519")) return "Ed25519";
  if (lower.includes("ml-dsa")) return "ML-DSA-65 (FIPS 204)";
  return sigAlg;
}

export interface ExpirationStatus {
  daysRemaining: number;
  isExpired: boolean;
  isExpiringSoon: boolean;
  formattedDate: string;
  badgeText: string;
  color: "success" | "warning" | "danger";
}

export function calculateExpiration(validTo: string): ExpirationStatus {
  if (!validTo) {
    return {
      daysRemaining: 0,
      isExpired: false,
      isExpiringSoon: false,
      formattedDate: "Unknown",
      badgeText: "Unknown",
      color: "warning",
    };
  }

  // Parse YYYY-MM-DD or standard ISO date
  const cleanDateStr = validTo.split(" ")[0];
  const target = new Date(cleanDateStr);
  const now = new Date();
  
  if (isNaN(target.getTime())) {
    return {
      daysRemaining: 0,
      isExpired: false,
      isExpiringSoon: false,
      formattedDate: cleanDateStr,
      badgeText: cleanDateStr,
      color: "success",
    };
  }

  const diffMs = target.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const isExpired = daysRemaining <= 0;
  const isExpiringSoon = daysRemaining > 0 && daysRemaining < 90;

  let badgeText = `${daysRemaining} days remaining`;
  let color: "success" | "warning" | "danger" = "success";

  if (isExpired) {
    badgeText = `Expired (${Math.abs(daysRemaining)}d ago)`;
    color = "danger";
  } else if (isExpiringSoon) {
    badgeText = `Expiring soon (${daysRemaining}d)`;
    color = "warning";
  }

  return {
    daysRemaining,
    isExpired,
    isExpiringSoon,
    formattedDate: target.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
    badgeText,
    color,
  };
}

export interface QuantumAssessment {
  isVulnerable: boolean;
  threatType: string;
  recommendedPQC: string;
  severity: "high" | "medium" | "safe";
}

export function getQuantumAssessment(pubKeyAlg: string): QuantumAssessment {
  const upper = (pubKeyAlg || "").toUpperCase();
  if (upper.includes("RSA")) {
    return {
      isVulnerable: true,
      threatType: "Shor's Algorithm (Integer Factorization)",
      recommendedPQC: "FIPS 204 ML-DSA-65 or Composite X.509 (RSA + ML-DSA)",
      severity: "high",
    };
  }
  if (upper.includes("ECDSA") || upper.includes("EC") || upper.includes("SECP")) {
    return {
      isVulnerable: true,
      threatType: "Shor's Algorithm (Elliptic Curve Discrete Logarithm)",
      recommendedPQC: "FIPS 204 ML-DSA-65 or Composite X.509 (ECDSA + ML-DSA)",
      severity: "high",
    };
  }
  if (upper.includes("ML-DSA") || upper.includes("DILITHIUM") || upper.includes("FALCON")) {
    return {
      isVulnerable: false,
      threatType: "Quantum-Resistant Lattice Cryptography",
      recommendedPQC: "Already Post-Quantum Capable",
      severity: "safe",
    };
  }
  return {
    isVulnerable: true,
    threatType: "Classical Asymmetric Key Primitive",
    recommendedPQC: "Assess against NIST FIPS 203/204/205 standards",
    severity: "medium",
  };
}
