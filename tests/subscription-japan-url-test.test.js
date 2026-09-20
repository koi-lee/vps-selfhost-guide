const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ctx = {};
vm.runInNewContext(fs.readFileSync(__dirname + '/../scripts/subscription-japan-url-test.js', 'utf8'), ctx);
const result = ctx.main({
  proxies: [{name:'日本-TY-1',type:'trojan'},{name:'日本-TY-2',type:'trojan'},{name:'美国-US-1',type:'trojan'}],
  'proxy-groups': [{name:'Proxy',type:'select',proxies:['日本-TY-1']}],
  rules: ['MATCH,Proxy']
});
assert.deepEqual(JSON.parse(JSON.stringify(result['proxy-groups'][0].proxies)), ['日本上网（自动测速）','切换到手动节点','DIRECT']);
const japan = result['proxy-groups'].find(g => g.name === '日本上网（自动测速）');
assert.deepEqual(JSON.parse(JSON.stringify(japan.proxies)), ['日本-TY-1','日本-TY-2']);
assert.equal(japan.lazy, false);
assert.equal(result['proxy-groups'].some(g => g.name === 'Proxy' || g.name === 'Auto'), false);
assert.deepEqual(JSON.parse(JSON.stringify(result['proxy-groups'].find(g => g.name === '全部国家节点列表').proxies)), ['日本-TY-1','日本-TY-2','美国-US-1']);
assert.equal(result.rules.at(-1), 'MATCH,上网方式');
assert.ok(result.rules.includes('GEOSITE,cn,DIRECT'));
console.log('PASS: old subscription Japan-only URL test, direct domestic rules and default selection');
const snapshot=JSON.stringify(result);
assert.equal(JSON.stringify(ctx.main(JSON.parse(snapshot))),snapshot);
const groups=result['proxy-groups'];
assert.equal(groups.find(g=>g.name==='切换到手动节点').proxies[0],'全部国家节点列表');
assert.equal(groups.find(g=>g.name==='切换到手动节点').hidden,true);
assert.deepEqual(Array.from(groups.filter(g=>!g.hidden),g=>g.name),['上网方式','全部国家节点列表']);
const input={proxies:[{name:'日本-A'},{name:'US-A'},{name:'有效期：剩余流量'}], 'proxy-groups':[{name:'自定义海外组'}],rules:['DOMAIN,example.com,自定义海外组','IP-CIDR,1.1.1.0/24,自定义海外组,no-resolve','DOMAIN,keep.example,REJECT','MATCH,自定义海外组']};
const custom=ctx.main(input);
assert.ok(custom.rules.includes('DOMAIN,example.com,上网方式'));
assert.ok(custom.rules.includes('IP-CIDR,1.1.1.0/24,上网方式,no-resolve'));
assert.ok(custom.rules.includes('DOMAIN,keep.example,REJECT'));
assert.equal(custom['proxy-groups'].find(g=>g.name==='全部国家节点列表').proxies.length,2);
assert.ok(custom.dns['direct-nameserver'].every(n=>n.endsWith('#DIRECT')));
const none={proxies:[{name:'US-A'}],rules:['MATCH,DIRECT']};
assert.equal(JSON.stringify(ctx.main(JSON.parse(JSON.stringify(none)))),JSON.stringify(none));
console.log('PASS: manual routing chain, idempotence, custom group references, metadata exclusion, direct DNS and no-Japan behavior');
