const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { Server } = require('socket.io');
const { io: connect } = require('socket.io-client');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { createCompetitionTransport } = require('./transport.cjs');
const { stations } = require('./stations.cjs');

test('HTTP cookie ownership, socket ready/start, duplicate rejection and two-player final ranking', async t => {
  const dir = mkdtempSync(join(tmpdir(), 'race-wire-'));
  let now = 100000;
  const transport = createCompetitionTransport({ dataDir: dir, now: () => now });
  const server = http.createServer((req, res) => { if (!transport.http(req, res)) { res.statusCode = 404; res.end(); } });
  const io = new Server(server, { transports: ['websocket'] }); transport.attach(io);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const clients = [];
  t.after(async () => { clients.forEach(s => s.disconnect()); transport.close(); await new Promise(resolve => io.close(resolve)); rmSync(dir, { recursive: true, force: true }); });
  async function post(body, cookie = '') {
    const response = await fetch(`${base}/competition-api`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: base, Cookie: cookie }, body: JSON.stringify(body) });
    return { data: await response.json(), cookie: response.headers.get('set-cookie')?.split(';')[0] || '' };
  }
  async function socket(cookie = '') { const s = connect(base, { transports: ['websocket'], extraHeaders: { Cookie: cookie, Origin: base } }); clients.push(s); await new Promise((resolve, reject) => { s.once('connect', resolve); s.once('connect_error', reject); }); return s; }
  function emit(s, name, data) { return new Promise((resolve, reject) => s.timeout(3000).emit(name, data, (err, reply) => err ? reject(err) : resolve(reply))); }
  const created = await post({ action: 'create', title: 'Transport test', hostName: 'Host', durationMinutes: 1, maxPlayers: 3 });
  assert.equal(created.data.ok, true); assert.match(created.cookie, /^hcm_host=/);
  const code = created.data.session.code;
  const host = await socket(created.cookie), a = await socket(), b = await socket();
  assert.equal((await emit(a, 'comp:host-watch', { code })).ok, false);
  assert.equal((await emit(host, 'comp:host-watch', { code })).ok, true);
  assert.equal((await post({ action: 'questions', code })).data.ok, false);
  const questions = (await post({ action: 'questions', code }, created.cookie)).data.questions;
  for (const [s, nickname] of [[a, 'A'], [b, 'B']]) {
    const joined = await emit(s, 'comp:join', { code, nickname, outfitId: 'student' });
    assert.equal(joined.ok, true); assert.ok(!JSON.stringify(joined.session).includes('correctOptionId'));
    assert.equal((await emit(s, 'comp:ready', { ready: true })).ok, true);
  }
  assert.equal((await post({ action: 'start', code }, created.cookie)).data.ok, true);
  now += 5000; transport.service.tick();
  for (const s of [a, b]) {
    for (const q of questions) {
      const enteredRoom = await emit(s, 'comp:room', { roomId: q.roomId });
      assert.equal(enteredRoom.ok, true, JSON.stringify(enteredRoom));
      const moved = await emit(s, 'comp:position', stations[q.id]);
      assert.equal(moved.ok, true, JSON.stringify(moved));
      now += 100;
      const answer = await emit(s, 'comp:answer', { roomId: q.roomId, questionId: q.id, optionId: q.correctOptionId });
      assert.equal(answer.ok, true); assert.equal(answer.correct, true);
    }
  }
  const result = (await post({ action: 'hostSnapshot', code }, created.cookie)).data.session;
  assert.equal(result.status, 'finalized'); assert.equal(result.ranking.length, 2);
  assert.equal(result.ranking[0].nickname, 'A'); assert.equal(result.ranking[0].elapsedMs, 1000);
  assert.equal(result.ranking[1].elapsedMs, 2000);
});
