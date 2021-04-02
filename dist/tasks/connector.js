"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectorTask = void 0;
const vec3_1 = __importDefault(require("vec3"));
const config_1 = require("../config");
let spawned = false;
function delay(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
function checkIfSpawned() {
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            if (spawned) {
                clearInterval(interval);
                resolve();
            }
        }, 100);
    });
}
function listenForSpawn(bot) {
    spawned = false;
    bot.client.once('spawn', () => spawned = true);
}
function waitForSpawn(bot) {
    return new Promise((resolve) => {
        bot.client.once('spawn', resolve);
    });
}
const CARDINAL_YAWS = {
    NORTH: 0,
    NORTH_WEST: (1 * Math.PI) / 4,
    WEST: Math.PI / 2,
    SOUTH_WEST: (3 * Math.PI) / 4,
    SOUTH: Math.PI,
    SOUTH_EAST: (5 * Math.PI) / 4,
    EAST: (3 * Math.PI) / 2,
    NORTH_EAST: (7 * Math.PI) / 4,
};
const WIGGLE_INTERVAL = 1000;
async function run(bot, options) {
    let timeout;
    if (bot.options.setPortalTimeout) {
        timeout = setTimeout(() => {
            throw new Error('Timed out while connecting on CityBuild.');
        }, config_1.config.PORTAL_TIMEOUT);
    }
    let startPos;
    let lookDirection;
    switch (options.start) {
        case 0:
            startPos = vec3_1.default([323, 117, 281]);
            lookDirection = [CARDINAL_YAWS.SOUTH_WEST, 0];
            break;
        case 1:
            startPos = vec3_1.default([323, 117, 279]);
            lookDirection = [CARDINAL_YAWS.NORTH_WEST, 0];
            break;
        case 2:
            startPos = vec3_1.default([327, 117, 279]);
            lookDirection = [CARDINAL_YAWS.NORTH_EAST, 0];
            break;
        case 3:
            startPos = vec3_1.default([327, 117, 281]);
            lookDirection = [CARDINAL_YAWS.SOUTH_EAST, 0];
            break;
        default:
            throw new Error('Start position not provided! Check path file.');
    }
    bot.sendCommand('portal');
    await waitForSpawn(bot);
    await delay(3000);
    listenForSpawn(bot);
    try {
        await bot.client.navigate.promise.to(startPos);
    }
    catch (e) {
        if (bot.options.setPortalTimeout) {
            clearTimeout(timeout);
        }
        throw new Error('Stuck in connector.');
    }
    await delay(500);
    const [yaw, pitch] = lookDirection;
    await new Promise(resolve => {
        bot.client.look(yaw, pitch, true, resolve);
    });
    await delay(500);
    bot.client.setControlState('sprint', true);
    bot.client.setControlState('jump', true);
    bot.client.setControlState('forward', true);
    await delay(200);
    bot.client.setControlState('jump', false);
    await delay(300);
    bot.client.clearControlStates();
    await delay(2000);
    const [frontX, frontY, frontZ] = options.front;
    const frontPos = vec3_1.default([frontX, frontY, frontZ]);
    try {
        await bot.client.navigate.promise.to(frontPos);
    }
    catch (e) {
        if (bot.client.entity.position.y == frontPos.y) {
            await bot.client.naviate.promise.to(frontPos);
        }
        else {
            throw new Error('Stuck in connector.');
        }
    }
    await delay(2000);
    const [portalX, portalY, portalZ] = options.portal;
    const portalPos = vec3_1.default([portalX, portalY, portalZ]);
    await new Promise(resolve => {
        bot.client.lookAt(portalPos, true, resolve);
    });
    bot.client.setControlState('jump', true);
    await delay(25);
    bot.client.setControlState('sprint', true);
    bot.client.setControlState('forward', true);
    await delay(2500);
    bot.client.clearControlStates();
    bot.client.setControlState('jump', true);
    await checkIfSpawned();
    bot.client.setControlState('jump', false);
    bot.client.clearControlStates();
    if (bot.options.setPortalTimeout) {
        clearTimeout(timeout);
    }
}
exports.connectorTask = run;
function wiggle(bot) {
    function moveLeft() {
        bot.client.setControlState('left', true);
    }
    function moveRight() {
        bot.client.setControlState('right', true);
    }
    let left = true;
    const interval = setInterval(() => {
        if (bot.client == null)
            return;
        bot.client.clearControlStates();
        left ? moveLeft() : moveRight();
        left = !left;
    }, WIGGLE_INTERVAL);
    return () => {
        clearInterval(interval);
    };
}
//# sourceMappingURL=connector.js.map