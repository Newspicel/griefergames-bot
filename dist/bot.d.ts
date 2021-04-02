/// <reference types="node" />
import { EventEmitter } from 'events';
import { Options } from './interfaces';
import { ConnectionStatus } from './enums';
declare class Bot extends EventEmitter {
    client: any;
    connectionStatus: ConnectionStatus;
    options: Options;
    private chatQueue;
    private currentChatMode;
    private chatDelay;
    private messageLastSentTime;
    constructor(options: Options);
    init(): Promise<void>;
    isOnline(): boolean;
    getStatus(): ConnectionStatus;
    connectCityBuild(dest: string): Promise<void>;
    sendChat(text: string, sendNext?: boolean): Promise<String>;
    sendCommand(command: string, sendNext?: boolean): Promise<String>;
    sendMsg(re: string, text: string, sendNext?: boolean): Promise<String>;
    pay(re: string, amount: number, sendNext?: boolean): Promise<String>;
    navigateTo(position: any): Promise<void>;
    end(reason?: string): void;
    private setConnectionStatus;
    private loadConnectorOptions;
    private installPlugins;
    private registerEvents;
    private getTimeSinceLastMessage;
    private processChatQueue;
    private send;
    private addToQueue;
    private sendNext;
    private clean;
}
declare function createBot(options: Options): Bot;
export { createBot, Bot };
