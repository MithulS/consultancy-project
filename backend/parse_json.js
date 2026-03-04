const fs = require('fs');
const txt = fs.readFileSync(process.argv[2], 'utf8');
const jsonStr = txt.substring(txt.indexOf('{'));
try {
    const d = JSON.parse(jsonStr);
    d.testResults.forEach(s => {
        if (s.assertionResults) {
            s.assertionResults.filter(a => a.status === 'failed').forEach(a => {
                console.log('SUITE:', s.name.split(/[\\/\\\\]/).pop());
                console.log('TEST:', a.title);
                console.log('ERROR:', a.failureMessages[0].substring(0, 300));
                console.log('---');
            });
        } else if (s.message) {
            console.log('SUITE CRASH:', s.name.split(/[\\/\\\\]/).pop());
            console.log('ERROR:', s.message.substring(0, 500));
            console.log('---');
        }
    });
} catch (e) {
    console.error(e.message);
}
