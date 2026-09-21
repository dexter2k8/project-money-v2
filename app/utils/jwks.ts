import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

let _client: jwksClient.JwksClient | null = null;

function getClient() {
  if (!_client) {
    _client = jwksClient({
      jwksUri: process.env.SUPABASE_JWKS_URL!,
      cache: true,
      cacheMaxAge: 600000,
      rateLimit: true,
      jwksRequestsPerMinute: 10,
    });
  }
  return _client;
}

function getSigningKey(header: jwt.JwtHeader): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = getClient();
    client.getSigningKey(header.kid, (err, key) => {
      if (err) {
        reject(err);
        return;
      }
      const signingKey = key?.getPublicKey();
      if (!signingKey) {
        reject(new Error("Unable to get signing key"));
        return;
      }
      resolve(signingKey);
    });
  });
}

export async function verifyToken(token: string): Promise<jwt.JwtPayload> {
  const decoded = jwt.decode(token, { complete: true });
  if (!decoded) {
    throw new Error("Invalid token");
  }

  const signingKey = await getSigningKey(decoded.header);

  return new Promise((resolve, reject) => {
    jwt.verify(token, signingKey, (err, payload) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(payload as jwt.JwtPayload);
    });
  });
}
