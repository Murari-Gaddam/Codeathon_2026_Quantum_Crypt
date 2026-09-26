/**
 * API Gateway Token Verification Service.
 * Validates inbound bearer tokens signed by the Authentication Service.
 * Component: api-gateway
 * Protocol: JWT / RS256
 */

import * as jwt from "jsonwebtoken";
import * as crypto from "crypto";

export interface DecodedToken {
  sub: string;
  roles: string[];
  exp: number;
}

export class TokenValidator {
  private publicKey: string;

  constructor(publicKeyPem: string) {
    this.publicKey = publicKeyPem;
  }

  public verifySessionToken(token: string): DecodedToken {
    // Verifies RS256 token using RSA public key
    const decoded = jwt.verify(token, this.publicKey, {
      algorithms: ["RS256"]
    }) as DecodedToken;

    return decoded;
  }

  public generateSessionHash(sessionId: string): string {
    // SHA-256 hash generation for cache lookups
    return crypto.createHash("sha256").update(sessionId).digest("hex");
  }
}
