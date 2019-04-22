require('dnscache')({ enable: true });

const configs = require('./configs');
const request = require('request-promise-native');
const retry = require('async-retry');

const SplunkLogger = require("splunk-logging").Logger;
const Logger = new SplunkLogger({
    token:'450BCE9E-4C38-48A2-9EFD-C3078928C2CD', 
    url: 'https://injest.splunk.admin.foxdcg.com:8088/services/collector'
});

(async () => {

  console.log(`Started at ${new Date()}`);

  // for each username/debugname from config
  for (let config of configs) {
    let offset = 0;
    let total;

    // response is paginated, so we use ?offset=10 ?offset=20 .. until we get everything
    do {
      const url = `https://cms.uplynk.com/ad/debugload?username=${config.USERNAME}&debugname=${config.DEBUGNAME}&offset=${offset}`;
      const resp = await retry(() => request.get(url, { json: true }));
      const ads = resp.hits;
      total = resp.total;
      
      console.log('*******************************************');
        // Can optimize this by passing in the account/channels being parsed
      console.log('Fetching data..', config, url);

      // send (10) ad requests (don't send it in parallel due to high payload)
      for (let ad of ads) {
        const adUrl = `https://cms.uplynk.com/ad/debugload/${ad._index}/${ad._id}`;
        const adResp = await retry(() => request.get(adUrl, { json: true }));

        console.log('*******************************************');
        console.log(adUrl);

        await retry(() => new Promise((resolve, reject) => {
          Logger.send({
            metadata: {
              index: 'video-eng-live',
              source: 'ad-debug-justin',
            },
            message: {
              userName: config.USERNAME,
              debugName: config.DEBUGNAME,
              adIndex: ad._index,
              adId: ad._id,
              adResponse: adResp,
            }
          }, (err, res, body) => {
            err ?
              reject(new Error(`splunk error for ${adUrl}`)) :
              resolve();
          });
        }));
        
      };

      offset += 10;

    } while (total > offset);

  };

  console.log(`Finished at ${new Date()}`);
})();
