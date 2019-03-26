const configs = require('./configs');
const request = require('request-promise-native');

const SplunkLogger = require("splunk-logging").Logger;
const Logger = new SplunkLogger({
    token:'450BCE9E-4C38-48A2-9EFD-C3078928C2CD', 
    url: 'https://injest.splunk.admin.foxdcg.com:8088/services/collector'
});

(async () => {

  // for each username/debugname from config
  for (config of configs) {
    let offset = 0;
    let total;

    // response is paginated, so we use ?offset=10 ?offset=20 .. until we get everything
    do {
      const url = `https://cms.uplynk.com/ad/debugload?username=${config.USERNAME}&debugname=${config.DEBUGNAME}&offset=${offset}`;
      const resp = await request.get(url, { json: true });
      const ads = resp.hits;
      total = resp.total;
      
      console.log('*******************************************');
        // Can optimize this by passing in the account/channels being parsed
      console.log('Finished printing data.', config, url, ads);

      // send all (10) ad requests in parallel
      ads.forEach(async ad => {
        const adUrl = `https://cms.uplynk.com/ad/debugload/${ad._index}/${ad._id}`;
        const adResp = await request.get(adUrl, { json: true });

        console.log('*******************************************');
        console.log(adUrl);

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
          if (err) {
            console.log('splunk error', err);
          }
        });
      });

      offset += 10;

    } while (total > offset);

  };
})();
