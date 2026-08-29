const logger = (function() {
  const internalLogs = [];
  const validLevels = new Set(['info','warn','error','debug']);
  function safeStringify(obj) {
    const seen = new WeakSet();
    try {
      return JSON.stringify(obj, (k,v) => {
        if (typeof v === 'object' && v !== null) {
          if (seen.has(v)) return '[Circular]';
          seen.add(v);
        }
        return v;
      });
    } catch (e) { return '[Stringify Error]'; }
  }
  function handleError(err, level, msg) {
    try {
      console.error('Logger error:', err.message);
      internalLogs.push({ts: Date.now(), level:'error', msg: 'Failure in ' + level + ' for ' + safeStringify(msg)});
    } catch (e) {
      try { process.stdout.write('CRITICAL\n'); } catch (_) {}
    }
  }
  function log(level, message, ...rest) {
    try {
      if (!validLevels.has(level)) level = 'info';
      if (message == null) message = 'No message';
      const strMsg = (typeof message === 'object' ? safeStringify(message) : String(message));
      const extras = rest.map(r => { try { return typeof r==='object' ? safeStringify(r) : String(r); } catch { return '[err]'; } });
      const entry = { ts: new Date().toISOString(), level, msg: strMsg, extra: extras };
      internalLogs.push(entry);
      const out = `[${entry.ts}] ${level.toUpperCase()}: ${strMsg}` + (extras.length ? ' ' + extras.join(' ') : '');
      (level === 'error' ? console.error : console.log)(out);
      return entry;
    } catch (e) {
      handleError(e, level, message);
    }
  }
  return {
    info: (m, ...a) => { try { return log('info', m, ...a); } catch(e){handleError(e,'info',m);} },
    warn: (m, ...a) => { try { return log('warn', m, ...a); } catch(e){handleError(e,'warn',m);} },
    error: (m, ...a) => { try { return log('error', m, ...a); } catch(e){handleError(e,'error',m);} },
    debug: (m, ...a) => { try { return log('debug', m, ...a); } catch(e){handleError(e,'debug',m);} },
    getAllLogs: () => { try { return [...internalLogs]; } catch { return []; } },
    clear: () => { try { internalLogs.length=0; } catch {} }
  };
})();
module.exports = logger;