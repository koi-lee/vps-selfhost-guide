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
assert.deepEqual(JSON.parse(JSON.stringify(result['proxy-groups'][0].proxies)), ['日本上网（自动测速）','DIRECT']);
const japan = result['proxy-groups'].find(g => g.name === '日本上网（自动测速）');
assert.deepEqual(JSON.parse(JSON.stringify(japan.proxies)), ['日本-TY-1','日本-TY-2']);
assert.equal(japan.lazy, false);
assert.equal(result.rules.at(-1), 'MATCH,上网方式');
assert.ok(result.rules.includes('GEOSITE,cn,DIRECT'));
console.log('PASS: old subscription Japan-only URL test, direct domestic rules and default selection');
