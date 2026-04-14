import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET_KEY || 'defaultsecret'
);

export async function generateToken(payload: JWTPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY);
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, SECRET_KEY);
  return payload;
}
