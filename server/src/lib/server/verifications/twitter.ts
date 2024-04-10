import type {VerifiableIdentity} from "$lib/types";

const verify = async (identity: VerifiableIdentity, publicKey: string) => {
  const twitter = identity.id;
  const tweet = identity.verificationInfo;

  // only store tweet if it is verifiable
  if (!tweet.startsWith('https://twitter.com/' + twitter + '/status/')) {
    throw new Error(
      `Tweet address ${tweet} cannot be used to verify identity ${twitter}`
    );
  }
  const tweetResponse = await fetch(tweet, {
    headers: {
      'User-Agent': 'WhatsApp/2',
    },
  });

  if (!tweetResponse.ok || !(await tweetResponse.text()).includes(publicKey)) {
    throw new Error(
      `Tweet at ${tweet} does not contain public key ${publicKey}`
    );
  }
};

export default {verify};
