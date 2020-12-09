declare namespace LtiNode {
  export interface LtiPlatform {
    consumerUrl: string;
    consumerName: string;
    consumerToolClientID: string;
    consumerAuthorizationURL: string;
    consumerAccessTokenURL: string;
    consumerRedirectURI: string;
    // Authentication method and key for verifying messages from
    //  the platform. {method: "RSA_KEY", key:"PUBLIC KEY..."}
    consumerAuthorizationConfigMethod: string;
    consumerAuthorizationConfigKey: string;
    kid: {
      publicKey: string;
      privateKey: string;
      keyID: string;
    };
  }
}

interface LtiOptions {
  store: any;
}

declare function LtiNode(
  LtiOptions?
): {
  createOidcResponse: any;
  tokenMaker: any;
  registerPlatform: (...LtiPlatform) => {};
  launchTool: any;
  getPublicKey: any;
};

export = LtiNode;
