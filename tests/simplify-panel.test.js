const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
function run(config) {
  const ctx = {};
  const scripts = ['shared-profile.js', 'simplify-panel.js'].map(name => fs.readFileSync(path.join(__dirname, '../scripts', name), 'utf8')).join('\n');
  vm.runInNewContext(scripts, ctx);
  return JSON.parse(JSON.stringify(ctx.main(config)));
}
function fixture() { return {proxies:[{name:'primary',type:'hysteria2',server:'edge.example.com'},{name:'cdn',type:'vless',network:'ws',server:'cdn.example.com'},{name:'ipv4',type:'vless',network:'tcp',server:'192.0.2.10'},{name:'ipv6',type:'vless',network:'tcp',server:'2001:db8::10'}],rules:[]}; }
test('optional panel presents purposes and retains failover and domestic rules', () => {
  const result = run(fixture());
  assert.deepEqual(result['proxy-groups'].filter(g=>!g.hidden).map(g=>g.name), ['上网方式','全部节点列表']);
  assert.deepEqual(result['proxy-groups'][0].proxies, ['自动上网（推荐）','切换到手动节点','直连上网（不经代理）']);
  const fallback = result['proxy-groups'].find(g=>g.type==='fallback');
  assert.deepEqual(fallback.proxies,['primary','cdn','ipv4']);
  assert.equal(fallback.lazy,false);
  assert.equal(result.rules.at(-1),'MATCH,上网方式');
  assert.ok(result.rules.includes('GEOSITE,cn,DIRECT'));
  assert.deepEqual(run(JSON.parse(JSON.stringify(result))), result);
});
test('manual selection reaches each self-hosted node and direct stays separate', () => {
  const input=fixture();
  const result=run(input);
  const groups=result['proxy-groups'];
  assert.deepEqual(groups.find(g=>g.name==='切换到手动节点').proxies,['全部节点列表']);
  assert.deepEqual(groups.find(g=>g.name==='全部节点列表').proxies,input.proxies.map(p=>p.name));
  assert.deepEqual(groups.find(g=>g.name==='直连上网（不经代理）').proxies,['DIRECT']);
  assert.deepEqual(run({proxies:[input.proxies[0]]})['proxy-groups'][0].proxies,['自动上网（推荐）','切换到手动节点','直连上网（不经代理）']);
});
test('simplified panel also rejects external provider input without changing it', () => {
  const input=fixture();input['proxy-providers']={'japan-primary':{type:'file',path:'./test-only.yaml'}};
  const before=JSON.stringify(input);
  assert.throws(()=>run(input),/proxy-providers/);
  assert.equal(JSON.stringify(input),before);
});
test('rejects node names that collide with option names', () => {
  const input=fixture();input.proxies[0].name='上网方式';
  assert.throws(()=>run(input),/冲突/);
});
