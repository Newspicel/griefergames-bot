"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.config = {
    SERVER_IP: 'griefergames.net',
    SERVER_PORT: 25565,
    NORMAL_COOLDOWN: 3050,
    SLOW_COOLDOWN: 4050,
    PORTAL_COOLDOWN: 12000,
    PORTAL_TIMEOUT: 60000,
    MSG_REGEXP: /^\[(\w+) \u2503 (\u007E?\u0021?\w{1,16}) -> mir\] (.+)$/,
    PLOTCHAT_REGEXP: /^\[Plot\-Chat\]\[(.+)\] (\w+) \u2503 (\u007E?\u0021?\w{1,16}) \: (.+)$/,
    CHATMODE_ALERT_REGEXP: /^\[Chat\] Der Chat wurde von (\w+) \u2503 (\u007E?\u0021?\w{1,16}) (.+)\.$/,
    SLOWCHAT_ALERT_REGEXP: /^\[GrieferGames\] Du kannst nur jede 10 Sekunden schreiben\.$/,
    COMMANDSPAM_ALERT_REGEXP: /^Bitte unterlasse das Spammen von Commands!$/,
    PAY_REGXP: /^(.+) \u2503 (\u007E?\u0021?\w{1,16}) hat dir \$(\S+) gegeben\.$/,
    MONEYDROP_REGEXP: /^\$(\S+) wurde zu deinem Konto hinzugefügt\.$/,
    REDSTONE_REGEXP: /^- Redstone (?:ist wieder )?(\w+)\!?$/,
    ITEMCLEAR_REGEXP: /^\[GrieferGames\] Warnung! Die auf dem Boden liegenden Items werden in (\w{2}) Sekunden entfernt\!$/,
    MOBREMOVER_REGEXP: /^\[MobRemover\] Achtung, in (\w{1}) Minuten werden alle Tiere gelöscht\.$/,
    TPA_REGEXP: /^([A-Za-z\-]+\+?) \u2503 (\u007E?\u0021?\w{1,16}) fragt, ob er sich zu dir teleportieren darf.$/,
    TPAHERE_REGEXP: /^([A-Za-z\\-]+\+?) \u2503 (\u007E?\u0021?\w{1,16}) fragt, ob du dich zu ihm teleportierst.$/,
    CODED_PAY_REGEXP: /^(.+)\u2503 (.+) §ahat dir \$(\S+) gegeben\.$/
};
//# sourceMappingURL=config.js.map