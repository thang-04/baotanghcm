const fs = require('node:fs');
const path = require('node:path');
class ResultStore {
 constructor(dir) { this.dir=dir; fs.mkdirSync(dir,{recursive:true}); }
 load() { return fs.readdirSync(this.dir).filter(x=>/^[a-f0-9-]+\.json$/.test(x)).map(x=>JSON.parse(fs.readFileSync(path.join(this.dir,x),'utf8'))); }
 save(session) { const target=path.join(this.dir,`${session.id}.json`); const temp=`${target}.tmp`; fs.writeFileSync(temp,JSON.stringify(session),{mode:0o600});fs.renameSync(temp,target); }
}
module.exports={ResultStore};
