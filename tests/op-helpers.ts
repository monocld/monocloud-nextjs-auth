/* eslint-disable import/no-extraneous-dependencies */
import nock from 'nock';
import * as jose from 'jose';

export const createTestIdToken = async (claims = {}) => {
  const kp = await jose.generateKeyPair('RS256', {
    modulusLength: 2048,
    extractable: true,
  });
  const jwk = await jose.exportJWK(kp.publicKey);
  const sub = 'sub';
  return {
    idToken: await new jose.SignJWT({
      sub_jwk: jwk,
      sub,
      nonce: 'nonce',
      ...claims,
    })
      .setIssuedAt()
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuer('https://op.example.com')
      .setAudience('__test_client_id__')
      .setExpirationTime('1m')
      .sign(kp.privateKey),
    key: jwk,
    sub,
  };
};

export const setupOp = async (
  discovery: { body?: object; status?: number } | undefined = undefined,
  enable: {
    token: boolean;
    userinfo: boolean;
  } = { token: true, userinfo: true },
  customRefreshBodyMatcher = {}
) => {
  nock('https://op.example.com')
    .get('/.well-known/openid-configuration')
    .reply(
      discovery?.status ?? 200,
      discovery?.body ?? {
        issuer: 'https://op.example.com',
        authorization_endpoint: 'https://op.example.com/authorize',
        token_endpoint: 'https://op.example.com/token',
        userinfo_endpoint: 'https://op.example.com/userinfo',
        jwks_uri: 'https://op.example.com/jwks',
        end_session_endpoint: 'https://op.example.com/endsession',
      }
    );

  let idToken;

  if (enable.userinfo) {
    idToken = await createTestIdToken();

    nock('https://op.example.com')
      .matchHeader('authorization', 'Bearer at')
      .get('/userinfo')
      .reply(200, {
        sub: idToken.sub,
        username: 'username',
        updated: 'false',
      });

    nock('https://op.example.com')
      .matchHeader('authorization', 'Basic at1')
      .get('/userinfo')
      .reply(200, {
        sub: idToken.sub,
        username: 'username',
        updated: 'true',
        new: 'field',
      });

    nock('https://op.example.com')
      .get('/jwks')
      .reply(200, { keys: [idToken?.key] });
  }

  if (enable.token) {
    nock('https://op.example.com')
      .matchHeader(
        'authorization',
        'Basic X190ZXN0X2NsaWVudF9pZF9fOl9fdGVzdF9jbGllbnRfc2VjcmV0X18='
      )
      .post('/token', body => {
        return (
          body.code === 'code' &&
          body.redirect_uri === 'https://example.org/api/auth/callback' &&
          body.code_verifier?.trim().length > 0 &&
          body.grant_type === 'authorization_code'
        );
      })
      .reply(200, {
        access_token: 'at',
        id_token: idToken?.idToken ?? 'idtoken',
        refresh_token: 'rt',
        expires_in: 999,
        scope: process.env.MONOCLOUD_AUTH_SCOPES,
        token_type: 'Bearer',
      })
      .post('/token', body => {
        const matcher = Object.keys(customRefreshBodyMatcher);
        if (matcher.length > 0) {
          // eslint-disable-next-line no-restricted-syntax
          for (const key of matcher) {
            if (!body[key]) {
              return false;
            }
          }
        }
        return (
          body.grant_type === 'refresh_token' && body.refresh_token === 'rt'
        );
      })
      .reply(200, {
        access_token: 'at1',
        id_token: idToken?.idToken,
        refresh_token: 'rt1',
        expires_in: 999,
        scope: process.env.MONOCLOUD_AUTH_SCOPES,
        token_type: 'Bearer',
      });
  }
};

export const refreshedTokens = {
  accessToken: 'at1',
  idToken: expect.any(String),
  refreshToken: 'rt1',
};

export const defaultAppUserInfoResponse = {
  sub: 'sub',
  username: 'username',
  updated: 'false',
  sub_jwk: expect.any(Object),
};

export const defaultDiscovery = {};
export const noBodyDiscoverySuccess = { body: {} };

export const noTokenAndUserInfo = { token: false, userinfo: false };
export const tokenAndUserInfoEnabled = { token: true, userinfo: true };
