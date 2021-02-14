"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bot = exports.createBot = void 0;
const mineflayer_1 = __importDefault(require("mineflayer"));
const mineflayer_navigate_promise_1 = __importDefault(require("mineflayer-navigate-promise"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const events_1 = require("events");
const enums_1 = require("./enums");
const config_1 = require("./config");
const connector_1 = require("./tasks/connector");
const solve_afk_challenge_1 = require("./tasks/solve-afk-challenge");
const minecraftUtil_1 = require("./util/minecraftUtil");
const defaultOptions = {
    setPortalTimeout: true,
    solveAfkChallenge: true,
    profilesFolder: path_1.default.join(__dirname, '../')
};
class Bot extends events_1.EventEmitter {
    constructor(options) {
        super();
        this.connectionStatus = enums_1.ConnectionStatus.NOT_STARTED;
        this.chatQueue = [];
        this.currentChatMode = enums_1.ChatMode.NORMAL;
        this.chatDelay = config_1.config.NORMAL_COOLDOWN;
        this.messageLastSentTime = 0;
        this.options = { ...defaultOptions, ...options };
    }
    async init() {
        this.setConnectionStatus(enums_1.ConnectionStatus.LOGGING_IN);
        this.clean();
        const botOptions = {
            host: config_1.config.SERVER_IP,
            port: config_1.config.SERVER_PORT,
            version: 1.8,
            checkTimeoutInterval: 30000,
            logErrors: false,
            auth: this.options.auth,
            profilesFolder: this.options.profilesFolder,
            username: this.options.username,
            password: this.options.password
        };
        this.client = mineflayer_1.default.createBot(botOptions);
        this.registerEvents();
        this.installPlugins();
    }
    isOnline() {
        return this.client && this.connectionStatus === enums_1.ConnectionStatus.LOGGED_IN;
    }
    getStatus() {
        return this.connectionStatus;
    }
    async connectCityBuild(dest) {
        let connectorOptions;
        try {
            connectorOptions = await this.loadConnectorOptions(dest);
        }
        catch (e) {
            throw new Error(`There is no CityBuild named '${dest}'.`);
        }
        try {
            await connector_1.connectorTask(this, connectorOptions);
        }
        catch (e) {
            throw e;
        }
    }
    sendChat(text, sendNext) {
        return this.send(text, sendNext);
    }
    sendCommand(command, sendNext) {
        return this.send(`/${command}`, sendNext);
    }
    sendMsg(re, text, sendNext) {
        return this.send(`/msg ${re} ${text}`, sendNext);
    }
    pay(re, amount, sendNext) {
        return this.send(`/pay ${re} ${amount}`, sendNext);
    }
    navigateTo(position) {
        return this.client.navigate.promise.to(position);
    }
    end(reason) {
        if (this.client) {
            this.client.quit(reason);
        }
    }
    setConnectionStatus(status) {
        const old = this.connectionStatus;
        this.connectionStatus = status;
        this.emit('connectionStatus', status, old);
    }
    async loadConnectorOptions(dest) {
        const file = path_1.default.join(__dirname, `../paths/${dest.trim().toLowerCase()}.json`);
        let connectorOptions;
        try {
            connectorOptions = await readJsonFile(file);
        }
        catch (e) {
            throw e;
        }
        return connectorOptions;
    }
    installPlugins() {
        mineflayer_navigate_promise_1.default(mineflayer_1.default)(this.client);
        this.client.navigate.blocksToAvoid[44] = true;
        this.client.navigate.blocksToAvoid[156] = true;
    }
    registerEvents() {
        const ChatMessage = require('prismarine-chat')(this.client.version);
        const forward = (e) => {
            this.client.on(e, (...d) => {
                this.emit(e, ...d);
            });
        };
        forward('spawn');
        forward('death');
        this.client.on('login', () => {
            this.setConnectionStatus(enums_1.ConnectionStatus.LOGGED_IN);
            this.emit('login');
        });
        this.client.on('end', () => {
            this.setConnectionStatus(enums_1.ConnectionStatus.DISCONNECTED);
            this.emit('end');
        });
        this.client.on('kicked', (reason, loggedIn) => {
            this.setConnectionStatus(enums_1.ConnectionStatus.DISCONNECTED);
            this.emit('kicked', reason, loggedIn);
        });
        this.client.chatAddPattern(config_1.config.MSG_REGEXP, 'msg');
        this.client.chatAddPattern(config_1.config.PLOTCHAT_REGEXP, 'plotchat');
        this.client.chatAddPattern(config_1.config.CHATMODE_ALERT_REGEXP, 'chatModeAlert');
        this.client.chatAddPattern(config_1.config.SLOWCHAT_ALERT_REGEXP, 'slowChatAlert');
        this.client.chatAddPattern(config_1.config.COMMANDSPAM_ALERT_REGEXP, 'commandSpamAlert');
        this.client.chatAddPattern(config_1.config.ITEMCLEAR_REGEXP, 'itemClearAlert');
        this.client.chatAddPattern(config_1.config.MOBREMOVER_REGEXP, 'mobClearAlert');
        this.client.chatAddPattern(config_1.config.REDSTONE_REGEXP, 'redstoneAlert');
        this.client.chatAddPattern(config_1.config.TPA_REGEXP, 'tpa');
        this.client.chatAddPattern(config_1.config.TPAHERE_REGEXP, 'tpahere');
        this.client.chatAddPattern(config_1.config.MONEYDROP_REGEXP, 'moneydrop');
        this.client.on('msg', (rank, username, message) => {
            this.emit('msg', rank, username, message);
        });
        this.client.on('plotchat', (plotID, rank, username, message) => {
            this.emit('plotchat', plotID, rank, username, message);
        });
        this.client.on('tpa', (rank, username) => {
            this.emit('tpa', rank, username);
        });
        this.client.on('tpahere', (rank, username) => {
            this.emit('tpahere', rank, username);
        });
        this.client.on('moneydrop', (amount) => {
            this.emit('moneydrop', parseFloat(amount.replace(/,/g, '')));
        });
        this.client.on('chatModeAlert', (rank, username, change) => {
            switch (change) {
                case 'auf normal gestellt':
                    this.currentChatMode = enums_1.ChatMode.NORMAL;
                    this.chatDelay = config_1.config.NORMAL_COOLDOWN;
                    break;
                case 'verlangsamt':
                    this.currentChatMode = enums_1.ChatMode.SLOW;
                    this.chatDelay = config_1.config.SLOW_COOLDOWN;
                    break;
                case 'geleert':
                    break;
            }
            this.emit('chatModeAlert', rank, username, change);
        });
        this.client.on('slowChatAlert', () => {
            this.chatDelay = config_1.config.SLOW_COOLDOWN;
            this.sendChat('&f', true);
            console.warn('Sent messages too quickly!');
        });
        this.client.on('commandSpamAlert', () => {
            this.chatDelay = config_1.config.SLOW_COOLDOWN;
            console.warn('Sent commands too quickly!');
        });
        this.client.on('itemClearAlert', (seconds) => {
            this.emit('itemClearAlert', parseInt(seconds));
        });
        this.client.on('mobClearAlert', (minutes) => {
            this.emit('mobClearAlert', parseInt(minutes));
        });
        this.client.on('redstoneAlert', (mode) => {
            let redstone = '';
            if (mode.includes('deaktiviert')) {
                redstone = enums_1.RedstoneMode.OFF;
            }
            else if (mode.includes('aktiviert')) {
                redstone = enums_1.RedstoneMode.ON;
            }
            this.emit('redstoneAlert', redstone);
        });
        this.client.on('connect', () => {
            this.client.once('spawn', () => {
                this.emit('ready');
            });
        });
        this.client.on('playerCollect', (collector, collected) => {
            if (collector.username === this.client.username) {
                this.emit('botCollect', collector, collected);
            }
            else {
                this.emit('playerCollect', collector, collected);
            }
        });
        this.client.on('windowOpen', (window) => {
            this.emit('windowOpen', window);
            if (this.options.solveAfkChallenge) {
                let title = JSON.parse(window.title);
                if (window.type == 'minecraft:container' && title && title.includes('§cAfk?')) {
                    solve_afk_challenge_1.solveAfkChallengeTask(this, window)
                        .then(() => {
                        this.emit('solvedAfkChallenge');
                    })
                        .catch((e) => {
                        console.error('Failed solving AFK challenge.');
                    });
                }
            }
        });
        this.client._client.once('session', () => {
            const session = this.client._client.session;
            this.emit('session', session);
        });
        this.client.on('error', (e) => {
            const errorText = (e.message || e || '').toLowerCase();
            if (errorText.includes('deserialization') || errorText.includes('buffer')) {
                return;
            }
            if (errorText.includes('invalid username or password')) {
                this.setConnectionStatus(enums_1.ConnectionStatus.DISCONNECTED);
            }
            this.emit('error', e);
        });
        this.client.on('message', (message) => {
            const codedText = minecraftUtil_1.jsonToCodedText(message.json).trim();
            const text = minecraftUtil_1.stripCodes(codedText);
            if (typeof this.options.logMessages === 'boolean') {
                if (this.options.logMessages) {
                    console.log(message.toAnsi());
                }
            }
            else if (typeof this.options.logMessages === 'object') {
                const logMessagesOptions = this.options.logMessages;
                if (logMessagesOptions.type === 'uncoded') {
                    console.log(text);
                }
                else if (logMessagesOptions.type === 'encoded') {
                    console.log(codedText);
                }
                else if (logMessagesOptions.type === 'ansi') {
                    console.log(message.toAnsi());
                }
            }
            const fakeCheck = codedText.match(config_1.config.CODED_PAY_REGEXP);
            const payMatches = text.match(config_1.config.PAY_REGXP);
            if (fakeCheck && payMatches && !codedText.includes('§f §ahat dir $')) {
                const rank = payMatches[1];
                const username = payMatches[2];
                const amount = parseFloat(payMatches[3].replace(/,/g, ''));
                this.emit('pay', rank, username, amount, text, codedText);
            }
        });
        this.client._client.on('chat', chatPacket => {
            let msg;
            try {
                msg = new ChatMessage(JSON.parse(chatPacket.message));
            }
            catch (e) {
                msg = new ChatMessage(chatPacket.message);
            }
            this.emit('message', msg, chatPacket.position);
        });
        this.client._client.on('packet', (data, metadata) => {
            if (metadata.name === 'scoreboard_team' && data.name === 'Kontostandcheck') {
                this.emit('scoreboardBalance', data.prefix);
            }
            if (metadata.name === 'scoreboard_team' && data.name === 'server') {
                this.emit('scoreboardServer', data.prefix);
            }
        });
    }
    getTimeSinceLastMessage() {
        return Date.now() - this.messageLastSentTime;
    }
    processChatQueue() {
        if (this.chatQueue.length === 0) {
            return;
        }
        const [text, resolve] = this.chatQueue.shift();
        this.client.chat(text);
        this.messageLastSentTime = Date.now();
        resolve(text);
        if (text.startsWith('/')) {
            if (this.currentChatMode === enums_1.ChatMode.NORMAL) {
                this.chatDelay = config_1.config.NORMAL_COOLDOWN;
            }
            else {
                this.chatDelay = config_1.config.SLOW_COOLDOWN;
            }
        }
        else {
            if (this.currentChatMode === enums_1.ChatMode.NORMAL) {
                this.chatDelay = config_1.config.NORMAL_COOLDOWN + 1000;
            }
            else {
                this.chatDelay = config_1.config.SLOW_COOLDOWN + 1000;
            }
        }
        if (this.options.additionalChatDelay) {
            this.chatDelay += this.options.additionalChatDelay;
        }
        if (this.chatQueue.length > 0) {
            setTimeout(() => {
                this.processChatQueue();
            }, this.chatDelay);
        }
    }
    async send(text, sendNext) {
        if (!this.isOnline()) {
            throw new Error('Bot is not currently online.');
        }
        if (this.chatQueue.length > 0) {
            if (sendNext) {
                return this.sendNext(text);
            }
            return this.addToQueue(text);
        }
        const sinceLast = this.getTimeSinceLastMessage();
        if (sinceLast >= this.chatDelay) {
            this.client.chat(text);
            this.messageLastSentTime = Date.now();
            return Promise.resolve(text);
        }
        const untilNext = this.chatDelay - sinceLast;
        setTimeout(() => {
            this.processChatQueue();
        }, untilNext);
        return this.addToQueue(text);
    }
    addToQueue(text) {
        return new Promise((resolve) => {
            this.chatQueue.push([text, resolve]);
        });
    }
    sendNext(text) {
        return new Promise((resolve) => {
            this.chatQueue = [[text, resolve], ...this.chatQueue];
        });
    }
    clean(reason) {
        if (this.client) {
            this.client.quit(reason);
            this.client.removeAllListeners();
            this.client = null;
        }
    }
}
exports.Bot = Bot;
function readJsonFile(filePath) {
    return new Promise((resolve, reject) => {
        fs_1.default.readFile(filePath, 'utf8', (e, data) => {
            if (e) {
                reject(e);
                return;
            }
            let parsed;
            try {
                parsed = JSON.parse(data);
            }
            catch (e) {
                reject(e);
                return;
            }
            resolve(parsed);
        });
    });
}
function createBot(options) {
    const bot = new Bot(options);
    return bot;
}
exports.createBot = createBot;
//# sourceMappingURL=bot.js.map