const AUTH_URL = "http://4.224.186.213/evaluation-service/auth";
const TOKEN_REFRESH_BUFFER_MS = 60_000;

interface AuthResponse {
  access_token?: string;
  accessToken?: string;
  "access token"?: string;
}

interface TokenState {
  value: string;
  expiresAt: number;
}

let tokenState: TokenState | null = null;

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function tokenExpiry(token: string): number {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString("utf8"),
    ) as { exp?: number };
    return payload.exp ? payload.exp * 1000 : Date.now() + 10 * 60_000;
  } catch {
    return Date.now() + 10 * 60_000;
  }
}

export async function getAccessToken(forceRefresh = false): Promise<string> {
  if (
    !forceRefresh &&
    tokenState &&
    tokenState.expiresAt - TOKEN_REFRESH_BUFFER_MS > Date.now()
  ) {
    return tokenState.value;
  }

  const response = await fetch(AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: required("TEST_SERVER_EMAIL"),
      name: required("TEST_SERVER_NAME"),
      rollNo: required("TEST_SERVER_ROLL_NO"),
      accessCode: required("TEST_SERVER_ACCESS_CODE"),
      clientID: required("TEST_SERVER_CLIENT_ID"),
      clientSecret: required("TEST_SERVER_CLIENT_SECRET"),
    }),
    signal: AbortSignal.timeout(10_000),
  });

  const payload = (await response.json().catch(() => null)) as AuthResponse | null;
  const token =
    payload?.access_token ?? payload?.accessToken ?? payload?.["access token"];
  if (!response.ok || !token) {
    throw new Error(`Authentication failed with HTTP ${response.status}`);
  }

  tokenState = { value: token, expiresAt: tokenExpiry(token) };
  return token;
}
