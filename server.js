const express = require('express');
const multer = require('multer');
const login = require('ws3-fca');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// 🔧 MULTER CONFIGURATION
const upload = multer({ dest: 'uploads/' });

// 🧠 BOT STATE MANAGEMENT
let botConfig = null;
let apiInstance = null;

// 📦 MIDDLEWARE SETUP
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// 🏠 HOME PAGE - STYLISH MODERN DESIGN
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>🔐 K9RT||K R9JPUT Locker Bot</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            
            body {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            
            .glass-container {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(15px);
                border-radius: 20px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                padding: 40px;
                width: 100%;
                max-width: 500px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                animation: fadeIn 0.8s ease;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            
            .header h1 {
                color: white;
                font-size: 28px;
                margin-bottom: 10px;
                text-shadow: 0 2px 10px rgba(0,0,0,0.3);
            }
            
            .header p {
                color: rgba(255, 255, 255, 0.8);
                font-size: 14px;
            }
            
            .form-group {
                margin-bottom: 20px;
            }
            
            label {
                display: block;
                color: white;
                margin-bottom: 8px;
                font-weight: 600;
                font-size: 14px;
            }
            
            input, textarea {
                width: 100%;
                padding: 12px 15px;
                border: none;
                border-radius: 10px;
                background: rgba(255, 255, 255, 0.9);
                font-size: 14px;
                transition: all 0.3s ease;
            }
            
            input:focus, textarea:focus {
                outline: none;
                background: white;
                box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
            }
            
            .file-input {
                background: rgba(255, 255, 255, 0.8);
                padding: 10px;
                border-radius: 10px;
                cursor: pointer;
            }
            
            .btn-group {
                display: flex;
                gap: 15px;
                margin-top: 10px;
            }
            
            .btn {
                flex: 1;
                padding: 14px;
                border: none;
                border-radius: 10px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                text-align: center;
                text-decoration: none;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }
            
            .btn-start {
                background: linear-gradient(135deg, #00b09b, #96c93d);
                color: white;
            }
            
            .btn-stop {
                background: linear-gradient(135deg, #ff416c, #ff4b2b);
                color: white;
            }
            
            .btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(0,0,0,0.2);
            }
            
            .status-indicator {
                margin-top: 20px;
                padding: 15px;
                border-radius: 10px;
                text-align: center;
                font-weight: 600;
                background: rgba(0, 0, 0, 0.3);
                color: white;
                transition: all 0.3s ease;
            }
            
            .status-on {
                background: rgba(76, 175, 80, 0.3);
                color: #a5d6a7;
            }
            
            .status-off {
                background: rgba(244, 67, 54, 0.3);
                color: #ef9a9a;
            }
            
            .icon {
                font-size: 18px;
            }
        </style>
    </head>
    <body>
        <div class="glass-container">
            <div class="header">
                <h1>🔐 K9RT||K R9JPUT Locker</h1>
                <p>Advanced Facebook Group Protection Bot</p>
            </div>
            
            <form id="botForm" enctype="multipart/form-data">
                <div class="form-group">
                    <label>📁 Upload Appstate.json</label>
                    <input type="file" name="appstate" accept=".json" class="file-input" required />
                </div>
                
                <div class="form-group">
                    <label>⚡ Command Prefix</label>
                    <input type="text" name="prefix" placeholder="e.g., *" required />
                </div>
                
                <div class="form-group">
                    <label>👑 Admin ID</label>
                    <input type="text" name="adminID" placeholder="Your Facebook ID" required />
                </div>
                
                <div class="btn-group">
                    <button type="button" class="btn btn-start" onclick="startBot()">
                        <span class="icon">🟢</span> Start Bot
                    </button>
                    <button type="button" class="btn btn-stop" onclick="stopBot()">
                        <span class="icon">🔴</span> Stop Bot
                    </button>
                </div>
                
                <div id="status" class="status-indicator status-off">
                    🔴 Status: OFFLINE
                </div>
            </form>
        </div>

        <script>
            async function startBot() {
                const form = document.getElementById('botForm');
                const formData = new FormData(form);
                const status = document.getElementById('status');
                
                status.innerHTML = '⏳ Starting Bot...';
                status.className = 'status-indicator';
                
                try {
                    const response = await fetch('/start-bot', { 
                        method: 'POST', 
                        body: formData 
                    });
                    
                    const result = await response.json();
                    
                    if (response.ok) {
                        status.innerHTML = '🟢 Status: ONLINE';
                        status.className = 'status-indicator status-on';
                        showNotification('Bot started successfully!', 'success');
                    } else {
                        status.innerHTML = '❌ Status: ERROR';
                        status.className = 'status-indicator status-off';
                        showNotification('Error: ' + result.message, 'error');
                    }
                } catch (error) {
                    status.innerHTML = '❌ Status: CONNECTION ERROR';
                    status.className = 'status-indicator status-off';
                    showNotification('Connection error: ' + error.message, 'error');
                }
            }
            
            async function stopBot() {
                const status = document.getElementById('status');
                status.innerHTML = '⏳ Stopping Bot...';
                status.className = 'status-indicator';
                
                try {
                    const response = await fetch('/stop-bot', { method: 'POST' });
                    const result = await response.json();
                    
                    if (response.ok) {
                        status.innerHTML = '🔴 Status: OFFLINE';
                        status.className = 'status-indicator status-off';
                        showNotification('Bot stopped successfully!', 'info');
                    } else {
                        showNotification('Error: ' + result.message, 'error');
                    }
                } catch (error) {
                    status.innerHTML = '❌ Status: ERROR';
                    status.className = 'status-indicator status-off';
                    showNotification('Error: ' + error.message, 'error');
                }
            }
            
            function showNotification(message, type) {
                // Simple notification implementation
                const notification = document.createElement('div');
                notification.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: 10px;
                    color: white;
                    font-weight: 600;
                    z-index: 1000;
                    animation: slideIn 0.3s ease;
                    max-width: 300px;
                `;
                
                if (type === 'success') {
                    notification.style.background = 'linear-gradient(135deg, #00b09b, #96c93d)';
                } else if (type === 'error') {
                    notification.style.background = 'linear-gradient(135deg, #ff416c, #ff4b2b)';
                } else {
                    notification.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
                }
                
                notification.textContent = message;
                document.body.appendChild(notification);
                
                setTimeout(() => {
                    notification.remove();
                }, 3000);
            }
        </script>
    </body>
    </html>
    `);
});

// 🚀 START BOT ENDPOINT
app.post('/start-bot', upload.single('appstate'), async (req, res) => {
    try {
        const { prefix, adminID } = req.body;
        
        if (!req.file || !prefix || !adminID) {
            return res.status(400).json({ 
                success: false, 
                message: '❌ Missing required fields' 
            });
        }

        let appState;
        try {
            appState = JSON.parse(fs.readFileSync(req.file.path));
            fs.unlinkSync(req.file.path);
        } catch (error) {
            return res.status(400).json({ 
                success: false, 
                message: '❌ Invalid appstate.json file' 
            });
        }

        botConfig = { appState, prefix, adminID };
        await startBot(botConfig);

        res.json({ 
            success: true, 
            message: '✅ Bot started successfully!' 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: `❌ Error: ${error.message}` 
        });
    }
});

// 🛑 STOP BOT ENDPOINT
app.post('/stop-bot', (req, res) => {
    if (!apiInstance) {
        return res.json({ 
            success: false, 
            message: '❌ Bot is not running' 
        });
    }
    
    apiInstance.logout(() => {
        apiInstance = null;
        botConfig = null;
        res.json({ 
            success: true, 
            message: '✅ Bot stopped successfully!' 
        });
    });
});

// 🤖 BOT CORE FUNCTIONALITY
async function startBot({ appState, prefix, adminID }) {
    if (apiInstance) {
        throw new Error('⚠️ Bot is already running');
    }

    return new Promise((resolve, reject) => {
        login({ appState }, (err, api) => {
            if (err) {
                console.error('❌ Login failed:', err);
                return reject(err);
            }

            console.log('✅ Bot is running and listening for commands...');
            api.setOptions({ listenEvents: true });
            apiInstance = api;

            // 🔒 LOCK MECHANISMS
            const lockedGroups = {};
            const lockedNicknames = {};
            const lockedDPs = {};
            const lockedThemes = {};
            const lockedEmojis = {};

            api.listenMqtt((err, event) => {
                if (err) {
                    console.error('❌ Listen error:', err);
                    return;
                }

                // 💬 COMMAND HANDLER
                if (event.type === 'message' && event.body.startsWith(prefix)) {
                    const senderID = event.senderID;
                    const args = event.body.slice(prefix.length).trim().split(' ');
                    const command = args[0].toLowerCase();
                    const input = args.slice(1).join(' ');

                    // 🔐 ADMIN VERIFICATION
                    if (senderID !== adminID) {
                        return api.sendMessage(
                            '❌ You are not authorized to use this command.', 
                            event.threadID
                        );
                    }

                    // 📚 HELP COMMAND
                    if (command === 'help') {
                        api.sendMessage(`
╔═══════════════════════╗
    🔐 𝐖𝐀𝐋𝐄𝐄𝐃𝐗𝐃 𝗟𝗢𝗖𝗞𝗘𝗥
╚═══════════════════════╝

📋 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗟𝗜𝗦𝗧:

🔒 𝗚𝗥𝗢𝗨𝗣 𝗣𝗥𝗢𝗧𝗘𝗖𝗧𝗜𝗢𝗡
• ${prefix}grouplockname on [name] - Lock group name
• ${prefix}nicknamelock on [name] - Lock all nicknames
• ${prefix}groupdplock on - Lock group profile picture
• ${prefix}groupthemeslock on - Lock group theme
• ${prefix}groupemojilock on - Lock group emoji

🆔 𝗜𝗡𝗙𝗢 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦
• ${prefix}tid - Get group thread ID
• ${prefix}uid - Get your user ID

⚡ 𝗔𝗗𝗩𝗔𝗡𝗖𝗘𝗗
• ${prefix}fyt on - Activate fight mode

👑 𝗗𝗘𝗩𝗘𝗟𝗢𝗣𝗘𝗥: WALEED
                        `, event.threadID);
                    }

                    // 🔐 GROUP NAME LOCK
                    if (command === 'grouplockname' && args[1] === 'on') {
                        const groupName = input.replace('on', '').trim();
                        lockedGroups[event.threadID] = groupName;
                        api.setTitle(groupName, event.threadID, (err) => {
                            if (err) return api.sendMessage('❌ Failed to lock group name.', event.threadID);
                            api.sendMessage(`✅ Group name locked as: ${groupName}`, event.threadID);
                        });
                    }

                    // 👤 NICKNAME LOCK
                    if (command === 'nicknamelock' && args[1] === 'on') {
                        const nickname = input.replace('on', '').trim();
                        api.getThreadInfo(event.threadID, (err, info) => {
                            if (err) return console.error('❌ Error fetching thread info:', err);
                            info.participantIDs.forEach((userID) => {
                                api.changeNickname(nickname, event.threadID, userID, (err) => {
                                    if (err) console.error(`❌ Failed to set nickname for user ${userID}:`, err);
                                });
                            });
                            lockedNicknames[event.threadID] = nickname;
                            api.sendMessage(`✅ Nicknames locked as: ${nickname}`, event.threadID);
                        });
                    }

                    // 🖼️ GROUP DP LOCK
                    if (command === 'groupdplock' && args[1] === 'on') {
                        lockedDPs[event.threadID] = true;
                        api.sendMessage('✅ Group DP locked. No changes allowed.', event.threadID);
                    }

                    // 🎨 THEME LOCK
                    if (command === 'groupthemeslock' && args[1] === 'on') {
                        lockedThemes[event.threadID] = true;
                        api.sendMessage('✅ Group themes locked. No changes allowed.', event.threadID);
                    }

                    // 😀 EMOJI LOCK
                    if (command === 'groupemojilock' && args[1] === 'on') {
                        lockedEmojis[event.threadID] = true;
                        api.sendMessage('✅ Group emoji locked. No changes allowed.', event.threadID);
                    }

                    // 🆔 ID COMMANDS
                    if (command === 'tid') {
                        api.sendMessage(`📋 Group UID: ${event.threadID}`, event.threadID);
                    }

                    if (command === 'uid') {
                        api.sendMessage(`👤 Your UID: ${senderID}`, event.threadID);
                    }

                    // ⚡ FIGHT MODE
                    if (command === 'fyt' && args[1] === 'on') {
                        api.sendMessage('🔥 Fight mode activated! Admin commands enabled.', event.threadID);
                    }
                }

                // 🛡️ PROTECTION MECHANISMS
                if (event.logMessageType) {
                    const lockedName = lockedGroups[event.threadID];
                    if (event.logMessageType === 'log:thread-name' && lockedName) {
                        api.setTitle(lockedName, event.threadID, () => {
                            api.sendMessage('🛡️ Group name change reverted.', event.threadID);
                        });
                    }

                    const lockedNickname = lockedNicknames[event.threadID];
                    if (event.logMessageType === 'log:thread-nickname' && lockedNickname) {
                        const affectedUserID = event.logMessageData.participant_id;
                        api.changeNickname(lockedNickname, event.threadID, affectedUserID, () => {
                            api.sendMessage('🛡️ Nickname change reverted.', event.threadID);
                        });
                    }

                    if (event.logMessageType === 'log:thread-icon' && lockedEmojis[event.threadID]) {
                        api.changeThreadEmoji('😀', event.threadID, () => {
                            api.sendMessage('🛡️ Emoji change reverted.', event.threadID);
                        });
                    }

                    if (event.logMessageType === 'log:thread-theme' && lockedThemes[event.threadID]) {
                        api.sendMessage('🛡️ Theme change reverted.', event.threadID);
                    }

                    if (event.logMessageType === 'log:thread-image' && lockedDPs[event.threadID]) {
                        api.sendMessage('🛡️ Group DP change reverted.', event.threadID);
                    }
                }
            });

            resolve();
        });
    });
}

// 🌐 SERVER START
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Web panel running on http://0.0.0.0:${PORT}`);
    console.log(`⭐ WALEED Ali Locker Bot - Ready to protect!`);
});